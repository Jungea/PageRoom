# Supabase 초기 설정 가이드

## 1. 프로젝트 생성

1. https://supabase.com 접속 → **New Project** 생성
2. 프로젝트 이름: `pageroom`
3. 생성 완료까지 1~2분 대기

## 2. 환경 변수 설정

**Settings → API** 에서 다음 값 복사 후 `.env.local` 파일 생성:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxx...
```

> `.env.local` 은 `.gitignore`에 포함되어 있어 git에 올라가지 않습니다.

## 3. 데이터베이스 스키마 실행

**SQL Editor** 에서 아래 SQL을 순서대로 실행하세요.

### 001 — 테이블 생성

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

### 002 — RLS 정책 설정

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

## 4. Storage 버킷 생성

**Storage → New Bucket**:
- Name: `covers`
- Public bucket: **ON** (커버 이미지는 공개 URL로 접근)

## 5. Auth 설정 (배포 후)

Vercel 배포 완료 후 **Authentication → URL Configuration**:
- Site URL: `https://your-project.vercel.app`
- Redirect URLs: `https://your-project.vercel.app/auth/callback`
