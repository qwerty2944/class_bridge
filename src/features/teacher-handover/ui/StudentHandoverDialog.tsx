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
import { fetchTenantMembers } from '@/entities/tenant';
import { handoverStudent } from '@/entities/handover';
import { useCurrentTenant } from '@/features/tenant-switch';

// 학생 단위 인수인계 — 특정 학생을 다른 선생님에게 넘기며 인계 메모를 남긴다.
export function StudentHandoverDialog({ studentId, studentName }: { studentId: string; studentName: string }) {
  const { tenantId, userId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [fromTeacherId, setFromTeacherId] = useState('');
  const [toTeacherId, setToTeacherId] = useState('');
  const [memo, setMemo] = useState('');

  const membersQ = useQuery({
    queryKey: ['members', tenantId],
    enabled: open && !!tenantId,
    queryFn: () => fetchTenantMembers(tenantId!),
  });

  // 학원의 선생님/원장 — 중복 user 제거.
  const teachers = useMemo(() => {
    const seen = new Set<string>();
    return (membersQ.data ?? [])
      .filter((m) => m.role === 'teacher' || m.role === 'director')
      .filter((m) => {
        if (seen.has(m.user_id)) return false;
        seen.add(m.user_id);
        return true;
      });
  }, [membersQ.data]);

  // 인계 선생님 기본값 = 현재 사용자(선생님일 때). 명시 선택이 있으면 그것을 우선.
  const effectiveFrom =
    fromTeacherId || (userId && teachers.some((t) => t.user_id === userId) ? userId : '');

  const submit = useMutation({
    mutationFn: async () => {
      if (!toTeacherId || !tenantId) throw new Error('인수 선생님을 선택하세요.');
      await handoverStudent({
        tenant_id: tenantId,
        student_id: studentId,
        from_teacher_id: effectiveFrom || null,
        to_teacher_id: toTeacherId,
        memo: memo.trim() || null,
        created_by: userId ?? null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['handovers-student', studentId] });
      toast.success('학생 인수인계 완료');
      setOpen(false);
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
          <DialogTitle>{studentName} — 학생 인수인계</DialogTitle>
          <DialogDescription>
            이 학생의 담당을 다른 선생님에게 넘깁니다. 인계 메모는 학생 상세의 인수인계 탭에 남습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>인계 선생님</Label>
            <Select value={effectiveFrom} onValueChange={(v) => setFromTeacherId(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((m) => (
                  <SelectItem key={`from-${m.user_id}`} value={m.user_id}>
                    {m.profile?.full_name} ({m.profile?.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>인수 선생님</Label>
            <Select value={toTeacherId} onValueChange={(v) => setToTeacherId(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {teachers
                  .filter((m) => m.user_id !== effectiveFrom)
                  .map((m) => (
                    <SelectItem key={`to-${m.user_id}`} value={m.user_id}>
                      {m.profile?.full_name} ({m.profile?.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>인계 메모</Label>
            <Textarea
              placeholder="학생의 학습 상황, 강점·약점, 상담 이력, 주의할 점 등을 적어 연속성 있게 인계하세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => submit.mutate()} disabled={submit.isPending || !toTeacherId}>
            인수인계
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
