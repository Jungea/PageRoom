# PageRoom

> 읽고, 기록하고, 운영하고, 쓰는 나만의 서점

독서 기록 서비스 + 서점 운영 타이쿤 + 창작 공간이 결합된 웹 서비스.

책을 읽으면 서재에 기록되고, 기록이 쌓이면 나만의 서점 재고가 됩니다.
손님이 찾아오고, 서점이 성장하고, 더 다양한 독서로 이어지는 선순환 구조입니다.

---

## 핵심 루프

```
읽는다 → 기록한다 → 서점 재고가 생긴다 → 손님이 방문한다 → 서점이 성장한다
```

## 주요 기능 (Phase 1)

- **독서 기록** — 책, 웹소설, 비출간 작품, 창작 글 등록
- **상태 관리** — 읽고 싶음 / 읽는 중 / 완료 / 포기 등 7가지 상태
- **활동 로그** — 날짜별 진행도 타임라인
- **독후감** — 마크다운 작성, 별점, 공개/비공개
- **서재 뷰** — 상태·타입 필터, 진행도 바
- **테마 시스템** — CSS 변수 기반, 유료 테마 확장 가능

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 + shadcn/ui |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage) |
| 배포 | Vercel |

## 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/<username>/pageroom.git
cd pageroom

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 열어서 Supabase URL, anon key 입력

# 4. 개발 서버 실행
npm run dev
```

→ http://localhost:3000

## 문서

- [`SETUP.md`](SETUP.md) — Supabase 초기 설정 & Vercel 배포
- [`docs/phase1-summary.md`](docs/phase1-summary.md) — Phase 1 개발 요약
