'use client';

import type { Subject } from '@/shared/types/database';
import { cn } from '@/shared/lib/utils';

/** 칩 그리드 multi-select. 클릭으로 추가/해제. 색상은 subject.color 살짝 강조. */
export function SubjectPicker({
  subjects,
  value,
  onChange,
  className,
}: {
  subjects: Subject[];
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
}) {
  if (subjects.length === 0) {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>
        등록된 과목이 없습니다. /subjects 에서 먼저 추가하세요.
      </p>
    );
  }

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {subjects.map((s) => {
        const active = value.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition',
              active ? 'bg-foreground text-background border-foreground' : 'bg-background hover:bg-accent',
            )}
            style={
              active
                ? { background: s.color ?? undefined, borderColor: s.color ?? undefined, color: 'white' }
                : undefined
            }
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: active ? 'white' : (s.color ?? '#888') }}
            />
            {s.name}
          </button>
        );
      })}
    </div>
  );
}
