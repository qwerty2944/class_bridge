'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { useCurrentTenant } from '@/features/tenant-switch';
import { createSubject, deleteSubject, fetchSubjects, updateSubject } from '@/entities/subject';
import type { Subject } from '@/shared/types/database';

const SUBJECT_COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#0ea5e9', '#a855f7', '#ef4444', '#14b8a6'];

export function SubjectsClient() {
  const { tenantId, has } = useCurrentTenant();
  const qc = useQueryClient();
  const subjectsQ = useQuery({
    queryKey: ['subjects', tenantId],
    enabled: !!tenantId,
    queryFn: () => fetchSubjects(tenantId!),
  });

  const del = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', tenantId] });
      toast.success('삭제됨');
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">과목</h1>
          <p className="text-sm text-muted-foreground">학원에서 가르치는 과목을 관리합니다.</p>
        </div>
        {(has('director') || has('teacher')) && <SubjectDialog />}
      </header>

      {subjectsQ.isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjectsQ.data?.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-10">
              과목이 없습니다.
            </p>
          )}
          {subjectsQ.data?.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="h-2" style={{ background: s.color ?? '#6366f1' }} />
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.description ?? '—'}</p>
                  </div>
                  {(has('director') || has('teacher')) && (
                    <div className="flex">
                      <SubjectDialog subject={s} trigger={<Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>} />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('삭제할까요?')) del.mutate(s.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectDialog({ subject, trigger }: { subject?: Subject; trigger?: React.ReactNode }) {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(subject?.name ?? '');
  const [description, setDescription] = useState(subject?.description ?? '');
  const [color, setColor] = useState(subject?.color ?? SUBJECT_COLORS[0]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!tenantId || !name.trim()) return;
    setBusy(true);
    try {
      if (subject) {
        await updateSubject(subject.id, { name, description, color });
      } else {
        await createSubject({ tenant_id: tenantId, name, description, color });
      }
      qc.invalidateQueries({ queryKey: ['subjects', tenantId] });
      toast.success(subject ? '수정됨' : '추가됨');
      setOpen(false);
      if (!subject) {
        setName('');
        setDescription('');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> 과목 추가
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subject ? '과목 수정' : '과목 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>이름</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 수학" />
          </div>
          <div>
            <Label>설명</Label>
            <Textarea className="mt-1" value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>색상</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className="h-8 w-8 rounded-md ring-offset-2 transition"
                  style={{ background: c, outline: color === c ? '2px solid currentColor' : 'none' }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy}>
            {subject ? '저장' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
