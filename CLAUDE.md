# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
npm run dev        # Start dev server (localhost:3000) — uses polling for WSL
npm run build      # Production build
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

**PageRoom** is a reading tracker + store simulator built with Next.js 16 App Router, React 19, TypeScript strict mode, Supabase (auth + PostgreSQL + storage), and Tailwind CSS v4 + shadcn/ui.

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
    store/                # User's store (planned)
```

### Data Flow

All mutations use **Server Actions** in `lib/actions/`. The pattern is:
1. Client submits a form or calls an action
2. Server action runs → Supabase write → `revalidatePath()` → redirect

No Redux or Zustand — Supabase is the source of truth, data is fetched server-side and cached via Next.js Data Cache.

### Supabase Clients

- `lib/supabase/server.ts` — use in Server Components and Server Actions
- `lib/supabase/client.ts` — use in Client Components (`'use client'`)

Auth is SSR-aware via `@supabase/ssr`. Session is maintained in cookies.

### Database Tables

| Table | Purpose |
|-------|---------|
| `contents` | Books/novels/comics metadata (title, author, genre, cover_url, type) |
| `reading_records` | Per-user reading progress & status |
| `reviews` | User reviews with rating and AI analysis fields |
| `activity_logs` | Timestamped log of all user actions |
| `user_profiles` | Theme preference, store name, store stats |

No ORM — raw Supabase client queries (`.select()`, `.insert()`, `.update()`, `.delete()`).

### Types

All core types live in `lib/types.ts`:
- `ContentType`: `'book' | 'webnovel' | 'indie' | 'original'`
- `ReadingStatus`: `'to_read' | 'reading' | 'completed' | 'dropped' | 'rereading' | 'waiting' | 'up_to_date'`
- `Content`, `ReadingRecord`, `Review`, `ActivityLog`, `UserProfile`

### Theme System

Themes are CSS variable sets defined in `styles/themes.css` under `[data-theme="..."]` selectors. The active theme is stored in `user_profiles.theme_id` and applied server-side in the root layout to avoid FOUC.

### Component Conventions

- Server Components by default; add `'use client'` only for interactivity
- UI primitives from `components/ui/` (shadcn/ui)
- Shared components (forms, editors) in `components/`
