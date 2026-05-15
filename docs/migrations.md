# 마이그레이션

초기 스키마(`SETUP.md`) 이후 추가로 실행한 SQL. 순서대로 실행하세요.

---

```sql
-- 001: user_profiles에 커스텀 장르 컬럼 추가
alter table user_profiles
  add column custom_genres text[] not null default '{}';

-- 002: contents에 progress_type 컬럼 추가
alter table contents
  add column progress_type text not null default 'none'
  check (progress_type in ('page', 'episode', 'none'));

-- 기존 데이터 타입 기반으로 마이그레이션
update contents set progress_type = case
  when type = 'book' then 'page'
  when type in ('webnovel', 'indie') then 'episode'
  else 'none'
end;

-- 003: activity_logs에 status_snapshot 컬럼 추가
alter table activity_logs
  add column status_snapshot text;

-- 004: reviews unique 제약 제거 (다이어리 형태 - 콘텐츠당 여러 독후감 허용)
alter table reviews drop constraint reviews_user_id_content_id_key;

-- 005: reviews에 title 컬럼 추가
alter table reviews add column title text not null default '';
```
