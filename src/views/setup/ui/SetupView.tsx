'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import { Loader2, GraduationCap, Sparkles, UserPlus, Search, Clock, Ticket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { createClient } from '@/shared/api/supabase/client';
import { useTenantStore } from '@/shared/stores/tenant-store';
import { searchTenants } from '@/entities/tenant';
import {
  createJoinRequest,
  fetchMyJoinRequests,
  type JoinRequestRole,
  type JoinRequestWithTenant,
  type TenantJoinRequest,
} from '@/entities/join-request';
import { ROLE_LABEL } from '@/shared/config/labels';
import type { Role, Tenant, TenantType } from '@/shared/types/database';

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || `t-${Math.random().toString(36).slice(2, 8)}`
  );
}

export function SetupClient({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const setTenant = useTenantStore((s) => s.setTenant);

  // 학원 만들기
  const [name, setName] = useState('');
  const [type, setType] = useState<TenantType>('academy');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('학원 이름을 입력해주세요.');
    setCreating(true);
    const slug = slugify(name);
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({ name, slug, type })
      .select()
      .single();
    if (error || !tenant) {
      setCreating(false);
      toast.error(error?.message ?? '생성 실패');
      return;
    }
    const rows = [{ tenant_id: tenant.id, user_id: userId, role: 'director' as Role }];
    if (type === 'tutor') rows.push({ tenant_id: tenant.id, user_id: userId, role: 'teacher' as Role });
    const { error: mErr } = await supabase.from('tenant_members').insert(rows);
    setCreating(false);
    if (mErr) return toast.error(mErr.message);
    toast.success(`${tenant.name} 생성 완료`);
    setTenant(tenant.id);
    router.replace('/dashboard');
    router.refresh();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" /> 학원 설정
        </CardTitle>
        <CardDescription>학원을 새로 만들거나, 기존 학원에 합류하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="create" className="gap-2">
              <GraduationCap className="h-4 w-4" /> 만들기
            </TabsTrigger>
            <Tooltip>
              <TooltipTrigger
                render={
                  <TabsTrigger value="join" className="gap-2">
                    <UserPlus className="h-4 w-4" /> 합류
                  </TabsTrigger>
                }
              />
              <TooltipContent>이미 운영 중인 학원에 들어갑니다 — 초대코드 또는 학원 검색</TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="create" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="tname">학원 이름</Label>
              <Input
                id="tname"
                placeholder="예: 클래스브릿지 학원"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>유형</Label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as TenantType)}
                className="grid grid-cols-2 gap-2"
              >
                <label
                  htmlFor="t-academy"
                  className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer data-[checked=true]:border-foreground"
                  data-checked={type === 'academy'}
                >
                  <RadioGroupItem id="t-academy" value="academy" />
                  <div>
                    <p className="text-sm font-medium">학원</p>
                    <p className="text-xs text-muted-foreground">여러 선생님·반</p>
                  </div>
                </label>
                <label
                  htmlFor="t-tutor"
                  className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer data-[checked=true]:border-foreground"
                  data-checked={type === 'tutor'}
                >
                  <RadioGroupItem id="t-tutor" value="tutor" />
                  <div>
                    <p className="text-sm font-medium">과외(1인)</p>
                    <p className="text-xs text-muted-foreground">학원장=선생님</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin" />} 학원 만들기
            </Button>
          </TabsContent>

          <TabsContent value="join" className="pt-4">
            <JoinTab userId={userId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/** 합류 탭 — 대기 중인 가입 요청이 있으면 그 상태를, 없으면 합류 폼을 보여준다. */
function JoinTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const myReqQ = useQuery({
    queryKey: ['my-join-requests', userId],
    queryFn: () => fetchMyJoinRequests(userId),
  });

  if (myReqQ.isLoading) return <Skeleton className="h-48" />;

  const pending = (myReqQ.data ?? []).find((r) => r.status === 'pending');
  const refresh = () => qc.invalidateQueries({ queryKey: ['my-join-requests', userId] });

  if (pending) return <PendingRequestPanel request={pending} onResolved={refresh} />;
  return <JoinForms userId={userId} onRequested={refresh} />;
}

/** 승인 대기 중 — 본인 요청의 상태 변화를 Realtime 으로 구독한다. */
function PendingRequestPanel({
  request,
  onResolved,
}: {
  request: JoinRequestWithTenant;
  onResolved: () => void;
}) {
  const router = useRouter();
  const setTenant = useTenantStore((s) => s.setTenant);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`join-request-${request.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tenant_join_requests',
          filter: `id=eq.${request.id}`,
        },
        (payload: RealtimePostgresUpdatePayload<TenantJoinRequest>) => {
          const next = payload.new;
          if (next.status === 'approved') {
            toast.success(`${request.tenant?.name ?? '학원'} 가입이 승인되었습니다.`);
            setTenant(request.tenant_id);
            router.replace('/dashboard');
            router.refresh();
          } else if (next.status === 'rejected') {
            toast.error('가입 요청이 거절되었습니다.');
            onResolved();
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [request.id, request.tenant_id, request.tenant?.name, router, setTenant, onResolved]);

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <Clock className="h-6 w-6" />
      </div>
      <div>
        <p className="font-medium">{request.tenant?.name ?? '학원'} 가입 요청을 보냈습니다.</p>
        <p className="text-sm text-muted-foreground mt-1">
          학원장이 승인하면 자동으로 입장합니다. ({ROLE_LABEL[request.requested_role]}로 요청)
        </p>
      </div>
      <Button variant="outline" className="w-full" onClick={onResolved}>
        새로고침
      </Button>
    </div>
  );
}

/** 초대코드(즉시 합류) / 학원 검색(요청 후 승인) 두 가지 합류 폼. */
function JoinForms({ userId, onRequested }: { userId: string; onRequested: () => void }) {
  const router = useRouter();
  const setTenant = useTenantStore((s) => s.setTenant);
  const [role, setRole] = useState<JoinRequestRole>('student');

  // 초대코드
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleCodeJoin = async () => {
    if (!code.trim()) return toast.error('초대코드를 입력해주세요.');
    setJoining(true);
    const supabase = createClient();
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('invite_code', code.trim().toUpperCase())
      .maybeSingle();
    if (error || !tenant) {
      setJoining(false);
      return toast.error('유효하지 않은 초대코드입니다.');
    }
    const { error: mErr } = await supabase
      .from('tenant_members')
      .insert({ tenant_id: tenant.id, user_id: userId, role });
    setJoining(false);
    if (mErr && !mErr.message.includes('duplicate')) return toast.error(mErr.message);
    toast.success(`${tenant.name}에 합류했습니다.`);
    setTenant(tenant.id);
    router.replace('/dashboard');
    router.refresh();
  };

  // 검색
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tenant[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<Tenant | null>(null);
  const [message, setMessage] = useState('');
  const [requesting, setRequesting] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      setResults(await searchTenants(query));
      setPicked(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const handleRequest = async () => {
    if (!picked) return;
    setRequesting(true);
    try {
      await createJoinRequest({
        tenantId: picked.id,
        userId,
        requestedRole: role,
        message,
      });
      toast.success('가입 요청을 보냈습니다. 학원장 승인을 기다려주세요.');
      onRequested();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Tabs defaultValue="search" className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="search" className="gap-1.5">
          <Search className="h-3.5 w-3.5" /> 학원 검색
        </TabsTrigger>
        <TabsTrigger value="code" className="gap-1.5">
          <Ticket className="h-3.5 w-3.5" /> 초대코드
        </TabsTrigger>
      </TabsList>

      <div className="space-y-1.5">
        <Label>합류할 역할</Label>
        <Select value={role} onValueChange={(v) => setRole(v as JoinRequestRole)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">선생님</SelectItem>
            <SelectItem value="student">학생</SelectItem>
            <SelectItem value="parent">학부모</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="search" className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="학원 이름으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button variant="secondary" onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : '검색'}
          </Button>
        </div>

        <div className="space-y-1 max-h-52 overflow-auto">
          {results.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPicked(t)}
              className={`w-full flex items-center justify-between gap-2 rounded-md border p-2.5 text-left transition hover:bg-accent ${
                picked?.id === t.id ? 'border-foreground bg-accent' : ''
              }`}
            >
              <span className="text-sm font-medium truncate">{t.name}</span>
              <Badge variant="secondary" className="shrink-0">
                {t.type === 'tutor' ? '과외' : '학원'}
              </Badge>
            </button>
          ))}
          {!searching && query && results.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">검색 결과가 없습니다.</p>
          )}
        </div>

        {picked && (
          <div className="space-y-1.5">
            <Label>가입 메시지 (선택)</Label>
            <Textarea
              rows={2}
              placeholder="학원장에게 전할 말 (예: 1학년 김민수입니다)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        )}

        <Button className="w-full" onClick={handleRequest} disabled={!picked || requesting}>
          {requesting && <Loader2 className="h-4 w-4 animate-spin" />}
          {picked ? `${picked.name}에 가입 요청` : '학원을 선택하세요'}
        </Button>
      </TabsContent>

      <TabsContent value="code" className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="code">초대코드</Label>
          <Input
            id="code"
            placeholder="ABCD1234"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <p className="text-xs text-muted-foreground">초대코드로 합류하면 승인 없이 바로 입장합니다.</p>
        </div>
        <Button className="w-full" onClick={handleCodeJoin} disabled={joining}>
          {joining && <Loader2 className="h-4 w-4 animate-spin" />} 합류하기
        </Button>
      </TabsContent>
    </Tabs>
  );
}
