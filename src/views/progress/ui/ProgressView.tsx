'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
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
import { createProgress, deleteProgress, fetchProgress } from '@/entities/progress';
import { fetchSubjects } from '@/entities/subject';

export function ProgressClient({ initialOrgId }: { initialOrgId: string | null }) {
  const { has, userId } = useCurrentTenant();
  const [orgId, setOrgId] = useState<string | null>(initialOrgId);
  const qc = useQueryClient();
  const pQ = useQuery({
    queryKey: ['progress', orgId],
    enabled: !!orgId,
    queryFn: () => fetchProgress(orgId!),
  });
  const del = useMutation({
    mutationFn: deleteProgress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress', orgId] });
      toast.success('삭제됨');
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">진도</h1>
          <p className="text-sm text-muted-foreground">단원·페이지 단위로 진도를 기록합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <OrgPicker value={orgId} onChange={setOrgId} />
          {orgId && (has('director') || has('teacher')) && <NewProgressDialog orgId={orgId} userId={userId} />}
        </div>
      </header>

      {!orgId ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">반을 선택하세요.</CardContent>
        </Card>
      ) : pQ.isLoading ? (
        <Skeleton className="h-40" />
      ) : pQ.data?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">진도 기록이 없습니다.</CardContent>
        </Card>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {pQ.data?.map((p) => (
              <div key={p.id} className="relative">
                <span className="absolute -left-[19px] top-2 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-background" />
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(p.record_date).toLocaleDateString('ko-KR')}
                          </p>
                          {p.subject && <Badge variant="secondary">{p.subject.name}</Badge>}
                        </div>
                        <h3 className="font-medium mt-1 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-indigo-500" />
                          {p.chapter ?? '단원 미지정'}
                          {(p.page_from || p.page_to) && (
                            <span className="text-xs text-muted-foreground">
                              p.{p.page_from ?? '?'} ~ {p.page_to ?? '?'}
                            </span>
                          )}
                        </h3>
                        {p.content_md && (
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{p.content_md}</p>
                        )}
                      </div>
                      {(has('director') || has('teacher')) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('삭제할까요?')) del.mutate(p.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NewProgressDialog({ orgId, userId }: { orgId: string; userId: string | null }) {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const subjectsQ = useQuery({ queryKey: ['subjects', tenantId], enabled: !!tenantId && open, queryFn: () => fetchSubjects(tenantId!) });
  const [form, setForm] = useState({
    record_date: new Date().toISOString().slice(0, 10),
    chapter: '',
    page_from: '',
    page_to: '',
    content_md: '',
    subject_id: null as string | null,
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await createProgress({
        organization_id: orgId,
        record_date: form.record_date,
        chapter: form.chapter || null,
        page_from: form.page_from ? Number(form.page_from) : null,
        page_to: form.page_to ? Number(form.page_to) : null,
        content_md: form.content_md || null,
        subject_id: form.subject_id,
        created_by: userId,
      });
      qc.invalidateQueries({ queryKey: ['progress', orgId] });
      toast.success('진도 추가됨');
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> 진도 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>진도 기록</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>날짜</Label>
              <Input type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} />
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
            <Label>단원/주제</Label>
            <Input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} placeholder="예: 3단원 - 미분" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>페이지 시작</Label>
              <Input type="number" value={form.page_from} onChange={(e) => setForm({ ...form, page_from: e.target.value })} />
            </div>
            <div>
              <Label>페이지 끝</Label>
              <Input type="number" value={form.page_to} onChange={(e) => setForm({ ...form, page_to: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>내용</Label>
            <Textarea rows={3} value={form.content_md} onChange={(e) => setForm({ ...form, content_md: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
