'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useCurrentTenant } from '@/features/tenant-switch';
import { fetchProfilesByIds } from '@/entities/user';
import { fetchOrganizationsForUser } from '@/entities/organization';
import { fetchStudentAssignments } from '@/entities/assignment';
import type { AssignmentWithSubject } from '@/entities/assignment';
import { fetchProgress } from '@/entities/progress';
import { fetchAttendancesByStudent } from '@/entities/class-session';
import { CharacterView } from '@/views/character';
import { ATTENDANCE_LABEL, SUBMISSION_LABEL } from '@/shared/config/labels';
import type { AssignmentSubmission, SubmissionStatus } from '@/shared/types/database';

type StudentAssignmentRow = AssignmentWithSubject & { mySubmission: AssignmentSubmission | null };

export function StudentDetailView({ studentId }: { studentId: string }) {
  const { tenantId, userId, loading: tenantLoading } = useCurrentTenant();
  const isSelf = userId === studentId;

  const profileQ = useQuery({
    queryKey: ['profile', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const list = await fetchProfilesByIds([studentId]);
      return list[0] ?? null;
    },
  });

  const orgsQ = useQuery({
    queryKey: ['orgs-for-user', tenantId, studentId],
    enabled: !!tenantId && !!studentId,
    queryFn: () => fetchOrganizationsForUser(tenantId!, studentId),
  });
  const orgIds = useMemo(() => (orgsQ.data ?? []).map((o) => o.id), [orgsQ.data]);

  if (tenantLoading || profileQ.isLoading) return <Skeleton className="h-[480px]" />;
  if (!profileQ.data)
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          학생 정보를 찾을 수 없습니다.
        </CardContent>
      </Card>
    );

  const profile = profileQ.data;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> 대시보드
          </Link>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
            {profile.full_name ?? '학생'}{' '}
            {isSelf && <Badge variant="outline" className="ml-2 text-xs">나</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(orgsQ.data ?? []).map((o) => (
              <Badge key={o.id} variant="secondary">
                {o.name}
              </Badge>
            ))}
            {orgsQ.data && orgsQ.data.length === 0 && (
              <span className="text-xs text-muted-foreground">소속된 반이 없습니다.</span>
            )}
          </div>
        </div>
      </header>

      <Tabs defaultValue="character">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="character" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" /> 캐릭터
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> 출결
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1">
            <ClipboardList className="h-3.5 w-3.5" /> 과제
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> 진도
          </TabsTrigger>
        </TabsList>

        <TabsContent value="character" className="mt-4">
          <CharacterView targetUserId={isSelf ? null : studentId} />
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <AttendanceTab studentId={studentId} orgIds={orgIds} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <AssignmentsTab studentId={studentId} orgIds={orgIds} />
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <ProgressTab orgIds={orgIds} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttendanceTab({ studentId, orgIds }: { studentId: string; orgIds: string[] }) {
  const q = useQuery({
    queryKey: ['attendances-by-student', studentId, orgIds.join(',')],
    enabled: !!studentId && orgIds.length > 0,
    queryFn: () => fetchAttendancesByStudent(studentId, orgIds),
  });
  if (q.isLoading) return <Skeleton className="h-40" />;
  const rows = q.data ?? [];
  if (rows.length === 0)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          출결 기록이 없습니다.
        </CardContent>
      </Card>
    );
  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-3">
            <div className="text-xs text-muted-foreground w-24 shrink-0">
              {r.session?.session_date ?? '—'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.session?.topic ?? '수업'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {r.session?.subject?.name ?? '—'}
              </p>
            </div>
            <Badge variant={r.status === 'present' ? 'secondary' : 'outline'}>
              {ATTENDANCE_LABEL[r.status]}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AssignmentsTab({ studentId, orgIds }: { studentId: string; orgIds: string[] }) {
  const q = useQuery({
    queryKey: ['student-assignments', studentId, orgIds.join(',')],
    enabled: !!studentId && orgIds.length > 0,
    queryFn: async () => (await fetchStudentAssignments(studentId, orgIds)) as StudentAssignmentRow[],
  });
  if (q.isLoading) return <Skeleton className="h-40" />;
  const rows: StudentAssignmentRow[] = q.data ?? [];
  if (rows.length === 0)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          과제가 없습니다.
        </CardContent>
      </Card>
    );
  return (
    <div className="space-y-2">
      {rows.map((a) => {
        const sub = a.mySubmission;
        return (
          <Card key={a.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {a.subject?.name ?? '—'} · 마감{' '}
                  {a.due_at ? new Date(a.due_at).toLocaleDateString('ko-KR') : '—'}
                </p>
              </div>
              {sub?.score != null && (
                <Badge variant="outline" className="font-mono">
                  {sub.score}점
                </Badge>
              )}
              <Badge variant="secondary">{SUBMISSION_LABEL[(sub?.status ?? 'pending') as SubmissionStatus]}</Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ProgressTab({ orgIds }: { orgIds: string[] }) {
  const q = useQuery({
    queryKey: ['progress-multi-org', orgIds.join(',')],
    enabled: orgIds.length > 0,
    queryFn: async () => {
      const lists = await Promise.all(orgIds.map((id) => fetchProgress(id)));
      return lists.flat().sort((a, b) => b.record_date.localeCompare(a.record_date));
    },
  });
  if (q.isLoading) return <Skeleton className="h-40" />;
  const rows = q.data ?? [];
  if (rows.length === 0)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          진도 기록이 없습니다.
        </CardContent>
      </Card>
    );
  return (
    <div className="space-y-2">
      {rows.map((p) => (
        <Card key={p.id}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {p.chapter ?? '진도'}
                  {p.page_from != null && (
                    <span className="text-muted-foreground ml-2 font-normal">
                      p.{p.page_from}
                      {p.page_to ? `–${p.page_to}` : ''}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {p.subject?.name ?? '—'} · {new Date(p.record_date).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
            {p.content_md && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.content_md}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
