# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Next.js 주의:** 이 버전은 학습 데이터와 다를 수 있습니다. 코드 작성 전 `node_modules/next/dist/docs/` 관련 가이드를 확인하고 deprecation 경고에 유의하세요.

---

## Commands

```bash
npm run dev        # Start dev server (localhost:3000) — --webpack flag forces webpack (not turbopack), polling enabled for WSL
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run test       # Jest (all tests)
npm run test:watch # Jest watch mode
```

Run a single test file:
```bash
npx jest __tests__/foo.test.ts
```

Required env vars — copy `.env.local.example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Architecture

**PageRoom** is a reading tracker + store simulator built with Next.js 16 App Router, React 19, TypeScript strict mode, Supabase (auth + PostgreSQL + storage), and Tailwind CSS v4 + shadcn/ui (built on `@base-ui/react`).

### Routing & Layouts

```
app/
  layout.tsx              # Root layout — loads user theme from DB, passes data-theme to <html>
  page.tsx                # Landing page (unauthenticated)
  (auth)/login/           # Login/signup (client component)
  auth/callback/          # Supabase OAuth callback
  (main)/                 # Protected route group
    layout.tsx            # Navbar + providers
    library/              # Book/content list and detail
    reviews/              # Review list and editor
    add/                  # Add new content
    settings/             # Profile and theme settings
    store/                # User's store (Phase 2 — not yet implemented)
```

### Data Flow

All mutations use **Server Actions** in `lib/actions/`. The pattern is:
1. Client submits a form or calls an action
2. Server action validates auth via `supabase.auth.getUser()` → Supabase write → `revalidatePath()` → redirect

There is **no middleware.ts** — auth is checked individually inside each Server Action.

No Redux or Zustand — Supabase is the source of truth, data is fetched server-side and cached via Next.js Data Cache.

### Server Actions

| File | Actions |
|------|---------|
| `lib/actions/content.ts` | `createContent()` (upload to `covers` bucket + create reading_record), `deleteContent()` |
| `lib/actions/reading-record.ts` | `updateProgress()` (updates status/progress, auto-sets completed_at, logs activity) |
| `lib/actions/review.ts` | `upsertReview()`, `deleteReview()` |
| `lib/actions/profile.ts` | `updateProfile()` (upserts theme + store name) |

### Supabase Clients

- `lib/supabase/server.ts` — use in Server Components and Server Actions
- `lib/supabase/client.ts` — use in Client Components (`'use client'`)

Auth is SSR-aware via `@supabase/ssr`. Session is maintained in cookies.

### Database Tables

| Table | Purpose |
|-------|---------|
| `contents` | Books/novels/comics metadata (title, author, genre, cover_url, type) |
| `reading_records` | Per-user reading progress & status; `is_in_store` flag connects to Phase 2 store |
| `reviews` | User reviews with rating and AI analysis fields (ai_keywords, ai_emotion, ai_depth) |
| `activity_logs` | Timestamped log of actions; references both content_id and record_id |
| `user_profiles` | Theme preference, store name, store stats (store_level, store_reputation) |

No ORM — raw Supabase client queries (`.select()`, `.insert()`, `.update()`, `.delete()`).

### Types

All core types live in `lib/types.ts`:
- `ContentType`: `'book' | 'webnovel' | 'indie' | 'original'`
- `ReadingStatus`: `'to_read' | 'reading' | 'completed' | 'dropped' | 'rereading' | 'waiting' | 'up_to_date'`
- `ActivityAction`: `'progress' | 'status_change' | 'review_written' | 'started' | 'completed'`
- `Content`, `ReadingRecord`, `Review`, `ActivityLog`, `UserProfile`
- `ContentWithRecord` — joined type combining `Content` with `reading_record: ReadingRecord | null`

### Utilities

`lib/utils.ts` provides display helpers:
- `getStatusLabel(status)` — Korean label for ReadingStatus
- `getStatusColor(status)` — Tailwind class for status badge
- `getContentTypeLabel(type)` — Korean label ('책', '웹소설', '비출간', '창작')
- `formatProgress(record, content)` — Formats page/episode progress string

### Theme System

Themes are CSS variable sets defined in `styles/themes.css` under `[data-theme="..."]` selectors. The active theme is stored in `user_profiles.theme_id` and applied server-side in the root layout to avoid FOUC.

### Component Conventions

- Server Components by default; add `'use client'` only for interactivity
- UI primitives from `components/ui/` (shadcn/ui)
- Shared components (forms, editors) in `components/`

### Documentation

- `SETUP.md` — Supabase 초기 설정 & Vercel 배포
- `docs/phase1-summary.md` — Phase 1 개발 요약
