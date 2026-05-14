# Phase 1 개발 완료 요약

> 개발 기간: 2026-05-14  
> 상태: **완료 + Vercel 배포 완료**

---

## 구현 기능

### 인증
- 이메일/비밀번호 로그인 & 회원가입 (Supabase Auth)
- 회원가입 시 서점 이름 설정 (`user_profiles` 자동 생성)
- 미로그인 시 `/login` 리다이렉트, 로그인 시 `/login` 접근 차단

### 콘텐츠 등록 (`/add`)
- 4가지 타입: 책 / 웹소설 / 비출간 / 창작
- 타입에 따라 조건부 필드 표시 (책: 총 페이지수 / 웹소설: 총 화수 + 연재 여부)
- 장르 태그 입력
- 커버 이미지 업로드 (Supabase Storage `covers` 버킷)
- 등록 시 `contents` + `reading_records` + `activity_logs` 동시 생성

### 서재 뷰 (`/library`)
- 전체 콘텐츠 목록 (커버 이미지, 제목, 진행도 바, 상태 배지)
- 상태 필터 (7가지): 읽고 싶음 / 읽는 중 / 완료 / 포기 / 재독 / 기다리는 중 / 최신화 완료
- 타입 필터 (4가지): 책 / 웹소설 / 비출간 / 창작

### 콘텐츠 상세 (`/library/[contentId]`)
- 콘텐츠 정보 표시
- 독서 상태 & 진행도 업데이트 (페이지 또는 화수)
- 활동 로그 타임라인 (날짜별, 한국어 형식)
- 해당 콘텐츠 독후감 바로가기

### 독후감 (`/reviews`)
- 독후감 목록 (별점, 공개 여부 표시)
- 마크다운 작성
- 별점 (0~5, 같은 별 재클릭 시 취소)
- 공개/비공개 설정
- 작성 시 `activity_logs`에 `review_written` 기록

### 설정 (`/settings`)
- 서점 이름 변경
- 테마 변경 (기본 / 크림)

### 서점 (`/store`)
- Phase 2를 위한 자리 예약 (플레이스홀더)

---

## 파일 구조

```
app/
├── layout.tsx                        # 루트 레이아웃 (테마 로드)
├── page.tsx                          # 랜딩 페이지
├── auth/callback/route.ts            # OAuth 콜백 + user_profiles 생성
├── (auth)/login/page.tsx             # 로그인 / 회원가입
└── (main)/
    ├── layout.tsx                    # 네비바 + 콘텐츠 래퍼
    ├── library/
    │   ├── page.tsx                  # 서재 목록
    │   ├── library-filters-wrapper.tsx
    │   └── [contentId]/page.tsx     # 콘텐츠 상세
    ├── add/page.tsx                  # 콘텐츠 등록
    ├── reviews/
    │   ├── page.tsx                  # 독후감 목록
    │   ├── new/page.tsx              # 독후감 작성
    │   └── [reviewId]/page.tsx      # 독후감 상세/수정
    ├── settings/page.tsx             # 설정
    └── store/page.tsx                # 서점 (플레이스홀더)

components/
├── navbar.tsx
├── content-card.tsx
├── content-form.tsx
├── library-filters.tsx
├── reading-status-badge.tsx
├── progress-form.tsx
├── activity-log-timeline.tsx
├── review-editor.tsx
├── theme-provider.tsx
└── ui/                               # shadcn/ui 컴포넌트

lib/
├── types.ts                          # 공통 타입 정의
├── utils.ts                          # cn, 상태 레이블, 진행도 포맷
├── supabase/
│   ├── client.ts                     # 브라우저 클라이언트
│   └── server.ts                     # 서버 클라이언트
└── actions/
    ├── content.ts                    # createContent
    ├── reading-record.ts             # updateProgress
    ├── review.ts                     # upsertReview
    └── profile.ts                    # updateProfile

__tests__/
├── utils.test.ts
├── reading-status-badge.test.tsx
└── library-filters.test.tsx
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 + shadcn/ui (base-ui) |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage) |
| 테스트 | Jest + React Testing Library |
| 배포 | Vercel |

---

## 알려진 사항 / Phase 2 전달

- `reading_records.is_in_store` 컬럼 존재 — Phase 2 서점 재고 전환 시 활성화
- `user_profiles.store_level`, `store_reputation` 컬럼 존재 — Phase 2에서 활성화
- `reviews.ai_keywords`, `ai_emotion`, `ai_depth` 컬럼 존재 — Phase 3 AI 분석 시 활성화
- shadcn/ui가 base-ui 기반으로 설치됨 — `asChild` prop 없음, Link에 `buttonVariants()` 직접 사용
- 외부 도서 API 미연동 — 콘텐츠 정보 직접 입력 방식
