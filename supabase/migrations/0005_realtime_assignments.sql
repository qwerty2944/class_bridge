-- 과제 실시간 알림 — assignments 테이블을 Supabase Realtime publication 에 추가.
-- 학생 클라이언트가 postgres_changes(INSERT) 를 구독해 새 과제 토스트를 띄운다.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'assignments'
  ) then
    alter publication supabase_realtime add table public.assignments;
  end if;
end $$;
