import { notFound } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { createClient } from '@/shared/api/supabase/server';
import { RichContent } from '@/features/rich-text-editor';
import type { ClassSession, Organization, Profile, Subject } from '@/shared/types/database';

export const metadata = { title: '수업 공유 — Class Bridge' };

type SharedSession = ClassSession & {
  subject: Subject | null;
  teacher: Profile | null;
  organization: Organization | null;
};

/** 학부모용 공개 수업 열람 페이지. 로그인 없이 share_token 으로 접근. */
export default async function SharedClassPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('class_sessions')
    .select(
      '*, subject:subjects(*), teacher:profiles!class_sessions_teacher_id_fkey(*), organization:organizations(*)',
    )
    .eq('share_token', token)
    .maybeSingle();

  if (!data) notFound();
  const s = data as SharedSession;

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

        {s.homework_md && (
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">과제</h2>
            <p className="whitespace-pre-wrap text-sm">{s.homework_md}</p>
          </section>
        )}

        <p className="pt-2 text-center text-xs text-muted-foreground">Class Bridge</p>
      </div>
    </main>
  );
}
