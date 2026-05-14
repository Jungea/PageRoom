# PageRoom — 설계 문서

> "읽고, 기록하고, 운영하고, 쓰는 나만의 서점"

독서 기록 서비스 + 서점 운영 타이쿤 + 창작 공간이 결합된 웹 서비스.

---

## 1. 개요

### 핵심 루프

```
읽는다 → 기록한다 → 서점 재고가 생긴다 → 손님이 방문한다 → 서점이 성장한다 → 더 다양한 독서를 하게 된다
```

### 개발 방향

단계별 개발 (개발 → 확인 → 개선 → 완료 → 다음 단계).  
Phase 1 완료 후 Phase 2 진입하는 방식. 각 Phase는 독립적으로 동작 가능해야 한다.

---

## 2. 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 풀스택, SSR, 생태계 |
| 언어 | TypeScript | 타입 안정성, Java 개발자 적응 용이 |
| 스타일 | Tailwind CSS + shadcn/ui | 빠른 UI 구성 |
| 백엔드/DB | Supabase | PostgreSQL + Auth + Storage 올인원, 무료 시작 |
| 배포 | Vercel | Next.js 최적화, 자동 배포 |
| AI (Phase 3) | Claude API | 독후감 분석, 손님 대사 생성 |

### 테마 시스템

CSS 커스텀 프로퍼티(변수) 기반으로 전체 UI를 구성한다.  
테마는 변수 세트를 교체하는 방식이므로, 나중에 유료 테마를 DB에 저장하고 적용만 하면 코드 변경 없이 추가 가능.  
수익화 모델: 유료 테마 판매, 서점 꾸미기 아이템 (Phase 4).

---

## 3. 개발 단계 로드맵

### Phase 1 — 독서 기록 시스템 (현재 목표)
콘텐츠 등록 · 독서 상태 관리 · 활동 로그 · 독후감 · 서재 뷰 · 테마 기반 구축

### Phase 2 — 서점 운영 시스템
서점 개설 · 읽은 책 → 재고 전환 · 손님 시스템 · 레벨/평판 · 장르 편향 알림

### Phase 3 — AI 시스템
독후감 분석 (감정/키워드/깊이) · AI 손님 대사 생성 · 취향 기반 추천

### Phase 4 — 창작 & 수익화
창작 글 작성/서재 진열 · 유료 테마 판매 · 서점 꾸미기 아이템

---

## 4. 데이터 모델 (Phase 1)

### 테이블 관계

```
users (Supabase Auth)
└─ user_profiles       서점 이름, 테마, 레벨
└─ contents            등록한 콘텐츠
    └─ reading_records 독서 상태 + 진행도
        └─ activity_logs 날짜별 활동 기록
    └─ reviews         독후감
```

### contents

```sql
id            uuid PK
user_id       uuid FK → auth.users
type          text  -- 'book' | 'webnovel' | 'indie' | 'original'
title         text
author        text
cover_url     text
genre         text[]          -- 장르 배열 (서점 진열/손님 매칭에 사용)
isbn          text            -- 선택, 외부 API 연동 대비
external_id   text            -- 선택
total_pages   int             -- 책 전용
total_episodes int            -- 웹소설 전용
is_ongoing    boolean         -- 연재 중 여부
created_at    timestamptz
```

### reading_records

```sql
id                uuid PK
user_id           uuid FK → auth.users
content_id        uuid FK → contents
status            text  -- 'to_read' | 'reading' | 'completed' | 'dropped' | 'rereading' | 'waiting' | 'up_to_date'
progress_page     int
progress_episode  int
started_at        timestamptz
completed_at      timestamptz
is_in_store       boolean default false  -- Phase 2에서 활성화
```

### activity_logs

```sql
id                uuid PK
user_id           uuid FK → auth.users
content_id        uuid FK → contents
record_id         uuid FK → reading_records
action            text  -- 'progress' | 'status_change' | 'review_written' | 'started' | 'completed'
note              text  -- "130화까지 읽음" 같은 메모
progress_snapshot int   -- 이 시점의 진행도
logged_at         timestamptz
```

### reviews

```sql
id           uuid PK
user_id      uuid FK → auth.users
content_id   uuid FK → contents
body         text        -- 마크다운
rating       int         -- 1~5
is_public    boolean default false
ai_keywords  text[]      -- Phase 3에서 채워짐
ai_emotion   text        -- Phase 3에서 채워짐
ai_depth     text        -- Phase 3에서 채워짐
created_at   timestamptz
updated_at   timestamptz
```

### user_profiles

```sql
user_id          uuid PK = Supabase Auth uid
store_name       text
theme_id         text default 'default'
store_level      int default 1       -- Phase 2에서 활성화
store_reputation numeric default 0  -- Phase 2에서 활성화
created_at       timestamptz
```

---

## 5. 화면 구조

### URL 구조

```
/                       랜딩 (비로그인 소개)
/login                  로그인 / 회원가입
/library                내 서재 (메인 홈)
/library/[contentId]    콘텐츠 상세 + 활동 로그
/add                    콘텐츠 등록 (?type=book|webnovel|indie|original)
/reviews                독후감 목록
/reviews/[reviewId]     독후감 상세 / 작성
/store                  내 서점 (Phase 2, 자리 예약)
/settings               테마 변경, 프로필, 서점 이름
```

### 네비게이션

상단 고정 네비바: 서재 · 서점 · 독후감 · 설정

---

## 6. Phase 1 범위

### 만드는 것

- **인증**: 이메일/소셜 로그인 (Supabase Auth), 회원가입 시 서점 이름 설정
- **콘텐츠 등록**: 4가지 타입, 장르 태그, 커버 이미지 업로드, 연재 여부/총 분량
- **독서 상태 관리**: 7가지 상태, 페이지/화수 진행도 기록
- **활동 로그**: 타임라인 형식, 날짜·진행도·메모
- **독후감**: 마크다운 작성, 별점, 공개/비공개
- **서재 뷰**: 상태별 필터, 타입별 필터, 진행도 바
- **테마 시스템 기반**: CSS 변수 구조, 기본 테마 1개, 설정 페이지 자리 예약

### 만들지 않는 것 (Phase 2+)

- 서점 운영 / 손님 시스템
- AI 분석 / 추천
- 외부 도서 API 연동 (ISBN 검색) — 직접 입력으로 대체
- 유료 결제 / 테마 판매
- 소셜 기능
- 모바일 앱

---

## 7. Phase 1 완료 기준

- 콘텐츠 등록 → 상태 변경 → 활동 로그 기록이 끊김 없이 동작
- 독후감 작성 후 해당 콘텐츠 상세에서 확인 가능
- 서재에서 상태/타입 필터링 동작
- 로그인한 사용자만 자신의 데이터 접근 (Supabase RLS 적용)
- Vercel 배포 후 실제로 접속 가능
