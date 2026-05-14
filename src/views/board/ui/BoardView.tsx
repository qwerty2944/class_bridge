'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pin, Plus } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { useCurrentTenant } from '@/features/tenant-switch';
import { createPost, fetchPosts } from '@/entities/post';
import { fetchOrganizations, fetchOrganizationsForUser } from '@/entities/organization';
import { CATEGORY_LABEL, type PostCategory } from '@/shared/types/database';

export function BoardClient() {
  const { tenantId, userId, has } = useCurrentTenant();
  const [scope, setScope] = useState<'tenant' | 'org'>('tenant');
  const [orgId, setOrgId] = useState<string | null>(null);

  const orgsQ = useQuery({
    queryKey: ['orgs', tenantId, userId, has('director') ? 'all' : 'mine'],
    enabled: !!tenantId && !!userId,
    queryFn: () =>
      has('director') ? fetchOrganizations(tenantId!) : fetchOrganizationsForUser(tenantId!, userId!),
  });

  const postsQ = useQuery({
    queryKey: ['posts', tenantId, scope, orgId],
    enabled: !!tenantId && (scope === 'tenant' || !!orgId),
    queryFn: () =>
      fetchPosts({
        tenantId: tenantId!,
        organizationId: scope === 'tenant' ? null : orgId,
      }),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">게시판</h1>
          <p className="text-sm text-muted-foreground">학원 공지 · 자유 · Q&A</p>
        </div>
        <NewPostDialog />
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <Tabs value={scope} onValueChange={(v) => setScope(v as 'tenant' | 'org')}>
          <TabsList>
            <TabsTrigger value="tenant">학원 전체</TabsTrigger>
            <TabsTrigger value="org">반 한정</TabsTrigger>
          </TabsList>
        </Tabs>
        {scope === 'org' && (
          <Select value={orgId ?? ''} onValueChange={(v) => setOrgId(v || null)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="반 선택" />
            </SelectTrigger>
            <SelectContent>
              {orgsQ.data?.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {postsQ.isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {(postsQ.data ?? []).length === 0 && (
              <p className="p-10 text-center text-sm text-muted-foreground">게시글이 없습니다.</p>
            )}
            {postsQ.data?.map((p) => (
              <Link key={p.id} href={`/board/${p.id}`} className="flex items-center gap-3 p-4 hover:bg-accent transition">
                {p.pinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                <Badge variant={p.category === 'notice' ? 'default' : 'secondary'} className="shrink-0">
                  {CATEGORY_LABEL[p.category]}
                </Badge>
                <p className="flex-1 truncate font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                  {p.author?.full_name ?? '—'} · {new Date(p.created_at).toLocaleDateString('ko-KR')}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NewPostDialog() {
  const { tenantId, userId, has } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const orgsQ = useQuery({
    queryKey: ['orgs', tenantId, userId, 'for-post'],
    enabled: !!tenantId && !!userId && open,
    queryFn: () =>
      has('director') ? fetchOrganizations(tenantId!) : fetchOrganizationsForUser(tenantId!, userId!),
  });
  const [form, setForm] = useState({
    title: '',
    content_md: '',
    category: 'free' as PostCategory,
    organization_id: null as string | null,
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!tenantId || !userId || !form.title.trim()) return;
    setBusy(true);
    try {
      await createPost({
        tenant_id: tenantId,
        organization_id: form.organization_id,
        title: form.title,
        content_md: form.content_md,
        category: form.category,
        author_id: userId,
      });
      qc.invalidateQueries({ queryKey: ['posts', tenantId] });
      toast.success('게시됨');
      setOpen(false);
      setForm({ title: '', content_md: '', category: 'free', organization_id: null });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> 글 쓰기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>새 게시글</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>카테고리</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as PostCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {has('director') && <SelectItem value="notice">공지</SelectItem>}
                  <SelectItem value="free">자유</SelectItem>
                  <SelectItem value="qna">Q&A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>대상</Label>
              <Select
                value={form.organization_id ?? '__tenant'}
                onValueChange={(v) => setForm({ ...form, organization_id: v === '__tenant' ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__tenant">학원 전체</SelectItem>
                  {orgsQ.data?.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      반: {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>제목</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>내용</Label>
            <Textarea rows={5} value={form.content_md} onChange={(e) => setForm({ ...form, content_md: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy}>
            게시
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
