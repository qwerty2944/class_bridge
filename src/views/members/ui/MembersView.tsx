'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, MoreVertical, RefreshCw, Trash2, UserPlus, Users, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useCurrentTenant } from '@/features/tenant-switch';
import {
  addTenantMember,
  fetchTenantMembers,
  regenerateInviteCode,
  removeTenantMember,
} from '@/entities/tenant';
import { searchProfiles } from '@/entities/user';
import {
  approveJoinRequest,
  fetchPendingJoinRequests,
  rejectJoinRequest,
  type TenantJoinRequest,
} from '@/entities/join-request';
import { ParentChildrenDialog } from '@/features/parent-link-manage';
import { ROLE_LABEL } from '@/shared/types/database';
import type { Role, Profile } from '@/shared/types/database';

const ROLES: Role[] = ['director', 'teacher', 'student', 'parent'];

export function MembersClient() {
  const { tenantId, tenant, has, loading } = useCurrentTenant();
  const qc = useQueryClient();

  const membersQ = useQuery({
    queryKey: ['members', tenantId],
    enabled: !!tenantId,
    queryFn: () => fetchTenantMembers(tenantId!),
  });

  const remove = useMutation({
    mutationFn: removeTenantMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', tenantId] });
      toast.success('회원 제거됨');
    },
  });

  const regen = useMutation({
    mutationFn: () => regenerateInviteCode(tenantId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memberships'] });
      toast.success('초대코드 재발급');
    },
  });

  const [filter, setFilter] = useState<Role | 'all'>('all');

  if (!has('director'))
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          학원장만 접근 가능합니다.
        </CardContent>
      </Card>
    );

  if (loading || !tenant) return <Skeleton className="h-40" />;

  const all = membersQ.data ?? [];
  const filtered = filter === 'all' ? all : all.filter((m) => m.role === filter);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">회원 관리</h1>
          <p className="text-sm text-muted-foreground">학원 전체 회원과 초대코드를 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Card className="px-3 py-2 flex flex-row items-center gap-2">
            <span className="text-xs text-muted-foreground">초대코드</span>
            <code className="font-mono font-semibold tracking-wider">{tenant.invite_code ?? '—'}</code>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(tenant.invite_code ?? '');
                toast.success('복사됨');
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => regen.mutate()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </Card>
          <AddMemberDialog />
        </div>
      </header>

      <JoinRequestsSection />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Role | 'all')}>
        <TabsList>
          <TabsTrigger value="all">전체 ({all.length})</TabsTrigger>
          {ROLES.map((r) => (
            <TabsTrigger key={r} value={r}>
              {ROLE_LABEL[r]} ({all.filter((m) => m.role === r).length})
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          {membersQ.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filtered.length === 0 && (
                    <p className="p-10 text-center text-sm text-muted-foreground">회원이 없습니다.</p>
                  )}
                  {filtered.map((m) => {
                    const isStudent = m.role === 'student';
                    const body = (
                      <>
                        <p className="font-medium truncate">
                          {m.profile?.full_name ?? '—'}{' '}
                          <span className="text-xs text-muted-foreground">{m.profile?.email}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(m.joined_at).toLocaleDateString('ko-KR')} 가입
                        </p>
                      </>
                    );
                    return (
                    <div key={m.id} className="flex items-center gap-3 p-4">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{m.profile?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                      </Avatar>
                      {isStudent ? (
                        <Link href={`/students/${m.user_id}`} className="flex-1 min-w-0 hover:underline">
                          {body}
                        </Link>
                      ) : (
                        <div className="flex-1 min-w-0">{body}</div>
                      )}
                      <Badge variant="secondary">{ROLE_LABEL[m.role]}</Badge>
                      {m.role === 'parent' && tenantId && m.profile && (
                        <ParentChildrenDialog
                          tenantId={tenantId}
                          parentUserId={m.user_id}
                          parentName={m.profile.full_name ?? m.profile.email ?? '학부모'}
                          trigger={
                            <Button size="icon" variant="ghost" title="자녀 관리">
                              <Users className="h-4 w-4" />
                            </Button>
                          }
                        />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm('해당 회원을 학원에서 제거할까요?')) remove.mutate(m.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> 제거
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** 학원장 — 검색으로 들어온 가입 요청 승인/거절. */
function JoinRequestsSection() {
  const { tenantId, userId } = useCurrentTenant();
  const qc = useQueryClient();

  const reqQ = useQuery({
    queryKey: ['join-requests', tenantId],
    enabled: !!tenantId,
    queryFn: () => fetchPendingJoinRequests(tenantId!),
  });

  const approve = useMutation({
    mutationFn: (request: TenantJoinRequest) => approveJoinRequest({ request, deciderId: userId! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['join-requests', tenantId] });
      qc.invalidateQueries({ queryKey: ['members', tenantId] });
      toast.success('가입을 승인했습니다.');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const reject = useMutation({
    mutationFn: (id: string) => rejectJoinRequest(id, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['join-requests', tenantId] });
      toast.success('가입 요청을 거절했습니다.');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const requests = reqQ.data ?? [];
  if (reqQ.isLoading || requests.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" /> 가입 요청
          <Badge variant="secondary">{requests.length}</Badge>
        </CardTitle>
        <CardDescription>학원 검색으로 들어온 가입 요청입니다. 승인하면 회원으로 추가됩니다.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 divide-y">
        {requests.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{r.requester?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {r.requester?.full_name ?? '—'}{' '}
                <span className="text-xs text-muted-foreground">{r.requester?.email}</span>
              </p>
              {r.message && <p className="text-xs text-muted-foreground truncate">“{r.message}”</p>}
            </div>
            <Badge variant="outline">{ROLE_LABEL[r.requested_role]}</Badge>
            <Button
              size="sm"
              className="gap-1"
              disabled={approve.isPending}
              onClick={() => approve.mutate(r)}
            >
              <Check className="h-3.5 w-3.5" /> 승인
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={reject.isPending}
              onClick={() => reject.mutate(r.id)}
            >
              <X className="h-3.5 w-3.5" /> 거절
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AddMemberDialog() {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [role, setRole] = useState<Role>('student');
  const [busy, setBusy] = useState(false);

  const onSearch = async () => {
    const r = await searchProfiles(query);
    setResults(r);
  };

  const onAdd = async (userId: string) => {
    if (!tenantId) return;
    setBusy(true);
    try {
      await addTenantMember({ tenantId, userId, role });
      toast.success('추가됨');
      qc.invalidateQueries({ queryKey: ['members', tenantId] });
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
          <UserPlus className="h-4 w-4" /> 회원 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>회원 추가</DialogTitle>
          <DialogDescription>이메일 또는 이름으로 가입된 사용자를 찾아 학원에 추가합니다.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="이메일 또는 이름" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button onClick={onSearch} variant="secondary">
              검색
            </Button>
          </div>
          <div>
            <Label className="text-xs">역할</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 max-h-72 overflow-auto">
            {results.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-2 rounded-md border">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                </div>
                <Button size="sm" disabled={busy} onClick={() => onAdd(r.id)}>
                  추가
                </Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <p className="text-xs text-muted-foreground">또는 초대코드를 공유해서 회원이 직접 합류하게 할 수 있습니다.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
