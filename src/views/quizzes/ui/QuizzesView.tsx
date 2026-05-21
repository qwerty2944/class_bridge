'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookCheck, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
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
import { createQuiz, fetchQuizzesByOrgs, describeXpRule } from '@/entities/quiz';
import type { QuizXpRule } from '@/entities/quiz';
import { fetchOrganizations, fetchOrganizationsForUser } from '@/entities/organization';
import type { OrgWithSubject } from '@/entities/organization';
import { fetchSubjects } from '@/entities/subject';
import { cn } from '@/shared/lib/utils';

export function QuizzesClient({ initialOrgId }: { initialOrgId: string | null }) {
  const { tenantId, userId, has } = useCurrentTenant();
  const canCreate = has('director') || has('teacher');

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

  const quizzesQ = useQuery({
    queryKey: ['quizzes-multi', orgIds.join(',')],
    enabled: orgIds.length > 0,
    queryFn: () => fetchQuizzesByOrgs(orgIds),
  });

  const [orgFilter, setOrgFilter] = useState<string>(initialOrgId ?? 'all');
  const filtered = (quizzesQ.data ?? []).filter(
    (q) => orgFilter === 'all' || q.organization_id === orgFilter,
  );

  const loading = orgsQ.isLoading || (orgIds.length > 0 && quizzesQ.isLoading);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">퀴즈</h1>
          <p className="text-sm text-muted-foreground">시험 점수를 기록하고 XP를 자동 지급합니다.</p>
        </div>
        {canCreate && orgs.length > 0 && (
          <NewQuizDialog
            orgs={orgs}
            defaultOrgId={orgFilter !== 'all' ? orgFilter : orgs[0].id}
            userId={userId}
          />
        )}
      </header>

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
            기록된 퀴즈가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q) => {
            const org = orgs.find((o) => o.id === q.organization_id);
            return (
              <Link key={q.id} href={`/quizzes/${q.id}`}>
                <Card className="h-full transition hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foreground/5">
                        <BookCheck className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{q.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {org && <Badge variant="outline">{org.name}</Badge>}
                          {q.subject && <Badge variant="secondary">{q.subject.name}</Badge>}
                          <Badge variant="secondary">
                            {q.score_count}/{q.total}명 기록
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {new Date(q.quiz_date).toLocaleDateString('ko-KR')} · 만점{' '}
                          {q.max_score}점
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {describeXpRule(q.xp_rule)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewQuizDialog({
  orgs,
  defaultOrgId,
  userId,
}: {
  orgs: OrgWithSubject[];
  defaultOrgId: string;
  userId: string | null;
}) {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const subjectsQ = useQuery({
    queryKey: ['subjects', tenantId],
    enabled: !!tenantId && open,
    queryFn: () => fetchSubjects(tenantId!),
  });

  type RuleKind = QuizXpRule['kind'];
  const [form, setForm] = useState({
    organization_id: defaultOrgId,
    name: '',
    quiz_date: new Date().toISOString().slice(0, 10),
    max_score: '100',
    subject_id: null as string | null,
    rule_kind: 'proportional' as RuleKind,
    prop_max_xp: '50',
    cutoff_threshold: '80',
    cutoff_xp: '50',
    bands: [
      { key: crypto.randomUUID(), minScore: '90', xp: '100' },
      { key: crypto.randomUUID(), minScore: '70', xp: '50' },
    ],
  });
  const [busy, setBusy] = useState(false);

  const buildRule = (): QuizXpRule => {
    switch (form.rule_kind) {
      case 'proportional':
        return { kind: 'proportional', maxXp: Math.max(0, Math.round(Number(form.prop_max_xp) || 0)) };
      case 'cutoff':
        return {
          kind: 'cutoff',
          threshold: Math.max(0, Math.round(Number(form.cutoff_threshold) || 0)),
          xp: Math.max(0, Math.round(Number(form.cutoff_xp) || 0)),
        };
      case 'bands':
        return {
          kind: 'bands',
          bands: form.bands
            .map((b) => ({
              minScore: Math.max(0, Math.round(Number(b.minScore) || 0)),
              xp: Math.max(0, Math.round(Number(b.xp) || 0)),
            }))
            .sort((a, b) => b.minScore - a.minScore),
        };
    }
  };

  const submit = async () => {
    if (!form.organization_id || !form.name.trim()) return;
    setBusy(true);
    try {
      await createQuiz({
        organization_id: form.organization_id,
        name: form.name.trim(),
        quiz_date: form.quiz_date,
        max_score: Math.max(1, Math.round(Number(form.max_score) || 100)),
        subject_id: form.subject_id,
        xp_rule: buildRule(),
        created_by: userId,
      });
      qc.invalidateQueries({ queryKey: ['quizzes-multi'] });
      toast.success('퀴즈 생성됨 (학생 점수 행 자동 생성)');
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> 퀴즈 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>새 퀴즈</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>반</Label>
            <Select
              value={form.organization_id}
              onValueChange={(v) => v && setForm({ ...form, organization_id: v })}
            >
              <SelectTrigger className="mt-1">
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
            <Label>이름</Label>
            <Input
              className="mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 5월 중간 단어 시험"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>날짜</Label>
              <Input
                className="mt-1"
                type="date"
                value={form.quiz_date}
                onChange={(e) => setForm({ ...form, quiz_date: e.target.value })}
              />
            </div>
            <div>
              <Label>만점</Label>
              <Input
                className="mt-1"
                type="number"
                min={1}
                value={form.max_score}
                onChange={(e) => setForm({ ...form, max_score: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>과목</Label>
            <Select
              value={form.subject_id ?? '__none'}
              onValueChange={(v) => setForm({ ...form, subject_id: v === '__none' ? null : v })}
            >
              <SelectTrigger className="mt-1">
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

          <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
            <p className="text-sm font-medium">XP 규칙</p>
            <div className="inline-flex overflow-hidden rounded-md border bg-background text-xs">
              {(['proportional', 'cutoff', 'bands'] as RuleKind[]).map((k, i) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm({ ...form, rule_kind: k })}
                  className={cn(
                    'px-3 py-1.5 transition',
                    i > 0 && 'border-l',
                    form.rule_kind === k
                      ? 'bg-foreground text-background'
                      : 'hover:bg-accent',
                  )}
                >
                  {k === 'proportional' ? '비례' : k === 'cutoff' ? '커트라인' : '구간'}
                </button>
              ))}
            </div>

            {form.rule_kind === 'proportional' && (
              <div>
                <Label>만점 시 지급 XP</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={0}
                  value={form.prop_max_xp}
                  onChange={(e) => setForm({ ...form, prop_max_xp: e.target.value })}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  점수에 비례 — 만점 절반이면 절반만 지급.
                </p>
              </div>
            )}

            {form.rule_kind === 'cutoff' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>커트라인 점수</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={form.cutoff_threshold}
                    onChange={(e) => setForm({ ...form, cutoff_threshold: e.target.value })}
                  />
                </div>
                <div>
                  <Label>통과 시 XP</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={form.cutoff_xp}
                    onChange={(e) => setForm({ ...form, cutoff_xp: e.target.value })}
                  />
                </div>
              </div>
            )}

            {form.rule_kind === 'bands' && (
              <div className="space-y-2">
                {form.bands.map((b) => (
                  <div key={b.key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">≥</span>
                    <Input
                      type="number"
                      min={0}
                      value={b.minScore}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bands: form.bands.map((x) =>
                            x.key === b.key ? { ...x, minScore: e.target.value } : x,
                          ),
                        })
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-muted-foreground">→</span>
                    <Input
                      type="number"
                      min={0}
                      value={b.xp}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bands: form.bands.map((x) =>
                            x.key === b.key ? { ...x, xp: e.target.value } : x,
                          ),
                        })
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-muted-foreground">XP</span>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        setForm({ ...form, bands: form.bands.filter((x) => x.key !== b.key) })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      bands: [
                        ...form.bands,
                        { key: crypto.randomUUID(), minScore: '0', xp: '0' },
                      ],
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> 구간 추가
                </Button>
                <p className="text-xs text-muted-foreground">
                  내림차순으로 평가 — 점수가 처음 매치되는 구간의 XP 지급.
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy || !form.name.trim() || !form.organization_id}>
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
