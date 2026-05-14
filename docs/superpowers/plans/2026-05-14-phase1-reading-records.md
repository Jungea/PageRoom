# PageRoom Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 독서 기록 시스템 완성 — 콘텐츠 등록, 상태 관리, 활동 로그, 독후감, 서재 뷰, 테마 기반 구축 후 Vercel 배포.

**Architecture:** Next.js 15 App Router. 데이터 조회는 Server Components, 뮤테이션은 Server Actions. UI는 Tailwind + shadcn/ui, CSS 커스텀 프로퍼티로 테마 시스템 구성. Supabase RLS로 사용자별 데이터 격리.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Auth + PostgreSQL + Storage), Vercel

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                          # 루트 레이아웃 (ThemeProvider)
│   ├── page.tsx                            # 랜딩 페이지
│   ├── (auth)/
│   │   └── login/page.tsx                 # 로그인 페이지
│   ├── (main)/
│   │   ├── layout.tsx                     # 네비바 포함 메인 레이아웃
│   │   ├── library/
│   │   │   ├── page.tsx                   # 서재 목록
│   │   │   └── [contentId]/page.tsx       # 콘텐츠 상세 + 활동 로그
│   │   ├── add/page.tsx                   # 콘텐츠 등록
│   │   ├── reviews/
│   │   │   ├── page.tsx                   # 독후감 목록
│   │   │   └── [reviewId]/page.tsx        # 독후감 상세/편집
│   │   ├── store/page.tsx                 # Phase 2 자리 예약 (빈 페이지)
│   │   └── settings/page.tsx              # 설정 (테마, 서점 이름)
│   └── auth/callback/route.ts             # Supabase OAuth 콜백
├── components/
│   ├── ui/                                # shadcn/ui 자동 생성 컴포넌트
│   ├── navbar.tsx                         # 상단 네비바
│   ├── content-card.tsx                   # 서재 목록 카드
│   ├── content-form.tsx                   # 콘텐츠 등록/수정 폼
│   ├── reading-status-badge.tsx           # 상태 뱃지
│   ├── library-filters.tsx                # 상태/타입 필터
│   ├── progress-form.tsx                  # 진행도 업데이트 폼
│   ├── activity-log-timeline.tsx          # 활동 로그 타임라인
│   ├── review-editor.tsx                  # 독후감 에디터
│   └── theme-provider.tsx                 # CSS 변수 테마 관리
├── lib/
│   ├── types.ts                           # 전체 TypeScript 타입 정의
│   ├── utils.ts                           # 상태 라벨, 색상 등 순수 함수
│   ├── actions/
│   │   ├── content.ts                     # 콘텐츠 Server Actions
│   │   ├── reading-record.ts              # 독서 상태 Server Actions
│   │   ├── activity-log.ts                # 활동 로그 Server Actions
│   │   └── review.ts                      # 독후감 Server Actions
│   └── supabase/
│       ├── client.ts                      # 브라우저용 Supabase 클라이언트
│       ├── server.ts                      # 서버용 Supabase 클라이언트
│       └── middleware.ts                  # 세션 갱신 미들웨어 헬퍼
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql                 # 전체 테이블 생성
│       └── 002_rls.sql                    # RLS 정책
├── styles/
│   └── themes.css                         # CSS 커스텀 프로퍼티 테마 정의
├── middleware.ts                           # Next.js 미들웨어 (세션 갱신 + 리디렉션)
└── __tests__/
    ├── utils.test.ts                      # 순수 함수 유닛 테스트
    ├── reading-status-badge.test.tsx      # 컴포넌트 테스트
    └── library-filters.test.tsx           # 컴포넌트 테스트
```

---

## Task 1: 프로젝트 초기 설정

**Files:**
- Create: 프로젝트 루트 전체
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
cd /mnt/d/practice/PageRoom
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

프롬프트가 나오면 전부 기본값(Enter) 선택.

- [ ] **Step 2: 의존성 설치**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

- [ ] **Step 3: shadcn/ui 초기화**

```bash
npx shadcn@latest init
```

프롬프트:
- Style: Default
- Base color: Slate
- CSS variables: Yes

그 다음 필요한 컴포넌트 설치:

```bash
npx shadcn@latest add button input label badge card select textarea
```

- [ ] **Step 4: Jest 설정**

`jest.config.ts` 생성:

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

`jest.setup.ts` 생성:

```typescript
import '@testing-library/jest-dom'
```

`package.json`의 scripts에 추가:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: .gitignore에 항목 추가**

`.gitignore` 파일 열어서 맨 아래에 추가:

```
.env.local
.superpowers/
```

- [ ] **Step 6: 초기 커밋**

```bash
git init
git add .
git commit -m "chore: init Next.js 15 project with TypeScript, Tailwind, shadcn/ui, Jest"
```

---

## Task 2: TypeScript 타입 & 유틸리티 함수 (TDD)

**Files:**
- Create: `lib/types.ts`
- Create: `lib/utils.ts`
- Create: `__tests__/utils.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`__tests__/utils.test.ts` 생성:

```typescript
import {
  getStatusLabel,
  getStatusColor,
  getContentTypeLabel,
  formatProgress,
} from '@/lib/utils'

describe('getStatusLabel', () => {
  it('한국어 라벨 반환', () => {
    expect(getStatusLabel('reading')).toBe('읽는 중')
    expect(getStatusLabel('completed')).toBe('완독')
    expect(getStatusLabel('to_read')).toBe('읽기 전')
    expect(getStatusLabel('dropped')).toBe('중단')
    expect(getStatusLabel('rereading')).toBe('재독 중')
    expect(getStatusLabel('waiting')).toBe('휴재 대기')
    expect(getStatusLabel('up_to_date')).toBe('최신화 도달')
  })
})

describe('getStatusColor', () => {
  it('Tailwind 클래스 반환', () => {
    expect(getStatusColor('reading')).toContain('indigo')
    expect(getStatusColor('completed')).toContain('green')
    expect(getStatusColor('dropped')).toContain('red')
    expect(getStatusColor('up_to_date')).toContain('green')
  })
})

describe('getContentTypeLabel', () => {
  it('타입 라벨 반환', () => {
    expect(getContentTypeLabel('book')).toBe('책')
    expect(getContentTypeLabel('webnovel')).toBe('웹소설')
    expect(getContentTypeLabel('indie')).toBe('비출간')
    expect(getContentTypeLabel('original')).toBe('창작')
  })
})

describe('formatProgress', () => {
  it('책은 페이지, 웹소설은 화수로 포맷', () => {
    expect(formatProgress('book', 136, null, 247, null)).toBe('136 / 247p')
    expect(formatProgress('webnovel', null, 130, null, 271)).toBe('130 / 271화')
    expect(formatProgress('indie', null, null, null, null)).toBe('')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- --testPathPattern="utils"
```

Expected: FAIL (모듈 없음)

- [ ] **Step 3: 타입 정의**

`lib/types.ts` 생성:

```typescript
export type ContentType = 'book' | 'webnovel' | 'indie' | 'original'

export type ReadingStatus =
  | 'to_read'
  | 'reading'
  | 'completed'
  | 'dropped'
  | 'rereading'
  | 'waiting'
  | 'up_to_date'

export type ActivityAction =
  | 'progress'
  | 'status_change'
  | 'review_written'
  | 'started'
  | 'completed'

export interface Content {
  id: string
  user_id: string
  type: ContentType
  title: string
  author: string
  cover_url: string | null
  genre: string[]
  isbn: string | null
  external_id: string | null
  total_pages: number | null
  total_episodes: number | null
  is_ongoing: boolean
  created_at: string
}

export interface ReadingRecord {
  id: string
  user_id: string
  content_id: string
  status: ReadingStatus
  progress_page: number | null
  progress_episode: number | null
  started_at: string | null
  completed_at: string | null
  is_in_store: boolean
}

export interface ActivityLog {
  id: string
  user_id: string
  content_id: string
  record_id: string
  action: ActivityAction
  note: string | null
  progress_snapshot: number | null
  logged_at: string
}

export interface Review {
  id: string
  user_id: string
  content_id: string
  body: string
  rating: number
  is_public: boolean
  ai_keywords: string[] | null
  ai_emotion: string | null
  ai_depth: string | null
  created_at: string
  updated_at: string
}

export interface UserProfile {
  user_id: string
  store_name: string
  theme_id: string
  store_level: number
  store_reputation: number
  created_at: string
}

export interface ContentWithRecord extends Content {
  reading_record: ReadingRecord | null
}
```

- [ ] **Step 4: 유틸리티 함수 구현**

`lib/utils.ts` 생성:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ContentType, ReadingStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const STATUS_LABELS: Record<ReadingStatus, string> = {
  to_read: '읽기 전',
  reading: '읽는 중',
  completed: '완독',
  dropped: '중단',
  rereading: '재독 중',
  waiting: '휴재 대기',
  up_to_date: '최신화 도달',
}

const STATUS_COLORS: Record<ReadingStatus, string> = {
  to_read: 'bg-slate-100 text-slate-600',
  reading: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  dropped: 'bg-red-100 text-red-600',
  rereading: 'bg-purple-100 text-purple-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  up_to_date: 'bg-green-100 text-green-700',
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  book: '책',
  webnovel: '웹소설',
  indie: '비출간',
  original: '창작',
}

export function getStatusLabel(status: ReadingStatus): string {
  return STATUS_LABELS[status]
}

export function getStatusColor(status: ReadingStatus): string {
  return STATUS_COLORS[status]
}

export function getContentTypeLabel(type: ContentType): string {
  return CONTENT_TYPE_LABELS[type]
}

export function formatProgress(
  type: ContentType,
  progressPage: number | null,
  progressEpisode: number | null,
  totalPages: number | null,
  totalEpisodes: number | null,
): string {
  if (type === 'book' && progressPage !== null) {
    return totalPages ? `${progressPage} / ${totalPages}p` : `${progressPage}p`
  }
  if ((type === 'webnovel' || type === 'indie') && progressEpisode !== null) {
    return totalEpisodes
      ? `${progressEpisode} / ${totalEpisodes}화`
      : `${progressEpisode}화`
  }
  return ''
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npm test -- --testPathPattern="utils"
```

Expected: PASS (4 test suites)

- [ ] **Step 6: 커밋**

```bash
git add lib/types.ts lib/utils.ts __tests__/utils.test.ts
git commit -m "feat: add TypeScript types and utility functions"
```

---

## Task 3: Supabase 프로젝트 & 스키마 설정

**Files:**
- Create: `supabase/migrations/001_schema.sql`
- Create: `supabase/migrations/002_rls.sql`
- Create: `.env.local` (git 제외)

- [ ] **Step 1: Supabase 프로젝트 생성**

1. https://supabase.com 접속 → New Project 생성
2. 프로젝트 이름: `pageroom`
3. 생성 완료 후 Settings → API 에서 다음 값 복사:
   - Project URL
   - anon public key
   - service_role key (나중에 필요)

- [ ] **Step 2: 환경 변수 설정**

`.env.local` 생성 (git 제외됨):

```
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
```

- [ ] **Step 3: 스키마 마이그레이션 파일 작성**

`supabase/migrations/001_schema.sql` 생성:

```sql
-- user_profiles
create table public.user_profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  store_name  text not null default '나의 서점',
  theme_id    text not null default 'default',
  store_level int not null default 1,
  store_reputation numeric not null default 0,
  created_at  timestamptz not null default now()
);

-- contents
create table public.contents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  type           text not null check (type in ('book', 'webnovel', 'indie', 'original')),
  title          text not null,
  author         text not null default '',
  cover_url      text,
  genre          text[] not null default '{}',
  isbn           text,
  external_id    text,
  total_pages    int,
  total_episodes int,
  is_ongoing     boolean not null default false,
  created_at     timestamptz not null default now()
);

-- reading_records
create table public.reading_records (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  content_id       uuid not null references public.contents(id) on delete cascade,
  status           text not null default 'to_read'
    check (status in ('to_read','reading','completed','dropped','rereading','waiting','up_to_date')),
  progress_page    int,
  progress_episode int,
  started_at       timestamptz,
  completed_at     timestamptz,
  is_in_store      boolean not null default false,
  unique (user_id, content_id)
);

-- activity_logs
create table public.activity_logs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  content_id        uuid not null references public.contents(id) on delete cascade,
  record_id         uuid not null references public.reading_records(id) on delete cascade,
  action            text not null
    check (action in ('progress','status_change','review_written','started','completed')),
  note              text,
  progress_snapshot int,
  logged_at         timestamptz not null default now()
);

-- reviews
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  content_id  uuid not null references public.contents(id) on delete cascade,
  body        text not null default '',
  rating      int not null default 0 check (rating between 0 and 5),
  is_public   boolean not null default false,
  ai_keywords text[],
  ai_emotion  text,
  ai_depth    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, content_id)
);
```

- [ ] **Step 4: RLS 정책 파일 작성**

`supabase/migrations/002_rls.sql` 생성:

```sql
-- RLS 활성화
alter table public.user_profiles enable row level security;
alter table public.contents enable row level security;
alter table public.reading_records enable row level security;
alter table public.activity_logs enable row level security;
alter table public.reviews enable row level security;

-- user_profiles: 본인만 접근
create policy "user_profiles_self" on public.user_profiles
  for all using (auth.uid() = user_id);

-- contents: 본인만 접근
create policy "contents_self" on public.contents
  for all using (auth.uid() = user_id);

-- reading_records: 본인만 접근
create policy "reading_records_self" on public.reading_records
  for all using (auth.uid() = user_id);

-- activity_logs: 본인만 접근
create policy "activity_logs_self" on public.activity_logs
  for all using (auth.uid() = user_id);

-- reviews: 본인은 전체, 공개 리뷰는 모두 읽기
create policy "reviews_self" on public.reviews
  for all using (auth.uid() = user_id);

create policy "reviews_public_read" on public.reviews
  for select using (is_public = true);
```

- [ ] **Step 5: Supabase Dashboard에서 SQL 실행**

1. Supabase Dashboard → SQL Editor
2. `001_schema.sql` 내용 전체 복사 → Run
3. `002_rls.sql` 내용 전체 복사 → Run

- [ ] **Step 6: Storage 버킷 생성**

Supabase Dashboard → Storage → New Bucket:
- Name: `covers`
- Public bucket: ON (커버 이미지는 공개)

- [ ] **Step 7: 커밋**

```bash
git add supabase/
git commit -m "feat: add database schema and RLS policies"
```

---

## Task 4: Supabase 클라이언트 헬퍼 & 미들웨어

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: 브라우저 클라이언트 작성**

`lib/supabase/client.ts` 생성:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 2: 서버 클라이언트 작성**

`lib/supabase/server.ts` 생성:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component에서 호출된 경우 무시
          }
        },
      },
    },
  )
}
```

- [ ] **Step 3: 미들웨어 작성**

`middleware.ts` 생성 (프로젝트 루트):

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isProtected = !isAuthPage && request.nextUrl.pathname !== '/'

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/library', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 4: auth 콜백 라우트 작성**

`app/auth/callback/route.ts` 생성:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // 첫 로그인 시 user_profiles 생성
      await supabase.from('user_profiles').upsert({
        user_id: data.user.id,
        store_name: '나의 서점',
        theme_id: 'default',
      }, { onConflict: 'user_id', ignoreDuplicates: true })

      return NextResponse.redirect(`${origin}/library`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

- [ ] **Step 5: 커밋**

```bash
git add lib/supabase/ middleware.ts app/auth/
git commit -m "feat: add Supabase client helpers and auth middleware"
```

---

## Task 5: 테마 시스템

**Files:**
- Create: `styles/themes.css`
- Create: `components/theme-provider.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: CSS 테마 변수 정의**

`styles/themes.css` 생성:

```css
/* 기본 테마 */
[data-theme="default"] {
  --color-primary: 99 102 241;        /* indigo-500 */
  --color-primary-foreground: 255 255 255;
  --color-surface: 248 250 252;       /* slate-50 */
  --color-surface-card: 255 255 255;
  --color-border: 226 232 240;        /* slate-200 */
  --color-text: 15 23 42;             /* slate-900 */
  --color-text-muted: 100 116 139;    /* slate-500 */
  --color-accent: 238 242 255;        /* indigo-50 */
}

/* 크림 테마 (기본 제공 무료 2번째 테마) */
[data-theme="cream"] {
  --color-primary: 161 130 98;
  --color-primary-foreground: 255 255 255;
  --color-surface: 250 247 242;
  --color-surface-card: 255 252 248;
  --color-border: 232 220 204;
  --color-text: 44 33 22;
  --color-text-muted: 139 117 95;
  --color-accent: 245 237 224;
}
```

`app/globals.css`에 추가 (기존 내용 아래에):

```css
@import '../styles/themes.css';

body {
  background-color: rgb(var(--color-surface));
  color: rgb(var(--color-text));
}
```

- [ ] **Step 2: ThemeProvider 컴포넌트**

`components/theme-provider.tsx` 생성:

```typescript
'use client'

import { useEffect } from 'react'

interface ThemeProviderProps {
  themeId: string
  children: React.ReactNode
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
  }, [themeId])

  return <>{children}</>
}
```

- [ ] **Step 3: 루트 레이아웃에 적용**

`app/layout.tsx` 수정:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PageRoom',
  description: '읽고, 기록하고, 운영하고, 쓰는 나만의 서점',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let themeId = 'default'
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('theme_id')
      .eq('user_id', user.id)
      .single()
    if (data) themeId = data.theme_id
  }

  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider themeId={themeId}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: 커밋**

```bash
git add styles/ components/theme-provider.tsx app/globals.css app/layout.tsx
git commit -m "feat: add CSS variable theme system with default and cream themes"
```

---

## Task 6: 랜딩 페이지, 로그인, 네비게이션

**Files:**
- Create: `app/page.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(main)/layout.tsx`
- Create: `components/navbar.tsx`

- [ ] **Step 1: 랜딩 페이지**

`app/page.tsx` 생성:

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold" style={{ color: 'rgb(var(--color-primary))' }}>
        📚 PageRoom
      </h1>
      <p className="text-lg max-w-md" style={{ color: 'rgb(var(--color-text-muted))' }}>
        읽고, 기록하고, 운영하고, 쓰는 나만의 서점
      </p>
      <Button asChild>
        <Link href="/login">시작하기</Link>
      </Button>
    </main>
  )
}
```

- [ ] **Step 2: 로그인 페이지**

`app/(auth)/login/page.tsx` 생성:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (error) setMessage(error.message)
      else setMessage('이메일을 확인해주세요.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/library'
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">📚 PageRoom</h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {isSignUp ? '회원가입' : '로그인'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {message && (
            <p className="text-sm text-center" style={{ color: 'rgb(var(--color-text-muted))' }}>
              {message}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '처리 중...' : isSignUp ? '가입하기' : '로그인'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-center"
          style={{ color: 'rgb(var(--color-primary))' }}
        >
          {isSignUp ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Navbar 컴포넌트**

`components/navbar.tsx` 생성:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/library', label: '서재' },
  { href: '/store', label: '서점' },
  { href: '/reviews', label: '독후감' },
  { href: '/settings', label: '설정' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between"
      style={{
        backgroundColor: 'rgb(var(--color-surface-card))',
        borderColor: 'rgb(var(--color-border))',
      }}
    >
      <Link href="/library" className="font-bold text-lg">
        📚 PageRoom
      </Link>

      <div className="flex items-center gap-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'font-semibold'
                : '',
            )}
            style={{
              color: pathname.startsWith(item.href)
                ? 'rgb(var(--color-primary))'
                : 'rgb(var(--color-text-muted))',
            }}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="text-sm"
          style={{ color: 'rgb(var(--color-text-muted))' }}
        >
          로그아웃
        </button>
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: 메인 레이아웃**

`app/(main)/layout.tsx` 생성:

```typescript
import { Navbar } from '@/components/navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-surface))' }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: 커밋**

```bash
git add app/page.tsx app/\(auth\)/ app/\(main\)/layout.tsx components/navbar.tsx
git commit -m "feat: add landing, login, and main navigation layout"
```

---

## Task 7: 서재 뷰 (콘텐츠 목록)

**Files:**
- Create: `components/reading-status-badge.tsx`
- Create: `components/library-filters.tsx`
- Create: `components/content-card.tsx`
- Create: `app/(main)/library/page.tsx`
- Create: `__tests__/reading-status-badge.test.tsx`
- Create: `__tests__/library-filters.test.tsx`

- [ ] **Step 1: ReadingStatusBadge 테스트 작성**

`__tests__/reading-status-badge.test.tsx` 생성:

```typescript
import { render, screen } from '@testing-library/react'
import { ReadingStatusBadge } from '@/components/reading-status-badge'

describe('ReadingStatusBadge', () => {
  it('상태 라벨 렌더링', () => {
    render(<ReadingStatusBadge status="reading" />)
    expect(screen.getByText('읽는 중')).toBeInTheDocument()
  })

  it('완독 상태 렌더링', () => {
    render(<ReadingStatusBadge status="completed" />)
    expect(screen.getByText('완독')).toBeInTheDocument()
  })

  it('최신화 도달 상태 렌더링', () => {
    render(<ReadingStatusBadge status="up_to_date" />)
    expect(screen.getByText('최신화 도달')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- --testPathPattern="reading-status-badge"
```

Expected: FAIL

- [ ] **Step 3: ReadingStatusBadge 구현**

`components/reading-status-badge.tsx` 생성:

```typescript
import { getStatusLabel, getStatusColor } from '@/lib/utils'
import type { ReadingStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ReadingStatusBadgeProps {
  status: ReadingStatus
  className?: string
}

export function ReadingStatusBadge({ status, className }: ReadingStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        getStatusColor(status),
        className,
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- --testPathPattern="reading-status-badge"
```

Expected: PASS

- [ ] **Step 5: LibraryFilters 테스트 작성**

`__tests__/library-filters.test.tsx` 생성:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LibraryFilters } from '@/components/library-filters'

describe('LibraryFilters', () => {
  it('필터 버튼 렌더링', () => {
    render(
      <LibraryFilters
        selectedStatus={null}
        selectedType={null}
        onStatusChange={() => {}}
        onTypeChange={() => {}}
      />,
    )
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('읽는 중')).toBeInTheDocument()
    expect(screen.getByText('완독')).toBeInTheDocument()
  })

  it('상태 필터 클릭 시 콜백 호출', async () => {
    const onStatusChange = jest.fn()
    render(
      <LibraryFilters
        selectedStatus={null}
        selectedType={null}
        onStatusChange={onStatusChange}
        onTypeChange={() => {}}
      />,
    )
    await userEvent.click(screen.getByText('읽는 중'))
    expect(onStatusChange).toHaveBeenCalledWith('reading')
  })
})
```

- [ ] **Step 6: LibraryFilters 구현**

`components/library-filters.tsx` 생성:

```typescript
'use client'

import { cn } from '@/lib/utils'
import { getStatusLabel, getContentTypeLabel } from '@/lib/utils'
import type { ReadingStatus, ContentType } from '@/lib/types'

const STATUS_OPTIONS: ReadingStatus[] = [
  'reading', 'completed', 'to_read', 'dropped', 'rereading', 'waiting', 'up_to_date',
]

const TYPE_OPTIONS: ContentType[] = ['book', 'webnovel', 'indie', 'original']

interface LibraryFiltersProps {
  selectedStatus: ReadingStatus | null
  selectedType: ContentType | null
  onStatusChange: (status: ReadingStatus | null) => void
  onTypeChange: (type: ContentType | null) => void
}

export function LibraryFilters({
  selectedStatus,
  selectedType,
  onStatusChange,
  onTypeChange,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="전체"
          active={selectedStatus === null && selectedType === null}
          onClick={() => { onStatusChange(null); onTypeChange(null) }}
        />
        {STATUS_OPTIONS.map((s) => (
          <FilterChip
            key={s}
            label={getStatusLabel(s)}
            active={selectedStatus === s}
            onClick={() => onStatusChange(selectedStatus === s ? null : s)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((t) => (
          <FilterChip
            key={t}
            label={getContentTypeLabel(t)}
            active={selectedType === t}
            onClick={() => onTypeChange(selectedType === t ? null : t)}
          />
        ))}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-sm font-medium transition-colors',
        active
          ? 'text-white'
          : 'border',
      )}
      style={
        active
          ? { backgroundColor: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary-foreground))' }
          : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-text-muted))' }
      }
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 7: ContentCard 컴포넌트**

`components/content-card.tsx` 생성:

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { ReadingStatusBadge } from './reading-status-badge'
import { formatProgress, getContentTypeLabel } from '@/lib/utils'
import type { ContentWithRecord } from '@/lib/types'

interface ContentCardProps {
  content: ContentWithRecord
}

export function ContentCard({ content }: ContentCardProps) {
  const record = content.reading_record

  const progress = record
    ? formatProgress(
        content.type,
        record.progress_page,
        record.progress_episode,
        content.total_pages,
        content.total_episodes,
      )
    : ''

  const progressPercent =
    record && content.total_pages && record.progress_page
      ? Math.round((record.progress_page / content.total_pages) * 100)
      : record && content.total_episodes && record.progress_episode
      ? Math.round((record.progress_episode / content.total_episodes) * 100)
      : null

  return (
    <Link href={`/library/${content.id}`}>
      <div
        className="flex gap-3 items-center rounded-xl p-3 border transition-shadow hover:shadow-sm"
        style={{
          backgroundColor: 'rgb(var(--color-surface-card))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        {/* 커버 */}
        <div className="w-10 h-14 rounded flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: 'rgb(var(--color-accent))' }}>
          {content.cover_url && (
            <Image
              src={content.cover_url}
              alt={content.title}
              width={40}
              height={56}
              className="object-cover w-full h-full"
            />
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{content.title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {content.author && `${content.author} · `}
            {getContentTypeLabel(content.type)}
            {progress && ` · ${progress}`}
          </p>
          {progressPercent !== null && (
            <div className="mt-1.5 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgb(var(--color-accent))' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'rgb(var(--color-primary))',
                }}
              />
            </div>
          )}
        </div>

        {/* 상태 */}
        {record && <ReadingStatusBadge status={record.status} />}
      </div>
    </Link>
  )
}
```

- [ ] **Step 8: 서재 페이지**

`app/(main)/library/page.tsx` 생성:

```typescript
import { createClient } from '@/lib/supabase/server'
import { ContentCard } from '@/components/content-card'
import { LibraryFiltersWrapper } from './library-filters-wrapper'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ContentWithRecord } from '@/lib/types'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: contents } = await supabase
    .from('contents')
    .select(`
      *,
      reading_record:reading_records(*)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const items: ContentWithRecord[] = (contents ?? []).map((c) => ({
    ...c,
    reading_record: Array.isArray(c.reading_record) ? c.reading_record[0] ?? null : c.reading_record,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">내 서재</h1>
        <Button asChild size="sm">
          <Link href="/add">+ 추가</Link>
        </Button>
      </div>

      <LibraryFiltersWrapper contents={items} />
    </div>
  )
}
```

`app/(main)/library/library-filters-wrapper.tsx` 생성:

```typescript
'use client'

import { useState } from 'react'
import { LibraryFilters } from '@/components/library-filters'
import { ContentCard } from '@/components/content-card'
import type { ContentWithRecord, ReadingStatus, ContentType } from '@/lib/types'

interface Props {
  contents: ContentWithRecord[]
}

export function LibraryFiltersWrapper({ contents }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | null>(null)
  const [selectedType, setSelectedType] = useState<ContentType | null>(null)

  const filtered = contents.filter((c) => {
    const statusMatch = !selectedStatus || c.reading_record?.status === selectedStatus
    const typeMatch = !selectedType || c.type === selectedType
    return statusMatch && typeMatch
  })

  return (
    <div className="space-y-4">
      <LibraryFilters
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
      />
      {filtered.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
          콘텐츠가 없어요.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => <ContentCard key={c.id} content={c} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 9: 테스트 통과 확인**

```bash
npm test
```

Expected: 전체 PASS

- [ ] **Step 10: 커밋**

```bash
git add components/reading-status-badge.tsx components/library-filters.tsx components/content-card.tsx app/\(main\)/library/ __tests__/
git commit -m "feat: add library view with content cards and filters"
```

---

## Task 8: 콘텐츠 등록 폼

**Files:**
- Create: `lib/actions/content.ts`
- Create: `components/content-form.tsx`
- Create: `app/(main)/add/page.tsx`

- [ ] **Step 1: 콘텐츠 Server Action**

`lib/actions/content.ts` 생성:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ContentType, ReadingStatus } from '@/lib/types'

export async function createContent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const type = formData.get('type') as ContentType
  const title = formData.get('title') as string
  const author = (formData.get('author') as string) || ''
  const genre = ((formData.get('genre') as string) || '')
    .split(',').map((g) => g.trim()).filter(Boolean)
  const totalPages = formData.get('total_pages') ? Number(formData.get('total_pages')) : null
  const totalEpisodes = formData.get('total_episodes') ? Number(formData.get('total_episodes')) : null
  const isOngoing = formData.get('is_ongoing') === 'true'
  const initialStatus = (formData.get('initial_status') as ReadingStatus) || 'to_read'

  // 커버 이미지 업로드
  let coverUrl: string | null = null
  const coverFile = formData.get('cover') as File | null
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(path, coverFile)
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path)
      coverUrl = urlData.publicUrl
    }
  }

  // contents 삽입
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .insert({ user_id: user.id, type, title, author, genre, cover_url: coverUrl, total_pages: totalPages, total_episodes: totalEpisodes, is_ongoing: isOngoing })
    .select()
    .single()

  if (contentError || !content) throw new Error(contentError?.message)

  // reading_records 삽입
  const { data: record, error: recordError } = await supabase
    .from('reading_records')
    .insert({ user_id: user.id, content_id: content.id, status: initialStatus })
    .select()
    .single()

  if (recordError || !record) throw new Error(recordError?.message)

  // 초기 activity_log
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    content_id: content.id,
    record_id: record.id,
    action: 'started',
    note: `${title} 등록`,
  })

  revalidatePath('/library')
  redirect(`/library/${content.id}`)
}
```

- [ ] **Step 2: ContentForm 컴포넌트**

`components/content-form.tsx` 생성:

```typescript
'use client'

import { useState } from 'react'
import { createContent } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getContentTypeLabel, getStatusLabel } from '@/lib/utils'
import type { ContentType, ReadingStatus } from '@/lib/types'

const CONTENT_TYPES: ContentType[] = ['book', 'webnovel', 'indie', 'original']
const INITIAL_STATUSES: ReadingStatus[] = ['to_read', 'reading', 'completed']

interface ContentFormProps {
  defaultType?: ContentType
}

export function ContentForm({ defaultType = 'book' }: ContentFormProps) {
  const [type, setType] = useState<ContentType>(defaultType)
  const [loading, setLoading] = useState(false)

  const isBook = type === 'book'
  const isEpisodic = type === 'webnovel' || type === 'indie'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.set('type', type)
    await createContent(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* 타입 선택 */}
      <div className="space-y-1">
        <Label>콘텐츠 타입</Label>
        <div className="flex gap-2 flex-wrap">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="rounded-full px-3 py-1 text-sm border transition-colors"
              style={
                type === t
                  ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white', borderColor: 'transparent' }
                  : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-text-muted))' }
              }
            >
              {getContentTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="title">제목 *</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="author">작가</Label>
        <Input id="author" name="author" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="genre">장르 (쉼표로 구분)</Label>
        <Input id="genre" name="genre" placeholder="판타지, 로맨스" />
      </div>

      {isBook && (
        <div className="space-y-1">
          <Label htmlFor="total_pages">총 페이지 수</Label>
          <Input id="total_pages" name="total_pages" type="number" min={1} />
        </div>
      )}

      {isEpisodic && (
        <>
          <div className="space-y-1">
            <Label htmlFor="total_episodes">총 화수</Label>
            <Input id="total_episodes" name="total_episodes" type="number" min={1} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_ongoing" name="is_ongoing" value="true" />
            <Label htmlFor="is_ongoing">연재 중</Label>
          </div>
        </>
      )}

      <div className="space-y-1">
        <Label htmlFor="cover">커버 이미지</Label>
        <Input id="cover" name="cover" type="file" accept="image/*" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="initial_status">초기 상태</Label>
        <select
          id="initial_status"
          name="initial_status"
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: 'rgb(var(--color-border))' }}
        >
          {INITIAL_STATUSES.map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '저장 중...' : '등록하기'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: 등록 페이지**

`app/(main)/add/page.tsx` 생성:

```typescript
import { ContentForm } from '@/components/content-form'
import type { ContentType } from '@/lib/types'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function AddPage({ searchParams }: Props) {
  const { type } = await searchParams
  const validTypes: ContentType[] = ['book', 'webnovel', 'indie', 'original']
  const defaultType: ContentType = validTypes.includes(type as ContentType)
    ? (type as ContentType)
    : 'book'

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">콘텐츠 추가</h1>
      <ContentForm defaultType={defaultType} />
    </div>
  )
}
```

- [ ] **Step 4: 동작 확인**

```bash
npm run dev
```

브라우저에서 `/add` 접속 → 폼 작성 → 등록 → `/library` 리디렉션 확인.

- [ ] **Step 5: 커밋**

```bash
git add lib/actions/content.ts components/content-form.tsx app/\(main\)/add/
git commit -m "feat: add content registration form with file upload"
```

---

## Task 9: 콘텐츠 상세 & 진행도 업데이트

**Files:**
- Create: `lib/actions/reading-record.ts`
- Create: `lib/actions/activity-log.ts`
- Create: `components/progress-form.tsx`
- Create: `components/activity-log-timeline.tsx`
- Create: `app/(main)/library/[contentId]/page.tsx`

- [ ] **Step 1: 진행도 업데이트 Server Action**

`lib/actions/reading-record.ts` 생성:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ReadingStatus } from '@/lib/types'

export async function updateProgress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const recordId = formData.get('record_id') as string
  const contentId = formData.get('content_id') as string
  const progressPage = formData.get('progress_page') ? Number(formData.get('progress_page')) : null
  const progressEpisode = formData.get('progress_episode') ? Number(formData.get('progress_episode')) : null
  const status = formData.get('status') as ReadingStatus
  const note = formData.get('note') as string | null

  await supabase
    .from('reading_records')
    .update({
      status,
      progress_page: progressPage,
      progress_episode: progressEpisode,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', recordId)
    .eq('user_id', user.id)

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    content_id: contentId,
    record_id: recordId,
    action: status === 'completed' ? 'completed' : 'progress',
    note: note || null,
    progress_snapshot: progressPage ?? progressEpisode,
  })

  revalidatePath(`/library/${contentId}`)
}
```

- [ ] **Step 2: ProgressForm 컴포넌트**

`components/progress-form.tsx` 생성:

```typescript
'use client'

import { useState } from 'react'
import { updateProgress } from '@/lib/actions/reading-record'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStatusLabel } from '@/lib/utils'
import type { ReadingStatus, ContentType, ReadingRecord } from '@/lib/types'

const STATUS_OPTIONS: ReadingStatus[] = [
  'reading', 'completed', 'to_read', 'dropped', 'rereading', 'waiting', 'up_to_date',
]

interface ProgressFormProps {
  record: ReadingRecord
  contentId: string
  contentType: ContentType
}

export function ProgressForm({ record, contentId, contentType }: ProgressFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    await updateProgress(formData)
    setLoading(false)
  }

  const isBook = contentType === 'book'
  const isEpisodic = contentType === 'webnovel' || contentType === 'indie'

  return (
    <form action={handleSubmit} className="space-y-3 rounded-xl p-4 border"
      style={{ backgroundColor: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))' }}>
      <input type="hidden" name="record_id" value={record.id} />
      <input type="hidden" name="content_id" value={contentId} />

      <div className="space-y-1">
        <Label htmlFor="status">상태</Label>
        <select
          id="status"
          name="status"
          defaultValue={record.status}
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: 'rgb(var(--color-border))' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      {isBook && (
        <div className="space-y-1">
          <Label htmlFor="progress_page">현재 페이지</Label>
          <Input
            id="progress_page"
            name="progress_page"
            type="number"
            min={0}
            defaultValue={record.progress_page ?? ''}
          />
        </div>
      )}

      {isEpisodic && (
        <div className="space-y-1">
          <Label htmlFor="progress_episode">현재 화수</Label>
          <Input
            id="progress_episode"
            name="progress_episode"
            type="number"
            min={0}
            defaultValue={record.progress_episode ?? ''}
          />
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="note">메모 (선택)</Label>
        <Input id="note" name="note" placeholder="오늘의 독서 메모..." />
      </div>

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? '저장 중...' : '기록하기'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: 활동 로그 타임라인 컴포넌트**

`components/activity-log-timeline.tsx` 생성:

```typescript
import type { ActivityLog } from '@/lib/types'

interface ActivityLogTimelineProps {
  logs: ActivityLog[]
}

const ACTION_LABELS: Record<string, string> = {
  progress: '진행도 업데이트',
  status_change: '상태 변경',
  review_written: '독후감 작성',
  started: '등록',
  completed: '완독',
}

export function ActivityLogTimeline({ logs }: ActivityLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-center py-4" style={{ color: 'rgb(var(--color-text-muted))' }}>
        활동 기록이 없어요.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3 text-sm">
          <span className="flex-shrink-0 w-16 text-right" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {new Date(log.logged_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
          </span>
          <div>
            <span className="font-medium">{ACTION_LABELS[log.action] ?? log.action}</span>
            {log.note && (
              <span style={{ color: 'rgb(var(--color-text-muted))' }}> — {log.note}</span>
            )}
            {log.progress_snapshot !== null && !log.note && (
              <span style={{ color: 'rgb(var(--color-text-muted))' }}> {log.progress_snapshot}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 콘텐츠 상세 페이지**

`app/(main)/library/[contentId]/page.tsx` 생성:

```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReadingStatusBadge } from '@/components/reading-status-badge'
import { ProgressForm } from '@/components/progress-form'
import { ActivityLogTimeline } from '@/components/activity-log-timeline'
import { getContentTypeLabel, formatProgress } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ contentId: string }>
}

export default async function ContentDetailPage({ params }: Props) {
  const { contentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: content } = await supabase
    .from('contents')
    .select('*')
    .eq('id', contentId)
    .eq('user_id', user!.id)
    .single()

  if (!content) notFound()

  const { data: record } = await supabase
    .from('reading_records')
    .select('*')
    .eq('content_id', contentId)
    .eq('user_id', user!.id)
    .single()

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('content_id', contentId)
    .eq('user_id', user!.id)
    .order('logged_at', { ascending: false })

  const { data: review } = await supabase
    .from('reviews')
    .select('id')
    .eq('content_id', contentId)
    .eq('user_id', user!.id)
    .single()

  const progress = record
    ? formatProgress(content.type, record.progress_page, record.progress_episode, content.total_pages, content.total_episodes)
    : ''

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex gap-4">
        <div className="w-16 h-22 flex-shrink-0 rounded-lg overflow-hidden"
          style={{ backgroundColor: 'rgb(var(--color-accent))' }}>
          {content.cover_url && (
            <Image src={content.cover_url} alt={content.title} width={64} height={88} className="object-cover w-full h-full" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{content.title}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {content.author && `${content.author} · `}
            {getContentTypeLabel(content.type)}
            {progress && ` · ${progress}`}
          </p>
          {record && <ReadingStatusBadge status={record.status} className="mt-2" />}
        </div>
      </div>

      {/* 진행도 업데이트 */}
      {record && (
        <div>
          <h2 className="font-semibold mb-2">진행도 업데이트</h2>
          <ProgressForm record={record} contentId={content.id} contentType={content.type} />
        </div>
      )}

      {/* 독후감 */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">독후감</h2>
        <Button asChild variant="outline" size="sm">
          <Link href={review ? `/reviews/${review.id}` : `/reviews/new?contentId=${content.id}`}>
            {review ? '독후감 보기' : '독후감 쓰기'}
          </Link>
        </Button>
      </div>

      {/* 활동 로그 */}
      <div>
        <h2 className="font-semibold mb-3">활동 로그</h2>
        <ActivityLogTimeline logs={logs ?? []} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 동작 확인**

```bash
npm run dev
```

서재에서 콘텐츠 클릭 → 상세 페이지 → 진행도 기록 → 활동 로그에 추가됨 확인.

- [ ] **Step 6: 커밋**

```bash
git add lib/actions/reading-record.ts components/progress-form.tsx components/activity-log-timeline.tsx app/\(main\)/library/\[contentId\]/
git commit -m "feat: add content detail page with progress tracking and activity log"
```

---

## Task 10: 독후감

**Files:**
- Create: `lib/actions/review.ts`
- Create: `components/review-editor.tsx`
- Create: `app/(main)/reviews/page.tsx`
- Create: `app/(main)/reviews/new/page.tsx`
- Create: `app/(main)/reviews/[reviewId]/page.tsx`

- [ ] **Step 1: 독후감 Server Actions**

`lib/actions/review.ts` 생성:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function upsertReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const reviewId = formData.get('review_id') as string | null
  const contentId = formData.get('content_id') as string
  const body = formData.get('body') as string
  const rating = Number(formData.get('rating')) || 0
  const isPublic = formData.get('is_public') === 'true'

  let resultId = reviewId

  if (reviewId) {
    await supabase
      .from('reviews')
      .update({ body, rating, is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .eq('user_id', user.id)
  } else {
    const { data, error } = await supabase
      .from('reviews')
      .insert({ user_id: user.id, content_id: contentId, body, rating, is_public: isPublic })
      .select()
      .single()
    if (error || !data) throw new Error(error?.message)
    resultId = data.id

    // 독후감 작성 활동 로그
    const { data: record } = await supabase
      .from('reading_records')
      .select('id')
      .eq('content_id', contentId)
      .eq('user_id', user.id)
      .single()

    if (record) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        content_id: contentId,
        record_id: record.id,
        action: 'review_written',
        note: '독후감 작성',
      })
    }
  }

  revalidatePath('/reviews')
  revalidatePath(`/library/${contentId}`)
  redirect(`/reviews/${resultId}`)
}
```

- [ ] **Step 2: ReviewEditor 컴포넌트**

`components/review-editor.tsx` 생성:

```typescript
'use client'

import { useState } from 'react'
import { upsertReview } from '@/lib/actions/review'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ReviewEditorProps {
  contentId: string
  reviewId?: string
  initialBody?: string
  initialRating?: number
  initialIsPublic?: boolean
  contentTitle: string
}

export function ReviewEditor({
  contentId,
  reviewId,
  initialBody = '',
  initialRating = 0,
  initialIsPublic = false,
  contentTitle,
}: ReviewEditorProps) {
  const [rating, setRating] = useState(initialRating)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.set('rating', String(rating))
    await upsertReview(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="content_id" value={contentId} />
      {reviewId && <input type="hidden" name="review_id" value={reviewId} />}

      <div>
        <h1 className="text-xl font-bold">{contentTitle}</h1>
        <p className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>독후감</p>
      </div>

      {/* 별점 */}
      <div className="space-y-1">
        <Label>별점</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(rating === star ? 0 : star)}
              className="text-2xl transition-transform hover:scale-110"
            >
              {star <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="body">내용 (마크다운 지원)</Label>
        <Textarea
          id="body"
          name="body"
          defaultValue={initialBody}
          rows={10}
          placeholder="이 책에 대한 생각을 자유롭게 기록해보세요..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_public"
          name="is_public"
          value="true"
          defaultChecked={initialIsPublic}
        />
        <Label htmlFor="is_public">공개</Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '저장 중...' : '저장하기'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: 독후감 목록 페이지**

`app/(main)/reviews/page.tsx` 생성:

```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, content:contents(title, type)')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">독후감</h1>

      {(!reviews || reviews.length === 0) ? (
        <p className="text-center py-12 text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
          작성한 독후감이 없어요.
        </p>
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <Link key={review.id} href={`/reviews/${review.id}`}>
              <div
                className="rounded-xl p-4 border"
                style={{ backgroundColor: 'rgb(var(--color-surface-card))', borderColor: 'rgb(var(--color-border))' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{(review.content as any)?.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>
                      {review.rating > 0 && '★'.repeat(review.rating)}
                      {review.is_public && ' · 공개'}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
                    {new Date(review.updated_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                {review.body && (
                  <p className="mt-2 text-sm line-clamp-2" style={{ color: 'rgb(var(--color-text-muted))' }}>
                    {review.body}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 독후감 작성 페이지 (신규)**

`app/(main)/reviews/new/page.tsx` 생성:

```typescript
import { createClient } from '@/lib/supabase/server'
import { ReviewEditor } from '@/components/review-editor'
import { notFound } from 'next/navigation'

interface Props {
  searchParams: Promise<{ contentId?: string }>
}

export default async function NewReviewPage({ searchParams }: Props) {
  const { contentId } = await searchParams
  if (!contentId) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: content } = await supabase
    .from('contents')
    .select('id, title')
    .eq('id', contentId)
    .eq('user_id', user!.id)
    .single()

  if (!content) notFound()

  return (
    <ReviewEditor
      contentId={content.id}
      contentTitle={content.title}
    />
  )
}
```

- [ ] **Step 5: 독후감 상세/편집 페이지**

`app/(main)/reviews/[reviewId]/page.tsx` 생성:

```typescript
import { createClient } from '@/lib/supabase/server'
import { ReviewEditor } from '@/components/review-editor'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ reviewId: string }>
}

export default async function ReviewDetailPage({ params }: Props) {
  const { reviewId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: review } = await supabase
    .from('reviews')
    .select('*, content:contents(id, title)')
    .eq('id', reviewId)
    .eq('user_id', user!.id)
    .single()

  if (!review) notFound()

  const content = review.content as { id: string; title: string }

  return (
    <ReviewEditor
      contentId={content.id}
      reviewId={review.id}
      initialBody={review.body}
      initialRating={review.rating}
      initialIsPublic={review.is_public}
      contentTitle={content.title}
    />
  )
}
```

- [ ] **Step 6: 커밋**

```bash
git add lib/actions/review.ts components/review-editor.tsx app/\(main\)/reviews/
git commit -m "feat: add review writing and management"
```

---

## Task 11: 설정 페이지

**Files:**
- Create: `lib/actions/profile.ts`
- Create: `app/(main)/settings/page.tsx`
- Create: `app/(main)/store/page.tsx`

- [ ] **Step 1: 프로필 Server Action**

`lib/actions/profile.ts` 생성:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const storeName = formData.get('store_name') as string
  const themeId = formData.get('theme_id') as string

  await supabase
    .from('user_profiles')
    .update({ store_name: storeName, theme_id: themeId })
    .eq('user_id', user.id)

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
}
```

- [ ] **Step 2: 설정 페이지**

`app/(main)/settings/page.tsx` 생성:

```typescript
import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const THEMES = [
  { id: 'default', label: '기본 (인디고)' },
  { id: 'cream', label: '크림' },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">설정</h1>

      <form action={updateProfile} className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="store_name">서점 이름</Label>
          <Input
            id="store_name"
            name="store_name"
            defaultValue={profile?.store_name ?? '나의 서점'}
          />
        </div>

        <div className="space-y-2">
          <Label>테마</Label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((theme) => (
              <label
                key={theme.id}
                className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer"
                style={{ borderColor: 'rgb(var(--color-border))' }}
              >
                <input
                  type="radio"
                  name="theme_id"
                  value={theme.id}
                  defaultChecked={profile?.theme_id === theme.id}
                />
                <span className="text-sm">{theme.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit">저장하기</Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: 서점 자리 예약 페이지**

`app/(main)/store/page.tsx` 생성:

```typescript
export default function StorePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <span className="text-5xl">🏗️</span>
      <h1 className="text-xl font-bold">서점 준비 중</h1>
      <p className="text-sm max-w-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
        독서 기록이 쌓이면 서점이 열립니다. 더 많이 읽어보세요!
      </p>
    </div>
  )
}
```

- [ ] **Step 4: 커밋**

```bash
git add lib/actions/profile.ts app/\(main\)/settings/ app/\(main\)/store/
git commit -m "feat: add settings page with theme selection and store placeholder"
```

---

## Task 12: Vercel 배포

- [ ] **Step 1: GitHub 리포지토리 생성 및 푸시**

```bash
git remote add origin https://github.com/<your-username>/pageroom.git
git push -u origin main
```

- [ ] **Step 2: Vercel 배포**

1. https://vercel.com 접속 → New Project
2. GitHub 리포지토리 선택
3. Framework Preset: Next.js (자동 감지)
4. Environment Variables에 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key

5. Deploy 클릭

- [ ] **Step 3: Supabase Auth 리디렉션 URL 설정**

Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-project.vercel.app`
- Redirect URLs에 추가: `https://your-project.vercel.app/auth/callback`

- [ ] **Step 4: 전체 플로우 확인**

배포된 URL에서:
1. 회원가입 → 이메일 인증 → 자동 로그인
2. 서재 진입 → 콘텐츠 추가 (책/웹소설)
3. 상세 페이지 → 진행도 기록 → 활동 로그 확인
4. 독후감 작성 → 목록에서 확인
5. 설정 → 테마 변경 → 전체 UI 색상 변경 확인
6. 로그아웃 → 랜딩 페이지 리디렉션

- [ ] **Step 5: 최종 커밋**

```bash
git add .
git commit -m "chore: finalize Phase 1 deployment"
git push
```

---

## Self-Review

**Spec Coverage:**
- ✅ 인증 (Task 6, 7)
- ✅ 콘텐츠 등록 4가지 타입 (Task 8)
- ✅ 독서 상태 7가지 (Task 9, lib/types.ts)
- ✅ 활동 로그 타임라인 (Task 9)
- ✅ 독후감 마크다운/별점/공개 (Task 10)
- ✅ 서재 상태/타입 필터 (Task 7)
- ✅ 테마 CSS 변수 + 2가지 테마 (Task 5, 11)
- ✅ RLS 적용 (Task 3)
- ✅ Vercel 배포 (Task 12)
- ✅ 커버 이미지 업로드 (Task 8)
- ✅ 서점 페이지 자리 예약 (Task 11)

**Type Consistency:**
- `ContentWithRecord` — Task 7 서재 페이지에서 사용, lib/types.ts에 정의 ✅
- `ReadingRecord` — ProgressForm props에서 사용, lib/types.ts에 정의 ✅
- `ActivityLog` — ActivityLogTimeline props에서 사용, lib/types.ts에 정의 ✅
- `ContentType`, `ReadingStatus` — 전 태스크에서 일관되게 사용 ✅
