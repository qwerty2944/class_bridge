'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { formatHHMM } from '@/shared/lib/datetime';
import type { SessionWithOrg } from '@/entities/class-session';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toIso(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function monthGridDates(year: number, month0: number): Date[] {
  const first = new Date(year, month0, 1);
  const firstWeekday = first.getDay(); // 0=Sun
  const start = new Date(year, month0, 1 - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function ClassCalendar({
  sessions,
  onEmptyDayClick,
}: {
  sessions: SessionWithOrg[];
  onEmptyDayClick?: (dateISO: string) => void;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [cursor, setCursor] = useState<{ y: number; m0: number }>({
    y: today.getFullYear(),
    m0: today.getMonth(),
  });

  const dates = useMemo(() => monthGridDates(cursor.y, cursor.m0), [cursor.y, cursor.m0]);

  // 날짜별 세션 묶음 — DB session_date 가 'yyyy-mm-dd' 문자열.
  const byDate = useMemo(() => {
    const m = new Map<string, SessionWithOrg[]>();
    for (const s of sessions) {
      const list = m.get(s.session_date) ?? [];
      list.push(s);
      m.set(s.session_date, list);
    }
    // 시작 시간 순으로 정렬.
    for (const list of m.values()) {
      list.sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
    }
    return m;
  }, [sessions]);

  const todayIso = toIso(today);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b p-3">
        <div className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              const d = new Date(cursor.y, cursor.m0 - 1, 1);
              setCursor({ y: d.getFullYear(), m0: d.getMonth() });
            }}
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold min-w-[8ch] text-center">
            {cursor.y}년 {cursor.m0 + 1}월
          </p>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              const d = new Date(cursor.y, cursor.m0 + 1, 1);
              setCursor({ y: d.getFullYear(), m0: d.getMonth() });
            }}
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCursor({ y: today.getFullYear(), m0: today.getMonth() })}
        >
          오늘
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b bg-muted/30 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              'py-2',
              i === 0 && 'text-red-500',
              i === 6 && 'text-blue-500',
            )}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dates.map((d) => {
          const iso = toIso(d);
          const inMonth = d.getMonth() === cursor.m0;
          const isToday = iso === todayIso;
          const dayOfWeek = d.getDay();
          const list = byDate.get(iso) ?? [];
          const visible = list.slice(0, 3);
          const overflow = list.length - visible.length;
          const empty = list.length === 0;
          return (
            <div
              key={iso}
              className={cn(
                'min-h-[100px] border-b border-r p-1.5 text-xs space-y-1',
                !inMonth && 'bg-muted/10 text-muted-foreground/50',
                empty && inMonth && onEmptyDayClick && 'cursor-pointer hover:bg-accent/40',
              )}
              onClick={() => {
                if (empty && inMonth && onEmptyDayClick) onEmptyDayClick(iso);
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                    isToday && 'bg-foreground text-background font-semibold',
                    !isToday && dayOfWeek === 0 && 'text-red-500',
                    !isToday && dayOfWeek === 6 && 'text-blue-500',
                  )}
                >
                  {d.getDate()}
                </span>
              </div>
              {visible.map((s) => (
                <Link
                  key={s.id}
                  href={`/classes/${s.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="block truncate rounded px-1.5 py-0.5 text-[11px] text-white"
                  style={{ background: s.organization?.color ?? '#6366f1' }}
                  title={`${s.organization?.name ?? ''} · ${s.topic ?? '수업'}`}
                >
                  {s.start_time ? `${formatHHMM(s.start_time)} ` : ''}
                  {s.topic ?? '수업'}
                </Link>
              ))}
              {overflow > 0 && (
                <p className="px-1.5 text-[11px] text-muted-foreground">+{overflow}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
