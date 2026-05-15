# Stage 1 설계 — Expo 서점 게임 씬

## 개요

PageRoom을 Expo (React Native) 앱으로 재구축한다.  
**1단계 목표: 게임 씬이 실제로 동작하는지 검증한다.**  
독서 관리 기능은 게임이 제대로 돌아간 이후에 추가한다.  
Supabase 연동도 이 단계에서는 포함하지 않는다 — 모의 데이터(mock)로 게임 씬만 완성한다.

---

## 플랫폼 결정

| 항목 | 결정 |
|------|------|
| 프레임워크 | **Expo (React Native)** |
| 라우팅 | **Expo Router** (Next.js App Router와 유사한 파일 기반) |
| 게임 렌더링 | **react-native-skia** (2D 스프라이트, GPU 가속) |
| 애니메이션 | **react-native-reanimated** |
| 백엔드 | Supabase (변경 없음) |
| 배포 | iOS App Store + Google Play + Expo Web |

---

## 이번 단계 범위

### 포함
- Expo 프로젝트 셋업
- 게임 씬: 방 렌더링 + 책장 + NPC 배회 + HUD
- 모의(mock) 데이터로 책 진열 표현

### 포함 안 함 (이후 단계)
- Supabase 연동, 로그인, 인증
- 독서 기록, 리뷰, 설정 화면
- App Store / Play Store 배포
- 손님 매칭 로직, 평판 계산

---

## 프로젝트 구조

```
PageRoom/                        # 새 Expo 프로젝트
  app/                           # Expo Router (파일 기반 라우팅)
    _layout.tsx                  # 루트 레이아웃 (테마, 인증)
    index.tsx                    # 랜딩 페이지
    (auth)/
      login.tsx
    (main)/
      _layout.tsx                # 탭 네비게이션
      library/
        index.tsx
        [id].tsx
      store/
        index.tsx                # 게임 씬 진입점
      reviews/
      settings/
  components/
    game/
      StoreGame.tsx              # 게임 메인 컴포넌트
      BookShelf.tsx              # 책장 렌더링
      NPC.tsx                    # NPC 스프라이트 + 워크
      StoreHUD.tsx               # HUD 오버레이 (레벨, 평판)
  lib/
    supabase/
      client.ts                  # Expo용 Supabase 클라이언트
    types.ts                     # 기존과 동일
    actions/                     # 데이터 fetch 함수 (Server Actions → async 함수)
  assets/
    sprites/
      book_shop_floor_walls_32x32.png
      book_shop_props_32x32.png
      libassetpack-tiled.png
      npc01_spritesheet.png
```

---

## 게임 씬 상세 (Stage 1)

### 렌더링 방식

`react-native-skia`의 `<Canvas>` 컴포넌트 안에 게임 씬 전체를 그린다.

```tsx
<Canvas style={{ flex: 1 }}>
  <FloorLayer />         {/* 바닥 타일 */}
  <BookShelfLayer />     {/* 책장 + 진열된 책 */}
  <NPCLayer />           {/* 손님 NPC */}
</Canvas>
```

HUD(레벨, 평판 바)는 Canvas 위에 React Native View로 absolute 오버레이.

### 방 레이아웃

- 화면 전체를 서점으로 사용
- 바닥: `book_shop_floor_walls_32x32.png` 타일 반복
- 상단/좌우: 벽 타일
- 카메라: Stage 1 고정, 스크롤 없음

### 책장 시스템

- `libassetpack-tiled.png`에서 나무 책장 스프라이트 크롭
- 기본 4개 배치 (벽 따라 배열)
- 장르별 할당:
  - 소설/웹소설 → 1번
  - 판타지/SF → 2번
  - 인문/철학 → 3번
  - 미분류 → 4번
- 책 수만큼 척추(spine) 색상 사각형 채워짐
- 탭 시 해당 책장 책 목록 모달로 표시

### NPC 시스템

- `npc01_spritesheet.png` (30×48px, 8열×6행)
- NPC 2마리, 방 안 랜덤 워크
- `react-native-reanimated`로 위치 보간 (부드러운 이동)
- 이동 로직: 랜덤 목적지 선택 → 이동 → 1~3초 대기 → 반복
- 벽/책장 영역 회피 (좌표 범위 체크)
- 탭 시 말풍선 (고정 텍스트 3~5개 랜덤)
  - "오, 좋은 책들이 많네요!"
  - "조용하고 좋은 서점이에요."
  - "이 책 읽어봤는데 재밌었어요."
- ※ NPC 프레임 인덱스는 실제 스프라이트 확인 후 조정

### HUD 오버레이

```
┌─────────────────────────────────┐
│ 📚 달빛 서점        [Lv.1 🌱]   │
│ ▓▓░░░░░░  평판 15/100           │
└─────────────────────────────────┘
```

- 서점 이름, 레벨, 평판 바
- 평판 최대치: 100 (Stage 1 고정, Stage 3에서 레벨별 확장)

---

## 데이터 (모의 데이터)

Supabase 없이 하드코딩된 mock으로 게임 씬을 구동한다.

```ts
// 게임 씬에 넘길 mock 데이터
const MOCK_STORE = {
  name: '달빛 서점',
  level: 1,
  reputation: 15,
}

const MOCK_BOOKS = [
  { id: '1', title: '채식주의자', genre: '소설' },
  { id: '2', title: '해리포터', genre: '판타지' },
  { id: '3', title: '사피엔스', genre: '인문' },
  { id: '4', title: '무너지기 쉬운', genre: '소설' },
]
```

Supabase 연동은 게임 씬 검증 후 다음 단계에서 추가한다.

---

## 패키지 (신규 Expo 프로젝트 기준)

```bash
npx create-expo-app PageRoom --template tabs

# 핵심 패키지
npx expo install @shopify/react-native-skia
npx expo install react-native-reanimated
npx expo install @supabase/supabase-js @supabase/ssr
npx expo install expo-router
```

---

## 범위 외 (Stage 2 이후)

- NPC 손님 타입별 취향 매칭 및 만족도 계산
- 평판/레벨업 로직
- 책장 해금 시스템
- 손님 실시간 대사 (Claude API)
- App Store / Play Store 배포 설정
