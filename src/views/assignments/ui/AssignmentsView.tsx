'use client';

import { useMemo, useState } from 'react';
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
import { useCurrentTenant } from '@/features/tenant-switch';
import {
  createAssignment,
  fetchAssignmentsByOrgs,
  type AssignmentWithRefs,
} from '@/entities/assignment';
import { fetchOrganizations, fetchOrganizationsForUser } from '@/entities/organization';
import type { OrgWithSubject } from '@/entities/organization';
import { fetchSubjects } from '@/entities/subject';

type StatusFilter = 'all' | 'open' | 'closed';
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'open', label: '진행 중' },
  { value: 'closed', label: '마감' },
];

export function AssignmentsClient({ initialOrgId }: { initialOrgId: string | null }) {
  const { tenantId, userId, has } = useCurrentTenant();
  const canCreate = has('director') || has('teacher');

  // 반 목록 — 원장은 학원 전체, 그 외는 소속 반.
  const orgsQ = useQuery({
    queryKey: ['orgs', tenantId, userId, has('director') ? 'all' : 'mine'],
    enabled: !!tenantId && !!userId,
    queryFn: () =>
      has('director')
        ? fetchOrganizations(tenantId!)
        : fetchOrganizationsForUser(tenantId!, userId!),
  });
  const orgs = useMemo(() => orgsQ.data ?? [], [orgsQ.data]);
  const orgIds = useMemo(() => orgs.map((o) => o.id), [orgs]);

  const aQ = useQuery({
    queryKey: ['assignments-multi', orgIds.join(',')],
    enabled: orgIds.length > 0,
    queryFn: () => fetchAssignmentsByOrgs(orgIds),
  });

  const [orgFilter, setOrgFilter] = useState<string>(initialOrgId ?? 'all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // 마운트 시점 기준 시각 — 렌더 중 Date.now() 직접 호출을 피하려 lazy state 로 고정.
  const [now] = useState(() => Date.now());
  const filtered = (aQ.data ?? []).filter((a) => {
    if (orgFilter !== 'all' && a.organization_id !== orgFilter) return false;
    if (statusFilter !== 'all') {
      const closed = !!a.due_at && new Date(a.due_at).getTime() < now;
      if (statusFilter === 'open' && closed) return false;
      if (statusFilter === 'closed' && !closed) return false;
    }
    return true;
  });

  const loading = orgsQ.isLoading || (orgIds.length > 0 && aQ.isLoading);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">과제</h1>
          <p className="text-sm text-muted-foreground">반별 과제 등록, 학생 제출, 선생님 채점.</p>
        </div>
        {canCreate && orgs.length > 0 && (
          <NewAssignmentDialog
            orgs={orgs}
            defaultOrgId={orgFilter !== 'all' ? orgFilter : orgs[0].id}
          />
        )}
      </header>

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={orgFilter} onValueChange={(v) => setOrgFilter(v ?? 'all')}>
          <SelectTrigger className="w-44">
            <SelectValue>
              {(value) => {
                const v = String(value ?? '');
                if (!v || v === 'all') return '전체 반';
                return orgs.find((o) => o.id === v)?.name ?? '전체 반';
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 반</SelectItem>
            {orgs.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          {STATUS_TABS.map((t) => (
            <Button
              key={t.value}
              size="sm"
              variant={statusFilter === t.value ? 'default' : 'outline'}
              onClick={() => setStatusFilter(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-40" />
      ) : orgs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            소속된 반이 없습니다.
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            조건에 맞는 과제가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AssignmentCard key={a.id} assignment={a} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment: a, now }: { assignment: AssignmentWithRefs; now: number }) {
  const closed = !!a.due_at && new Date(a.due_at).getTime() < now;
  return (
    <Link href={`/assignments/${a.id}`}>
      <Card className="h-full transition hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foreground/5">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{a.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {a.organization && <Badge variant="outline">{a.organization.name}</Badge>}
                {a.subject && <Badge variant="secondary">{a.subject.name}</Badge>}
                <Badge variant={closed ? 'secondary' : 'default'}>
                  {closed ? '마감' : '진행 중'}
                </Badge>
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                {a.description_md ?? '—'}
              </p>
              {a.due_at && (
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600">
                  <CalendarClock className="h-3.5 w-3.5" /> 마감{' '}
                  {new Date(a.due_at).toLocaleString('ko-KR')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function NewAssignmentDialog({
  orgs,
  defaultOrgId,
}: {
  orgs: OrgWithSubject[];
  defaultOrgId: string;
}) {
  const { tenantId, userId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const subjectsQ = useQuery({
    queryKey: ['subjects', tenantId],
    enabled: !!tenantId && open,
    queryFn: () => fetchSubjects(tenantId!),
  });
  const [form, setForm] = useState({
    organization_id: defaultOrgId,
    title: '',
    description_md: '',
    due_at: '',
    subject_id: null as string | null,
    xp_reward: '',
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.title.trim() || !form.organization_id) return;
    setBusy(true);
    try {
      await createAssignment({
        organization_id: form.organization_id,
        title: form.title,
        description_md: form.description_md || null,
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        subject_id: form.subject_id,
        xp_reward: form.xp_reward ? Math.max(0, Math.round(Number(form.xp_reward))) : 0,
        created_by: userId,
      });
      qc.invalidateQueries({ queryKey: ['assignments-multi'] });
      toast.success('과제 생성됨 (학생 제출 항목 생성)');
      setOpen(false);
      setForm({
        organization_id: defaultOrgId,
        title: '',
        description_md: '',
        due_at: '',
        subject_id: null,
        xp_reward: '',
      });
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
            <Label>반</Label>
            <Select
              value={form.organization_id}
              onValueChange={(v) => v && setForm({ ...form, organization_id: v })}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value) =>
                    orgs.find((o) => o.id === String(value ?? ''))?.name ?? '반 선택'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {orgs.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>제목</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>설명</Label>
            <Textarea
              rows={3}
              value={form.description_md}
              onChange={(e) => setForm({ ...form, description_md: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>마감</Label>
              <Input
                type="datetime-local"
                value={form.due_at}
                onChange={(e) => setForm({ ...form, due_at: e.target.value })}
              />
            </div>
            <div>
              <Label>과목</Label>
              <Select
                value={form.subject_id ?? '__none'}
                onValueChange={(v) => setForm({ ...form, subject_id: v === '__none' ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택">
                    {(value) => {
                      const v = String(value ?? '');
                      if (!v || v === '__none') return '미지정';
                      return subjectsQ.data?.find((s) => s.id === v)?.name ?? '미지정';
                    }}
                  </SelectValue>
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
