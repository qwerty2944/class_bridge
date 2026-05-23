'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Gantt from 'frappe-gantt';
// CSS 는 app/globals.css 에서 @import. Turbopack 이 패키지 subpath 를 못 풀어서.
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import type { AssignmentWithRefs } from '@/entities/assignment';

type ViewMode = 'Day' | 'Week' | 'Month';

function toIso(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/**
 * 과제 간트차트 — frappe-gantt 래핑.
 * - 막대 시작: assignment.created_at (날짜만)
 * - 막대 끝: assignment.due_at, 없으면 created_at + 7일
 * - 진도(progress): submissions 중 status='graded' 비율 × 100
 * - 색상: assignment.organization.color (CSS var 로 막대 채움)
 * - 클릭 시 /assignments/[id] 로 이동
 */
export function AssignmentsGantt({ assignments }: { assignments: AssignmentWithRefs[] }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<Gantt | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('Week');

  const tasks = useMemo(() => {
    return assignments.map((a) => {
      const startIso = toIso(new Date(a.created_at));
      const endIso = a.due_at ? toIso(new Date(a.due_at)) : addDays(startIso, 7);
      // start > end 방지
      const safeEnd = endIso >= startIso ? endIso : startIso;
      const submissions = (a as unknown as { submissions?: { status?: string }[] }).submissions ?? [];
      const total = submissions.length;
      const graded = submissions.filter((s) => s.status === 'graded').length;
      const progress = total > 0 ? Math.round((graded / total) * 100) : 0;
      const orgName = a.organization?.name ?? '';
      return {
        id: a.id,
        name: orgName ? `${orgName} · ${a.title}` : a.title,
        start: startIso,
        end: safeEnd,
        progress,
        custom_class: `gantt-org-${a.organization_id}`,
      };
    });
  }, [assignments]);

  // 막대 색 — CSS 변수 + dynamic stylesheet 로 org 별 채움. Tailwind 로는 동적 클래스가 안 잡혀서 inline <style> 주입.
  const styleCss = useMemo(() => {
    const seen = new Set<string>();
    const rules: string[] = [];
    for (const a of assignments) {
      if (!a.organization || seen.has(a.organization_id)) continue;
      seen.add(a.organization_id);
      const color = a.organization.color ?? '#6366f1';
      const cls = `gantt-org-${a.organization_id}`;
      rules.push(
        `.${cls} .bar { fill: ${color} !important; }`,
        `.${cls} .bar-progress { fill: ${color} !important; filter: brightness(0.7); }`,
      );
    }
    return rules.join('\n');
  }, [assignments]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (tasks.length === 0) {
      // 막대 없을 때 frappe-gantt 가 throw 하므로 회피.
      containerRef.current.innerHTML = '';
      ganttRef.current = null;
      return;
    }
    // 매번 새로 생성 (refresh API 가 안정적이지 않음).
    containerRef.current.innerHTML = '';
    ganttRef.current = new Gantt(containerRef.current, tasks, {
      view_mode: viewMode,
      language: 'ko',
      bar_height: 24,
      padding: 18,
      // popup 비활성화하고 외부 클릭으로 라우팅.
      popup_trigger: 'mouseover',
      on_click: (task: { id: string }) => router.push(`/assignments/${task.id}`),
    });
  }, [tasks, viewMode, router]);

  return (
    <div className="space-y-3">
      <style dangerouslySetInnerHTML={{ __html: styleCss }} />
      <div className="inline-flex overflow-hidden rounded-md border bg-background text-sm">
        {(['Day', 'Week', 'Month'] as ViewMode[]).map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => setViewMode(v)}
            className={cn(
              'px-3 py-1.5 transition',
              i > 0 && 'border-l',
              viewMode === v ? 'bg-foreground text-background' : 'hover:bg-accent',
            )}
          >
            {v === 'Day' ? '일' : v === 'Week' ? '주' : '월'}
          </button>
        ))}
      </div>
      <div className="rounded-xl border bg-card overflow-x-auto">
        {tasks.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            표시할 과제가 없습니다.
          </p>
        ) : (
          <div ref={containerRef} className="min-w-full" />
        )}
      </div>
    </div>
  );
}
