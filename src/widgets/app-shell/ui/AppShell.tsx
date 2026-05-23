'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardList,
  BookCheck,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  GripVertical,
  Pencil,
  Check,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Separator } from '@/shared/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useTenantStore } from '@/shared/stores/tenant-store';
import { useNavOrderStore, sortByStoredOrder } from '@/shared/stores/nav-order-store';
import { createClient } from '@/shared/api/supabase/client';
import { AssignmentToastListener } from '@/features/assignment-realtime';
import { JoinRequestToastListener } from '@/features/join-request-realtime';
import { FloatingUnityHost } from '@/shared/unity/floating-host';
import { useUnityStore } from '@/shared/stores/unity-store';
import type { SessionContext } from '@/shared/auth/server';
import type { Role } from '@/shared/types/database';
import { ROLE_LABEL } from '@/shared/types/database';
import { cn } from '@/shared/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard, roles: ['director', 'teacher', 'student', 'parent'] },
  { href: '/classes', label: '수업', icon: CalendarDays, roles: ['director', 'teacher', 'student', 'parent'] },
  { href: '/assignments', label: '과제', icon: ClipboardList, roles: ['director', 'teacher', 'student', 'parent'] },
  { href: '/quizzes', label: '퀴즈', icon: BookCheck, roles: ['director', 'teacher', 'student', 'parent'] },
  { href: '/progress', label: '진도', icon: TrendingUp, roles: ['director', 'teacher', 'student', 'parent'] },
  { href: '/board', label: '게시판', icon: MessageSquare, roles: ['director', 'teacher', 'student', 'parent'] },
  { href: '/character', label: '캐릭터', icon: Sparkles, roles: ['student', 'parent', 'teacher', 'director'] },
  { href: '/shop', label: '캐릭터 상점', icon: ShoppingBag, roles: ['student', 'director'] },
  { href: '/organizations', label: '반·조직', icon: GraduationCap, roles: ['director', 'teacher'] },
  { href: '/subjects', label: '과목', icon: BookOpen, roles: ['director', 'teacher'] },
  { href: '/members', label: '회원', icon: Users, roles: ['director'] },
  { href: '/settings', label: '설정', icon: Settings, roles: ['director', 'teacher', 'student', 'parent'] },
];

function initial(name?: string | null) {
  if (!name) return '?';
  return name.slice(0, 1).toUpperCase();
}

export function AppShell({ ctx, children }: { ctx: SessionContext; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { currentTenantId, setTenant } = useTenantStore();
  const unityRequested = useUnityStore((s) => s.requested);

  // 첫 진입 시 자동 선택
  useEffect(() => {
    if (!currentTenantId && ctx.memberships.length > 0) {
      setTenant(ctx.memberships[0].tenant_id);
    } else if (currentTenantId && !ctx.memberships.find((m) => m.tenant_id === currentTenantId)) {
      setTenant(ctx.memberships[0]?.tenant_id ?? null);
    }
  }, [currentTenantId, ctx.memberships, setTenant]);

  const activeTenant = useMemo(
    () => ctx.memberships.find((m) => m.tenant_id === currentTenantId) ?? ctx.memberships[0],
    [ctx.memberships, currentTenantId],
  );
  const myRoles = useMemo(
    () =>
      ctx.memberships
        .filter((m) => m.tenant_id === activeTenant?.tenant_id)
        .map((m) => m.role) as Role[],
    [ctx.memberships, activeTenant],
  );

  const itemsBase = useMemo(() => NAV.filter((n) => n.roles.some((r) => myRoles.includes(r))), [myRoles]);
  const storedOrder = useNavOrderStore((s) => s.order);
  const setOrder = useNavOrderStore((s) => s.setOrder);
  const items = useMemo(() => sortByStoredOrder(itemsBase, storedOrder), [itemsBase, storedOrder]);

  // 사이드바 편집 모드 — 드래그로 순서 변경 가능. 토글은 localStorage 에 영구.
  const [editMode, setEditMode] = useState(false);
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const reorder = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setOrder(next.map((it) => it.href));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  if (!activeTenant) return null;
  const displayName = ctx.profile?.full_name || ctx.profile?.email || '사용자';

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card">
        {/* Tenant switcher */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 rounded-lg border bg-background p-3 hover:bg-accent transition">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}
                >
                  {initial(activeTenant.tenant.name)}
                </span>
                <span className="flex-1 text-left overflow-hidden">
                  <span className="block truncate text-sm font-semibold">{activeTenant.tenant.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {activeTenant.tenant.type === 'tutor' ? '과외' : '학원'} · {ROLE_LABEL[activeTenant.role]}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="start">
              <DropdownMenuLabel>학원 전환</DropdownMenuLabel>
              {ctx.memberships
                .filter((m, i, arr) => arr.findIndex((x) => x.tenant_id === m.tenant_id) === i)
                .map((m) => (
                  <DropdownMenuItem
                    key={m.tenant_id}
                    onClick={() => setTenant(m.tenant_id)}
                    className={cn('flex justify-between', m.tenant_id === currentTenantId && 'bg-accent')}
                  >
                    <span className="truncate">{m.tenant.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {ROLE_LABEL[m.role]}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuItem asChild>
                      <Link href="/setup">+ 학원 추가 / 합류</Link>
                    </DropdownMenuItem>
                  }
                />
                <TooltipContent side="right">
                  &lsquo;합류&rsquo;는 이미 운영 중인 다른 학원에 들어가는 것을 말해요.
                </TooltipContent>
              </Tooltip>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
        <nav className="flex-1 p-2 space-y-1">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              메뉴
            </span>
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] transition',
                editMode
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-accent',
              )}
            >
              {editMode ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
              {editMode ? '완료' : '편집'}
            </button>
          </div>
          {items.map((it, idx) => {
            const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
            const isOver = dragOverIdx === idx;
            if (editMode) {
              return (
                <div
                  key={it.href}
                  draggable
                  onDragStart={(e) => {
                    dragIdx.current = idx;
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverIdx !== idx) setDragOverIdx(idx);
                  }}
                  onDragLeave={() => {
                    if (dragOverIdx === idx) setDragOverIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = dragIdx.current;
                    dragIdx.current = null;
                    setDragOverIdx(null);
                    if (from !== null) reorder(from, idx);
                  }}
                  onDragEnd={() => {
                    dragIdx.current = null;
                    setDragOverIdx(null);
                  }}
                  className={cn(
                    'flex cursor-grab items-center gap-2 rounded-md border border-dashed border-foreground/15 bg-card px-2 py-2 text-sm font-medium transition active:cursor-grabbing',
                    isOver && 'border-foreground/40 bg-accent',
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <it.icon className="h-4 w-4" /> {it.label}
                </div>
              );
            }
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-foreground text-background'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                )}
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <Separator />
        {/* User */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 rounded-lg hover:bg-accent p-2 transition">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initial(displayName)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left overflow-hidden">
                  <span className="block text-sm font-medium truncate">{displayName}</span>
                  <span className="block text-xs text-muted-foreground truncate">{ctx.profile?.email}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/settings">설정</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4" /> 로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 md:py-10">{children}</div>
      </main>

      <AssignmentToastListener />
      <JoinRequestToastListener />
      {unityRequested && <FloatingUnityHost />}
    </div>
  );
}
