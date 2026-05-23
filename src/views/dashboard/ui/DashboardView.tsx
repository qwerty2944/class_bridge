'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { CalendarDays, ClipboardList, GraduationCap, Users, ArrowRight, MessageSquare, TrendingUp, Copy, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useCurrentTenant } from '@/features/tenant-switch';
import { fetchTenantMembers } from '@/entities/tenant';
import { fetchOrganizations, fetchOrganizationsForUser } from '@/entities/organization';
import { fetchPosts } from '@/entities/post';
import { fetchParentLinks } from '@/entities/membership';
import { ROLE_LABEL } from '@/shared/types/database';
import { toast } from 'sonner';

export function DashboardClient() {
  const { tenantId, tenant, roles, userId, profile, has, loading } = useCurrentTenant();

  const orgsQ = useQuery({
    queryKey: ['orgs', tenantId, userId, roles.join(',')],
    enabled: !!tenantId && !!userId,
    queryFn: () =>
      has('director')
        ? fetchOrganizations(tenantId!)
        : fetchOrganizationsForUser(tenantId!, userId!),
  });

  const membersQ = useQuery({
    queryKey: ['members', tenantId],
    enabled: !!tenantId && has('director'),
    queryFn: () => fetchTenantMembers(tenantId!),
  });

  const postsQ = useQuery({
    queryKey: ['posts', tenantId, 'recent'],
    enabled: !!tenantId,
    queryFn: () => fetchPosts({ tenantId: tenantId! }),
  });

  const childrenQ = useQuery({
    queryKey: ['parent-links', tenantId, userId],
    enabled: !!tenantId && !!userId && has('parent'),
    queryFn: () => fetchParentLinks(tenantId!, userId!),
  });

  if (loading || !tenant) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name ?? '사용자';
  const orgCount = orgsQ.data?.length ?? 0;
  const memberCount = membersQ.data?.length ?? 0;
  const recentPosts = (postsQ.data ?? []).slice(0, 5);

  const copyInvite = () => {
    if (!tenant.invite_code) return;
    navigator.clipboard.writeText(tenant.invite_code);
    toast.success('초대코드 복사됨');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-muted-foreground">안녕하세요</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{displayName}님 👋</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">{tenant.name}</Badge>
            {roles.map((r) => (
              <Badge key={r}>{ROLE_LABEL[r]}</Badge>
            ))}
          </div>
        </div>
        {has('director') && tenant.invite_code && (
          <Button variant="outline" onClick={copyInvite} className="gap-2 rounded-full">
            <Copy className="h-4 w-4" /> 초대코드 <code className="font-mono ml-1">{tenant.invite_code}</code>
          </Button>
        )}
      </div>

      {has('parent') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> 내 자녀
            </CardTitle>
            <CardDescription>자녀 카드를 눌러 캐릭터·출결·과제·진도를 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            {childrenQ.isLoading ? (
              <Skeleton className="h-20" />
            ) : (childrenQ.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                아직 등록된 자녀가 없습니다. 학원장에게 자녀 연결을 요청하세요.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(childrenQ.data ?? []).map((l) => (
                  <Link
                    key={l.id}
                    href={`/students/${l.student_user_id}`}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{l.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{l.student?.full_name ?? '학생'}</p>
                      <p className="text-xs text-muted-foreground truncate">{l.student?.email}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={GraduationCap}
          label={has('director') ? '전체 반' : '내 반'}
          value={orgCount}
          href="/organizations"
        />
        {has('director') && (
          <StatCard icon={Users} label="회원 수" value={memberCount} href="/members" />
        )}
        <StatCard icon={ClipboardList} label="과제" value="관리" href="/assignments" />
        <StatCard icon={CalendarDays} label="수업" value="기록" href="/classes" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{has('director') ? '학원 전체 반' : '내 반'}</CardTitle>
              <CardDescription>최근 활동순</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href="/organizations">
                모두 보기 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {orgsQ.isLoading ? (
              <Skeleton className="h-16" />
            ) : orgsQ.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">아직 반이 없습니다.</p>
            ) : (
              orgsQ.data?.slice(0, 5).map((o) => (
                <Link
                  key={o.id}
                  href={`/organizations/${o.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 hover:bg-accent transition"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="h-9 w-9 rounded-md shrink-0" style={{ background: o.color ?? '#3b82f6' }} />
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{o.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {o.subjects.length > 0
                          ? o.subjects.map((s) => s.name).join(', ')
                          : '과목 미지정'}{' '}
                        · {o.description ?? '—'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 게시판</CardTitle>
              <CardDescription>학원 공지/소식</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/board">
                <MessageSquare className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {postsQ.isLoading ? (
              <Skeleton className="h-12" />
            ) : recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">게시글이 없습니다.</p>
            ) : (
              recentPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/board/${p.id}`}
                  className="block rounded-md hover:bg-accent transition p-2"
                >
                  <p className="text-sm font-medium truncate flex items-center gap-2">
                    {p.pinned && <Badge variant="outline" className="text-[10px]">고정</Badge>}
                    {p.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.author?.full_name ?? '—'} · {new Date(p.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {has('director') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" /> 학원장 빠른 작업
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-3">
            <QuickLink href="/members" label="회원 관리" icon={Users} />
            <QuickLink href="/organizations" label="반 만들기" icon={GraduationCap} />
            <QuickLink href="/subjects" label="과목 관리" icon={ClipboardList} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href }: { icon: typeof Users; label: string; value: number | string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Users }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border bg-background p-4 hover:bg-accent transition"
    >
      <span className="flex items-center gap-3">
        <span className="h-9 w-9 grid place-items-center rounded-md bg-foreground/5">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-medium">{label}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
