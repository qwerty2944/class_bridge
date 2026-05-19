-- 수업 내용 링크 공유 — 선생님이 수업을 학부모에게 링크로 공유.
-- share_token 이 있는 수업은 /share/class/<token> 공개 페이지에서 열람 가능.

alter table class_sessions add column if not exists share_token text unique;
