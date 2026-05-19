'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClipboardList, Plus, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { OrgPicker } from '@/features/org-pick';
import { useCurrentTenant } from '@/features/tenant-switch';
import { createAssignment, fetchAssignments } from '@/entities/assignment';
import { fetchSubjects } from '@/entities/subject';

export function AssignmentsClient({ initialOrgId }: { initialOrgId: string | null }) {
  const { has } = useCurrentTenant();
  const [orgId, setOrgId] = useState<string | null>(initialOrgId);
  const aQ = useQuery({
    queryKey: ['assignments', orgId],
    enabled: !!orgId,
    queryFn: () => fetchAssignments(orgId!),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">과제</h1>
          <p className="text-sm text-muted-foreground">반별 과제 등록, 학생 제출, 선생님 채점.</p>
        </div>
        <div className="flex items-center gap-2">
          <OrgPicker value={orgId} onChange={setOrgId} />
          {orgId && (has('director') || has('teacher')) && <NewAssignmentDialog orgId={orgId} />}
        </div>
      </header>

      {!orgId ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">반을 선택하세요.</CardContent>
        </Card>
      ) : aQ.isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {aQ.data?.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-10">과제가 없습니다.</p>
          )}
          {aQ.data?.map((a) => (
            <Link key={a.id} href={`/assignments/${a.id}`}>
              <Card className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="h-10 w-10 grid place-items-center rounded-md bg-foreground/5">
                      <ClipboardList className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{a.title}</p>
                        {a.subject && <Badge variant="secondary">{a.subject.name}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.description_md ?? '—'}</p>
                      {a.due_at && (
                        <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600">
                          <CalendarClock className="h-3.5 w-3.5" /> 마감 {new Date(a.due_at).toLocaleString('ko-KR')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NewAssignmentDialog({ orgId }: { orgId: string }) {
  const { tenantId, userId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const subjectsQ = useQuery({ queryKey: ['subjects', tenantId], enabled: !!tenantId && open, queryFn: () => fetchSubjects(tenantId!) });
  const [form, setForm] = useState({
    title: '',
    description_md: '',
    due_at: '',
    subject_id: null as string | null,
    xp_reward: '',
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      await createAssignment({
        organization_id: orgId,
        title: form.title,
        description_md: form.description_md || null,
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        subject_id: form.subject_id,
        xp_reward: form.xp_reward ? Math.max(0, Math.round(Number(form.xp_reward))) : 0,
        created_by: userId,
      });
      qc.invalidateQueries({ queryKey: ['assignments', orgId] });
      toast.success('과제 생성됨 (학생 제출 항목 생성)');
      setOpen(false);
      setForm({ title: '', description_md: '', due_at: '', subject_id: null, xp_reward: '' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> 과제 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 과제</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>제목</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>설명</Label>
            <Textarea rows={3} value={form.description_md} onChange={(e) => setForm({ ...form, description_md: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>마감</Label>
              <Input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
            </div>
            <div>
              <Label>과목</Label>
              <Select value={form.subject_id ?? '__none'} onValueChange={(v) => setForm({ ...form, subject_id: v === '__none' ? null : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">미지정</SelectItem>
                  {subjectsQ.data?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>완료 시 지급 경험치(XP)</Label>
            <Input
              type="number"
              min={0}
              value={form.xp_reward}
              onChange={(e) => setForm({ ...form, xp_reward: e.target.value })}
              placeholder="예: 100"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              채점되면 학생에게 이 경험치가 지급됩니다.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy}>
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
