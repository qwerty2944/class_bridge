'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, GraduationCap, Sparkles, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { createClient } from '@/shared/api/supabase/client';
import { useTenantStore } from '@/shared/stores/tenant-store';
import type { Role, TenantType } from '@/shared/types/database';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || `t-${Math.random().toString(36).slice(2, 8)}`;
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

  // 초대코드로 참여
  const [code, setCode] = useState('');
  const [joinRole, setJoinRole] = useState<Role>('student');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return toast.error('초대코드를 입력해주세요.');
    setJoining(true);
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('invite_code', code.trim().toUpperCase())
      .maybeSingle();
    if (error || !tenant) {
      setJoining(false);
      toast.error('유효하지 않은 초대코드입니다.');
      return;
    }
    const { error: mErr } = await supabase
      .from('tenant_members')
      .insert({ tenant_id: tenant.id, user_id: userId, role: joinRole });
    setJoining(false);
    if (mErr && !mErr.message.includes('duplicate')) {
      toast.error(mErr.message);
      return;
    }
    toast.success(`${tenant.name}에 합류했습니다.`);
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
        <CardDescription>학원을 새로 만들거나, 초대코드로 합류하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="create" className="gap-2">
              <GraduationCap className="h-4 w-4" /> 만들기
            </TabsTrigger>
            <TabsTrigger value="join" className="gap-2">
              <UserPlus className="h-4 w-4" /> 합류
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="tname">학원 이름</Label>
              <Input id="tname" placeholder="예: 클래스브릿지 학원" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>유형</Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as TenantType)} className="grid grid-cols-2 gap-2">
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

          <TabsContent value="join" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">초대코드</Label>
              <Input id="code" placeholder="ABCD1234" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1.5">
              <Label>합류할 역할</Label>
              <Select value={joinRole} onValueChange={(v) => setJoinRole(v as Role)}>
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
            <Button className="w-full" onClick={handleJoin} disabled={joining}>
              {joining && <Loader2 className="h-4 w-4 animate-spin" />} 합류하기
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
