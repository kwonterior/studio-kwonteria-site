-- 홈페이지 히어로(대표) 사진을 관리자페이지에서 직접 올리고 뺄 수 있도록 지원 (2026-09-12)
-- Supabase SQL Editor에서 실행해주세요.

create table hero_photos (
  id bigint generated always as identity primary key,
  image_url text not null,
  image_path text not null,
  sort_order int default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table hero_photos enable row level security;

-- 홈페이지(비로그인 방문자)도 읽을 수 있어야 함 — youtube_videos/projects 테이블과 동일한 패턴
create policy "hero_photos_public_select" on hero_photos
  for select using (true);

-- 등록/수정/삭제는 로그인한 관리자페이지 계정만
create policy "hero_photos_manage_authenticated" on hero_photos
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
