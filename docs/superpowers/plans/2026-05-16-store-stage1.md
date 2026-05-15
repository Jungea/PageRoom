# Stage 1 — 서점 게임 씬 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expo 앱에서 바닥 타일, 책장 4개, NPC 2마리가 배회하는 서점 게임 씬을 동작시킨다.

**Architecture:** react-native-skia Canvas 안에 FloorLayer → BookShelfLayer → NPCLayer 순으로 그린다. NPC 위치/방향/프레임은 React state로 관리하며 setInterval + useRef 기반 게임 루프(~40fps)로 업데이트한다. HUD는 Canvas 위에 React Native View로 absolute 오버레이한다.

**Tech Stack:** Expo SDK 52, Expo Router, @shopify/react-native-skia v1, TypeScript

---

## 파일 구조

```
PageRoomApp/                       # 새 Expo 프로젝트 (/home/ejung/projects/PageRoomApp)
  app/
    _layout.tsx                    # 루트 레이아웃 (Expo Router)
    index.tsx                      # 게임 화면 (유일한 화면)
  components/game/
    StoreGame.tsx                  # Canvas + HUD 조합
    FloorLayer.tsx                 # 바닥 타일 레이어
    BookShelfLayer.tsx             # 책장 + 책 척추 레이어
    NPCLayer.tsx                   # NPC 스프라이트 + 워크
    StoreHUD.tsx                   # HUD 오버레이 (이름, 레벨, 평판)
    SpriteFrame.tsx                # 스프라이트시트 단일 프레임 렌더링
  lib/
    spriteUtils.ts                 # 프레임 좌표 계산 (순수 함수)
    mockData.ts                    # Mock 서점/책 데이터
    gameLoop.ts                    # NPC 워크 로직 (순수 함수)
  constants/
    gameConfig.ts                  # 캔버스 크기, 타일 크기, 책장 위치, NPC 프레임 정보
  assets/sprites/
    book_shop_floor_walls_32x32.png
    libassetpack-tiled.png
    npc01_spritesheet.png
  __tests__/
    spriteUtils.test.ts
    gameLoop.test.ts
```

---

## Task 1: 프로젝트 초기화

**Files:**
- Create: `/home/ejung/projects/PageRoomApp/` (새 Expo 프로젝트)

- [ ] **Step 1: Expo 프로젝트 생성**

```bash
cd /home/ejung/projects
npx create-expo-app@latest PageRoomApp --template blank-typescript
cd PageRoomApp
```

- [ ] **Step 2: 핵심 패키지 설치**

```bash
npx expo install @shopify/react-native-skia
npx expo install expo-router
```

- [ ] **Step 3: babel.config.js 확인 — expo-router 플러그인 포함 여부 확인**

`babel.config.js`를 열어 `babel-preset-expo`가 있는지 확인. 없으면:

```js
// babel.config.js
module.exports = function(api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
  }
}
```

- [ ] **Step 4: app/_layout.tsx 생성**

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router'

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
```

- [ ] **Step 5: 웹에서 실행 확인**

```bash
npx expo start --web
```

브라우저에서 빈 화면이 뜨면 성공.

- [ ] **Step 6: 커밋**

```bash
git init  # create-expo-app이 git init을 안 했다면
git add .
git commit -m "init: Expo 프로젝트 초기화"
```

---

## Task 2: 에셋 복사 및 상수 정의

**Files:**
- Create: `assets/sprites/` (에셋 복사)
- Create: `constants/gameConfig.ts`
- Create: `lib/mockData.ts`

- [ ] **Step 1: 스프라이트 에셋 복사**

```bash
mkdir -p assets/sprites
cp /home/ejung/projects/PageRoom/public/assets/book_shop_floor_walls_32x32.png assets/sprites/
cp /home/ejung/projects/PageRoom/public/assets/libassetpack-tiled.png assets/sprites/
cp /home/ejung/projects/PageRoom/public/assets/npc01_spritesheet.png assets/sprites/
```

- [ ] **Step 2: constants/gameConfig.ts 생성**

```ts
// constants/gameConfig.ts
import { Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

export const CANVAS_WIDTH = width
export const CANVAS_HEIGHT = height

// 바닥 타일 (book_shop_floor_walls_32x32.png: 292×192, 32×32 타일)
export const TILE_SIZE = 32
export const TILE_SCALE = 2
export const TILE_DISPLAY = TILE_SIZE * TILE_SCALE  // 64px
// 타일셋 내 바닥 타일 좌표 — 실제 이미지 확인 후 조정 필요
export const FLOOR_TILE = { col: 2, row: 2 }

// NPC 스프라이트 (npc01_spritesheet.png: 240×288, 30×48px 프레임, 8열×6행)
export const NPC_FRAME_WIDTH = 30
export const NPC_FRAME_HEIGHT = 48
export const NPC_SCALE = 2
export const NPC_DISPLAY_WIDTH = NPC_FRAME_WIDTH * NPC_SCALE
export const NPC_DISPLAY_HEIGHT = NPC_FRAME_HEIGHT * NPC_SCALE
export const NPC_WALK_FRAMES = 8

// NPC 방향별 스프라이트시트 행 인덱스 — 실제 스프라이트 확인 후 조정 필요
export const NPC_ROWS: Record<string, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
}

// 책장 스프라이트 (libassetpack-tiled.png: 1488×528)
// srcX, srcY는 이미지 에디터로 측정 후 조정 필요 (아래는 추정값)
export const SHELF_SPRITES = [
  { srcX: 8,   srcY: 370, w: 82, h: 148 },
  { srcX: 97,  srcY: 370, w: 82, h: 148 },
  { srcX: 186, srcY: 370, w: 82, h: 148 },
  { srcX: 275, srcY: 370, w: 82, h: 148 },
]
export const SHELF_SCALE = 1.5
export const SHELF_DISPLAY_W = 82 * SHELF_SCALE  // 123px
export const SHELF_DISPLAY_H = 148 * SHELF_SCALE // 222px

// 책장 배치 위치 (화면 상단)
export const SHELF_POSITIONS = [
  { x: 10,                              y: 40 },
  { x: 10 + SHELF_DISPLAY_W + 8,        y: 40 },
  { x: 10 + (SHELF_DISPLAY_W + 8) * 2,  y: 40 },
  { x: 10 + (SHELF_DISPLAY_W + 8) * 3,  y: 40 },
]

// NPC 이동 가능 영역 (책장 아래)
export const WALK_AREA = {
  minX: 20,
  maxX: CANVAS_WIDTH - 80,
  minY: 40 + SHELF_DISPLAY_H + 30,
  maxY: CANVAS_HEIGHT - 100,
}
```

- [ ] **Step 3: lib/mockData.ts 생성**

```ts
// lib/mockData.ts
export const MOCK_STORE = {
  name: '달빛 서점',
  level: 1,
  reputation: 15,
  maxReputation: 100,
}

export const MOCK_BOOKS = [
  { id: '1', title: '채식주의자', genre: '소설' },
  { id: '2', title: '해리포터', genre: '판타지' },
  { id: '3', title: '사피엔스', genre: '인문' },
  { id: '4', title: '무너지기 쉬운', genre: '소설' },
  { id: '5', title: '1984', genre: '판타지' },
]

const GENRE_TO_SHELF: Record<string, number> = {
  '소설': 0, '웹소설': 0,
  '판타지': 1, 'SF': 1,
  '인문': 2, '철학': 2,
}

export function getShelfIndex(genre: string): number {
  return GENRE_TO_SHELF[genre] ?? 3
}

export function getBooksForShelf(shelfIndex: number) {
  return MOCK_BOOKS.filter(b => getShelfIndex(b.genre) === shelfIndex)
}
```

- [ ] **Step 4: 커밋**

```bash
git add .
git commit -m "feat: 게임 에셋 및 상수 설정"
```

---

## Task 3: 스프라이트 유틸 함수 + 테스트

**Files:**
- Create: `lib/spriteUtils.ts`
- Create: `__tests__/spriteUtils.test.ts`

- [ ] **Step 1: 테스트 먼저 작성**

```ts
// __tests__/spriteUtils.test.ts
import { getFrameOrigin, getSheetOffset } from '../lib/spriteUtils'

describe('getFrameOrigin', () => {
  it('0행 0열이면 (0, 0) 반환', () => {
    expect(getFrameOrigin(0, 0, 30, 48)).toEqual({ x: 0, y: 0 })
  })
  it('0행 3열이면 (90, 0) 반환', () => {
    expect(getFrameOrigin(3, 0, 30, 48)).toEqual({ x: 90, y: 0 })
  })
  it('2행 0열이면 (0, 96) 반환', () => {
    expect(getFrameOrigin(0, 2, 30, 48)).toEqual({ x: 0, y: 96 })
  })
  it('2행 5열이면 (150, 96) 반환', () => {
    expect(getFrameOrigin(5, 2, 30, 48)).toEqual({ x: 150, y: 96 })
  })
})

describe('getSheetOffset', () => {
  it('스케일 2, destX=100, srcX=30이면 40 반환', () => {
    expect(getSheetOffset(100, 30, 2)).toBe(40)
  })
  it('스케일 1, destX=0, srcX=0이면 0 반환', () => {
    expect(getSheetOffset(0, 0, 1)).toBe(0)
  })
  it('스케일 2, destX=0, srcX=60이면 -120 반환', () => {
    expect(getSheetOffset(0, 60, 2)).toBe(-120)
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npx jest __tests__/spriteUtils.test.ts
```

Expected: `Cannot find module '../lib/spriteUtils'`

- [ ] **Step 3: lib/spriteUtils.ts 구현**

```ts
// lib/spriteUtils.ts

/** 스프라이트시트에서 col열 row행 프레임의 픽셀 좌표 반환 */
export function getFrameOrigin(
  col: number,
  row: number,
  frameW: number,
  frameH: number
): { x: number; y: number } {
  return { x: col * frameW, y: row * frameH }
}

/**
 * Canvas의 destPos 위치에 srcPos 프레임을 그릴 때 이미지 전체의 x/y 좌표 계산.
 * Group clip 방식: imagePos = destPos - srcPos * scale
 */
export function getSheetOffset(
  destPos: number,
  srcPos: number,
  scale: number
): number {
  return destPos - srcPos * scale
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx jest __tests__/spriteUtils.test.ts
```

Expected: 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/spriteUtils.ts __tests__/spriteUtils.test.ts
git commit -m "feat: 스프라이트 유틸 함수"
```

---

## Task 4: SpriteFrame 컴포넌트

**Files:**
- Create: `components/game/SpriteFrame.tsx`

- [ ] **Step 1: SpriteFrame.tsx 작성**

```tsx
// components/game/SpriteFrame.tsx
import { Group, Image, Skia } from '@shopify/react-native-skia'
import type { SkImage } from '@shopify/react-native-skia'
import { getFrameOrigin, getSheetOffset } from '../../lib/spriteUtils'

interface Props {
  sheet: SkImage
  col: number
  row: number
  frameW: number
  frameH: number
  destX: number
  destY: number
  scale: number
}

export function SpriteFrame({ sheet, col, row, frameW, frameH, destX, destY, scale }: Props) {
  const { x: srcX, y: srcY } = getFrameOrigin(col, row, frameW, frameH)
  const imgX = getSheetOffset(destX, srcX, scale)
  const imgY = getSheetOffset(destY, srcY, scale)
  const dispW = frameW * scale
  const dispH = frameH * scale

  return (
    <Group clip={Skia.XYWHRect(destX, destY, dispW, dispH)}>
      <Image
        image={sheet}
        x={imgX}
        y={imgY}
        width={sheet.width() * scale}
        height={sheet.height() * scale}
      />
    </Group>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/game/SpriteFrame.tsx
git commit -m "feat: SpriteFrame 컴포넌트"
```

---

## Task 5: FloorLayer — 바닥 렌더링

**Files:**
- Create: `components/game/FloorLayer.tsx`
- Modify: `app/index.tsx`

- [ ] **Step 1: FloorLayer.tsx 작성**

```tsx
// components/game/FloorLayer.tsx
import { useImage } from '@shopify/react-native-skia'
import { SpriteFrame } from './SpriteFrame'
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TILE_SCALE, TILE_DISPLAY, FLOOR_TILE } from '../../constants/gameConfig'

const COLS = Math.ceil(CANVAS_WIDTH / TILE_DISPLAY) + 1
const ROWS = Math.ceil(CANVAS_HEIGHT / TILE_DISPLAY) + 1

export function FloorLayer() {
  const sheet = useImage(require('../../assets/sprites/book_shop_floor_walls_32x32.png'))
  if (!sheet) return null

  const tiles = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      tiles.push(
        <SpriteFrame
          key={`f-${r}-${c}`}
          sheet={sheet}
          col={FLOOR_TILE.col}
          row={FLOOR_TILE.row}
          frameW={TILE_SIZE}
          frameH={TILE_SIZE}
          destX={c * TILE_DISPLAY}
          destY={r * TILE_DISPLAY}
          scale={TILE_SCALE}
        />
      )
    }
  }
  return <>{tiles}</>
}
```

- [ ] **Step 2: app/index.tsx에서 바닥만 확인**

```tsx
// app/index.tsx
import { Canvas } from '@shopify/react-native-skia'
import { StyleSheet, View, Dimensions } from 'react-native'
import { FloorLayer } from '../components/game/FloorLayer'

const { width, height } = Dimensions.get('window')

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        <FloorLayer />
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
})
```

- [ ] **Step 3: 웹에서 확인**

```bash
npx expo start --web
```

바닥 타일이 화면을 채우면 성공. 타일이 이상하면 `constants/gameConfig.ts`의 `FLOOR_TILE` 좌표를 조정.

- [ ] **Step 4: 커밋**

```bash
git add components/game/FloorLayer.tsx app/index.tsx
git commit -m "feat: 바닥 타일 레이어"
```

---

## Task 6: BookShelfLayer — 책장 렌더링

**Files:**
- Create: `components/game/BookShelfLayer.tsx`
- Modify: `app/index.tsx`

- [ ] **Step 1: BookShelfLayer.tsx 작성**

```tsx
// components/game/BookShelfLayer.tsx
import { Group, Image, Rect, Skia, useImage } from '@shopify/react-native-skia'
import { SHELF_SPRITES, SHELF_SCALE, SHELF_DISPLAY_W, SHELF_DISPLAY_H, SHELF_POSITIONS } from '../../constants/gameConfig'
import { getBooksForShelf } from '../../lib/mockData'
import { getSheetOffset } from '../../lib/spriteUtils'

const BOOK_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

export function BookShelfLayer() {
  const sheet = useImage(require('../../assets/sprites/libassetpack-tiled.png'))
  if (!sheet) return null

  return (
    <>
      {SHELF_POSITIONS.map((pos, i) => {
        const sprite = SHELF_SPRITES[i]
        const books = getBooksForShelf(i)
        const imgX = getSheetOffset(pos.x, sprite.srcX, SHELF_SCALE)
        const imgY = getSheetOffset(pos.y, sprite.srcY, SHELF_SCALE)

        return (
          <Group key={`shelf-${i}`}>
            <Group clip={Skia.XYWHRect(pos.x, pos.y, SHELF_DISPLAY_W, SHELF_DISPLAY_H)}>
              <Image
                image={sheet}
                x={imgX}
                y={imgY}
                width={sheet.width() * SHELF_SCALE}
                height={sheet.height() * SHELF_SCALE}
              />
            </Group>
            {books.slice(0, 5).map((book, bi) => (
              <Rect
                key={book.id}
                x={pos.x + 10 + bi * 14}
                y={pos.y + SHELF_DISPLAY_H - 65}
                width={11}
                height={50}
                color={BOOK_COLORS[bi % BOOK_COLORS.length]}
              />
            ))}
          </Group>
        )
      })}
    </>
  )
}
```

- [ ] **Step 2: app/index.tsx에 BookShelfLayer 추가**

```tsx
// app/index.tsx
import { Canvas } from '@shopify/react-native-skia'
import { StyleSheet, View, Dimensions } from 'react-native'
import { FloorLayer } from '../components/game/FloorLayer'
import { BookShelfLayer } from '../components/game/BookShelfLayer'

const { width, height } = Dimensions.get('window')

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        <FloorLayer />
        <BookShelfLayer />
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
})
```

- [ ] **Step 3: 웹에서 확인**

```bash
npx expo start --web
```

책장 4개가 상단에 나오고 책 척추가 보이면 성공.  
책장 스프라이트 위치가 맞지 않으면 `SHELF_SPRITES` 좌표를 이미지 에디터(예: GIMP)로 측정해 `gameConfig.ts`에서 수정.

- [ ] **Step 4: 커밋**

```bash
git add components/game/BookShelfLayer.tsx app/index.tsx
git commit -m "feat: 책장 레이어 및 책 척추 렌더링"
```

---

## Task 7: NPC 워크 로직 + 테스트

**Files:**
- Create: `lib/gameLoop.ts`
- Create: `__tests__/gameLoop.test.ts`

- [ ] **Step 1: 테스트 먼저 작성**

```ts
// __tests__/gameLoop.test.ts
import { moveTowardTarget, pickRandomTarget, getWalkDirection } from '../lib/gameLoop'

const AREA = { minX: 0, maxX: 300, minY: 200, maxY: 600 }

describe('moveTowardTarget', () => {
  it('목표에 충분히 가까우면 arrived=true', () => {
    const r = moveTowardTarget({ x: 100, y: 200 }, { x: 101, y: 200 }, 2)
    expect(r.arrived).toBe(true)
    expect(r.pos).toEqual({ x: 101, y: 200 })
  })
  it('목표 방향으로 speed만큼 이동', () => {
    const r = moveTowardTarget({ x: 0, y: 0 }, { x: 100, y: 0 }, 2)
    expect(r.pos.x).toBeCloseTo(2)
    expect(r.pos.y).toBeCloseTo(0)
    expect(r.arrived).toBe(false)
  })
  it('대각선 이동 거리가 speed와 같음', () => {
    const r = moveTowardTarget({ x: 0, y: 0 }, { x: 100, y: 100 }, 2)
    const dist = Math.sqrt(r.pos.x ** 2 + r.pos.y ** 2)
    expect(dist).toBeCloseTo(2)
  })
})

describe('pickRandomTarget', () => {
  it('WALK_AREA 범위 내 좌표 반환', () => {
    for (let i = 0; i < 30; i++) {
      const t = pickRandomTarget(AREA)
      expect(t.x).toBeGreaterThanOrEqual(AREA.minX)
      expect(t.x).toBeLessThanOrEqual(AREA.maxX)
      expect(t.y).toBeGreaterThanOrEqual(AREA.minY)
      expect(t.y).toBeLessThanOrEqual(AREA.maxY)
    }
  })
})

describe('getWalkDirection', () => {
  it('오른쪽 이동이면 right', () => {
    expect(getWalkDirection({ x: 0, y: 0 }, { x: 10, y: 2 })).toBe('right')
  })
  it('왼쪽 이동이면 left', () => {
    expect(getWalkDirection({ x: 10, y: 0 }, { x: 0, y: 2 })).toBe('left')
  })
  it('아래 이동이면 down', () => {
    expect(getWalkDirection({ x: 0, y: 0 }, { x: 2, y: 10 })).toBe('down')
  })
  it('위 이동이면 up', () => {
    expect(getWalkDirection({ x: 0, y: 10 }, { x: 2, y: 0 })).toBe('up')
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npx jest __tests__/gameLoop.test.ts
```

Expected: `Cannot find module '../lib/gameLoop'`

- [ ] **Step 3: lib/gameLoop.ts 구현**

```ts
// lib/gameLoop.ts
export type Direction = 'up' | 'down' | 'left' | 'right'
export type WalkArea = { minX: number; maxX: number; minY: number; maxY: number }

export function moveTowardTarget(
  pos: { x: number; y: number },
  target: { x: number; y: number },
  speed: number
): { pos: { x: number; y: number }; arrived: boolean } {
  const dx = target.x - pos.x
  const dy = target.y - pos.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist <= speed) {
    return { pos: target, arrived: true }
  }

  return {
    pos: {
      x: pos.x + (dx / dist) * speed,
      y: pos.y + (dy / dist) * speed,
    },
    arrived: false,
  }
}

export function pickRandomTarget(area: WalkArea): { x: number; y: number } {
  return {
    x: area.minX + Math.random() * (area.maxX - area.minX),
    y: area.minY + Math.random() * (area.maxY - area.minY),
  }
}

export function getWalkDirection(
  pos: { x: number; y: number },
  target: { x: number; y: number }
): Direction {
  const dx = target.x - pos.x
  const dy = target.y - pos.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'right' : 'left'
  }
  return dy >= 0 ? 'down' : 'up'
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx jest __tests__/gameLoop.test.ts
```

Expected: 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/gameLoop.ts __tests__/gameLoop.test.ts
git commit -m "feat: NPC 워크 로직"
```

---

## Task 8: NPCLayer — 스프라이트 + 애니메이션

**Files:**
- Create: `components/game/NPCLayer.tsx`
- Modify: `app/index.tsx`

- [ ] **Step 1: NPCLayer.tsx 작성**

```tsx
// components/game/NPCLayer.tsx
import { useEffect, useRef, useState } from 'react'
import { useImage } from '@shopify/react-native-skia'
import { SpriteFrame } from './SpriteFrame'
import {
  NPC_FRAME_WIDTH, NPC_FRAME_HEIGHT, NPC_SCALE,
  NPC_ROWS, NPC_WALK_FRAMES, WALK_AREA,
} from '../../constants/gameConfig'
import { moveTowardTarget, pickRandomTarget, getWalkDirection } from '../../lib/gameLoop'
import type { Direction } from '../../lib/gameLoop'

interface NPCState {
  x: number
  y: number
  target: { x: number; y: number }
  direction: Direction
  frame: number
  idleTicks: number
}

const SPEED = 1.5
const IDLE_DURATION = 60  // ~1.5초
const FRAME_ADVANCE = 5   // N틱마다 다음 프레임

function makeNPC(x: number, y: number): NPCState {
  return {
    x, y,
    target: pickRandomTarget(WALK_AREA),
    direction: 'down',
    frame: 0,
    idleTicks: 0,
  }
}

function tickNPC(npc: NPCState, tick: number): NPCState {
  if (npc.idleTicks > 0) {
    return { ...npc, idleTicks: npc.idleTicks - 1 }
  }

  const { pos, arrived } = moveTowardTarget(
    { x: npc.x, y: npc.y },
    npc.target,
    SPEED
  )

  if (arrived) {
    return {
      ...npc,
      x: pos.x, y: pos.y,
      target: pickRandomTarget(WALK_AREA),
      idleTicks: IDLE_DURATION,
      frame: 0,
    }
  }

  const direction = getWalkDirection({ x: npc.x, y: npc.y }, npc.target)
  const frame = tick % FRAME_ADVANCE === 0
    ? (npc.frame + 1) % NPC_WALK_FRAMES
    : npc.frame

  return { ...npc, x: pos.x, y: pos.y, direction, frame }
}

export function NPCLayer() {
  const sheet = useImage(require('../../assets/sprites/npc01_spritesheet.png'))
  const tickRef = useRef(0)
  const [npcs, setNPCs] = useState<NPCState[]>([
    makeNPC(WALK_AREA.minX + 60, WALK_AREA.minY + 60),
    makeNPC(WALK_AREA.minX + 160, WALK_AREA.minY + 90),
  ])

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1
      const tick = tickRef.current
      setNPCs(prev => prev.map(npc => tickNPC(npc, tick)))
    }, 25)  // ~40fps
    return () => clearInterval(id)
  }, [])

  if (!sheet) return null

  return (
    <>
      {npcs.map((npc, i) => (
        <SpriteFrame
          key={`npc-${i}`}
          sheet={sheet}
          col={npc.frame % NPC_WALK_FRAMES}
          row={NPC_ROWS[npc.direction]}
          frameW={NPC_FRAME_WIDTH}
          frameH={NPC_FRAME_HEIGHT}
          destX={Math.round(npc.x)}
          destY={Math.round(npc.y)}
          scale={NPC_SCALE}
        />
      ))}
    </>
  )
}
```

- [ ] **Step 2: app/index.tsx에 NPCLayer 추가**

```tsx
// app/index.tsx
import { Canvas } from '@shopify/react-native-skia'
import { StyleSheet, View, Dimensions } from 'react-native'
import { FloorLayer } from '../components/game/FloorLayer'
import { BookShelfLayer } from '../components/game/BookShelfLayer'
import { NPCLayer } from '../components/game/NPCLayer'

const { width, height } = Dimensions.get('window')

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        <FloorLayer />
        <BookShelfLayer />
        <NPCLayer />
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
})
```

- [ ] **Step 3: 웹에서 확인**

```bash
npx expo start --web
```

NPC 2마리가 책장 아래 영역을 걸어다니면 성공.  
스프라이트 방향이 이상하면 `NPC_ROWS`를 `gameConfig.ts`에서 조정.

- [ ] **Step 4: 커밋**

```bash
git add components/game/NPCLayer.tsx app/index.tsx
git commit -m "feat: NPC 스프라이트 및 랜덤 워크"
```

---

## Task 9: StoreHUD + 최종 조합

**Files:**
- Create: `components/game/StoreHUD.tsx`
- Create: `components/game/StoreGame.tsx`
- Modify: `app/index.tsx`

- [ ] **Step 1: StoreHUD.tsx 작성**

```tsx
// components/game/StoreHUD.tsx
import { StyleSheet, View, Text } from 'react-native'
import { MOCK_STORE } from '../../lib/mockData'

export function StoreHUD() {
  const { name, level, reputation, maxReputation } = MOCK_STORE
  const pct = reputation / maxReputation

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.top}>
        <Text style={styles.name}>📚 {name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Lv.{level} 🌱</Text>
        </View>
      </View>
      <View style={styles.repRow}>
        <Text style={styles.label}>평판</Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct * 100}%` as any }]} />
        </View>
        <Text style={styles.label}>{reputation}/{maxReputation}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0,
    padding: 12, backgroundColor: 'rgba(0,0,0,0.6)',
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  badge: { backgroundColor: '#ffd700', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  badgeText: { color: '#1a1a1a', fontSize: 12, fontWeight: 'bold' },
  repRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: '#ccc', fontSize: 12 },
  barBg: { flex: 1, height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#ffd700', borderRadius: 4 },
})
```

- [ ] **Step 2: StoreGame.tsx 작성**

```tsx
// components/game/StoreGame.tsx
import { Canvas } from '@shopify/react-native-skia'
import { StyleSheet, View, Dimensions } from 'react-native'
import { FloorLayer } from './FloorLayer'
import { BookShelfLayer } from './BookShelfLayer'
import { NPCLayer } from './NPCLayer'
import { StoreHUD } from './StoreHUD'

const { width, height } = Dimensions.get('window')

export function StoreGame() {
  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        <FloorLayer />
        <BookShelfLayer />
        <NPCLayer />
      </Canvas>
      <StoreHUD />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
})
```

- [ ] **Step 3: app/index.tsx를 StoreGame으로 교체**

```tsx
// app/index.tsx
import { StoreGame } from '../components/game/StoreGame'

export default function GameScreen() {
  return <StoreGame />
}
```

- [ ] **Step 4: 전체 테스트 통과 확인**

```bash
npx jest
```

Expected: 모두 PASS

- [ ] **Step 5: 웹에서 최종 확인**

```bash
npx expo start --web
```

확인 항목:
- [ ] 바닥 타일이 화면을 채운다
- [ ] 책장 4개가 상단에 보인다
- [ ] 각 책장에 색깔 책 척추가 표시된다
- [ ] NPC 2마리가 책장 아래 영역을 걸어다닌다
- [ ] 상단 HUD에 서점 이름, 레벨 배지, 평판 바가 보인다

- [ ] **Step 6: 최종 커밋**

```bash
git add .
git commit -m "feat: 서점 게임 씬 1단계 완성 — 책장 + NPC 배회 + HUD"
```

---

## Task 10: NPC 탭 말풍선

**Files:**
- Modify: `components/game/StoreGame.tsx`

- [ ] **Step 1: StoreGame.tsx에 말풍선 상태 및 탭 핸들러 추가**

```tsx
// components/game/StoreGame.tsx
import { useState } from 'react'
import { Canvas } from '@shopify/react-native-skia'
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions } from 'react-native'
import { FloorLayer } from './FloorLayer'
import { BookShelfLayer } from './BookShelfLayer'
import { NPCLayer } from './NPCLayer'
import { StoreHUD } from './StoreHUD'

const { width, height } = Dimensions.get('window')

const NPC_LINES = [
  '오, 좋은 책들이 많네요!',
  '조용하고 좋은 서점이에요.',
  '이 책 읽어봤는데 재밌었어요.',
  '다음에 또 올게요.',
  '책 냄새가 좋아요.',
]

export function StoreGame() {
  const [bubble, setBubble] = useState<string | null>(null)

  function handleTap() {
    const line = NPC_LINES[Math.floor(Math.random() * NPC_LINES.length)]
    setBubble(line)
    setTimeout(() => setBubble(null), 2000)
  }

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <Canvas style={{ width, height }}>
          <FloorLayer />
          <BookShelfLayer />
          <NPCLayer />
        </Canvas>
      </TouchableWithoutFeedback>
      <StoreHUD />
      {bubble && (
        <View style={styles.bubble} pointerEvents="none">
          <Text style={styles.bubbleText}>{bubble}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  bubble: {
    position: 'absolute',
    bottom: 80, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
    maxWidth: '80%',
  },
  bubbleText: { color: '#1a1a1a', fontSize: 14, textAlign: 'center' },
})
```

- [ ] **Step 2: 웹에서 확인**

```bash
npx expo start --web
```

화면 탭 시 말풍선이 2초간 표시되면 성공.

- [ ] **Step 3: 최종 커밋 수정**

```bash
git add components/game/StoreGame.tsx
git commit -m "feat: NPC 탭 말풍선"
```

---

## 스프라이트 좌표 조정 가이드

구현 중 아래 상수가 맞지 않으면 이미지 에디터로 측정 후 `constants/gameConfig.ts`에서 수정:

| 상수 | 기본값 | 조정 방법 |
|------|--------|-----------|
| `FLOOR_TILE` | `{ col: 2, row: 2 }` | `book_shop_floor_walls_32x32.png`에서 원하는 타일의 열/행 번호 |
| `SHELF_SPRITES[i].srcX/srcY` | 추정값 | `libassetpack-tiled.png`에서 각 책장 좌상단 픽셀 좌표 |
| `NPC_ROWS` | `{ down:0, left:1, right:2, up:3 }` | `npc01_spritesheet.png`에서 각 방향의 행 번호 |
