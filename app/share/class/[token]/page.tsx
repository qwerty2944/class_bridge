import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  User,
} from 'lucide-react';
import { createClient } from '@/shared/api/supabase/server';
import { RichContent } from '@/features/rich-text-editor';
import { cn } from '@/shared/lib/utils';
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
      new Date(s.session_date).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
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

  const orgColor = s.organization?.color ?? '#6366f1';
  const reviewed = (s.class_session_reviews ?? [])
    .map((r) => r.assignment)
    .filter((a): a is ReviewedAssignment => !!a);

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/40 to-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Hero — 반 색상 그라데이션 */}
        <header
          className="relative overflow-hidden rounded-2xl p-7 md:p-9 text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${orgColor}, ${orgColor}b0 60%, ${orgColor}80)`,
          }}
        >
          <p className="absolute right-5 top-5 text-[11px] font-medium tracking-wider opacity-80">
            Class Bridge
          </p>
          {s.organization?.name && (
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
              {s.organization.name}
            </p>
          )}
          <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
            {s.topic ?? '수업'}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-sm">
            <Chip>
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(s.session_date).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
            </Chip>
            {s.start_time && (
              <Chip>
                <Clock className="h-3.5 w-3.5" />
                {s.start_time.slice(0, 5)}
                {s.end_time ? ` ~ ${s.end_time.slice(0, 5)}` : ''}
              </Chip>
            )}
            {s.subject && <Chip>{s.subject.name}</Chip>}
            {s.teacher?.full_name && (
              <Chip>
                <User className="h-3.5 w-3.5" />
                {s.teacher.full_name} 선생님
              </Chip>
            )}
          </div>
        </header>

        {/* 수업 내용 */}
        <SectionCard icon={<BookOpen className="h-4 w-4" />} title="수업 내용">
          <RichContent html={s.content_md} />
        </SectionCard>

        {/* 이번 수업에서 나가는 과제 */}
        {s.assignments && s.assignments.length > 0 && (
          <SectionCard
            icon={<ClipboardList className="h-4 w-4" />}
            title="이번 수업에서 나가는 과제"
          >
            <ul className="space-y-2">
              {s.assignments.map((a) => (
                <li key={a.id} className="rounded-xl border bg-background p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="text-sm font-semibold flex-1 min-w-0">{a.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.xp_reward > 0 && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          +{a.xp_reward} XP
                        </span>
                      )}
                      {a.due_at && (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                          마감 {new Date(a.due_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })}
                        </span>
                      )}
                    </div>
                  </div>
                  {a.description_md && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {a.description_md}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* 지난 과제 점검 */}
        {reviewed.length > 0 && (
          <SectionCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            title="지난 과제 점검"
          >
            <ul className="space-y-3">
              {reviewed.map((a) => {
                const subs = a.submissions ?? [];
                const all = [...subs].sort((x, y) =>
                  (x.student?.full_name ?? '').localeCompare(y.student?.full_name ?? ''),
                );
                return (
                  <li key={a.id} className="rounded-xl border bg-background p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="text-sm font-semibold flex-1 min-w-0">{a.title}</p>
                      {a.due_at && (
                        <span className="text-[11px] text-muted-foreground">
                          마감 {new Date(a.due_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', timeZone: 'Asia/Seoul' })}
                        </span>
                      )}
                    </div>
                    {a.description_md && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                        {a.description_md}
                      </p>
                    )}
                    {all.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-1.5">
                        {all.map((sub) => (
                          <div
                            key={sub.id}
                            className={cn(
                              'rounded-lg px-2.5 py-2 text-[12px]',
                              qualityToneBg(sub.quality, sub.status),
                            )}
                          >
                            <p className="font-medium truncate">
                              {sub.student?.full_name ?? '학생'}
                            </p>
                            <p className="text-[11px] opacity-80 truncate">
                              {qualityLabel(sub.quality, sub.status)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        )}

        <footer className="pt-2 text-center">
          <p className="text-[11px] text-muted-foreground">
            {s.organization?.name && `${s.organization.name} · `}Class Bridge 로 공유됨
          </p>
        </footer>
      </div>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-2.5 py-1 text-[12px] font-medium">
      {children}
    </span>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 md:p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-indigo-500">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

function qualityToneBg(q: SubmissionQuality, status: string): string {
  if (status !== 'graded') {
    if (status === 'submitted') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    return 'bg-muted text-muted-foreground';
  }
  switch (q) {
    case 'excellent':
      return 'bg-indigo-100 text-indigo-700';
    case 'done':
      return 'bg-emerald-100 text-emerald-700';
    case 'partial':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function qualityLabel(q: SubmissionQuality, status: string): string {
  if (status !== 'graded') {
    return status === 'submitted' ? '제출함 (확인 전)' : '미확인';
  }
  return SUBMISSION_QUALITY_LABEL[q];
}
