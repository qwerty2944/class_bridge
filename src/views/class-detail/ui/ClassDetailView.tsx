'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Check, Clock, X, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { fetchAttendances, fetchClassSession, updateAttendance } from '@/entities/class-session';
import { useCurrentTenant } from '@/features/tenant-switch';
import { ATTENDANCE_LABEL, type AttendanceStatus } from '@/shared/types/database';

const STATUSES: AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

export function ClassDetailClient({ sessionId }: { sessionId: string }) {
  const { has } = useCurrentTenant();
  const qc = useQueryClient();
  const sQ = useQuery({ queryKey: ['session', sessionId], queryFn: () => fetchClassSession(sessionId) });
  const aQ = useQuery({ queryKey: ['attendances', sessionId], queryFn: () => fetchAttendances(sessionId) });

  const upd = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateAttendance>[1] }) =>
      updateAttendance(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendances', sessionId] }),
  });

  if (sQ.isLoading || !sQ.data) return <Skeleton className="h-40" />;
  const s = sQ.data;
  const canEdit = has('director') || has('teacher');

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/classes">
          <ArrowLeft className="h-4 w-4" /> 수업 목록
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{s.topic ?? '제목 없음'}</CardTitle>
            {s.subject && <Badge variant="secondary">{s.subject.name}</Badge>}
          </div>
          <CardDescription>
            {new Date(s.session_date).toLocaleDateString('ko-KR')}{' '}
            {s.start_time && `${s.start_time.slice(0, 5)}`}
            {s.end_time && ` ~ ${s.end_time.slice(0, 5)}`}
            {s.teacher && ` · ${s.teacher.full_name} 선생님`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">수업 내용</p>
            <p className="text-sm whitespace-pre-wrap">{s.content_md ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">과제 메모</p>
            <p className="text-sm whitespace-pre-wrap">{s.homework_md ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>출결</CardTitle>
          <CardDescription>{canEdit ? '학생별 출결을 체크/사유를 입력하세요.' : '내 출결 상태'}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {aQ.isLoading ? (
            <Skeleton className="h-24" />
          ) : aQ.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">학생이 없습니다.</p>
          ) : (
            aQ.data?.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{a.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.student?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.student?.email}</p>
                </div>
                {canEdit ? (
                  <div className="flex items-center gap-2">
                    <Select value={a.status} onValueChange={(v) => upd.mutate({ id: a.id, patch: { status: v as AttendanceStatus } })}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {ATTENDANCE_LABEL[st]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="사유"
                      defaultValue={a.note ?? ''}
                      onBlur={(e) => {
                        if ((e.target.value || '') !== (a.note ?? '')) {
                          upd.mutate({ id: a.id, patch: { note: e.target.value } });
                        }
                      }}
                      className="w-[160px]"
                    />
                  </div>
                ) : (
                  <Badge variant={a.status === 'present' ? 'default' : 'secondary'}>{ATTENDANCE_LABEL[a.status]}</Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
