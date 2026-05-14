'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Plus, Users } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
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
import { useCurrentTenant } from '@/features/tenant-switch';
import { createOrganization, fetchOrganizations, fetchOrganizationsForUser } from '@/entities/organization';
import { fetchSubjects } from '@/entities/subject';

const ORG_COLORS = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ec4899', '#06b6d4'];

export function OrganizationsClient() {
  const { tenantId, userId, has } = useCurrentTenant();
  const orgsQ = useQuery({
    queryKey: ['orgs', tenantId, userId, has('director') ? 'all' : 'mine'],
    enabled: !!tenantId && !!userId,
    queryFn: () =>
      has('director') ? fetchOrganizations(tenantId!) : fetchOrganizationsForUser(tenantId!, userId!),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">반·조직</h1>
          <p className="text-sm text-muted-foreground">학원 내 반(클래스)을 관리합니다.</p>
        </div>
        {has('director') && <NewOrgDialog />}
      </header>

      {orgsQ.isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : orgsQ.data?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground text-sm">아직 반이 없습니다.</CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {orgsQ.data?.map((o) => (
            <Link key={o.id} href={`/organizations/${o.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition group">
                <div className="h-2" style={{ background: o.color ?? '#3b82f6' }} />
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {o.name}
                        {o.subject && (
                          <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: `${o.subject.color}20`, color: o.subject.color ?? undefined }}>
                            {o.subject.name}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{o.description ?? '—'}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> 멤버 보러가기
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

function NewOrgDialog() {
  const { tenantId, userId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [color, setColor] = useState(ORG_COLORS[0]);
  const [busy, setBusy] = useState(false);

  const subjectsQ = useQuery({
    queryKey: ['subjects', tenantId],
    enabled: !!tenantId && open,
    queryFn: () => fetchSubjects(tenantId!),
  });

  const submit = async () => {
    if (!tenantId || !name.trim()) return;
    setBusy(true);
    try {
      await createOrganization({ tenant_id: tenantId, name, description, subject_id: subjectId, color, created_by: userId });
      qc.invalidateQueries({ queryKey: ['orgs', tenantId] });
      toast.success('반 생성됨');
      setOpen(false);
      setName('');
      setDescription('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> 반 만들기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 반</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>이름</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 고2 수학 심화반" />
          </div>
          <div>
            <Label>설명</Label>
            <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>과목</Label>
            <Select value={subjectId ?? '__none'} onValueChange={(v) => setSubjectId(v === '__none' ? null : v)}>
              <SelectTrigger className="mt-1">
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
          <div>
            <Label>색상</Label>
            <div className="mt-1 flex gap-2">
              {ORG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-md"
                  style={{ background: c, outline: color === c ? '2px solid currentColor' : 'none' }}
                />
              ))}
            </div>
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
