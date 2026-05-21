'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeftRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { fetchOrganizationMembers } from '@/entities/organization';
import { fetchTenantMembers } from '@/entities/tenant';
import { handoverOrganizationTeacher } from '@/entities/handover';
import { useCurrentTenant } from '@/features/tenant-switch';
import { TEACHER_ROLE_LABEL } from '@/shared/config/labels';

// 반 단위 인수인계 — 기존 담당 선생님을 다른 선생님으로 교체하고 인계 메모를 남긴다.
export function ClassHandoverDialog({ orgId, orgName }: { orgId: string; orgName: string }) {
  const { tenantId, userId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [fromMemberId, setFromMemberId] = useState('');
  const [toTeacherId, setToTeacherId] = useState('');
  const [memo, setMemo] = useState('');

  const orgMembersQ = useQuery({
    queryKey: ['org-members', orgId],
    enabled: open,
    queryFn: () => fetchOrganizationMembers(orgId),
  });
  const tenantMembersQ = useQuery({
    queryKey: ['members', tenantId],
    enabled: open && !!tenantId,
    queryFn: () => fetchTenantMembers(tenantId!),
  });

  // 현재 이 반을 맡고 있는 선생님 (인계자 후보).
  const orgTeachers = useMemo(
    () => (orgMembersQ.data ?? []).filter((m) => m.role === 'teacher'),
    [orgMembersQ.data],
  );
  // 학원의 선생님/원장 (인수자 후보) — 인계자 본인은 제외.
  const candidates = useMemo(() => {
    const fromUserId = orgTeachers.find((m) => m.id === fromMemberId)?.user_id;
    const seen = new Set<string>();
    return (tenantMembersQ.data ?? [])
      .filter((m) => m.role === 'teacher' || m.role === 'director')
      .filter((m) => {
        if (m.user_id === fromUserId) return false;
        if (seen.has(m.user_id)) return false;
        seen.add(m.user_id);
        return true;
      });
  }, [tenantMembersQ.data, orgTeachers, fromMemberId]);

  const submit = useMutation({
    mutationFn: async () => {
      const fromMember = orgTeachers.find((m) => m.id === fromMemberId);
      if (!fromMember || !toTeacherId || !tenantId) throw new Error('인계/인수 선생님을 모두 선택하세요.');
      await handoverOrganizationTeacher({
        tenant_id: tenantId,
        organization_id: orgId,
        from_member_row_id: fromMember.id,
        from_teacher_id: fromMember.user_id,
        from_teacher_role: fromMember.teacher_role,
        to_teacher_id: toTeacherId,
        memo: memo.trim() || null,
        created_by: userId ?? null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-members', orgId] });
      qc.invalidateQueries({ queryKey: ['handovers-org', orgId] });
      qc.invalidateQueries({ queryKey: ['handovers-student'] });
      toast.success('반 인수인계 완료');
      setOpen(false);
      setFromMemberId('');
      setToTeacherId('');
      setMemo('');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <ArrowLeftRight className="h-3.5 w-3.5" /> 인수인계
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{orgName} — 반 인수인계</DialogTitle>
          <DialogDescription>
            담당 선생님을 교체합니다. 기존 선생님은 반에서 제외되고, 인계 메모는 반 학생들의 상세 페이지에 남습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>인계 선생님 (기존 담당)</Label>
            <Select value={fromMemberId} onValueChange={(v) => setFromMemberId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="선택">
                  {(value) => {
                    const v = String(value ?? '');
                    if (!v) return '선택';
                    const m = orgTeachers.find((x) => x.id === v);
                    if (!m) return '선택';
                    return `${m.profile?.full_name ?? '이름 없음'}${
                      m.teacher_role ? ` · ${TEACHER_ROLE_LABEL[m.teacher_role]}` : ''
                    }`;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {orgTeachers.length === 0 && (
                  <div className="p-3 text-xs text-muted-foreground">이 반에 배정된 선생님이 없습니다.</div>
                )}
                {orgTeachers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        {m.profile?.full_name ?? '이름 없음'}
                        {m.teacher_role ? ` · ${TEACHER_ROLE_LABEL[m.teacher_role]}` : ''}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {m.profile?.email}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>인수 선생님 (새 담당)</Label>
            <Select value={toTeacherId} onValueChange={(v) => setToTeacherId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="선택">
                  {(value) => {
                    const v = String(value ?? '');
                    if (!v) return '선택';
                    return (
                      candidates.find((x) => x.user_id === v)?.profile?.full_name ?? '선택'
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {candidates.length === 0 && (
                  <div className="p-3 text-xs text-muted-foreground">선택 가능한 선생님이 없습니다.</div>
                )}
                {candidates.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm">{m.profile?.full_name ?? '이름 없음'}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {m.profile?.email}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>인계 메모</Label>
            <Textarea
              placeholder="진도 상황, 학생별 특이사항, 주의할 점 등을 적어 연속성 있게 인계하세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || !fromMemberId || !toTeacherId}
          >
            인수인계
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
