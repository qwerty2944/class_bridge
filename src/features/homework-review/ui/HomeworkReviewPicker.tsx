'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { fetchClassSessions } from '@/entities/class-session';
import {
  fetchAssignmentWithSubmissions,
  fetchAssignmentsByOrgs,
  setSubmissionApproved,
  setSubmissionQuality,
  type SessionAssignment,
} from '@/entities/assignment';
import { QualitySegmented } from '@/views/assignment-detail/ui/AssignmentDetailView';
import { SUBMISSION_QUALITY_LABEL, type SubmissionQuality } from '@/shared/types/database';

/**
 * 지난 과제를 골라 학생별 quality/승인을 매기는 재사용 컴포넌트.
 *
 * Select 옵션 = 같은 반의 모든 과제 (수업에 묶인 것 + 직접 만든 standalone 모두).
 * 라벨은 source_session 이 있으면 '{날짜} · {수업주제} — {과제 제목}', 없으면 '{제목}'.
 * `currentSessionId` 가 주어지면 그 수업에서 만든 과제는 옵션에서 제외 (자기 자신 점검 방지).
 *
 * value/onChange 가 없으면 내부 상태로만 동작 (가벼운 점검 흐름).
 */
export function HomeworkReviewPicker({
  orgId,
  tenantId,
  currentSessionId,
  value,
  onChange,
  onRemove,
  removeLabel = '점검 해제',
  emptyHint = '점검할 과제가 없습니다.',
}: {
  orgId: string;
  tenantId: string;
  currentSessionId?: string;
  value?: string | null;
  onChange?: (assignmentId: string | null) => void;
  /** 우측 X 버튼을 노출. 클릭 시 호출. 없으면 X 자체가 안 그려짐. */
  onRemove?: () => void;
  removeLabel?: string;
  emptyHint?: string;
}) {
  const qc = useQueryClient();

  // 같은 반의 모든 과제 + 수업 정보. 수업에 묶이지 않은 과제도 포함.
  const assignmentsQ = useQuery({
    queryKey: ['assignments-by-org', orgId],
    queryFn: () => fetchAssignmentsByOrgs([orgId]),
  });
  const sessionsQ = useQuery({
    queryKey: ['class-sessions', orgId],
    queryFn: () => fetchClassSessions(orgId),
  });

  const sessionById = useMemo(() => {
    const m = new Map<string, NonNullable<typeof sessionsQ.data>[number]>();
    for (const s of sessionsQ.data ?? []) m.set(s.id, s);
    return m;
  }, [sessionsQ.data]);

  // currentSessionId 의 source_session_id 와 일치하면 제외 (자기 점검 방지).
  const eligible = useMemo(() => {
    return (assignmentsQ.data ?? []).filter(
      (a) => !currentSessionId || a.source_session_id !== currentSessionId,
    );
  }, [assignmentsQ.data, currentSessionId]);

  // 트리거에 한 줄로 들어갈 짧은 라벨 — 제목 위주.
  const triggerLabel = (a: NonNullable<typeof assignmentsQ.data>[number]) => a.title;
  // 옵션 아이템의 sub 라벨 — 수업 날짜·주제. 없으면 '수업 미지정'.
  const subLabel = (a: NonNullable<typeof assignmentsQ.data>[number]): string => {
    const sess = a.source_session_id ? sessionById.get(a.source_session_id) : null;
    if (!sess) return '수업 미지정';
    const date = new Date(sess.session_date).toLocaleDateString('ko-KR');
    return `${date} · ${sess.topic ?? '수업'}`;
  };

  const controlled = value !== undefined;
  const fallbackAssignmentId = eligible[0]?.id ?? '';
  const selectedAssignmentId = controlled ? value ?? '' : fallbackAssignmentId;

  const hwQ = useQuery({
    queryKey: ['assignment-with-submissions', selectedAssignmentId],
    enabled: !!selectedAssignmentId,
    queryFn: () => fetchAssignmentWithSubmissions(selectedAssignmentId),
  });

  const xpReward = hwQ.data?.xp_reward ?? 0;

  const qualityMutation = useMutation({
    mutationFn: async (args: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      quality: SubmissionQuality;
    }) =>
      setSubmissionQuality({
        submissionId: args.submissionId,
        tenantId,
        studentUserId: args.studentId,
        studentFullName: args.studentFullName,
        quality: args.quality,
        xpReward,
      }),
    onSuccess: (r, vars) => {
      qc.invalidateQueries({ queryKey: ['assignment-with-submissions', selectedAssignmentId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      const label = SUBMISSION_QUALITY_LABEL[vars.quality];
      if (r && r.xpAdded !== 0) {
        toast.success(`${label} — ${r.xpAdded > 0 ? '+' : ''}${r.xpAdded} XP`);
      } else {
        toast.success(label);
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const approveMutation = useMutation({
    mutationFn: async (args: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      approved: boolean;
      quality: SubmissionQuality;
    }) =>
      setSubmissionApproved({
        submissionId: args.submissionId,
        tenantId,
        studentUserId: args.studentId,
        studentFullName: args.studentFullName,
        approved: args.approved,
        quality: args.quality,
        xpReward,
      }),
    onSuccess: (r, vars) => {
      qc.invalidateQueries({ queryKey: ['assignment-with-submissions', selectedAssignmentId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      if (r && r.xpAdded !== 0) {
        toast.success(
          vars.approved ? `확정 — +${r.xpAdded} XP` : `확정 해제 — ${r.xpAdded} XP`,
        );
      } else {
        toast.success(vars.approved ? '확정됨' : '확정 해제됨');
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!assignmentsQ.isLoading && eligible.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">{emptyHint}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select
          value={selectedAssignmentId}
          onValueChange={(v) => v && onChange?.(v)}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue>
              {(val) => {
                const a = eligible.find((o) => o.id === String(val ?? ''));
                return a ? triggerLabel(a) : '과제 선택';
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {eligible.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm">{a.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{subLabel(a)}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onRemove && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onRemove}
            aria-label={removeLabel}
            title={removeLabel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {hwQ.data && (
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <div className="flex items-start gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <span className="font-medium">{hwQ.data.title}</span>
              {hwQ.data.xp_reward > 0 && (
                <Badge variant="secondary">완료 시 +{hwQ.data.xp_reward} XP</Badge>
              )}
              {hwQ.data.due_at && (
                <span className="text-xs text-muted-foreground">
                  마감: {new Date(hwQ.data.due_at).toLocaleString('ko-KR')}
                </span>
              )}
            </div>
            <Link
              href={`/assignments/${hwQ.data.id}`}
              className="shrink-0 rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent transition"
            >
              과제 상세 →
            </Link>
          </div>
          {hwQ.data.description_md && (
            <p className="mt-1.5 whitespace-pre-wrap text-xs text-muted-foreground">
              {hwQ.data.description_md}
            </p>
          )}
        </div>
      )}

      <div className="divide-y">
        {hwQ.isLoading ? (
          <Skeleton className="h-24" />
        ) : !hwQ.data || hwQ.data.submissions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {selectedAssignmentId ? '학생이 없습니다.' : '과제를 선택하세요.'}
          </p>
        ) : (
          renderSubmissions(
            hwQ.data,
            (sub, q) =>
              qualityMutation.mutate({
                submissionId: sub.id,
                studentId: sub.student_id,
                studentFullName: sub.student?.full_name ?? null,
                quality: q,
              }),
            (sub, approved) =>
              approveMutation.mutate({
                submissionId: sub.id,
                studentId: sub.student_id,
                studentFullName: sub.student?.full_name ?? null,
                approved,
                quality: sub.quality,
              }),
          )
        )}
      </div>
    </div>
  );
}

function renderSubmissions(
  assignment: SessionAssignment,
  onQuality: (sub: SessionAssignment['submissions'][number], q: SubmissionQuality) => void,
  onApprove: (sub: SessionAssignment['submissions'][number], approved: boolean) => void,
) {
  return assignment.submissions.map((sub) => {
    const studentSubmitted = sub.status === 'submitted';
    const isApproved = sub.status === 'graded';
    return (
      <div key={sub.id} className="flex items-center gap-3 py-2.5 flex-wrap">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{sub.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
        </Avatar>
        <Link
          href={`/students/${sub.student_id}`}
          className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
        >
          {sub.student?.full_name}
        </Link>
        {studentSubmitted && (
          <Badge variant="outline" className="border-amber-400 text-amber-700">
            학생 제출
          </Badge>
        )}
        <Button
          size="sm"
          variant={isApproved ? 'default' : 'outline'}
          onClick={() => onApprove(sub, !isApproved)}
        >
          {isApproved ? '확정됨' : '승인'}
        </Button>
        <QualitySegmented value={sub.quality} onChange={(q) => onQuality(sub, q)} />
      </div>
    );
  });
}
