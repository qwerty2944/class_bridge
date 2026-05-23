'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Copy, Pencil, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { useCurrentTenant } from '@/features/tenant-switch';
import { createClient } from '@/shared/api/supabase/client';
import { ROLE_LABEL } from '@/shared/types/database';

export function SettingsClient() {
  const { tenantId, tenant, roles, profile } = useCurrentTenant();
  const qc = useQueryClient();
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [busy, setBusy] = useState(false);
  // profile 이 SSR 후 늦게 들어올 수 있어 한 번만 lazy sync.
  const [hydrated, setHydrated] = useState(!!profile);
  if (profile && !hydrated) {
    setHydrated(true);
    setName(profile.full_name ?? '');
    setPhone(profile.phone ?? '');
  }

  const isDirector = roles.includes('director');
  const [editingTenantName, setEditingTenantName] = useState(false);
  const [tenantName, setTenantName] = useState(tenant?.name ?? '');
  const [tenantBusy, setTenantBusy] = useState(false);

  const save = async () => {
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() || null, phone: phone.trim() || null })
      .eq('id', profile.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ['profile', profile.id] });
    router.refresh();  // 사이드바 user 영역 등 SSR 갱신
    toast.success('저장됨');
  };

  const saveTenantName = async () => {
    if (!tenantId || !tenantName.trim()) return;
    setTenantBusy(true);
    const { error } = await supabase.from('tenants').update({ name: tenantName.trim() }).eq('id', tenantId);
    setTenantBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
    router.refresh();
    toast.success('학원 이름이 변경되었습니다');
    setEditingTenantName(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">설정</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>내 프로필</CardTitle>
            <CardDescription>이름과 연락처를 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>이메일</Label>
              <Input className="mt-1" value={profile?.email ?? ''} disabled />
            </div>
            <div>
              <Label>이름</Label>
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>전화번호</Label>
              <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button onClick={save} disabled={busy}>
              저장
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>현재 학원</CardTitle>
            <CardDescription>접속 중인 학원과 내 역할 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>학원</Label>
              {editingTenantName && isDirector ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <Input
                    autoFocus
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTenantName();
                      if (e.key === 'Escape') {
                        setEditingTenantName(false);
                        setTenantName(tenant?.name ?? '');
                      }
                    }}
                  />
                  <Button
                    size="icon-sm"
                    onClick={saveTenantName}
                    disabled={tenantBusy || !tenantName.trim()}
                    aria-label="저장"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTenantName(false);
                      setTenantName(tenant?.name ?? '');
                    }}
                    aria-label="취소"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-medium">{tenant?.name ?? '—'}</p>
                  {isDirector && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setTenantName(tenant?.name ?? '');
                        setEditingTenantName(true);
                      }}
                      title="학원 이름 수정"
                      aria-label="학원 이름 수정"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>유형</Label>
              <p className="mt-1 text-sm">{tenant?.type === 'tutor' ? '과외(1인)' : '학원'}</p>
            </div>
            <div>
              <Label>내 역할</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {roles.map((r) => (
                  <Badge key={r}>{ROLE_LABEL[r]}</Badge>
                ))}
              </div>
            </div>
            {tenant?.invite_code && (
              <div>
                <Label>초대코드</Label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="px-2 py-1 rounded bg-muted font-mono">{tenant.invite_code}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(tenant.invite_code!);
                      toast.success('복사됨');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
