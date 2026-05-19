'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarDays, Plus, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Checkbox } from '@/shared/ui/checkbox';
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
import { createClassSession, fetchClassSessions } from '@/entities/class-session';
import { upsertSessionAssignment } from '@/entities/assignment';
import { fetchSubjects } from '@/entities/subject';
import { RichTextEditor } from '@/features/rich-text-editor';

export function ClassesClient({ initialOrgId }: { initialOrgId: string | null }) {
  const { tenantId, has, userId } = useCurrentTenant();
  const [orgId, setOrgId] = useState<string | null>(initialOrgId);

  const sessionsQ = useQuery({
    queryKey: ['class-sessions', orgId],
    enabled: !!orgId,
    queryFn: () => fetchClassSessions(orgId!),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">수업 기록</h1>
          <p className="text-sm text-muted-foreground">반별로 수업을 기록하고 출결을 체크합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <OrgPicker value={orgId} onChange={setOrgId} />
          {orgId && (has('director') || has('teacher')) && <NewSessionDialog orgId={orgId} userId={userId} />}
        </div>
      </header>

      {!orgId ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            반을 선택하세요.
          </CardContent>
        </Card>
      ) : sessionsQ.isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {sessionsQ.data?.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                기록된 수업이 없습니다.
              </CardContent>
            </Card>
          )}
          {sessionsQ.data?.map((s) => (
            <Link key={s.id} href={`/classes/${s.id}`}>
              <Card className="hover:shadow-md transition">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-foreground/5 grid place-items-center">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{s.topic ?? '제목 없음'}</p>
                      {s.subject && <Badge variant="secondary">{s.subject.name}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(s.session_date).toLocaleDateString('ko-KR')}{' '}
                      {s.start_time && `${s.start_time.slice(0, 5)}`}
                      {s.end_time && ` ~ ${s.end_time.slice(0, 5)}`}
                      {s.teacher && ` · ${s.teacher.full_name}`}
                    </p>
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

function NewSessionDialog({ orgId, userId }: { orgId: string; userId: string | null }) {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const subjectsQ = useQuery({ queryKey: ['subjects', tenantId], enabled: !!tenantId && open, queryFn: () => fetchSubjects(tenantId!) });
  const [form, setForm] = useState({
    session_date: new Date().toISOString().slice(0, 10),
    start_time: '',
    end_time: '',
    topic: '',
    subject_id: null as string | null,
    content_md: '',
    add_homework: false,
    hw_title: '',
    hw_description: '',
    hw_due_at: '',
    hw_xp: '',
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.session_date) return;
    setBusy(true);
    try {
      const created = await createClassSession({
        organization_id: orgId,
        session_date: form.session_date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        topic: form.topic || null,
        subject_id: form.subject_id,
        content_md: form.content_md || null,
        teacher_id: userId,
      });
      const wantHomework = form.add_homework && form.hw_title.trim().length > 0;
      await upsertSessionAssignment({
        sessionId: created.id,
        organizationId: orgId,
        subjectId: form.subject_id,
        createdBy: userId,
        assignment: wantHomework
          ? {
              title: form.hw_title.trim(),
              descriptionMd: form.hw_description.trim() || null,
              dueAt: form.hw_due_at ? new Date(form.hw_due_at).toISOString() : null,
              xpReward: form.hw_xp ? Math.max(0, Math.round(Number(form.hw_xp))) : 0,
            }
          : null,
      });
      qc.invalidateQueries({ queryKey: ['class-sessions', orgId] });
      toast.success(
        wantHomework
          ? '수업 + 과제 생성됨 (학생 출결·제출 자동 생성)'
          : '수업 생성됨 (학생 출결 자동 생성)',
      );
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
          <Plus className="h-4 w-4" /> 수업 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>새 수업</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>날짜</Label>
            <Input type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>시작</Label>
              <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <Label>종료</Label>
              <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>주제</Label>
            <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="예: 미분의 활용" />
          </div>
          <div>
            <Label>과목</Label>
            <Select value={form.subject_id ?? '__none'} onValueChange={(v) => setForm({ ...form, subject_id: v === '__none' ? null : v })}>
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
          <div>
            <Label>수업 내용</Label>
            <RichTextEditor
              value={form.content_md}
              onChange={(html) => setForm({ ...form, content_md: html })}
              placeholder="오늘 다룬 내용"
            />
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.add_homework}
                onCheckedChange={(c) => setForm({ ...form, add_homework: c === true })}
              />
              이 수업에 과제 추가
            </label>
            {form.add_homework && (
              <div className="space-y-3 pl-1">
                <div>
                  <Label>과제 제목</Label>
                  <Input
                    value={form.hw_title}
                    onChange={(e) => setForm({ ...form, hw_title: e.target.value })}
                    placeholder="예: 교재 p.120 ~ 122 문제 풀이"
                  />
                </div>
                <div>
                  <Label>과제 설명</Label>
                  <Textarea
                    rows={2}
                    value={form.hw_description}
                    onChange={(e) => setForm({ ...form, hw_description: e.target.value })}
                    placeholder="자세한 안내 (선택)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>마감일</Label>
                    <Input
                      type="datetime-local"
                      value={form.hw_due_at}
                      onChange={(e) => setForm({ ...form, hw_due_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>완료 시 XP</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.hw_xp}
                      onChange={(e) => setForm({ ...form, hw_xp: e.target.value })}
                      placeholder="예: 20"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  과제 목록에 자동 등록되고, 수업 상세에서 학생별로 점검할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button disabled={busy} onClick={submit}>
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
