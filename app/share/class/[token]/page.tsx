import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { createClient } from '@/shared/api/supabase/server';
import { RichContent } from '@/features/rich-text-editor';
import type {
  Assignment,
  AssignmentSubmission,
  ClassSession,
  Organization,
  Profile,
  Subject,
  SubmissionQuality,
} from '@/shared/types/database';
import { SUBMISSION_QUALITY_LABEL } from '@/shared/types/database';

type SubmissionWithStudent = AssignmentSubmission & { student: Profile | null };
type ReviewedAssignment = Assignment & { submissions: SubmissionWithStudent[] };

type SharedSession = ClassSession & {
  subject: Subject | null;
  teacher: Profile | null;
  organization: Organization | null;
  // 이번 수업에서 나가는 과제 (source_session_id = this).
  assignments: Assignment[];
  // 지난 과제 점검 (class_session_reviews junction).
  class_session_reviews: { assignment: ReviewedAssignment | null }[];
};

// generateMetadata + 페이지가 같은 요청 내에서 쿼리를 공유하도록 cache() 로 감쌈.
const getSharedSession = cache(async (token: string): Promise<SharedSession | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('class_sessions')
    .select(
      '*, subject:subjects(*), teacher:profiles!class_sessions_teacher_id_fkey(*), organization:organizations(*), assignments:assignments!assignments_source_session_id_fkey(*), class_session_reviews(assignment:assignments(*, submissions:assignment_submissions(*, student:profiles(*))))',
    )
    .eq('share_token', token)
    .maybeSingle();
  return (data as SharedSession) ?? null;
});

// 카톡·슬랙 등 링크 미리보기용 OG 메타데이터 (SSR).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const s = await getSharedSession(token);
  if (!s) return { title: '수업 공유 — Class Bridge' };

  const title = `${s.topic ?? '수업'}${s.organization?.name ? ` — ${s.organization.name}` : ''}`;
  const description =
    [
      new Date(s.session_date).toLocaleDateString('ko-KR'),
      s.teacher?.full_name ? `${s.teacher.full_name} 선생님` : null,
      s.subject?.name ?? null,
    ]
      .filter(Boolean)
      .join(' · ') + ' · 수업 내용 공유';

  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
  };
}

/** 학부모용 공개 수업 열람 페이지. 로그인 없이 share_token 으로 접근. */
export default async function SharedClassPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const s = await getSharedSession(token);
  if (!s) notFound();

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="rounded-xl border bg-card p-6 shadow-sm">
          {s.organization?.name && (
            <p className="text-xs text-muted-foreground">{s.organization.name}</p>
          )}
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{s.topic ?? '수업'}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(s.session_date).toLocaleDateString('ko-KR')}
            </span>
            {s.start_time && (
              <span>
                {s.start_time.slice(0, 5)}
                {s.end_time ? ` ~ ${s.end_time.slice(0, 5)}` : ''}
              </span>
            )}
            {s.subject && <span>· {s.subject.name}</span>}
            {s.teacher?.full_name && <span>· {s.teacher.full_name} 선생님</span>}
          </div>
        </header>

        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">수업 내용</h2>
          <RichContent html={s.content_md} />
        </section>

        {s.assignments && s.assignments.length > 0 && (
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              이번 수업에서 나가는 과제
            </h2>
            <ul className="space-y-3">
              {s.assignments.map((a) => (
                <li key={a.id} className="rounded-md border bg-muted/20 p-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.description_md && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {a.description_md}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {a.due_at && <span>마감: {new Date(a.due_at).toLocaleString('ko-KR')}</span>}
                    {a.xp_reward > 0 && <span>완료 시 +{a.xp_reward} XP</span>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(() => {
          const reviewed = (s.class_session_reviews ?? [])
            .map((r) => r.assignment)
            .filter((a): a is ReviewedAssignment => !!a);
          if (reviewed.length === 0) return null;
          return (
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                지난 과제 점검
              </h2>
              <ul className="space-y-3">
                {reviewed.map((a) => {
                  // 선생님이 컨펌한 학생 = status='graded' (등급 매겨 확정).
                  const approved = (a.submissions ?? []).filter((sub) => sub.status === 'graded');
                  const pending = (a.submissions ?? []).filter((sub) => sub.status !== 'graded');
                  return (
                    <li key={a.id} className="rounded-md border bg-muted/20 p-3">
                      <p className="text-sm font-medium">{a.title}</p>
                      {a.description_md && (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {a.description_md}
                        </p>
                      )}
                      {a.due_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          마감: {new Date(a.due_at).toLocaleString('ko-KR')}
                        </p>
                      )}
                      {(approved.length > 0 || pending.length > 0) && (
                        <div className="mt-3 border-t pt-3 space-y-1.5">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            점검 결과
                          </p>
                          {approved.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between gap-2 text-sm"
                            >
                              <span className="truncate">{sub.student?.full_name ?? '학생'}</span>
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${qualityTone(sub.quality)}`}
                              >
                                {SUBMISSION_QUALITY_LABEL[sub.quality]}
                              </span>
                            </div>
                          ))}
                          {pending.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
                            >
                              <span className="truncate">{sub.student?.full_name ?? '학생'}</span>
                              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">
                                미확인
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })()}

        <p className="pt-2 text-center text-xs text-muted-foreground">Class Bridge</p>
      </div>
    </main>
  );
}

function qualityTone(q: SubmissionQuality): string {
  switch (q) {
    case 'excellent':
      return 'bg-indigo-600 text-white';
    case 'done':
      return 'bg-emerald-500 text-white';
    case 'partial':
      return 'bg-amber-500 text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
}
