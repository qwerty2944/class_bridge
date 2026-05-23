'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  addOrgMember,
  fetchOrganization,
  fetchOrganizationMembers,
  removeOrgMember,
  setOrganizationSubjects,
  updateOrgMemberTeacherRole,
  updateOrganization,
} from '@/entities/organization';
import { fetchSubjects } from '@/entities/subject';
import { ORG_COLORS } from '@/views/organizations/ui/OrganizationsView';
import { SubjectPicker } from '@/views/organizations/ui/SubjectPicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Palette, BookOpen } from 'lucide-react';
import { fetchTenantMembers } from '@/entities/tenant';
import { useCurrentTenant } from '@/features/tenant-switch';
import { ClassHandoverDialog } from '@/features/teacher-handover';
import { TEACHER_ROLE_LABEL } from '@/shared/config/labels';
import type { OrgRole, TeacherRole } from '@/shared/types/database';

export function OrganizationDetailClient({ orgId }: { orgId: string }) {
  const { userId, has } = useCurrentTenant();
  const qc = useQueryClient();
  const orgQ = useQuery({ queryKey: ['org', orgId], queryFn: () => fetchOrganization(orgId) });
  const membersQ = useQuery({
    queryKey: ['org-members', orgId],
    queryFn: () => fetchOrganizationMembers(orgId),
  });
  const remove = useMutation({
    mutationFn: removeOrgMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-members', orgId] });
      toast.success('제거됨');
    },
  });
  const changeRole = useMutation({
    mutationFn: ({ id, teacherRole }: { id: string; teacherRole: TeacherRole }) =>
      updateOrgMemberTeacherRole(id, teacherRole),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-members', orgId] });
      toast.success('등급 변경됨');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (orgQ.isLoading || !orgQ.data) return <Skeleton className="h-40" />;
  const org = orgQ.data;
  const members = membersQ.data ?? [];
  const teachers = members.filter((m) => m.role === 'teacher');
  const students = members.filter((m) => m.role === 'student');
  // 이 반의 담임이거나 학원장이면 반 관리(인수인계·선생님 추가/제거) 가능. 부담임은 조회만.
  const myOrgMember = members.find((m) => m.user_id === userId && m.role === 'teacher');
  const canManageOrg = has('director') || myOrgMember?.teacher_role === 'homeroom';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/organizations">
          <ArrowLeft className="h-4 w-4" /> 반 목록
        </Link>
      </Button>
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="h-2 w-12 rounded" style={{ background: org.color ?? '#3b82f6' }} />
            {org.subjects.map((s) => (
              <Badge
                key={s.id}
                variant="secondary"
                style={{ background: `${s.color ?? '#888'}20`, color: s.color ?? undefined }}
              >
                {s.name}
              </Badge>
            ))}
            {canManageOrg && (
              <>
                <OrgColorPicker
                  orgId={orgId}
                  value={org.color ?? '#3b82f6'}
                  onSaved={() => qc.invalidateQueries({ queryKey: ['org', orgId] })}
                />
                <OrgSubjectsDialog
                  orgId={orgId}
                  currentSubjectIds={org.subjects.map((s) => s.id)}
                  onSaved={() => {
                    qc.invalidateQueries({ queryKey: ['org', orgId] });
                    qc.invalidateQueries({ queryKey: ['orgs'] });
                  }}
                />
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{org.name}</h1>
          <p className="text-sm text-muted-foreground">{org.description ?? '—'}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href={`/classes?org=${org.id}`}>
              수업 <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/assignments?org=${org.id}`}>
              과제 <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/progress?org=${org.id}`}>
              진도 <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> 선생님 ({teachers.length})
              </CardTitle>
              <CardDescription>담임 · 부담임 (담임은 여러 명 가능)</CardDescription>
            </div>
            {canManageOrg && (
              <div className="flex gap-1.5">
                <ClassHandoverDialog orgId={orgId} orgName={org.name} />
                <AddOrgMemberDialog orgId={orgId} role="teacher" />
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-1">
            {teachers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">없음</p>}
            {teachers.map((m) => (
              <TeacherRow
                key={m.id}
                name={m.profile?.full_name}
                email={m.profile?.email}
                teacherRole={m.teacher_role}
                canManage={canManageOrg}
                onChangeRole={(tr) => changeRole.mutate({ id: m.id, teacherRole: tr })}
                onRemove={() => remove.mutate(m.id)}
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> 학생 ({students.length})
              </CardTitle>
              <CardDescription>이 반에 등록된 학생</CardDescription>
            </div>
            {(has('director') || has('teacher')) && <AddOrgMemberDialog orgId={orgId} role="student" />}
          </CardHeader>
          <CardContent className="space-y-1">
            {students.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">없음</p>}
            {students.map((m) => (
              <MemberRow
                key={m.id}
                name={m.profile?.full_name}
                email={m.profile?.email}
                href={m.user_id ? `/students/${m.user_id}` : undefined}
                onRemove={() => (has('director') || has('teacher')) && remove.mutate(m.id)}
                canRemove={has('director') || has('teacher')}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MemberRow({
  name,
  email,
  href,
  onRemove,
  canRemove,
}: {
  name?: string | null;
  email?: string | null;
  href?: string;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const body = (
    <>
      <p className="text-sm font-medium truncate">{name ?? '—'}</p>
      <p className="text-xs text-muted-foreground truncate">{email}</p>
    </>
  );
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{name?.slice(0, 1) ?? '?'}</AvatarFallback>
      </Avatar>
      {href ? (
        <Link href={href} className="flex-1 min-w-0 hover:underline">
          {body}
        </Link>
      ) : (
        <div className="flex-1 min-w-0">{body}</div>
      )}
      {canRemove && (
        <Button size="icon" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function TeacherRow({
  name,
  email,
  teacherRole,
  canManage,
  onChangeRole,
  onRemove,
}: {
  name?: string | null;
  email?: string | null;
  teacherRole: TeacherRole | null;
  canManage: boolean;
  onChangeRole: (tr: TeacherRole) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{name?.slice(0, 1) ?? '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name ?? '—'}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
      {canManage ? (
        <Select value={teacherRole ?? 'homeroom'} onValueChange={(v) => onChangeRole(v as TeacherRole)}>
          <SelectTrigger className="h-7 w-[90px] text-xs">
            <SelectValue>
              {(value) =>
                TEACHER_ROLE_LABEL[(String(value ?? 'homeroom')) as TeacherRole] ?? '담임'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="homeroom">담임</SelectItem>
            <SelectItem value="assistant">부담임</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Badge variant={teacherRole === 'assistant' ? 'outline' : 'secondary'}>
          {TEACHER_ROLE_LABEL[teacherRole ?? 'homeroom']}
        </Badge>
      )}
      {canManage && (
        <Button size="icon" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function AddOrgMemberDialog({ orgId, role }: { orgId: string; role: OrgRole }) {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [teacherRole, setTeacherRole] = useState<TeacherRole>('homeroom');
  const candidatesQ = useQuery({
    queryKey: ['members', tenantId],
    enabled: !!tenantId && open,
    queryFn: () => fetchTenantMembers(tenantId!),
  });
  const filtered = (candidatesQ.data ?? []).filter((m) =>
    role === 'teacher' ? m.role === 'teacher' || m.role === 'director' : m.role === 'student',
  );

  const submit = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      await addOrgMember({
        organization_id: orgId,
        user_id: picked,
        role,
        teacher_role: role === 'teacher' ? teacherRole : null,
      });
      qc.invalidateQueries({ queryKey: ['org-members', orgId] });
      toast.success('추가됨');
      setOpen(false);
      setPicked(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <UserPlus className="h-3.5 w-3.5" /> 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role === 'teacher' ? '선생님 배정' : '학생 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>학원 회원 선택</Label>
            <Select value={picked ?? ''} onValueChange={(v) => setPicked(v)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="선택">
                  {(value) => {
                    const v = String(value ?? '');
                    if (!v) return '선택';
                    const m = filtered.find((x) => x.user_id === v);
                    return m?.profile?.full_name ?? '선택';
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filtered.length === 0 && (
                  <div className="p-3 text-xs text-muted-foreground">선택 가능한 회원이 없습니다.</div>
                )}
                {filtered.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm">{m.profile?.full_name ?? '이름 없음'}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{m.profile?.email}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role === 'teacher' && (
            <div>
              <Label>등급</Label>
              <Select value={teacherRole} onValueChange={(v) => setTeacherRole(v as TeacherRole)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue>
                    {(value) =>
                      TEACHER_ROLE_LABEL[(String(value ?? 'homeroom')) as TeacherRole] ?? '담임'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeroom">담임</SelectItem>
                  <SelectItem value="assistant">부담임</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy || !picked}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 반 색상을 빠르게 바꿀 수 있는 popover. 캘린더 칩 / 카드 색상에 반영된다.
 * 형광 색도 팔레트에 포함.
 */
function OrgColorPicker({
  orgId,
  value,
  onSaved,
}: {
  orgId: string;
  value: string;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const save = useMutation({
    mutationFn: (color: string) => updateOrganization(orgId, { color }),
    onSuccess: () => {
      onSaved();
      toast.success('색상 변경됨');
      setOpen(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition"
        aria-label="반 색상 변경"
        title="반 색상 변경"
      >
        <Palette className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <p className="text-xs font-medium mb-2">반 색상</p>
        <div className="grid grid-cols-6 gap-1.5 max-w-[200px]">
          {ORG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => save.mutate(c)}
              aria-label={c}
              className="h-7 w-7 rounded-md ring-offset-2 transition hover:scale-110"
              style={{
                background: c,
                outline: value === c ? '2px solid currentColor' : 'none',
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">캘린더 칩에 적용됩니다.</p>
      </PopoverContent>
    </Popover>
  );
}

/** 반의 과목 set 관리 — 종합반은 여러 과목을 동시에 가질 수 있다. */
function OrgSubjectsDialog({
  orgId,
  currentSubjectIds,
  onSaved,
}: {
  orgId: string;
  currentSubjectIds: string[];
  onSaved: () => void;
}) {
  const { tenantId } = useCurrentTenant();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>(currentSubjectIds);

  // 다이얼로그 열 때마다 현재 값으로 초기화 (외부에서 바뀌었을 수 있음).
  const subjectsQ = useQuery({
    queryKey: ['subjects', tenantId],
    enabled: !!tenantId && open,
    queryFn: () => fetchSubjects(tenantId!),
  });

  const save = useMutation({
    mutationFn: () => setOrganizationSubjects(orgId, picked),
    onSuccess: () => {
      onSaved();
      toast.success('과목 갱신됨');
      setOpen(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setPicked(currentSubjectIds);
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="과목 관리"
          title="과목 관리"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>과목 관리</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            여러 과목을 동시에 선택할 수 있습니다 (종합반).
          </p>
          <SubjectPicker
            subjects={subjectsQ.data ?? []}
            value={picked}
            onChange={setPicked}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
