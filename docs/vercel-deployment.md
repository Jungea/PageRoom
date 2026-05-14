# Vercel 배포 가이드

## 사전 준비

- GitHub 계정
- Vercel 계정 (https://vercel.com)
- Supabase 설정 완료 (docs/supabase-setup.md 참고)

---

## 1. GitHub 저장소 생성 & 푸시

```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/<username>/pageroom.git
git branch -M main
git push -u origin main
```

---

## 2. Vercel 프로젝트 생성

1. https://vercel.com/dashboard → **Add New → Project**
2. GitHub 저장소 `pageroom` Import
3. Framework Preset: **Next.js** (자동 감지됨)
4. Root Directory: `.` (기본값 유지)

---

## 3. 환경 변수 설정

**Settings → Environment Variables** 에서 아래 두 값 입력:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API → anon public key |

> **Environment:** Production / Preview / Development 모두 체크

---

## 4. 배포

- **Deploy** 버튼 클릭
- 1~3분 후 배포 완료
- 배포 URL 확인 (예: `https://pageroom-xxx.vercel.app`)

---

## 5. Supabase Auth URL 설정

배포 완료 후 반드시 해야 하는 설정.

**Supabase Dashboard → Authentication → URL Configuration:**

| 항목 | 값 |
|------|-----|
| Site URL | `https://pageroom-xxx.vercel.app` |
| Redirect URLs | `https://pageroom-xxx.vercel.app/auth/callback` |

> 이 설정 없으면 로그인 후 리다이렉트가 실패합니다.

---

## 6. 동작 확인 체크리스트

- [ ] 메인 페이지 (`/`) 접속 가능
- [ ] 회원가입 후 서점 이름 설정 화면 표시
- [ ] 로그인 → `/library` 리다이렉트
- [ ] 콘텐츠 등록 (`/add`) 정상 동작
- [ ] 서재 (`/library`) 목록 표시

---

## 재배포 (코드 수정 후)

`main` 브랜치에 push하면 자동으로 재배포됩니다.

```bash
git add .
git commit -m "feat: ..."
git push
```
