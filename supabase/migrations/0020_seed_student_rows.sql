-- 학생이 반에 추가되면 그 반의 기존 수업 출결(attendances)과 과제 제출(assignment_submissions)
-- 행을 자동으로 시드. 이전엔 수업·과제 생성 시점의 학생만 시드돼서, 나중에 들어온 학생은
-- 빈 칸으로 표시되던 문제.

create or replace function public.seed_student_rows(p_org_id uuid, p_user_id uuid)
returns void language plpgsql as $$
begin
  -- 해당 반의 모든 class_session 에 출결 행 보장.
  insert into attendances (class_session_id, student_id, status)
  select s.id, p_user_id, 'present'
  from class_sessions s
  where s.organization_id = p_org_id
    and not exists (
      select 1 from attendances a where a.class_session_id = s.id and a.student_id = p_user_id
    );

  -- 해당 반의 모든 assignment 에 submission 행 보장.
  insert into assignment_submissions (assignment_id, student_id, status)
  select a.id, p_user_id, 'pending'
  from assignments a
  where a.organization_id = p_org_id
    and not exists (
      select 1 from assignment_submissions sub where sub.assignment_id = a.id and sub.student_id = p_user_id
    );

  -- 해당 반의 모든 quiz 에 score 행 보장.
  insert into quiz_scores (quiz_id, student_id)
  select q.id, p_user_id
  from quizzes q
  where q.organization_id = p_org_id
    and not exists (
      select 1 from quiz_scores qs where qs.quiz_id = q.id and qs.student_id = p_user_id
    );
end; $$;

-- organization_members 에 student 가 추가되면 자동 호출.
create or replace function public.on_org_member_inserted_seed() returns trigger
language plpgsql as $$
begin
  if new.role = 'student' then
    perform public.seed_student_rows(new.organization_id, new.user_id);
  end if;
  return new;
end; $$;

drop trigger if exists organization_members_seed_student on organization_members;
create trigger organization_members_seed_student
  after insert on organization_members
  for each row execute function public.on_org_member_inserted_seed();

-- 기존에 빠진 학생 행 일괄 백필.
do $$ declare m record;
begin
  for m in select organization_id, user_id from organization_members where role = 'student' loop
    perform public.seed_student_rows(m.organization_id, m.user_id);
  end loop;
end; $$;
