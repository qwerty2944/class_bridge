-- 수업 첨부파일 버킷 — 수업 내용 에디터의 이미지(AVIF)·PDF 저장용.
-- public 버킷: 읽기는 공개 URL, 쓰기는 attachment-upload 엣지함수(service role)만 수행.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'class-attachments',
  'class-attachments',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do nothing;
