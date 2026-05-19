import { cn } from '@/shared/lib/utils';

/**
 * TipTap 이 만든 HTML 읽기 전용 렌더러.
 * 입력이 에디터 스키마 산출물(또는 과거 평문)이라 스크립트 주입 위험이 없다.
 */
export function RichContent({ html, className }: { html: string | null; className?: string }) {
  if (!html || !html.trim()) {
    return <p className={cn('text-sm text-muted-foreground', className)}>—</p>;
  }
  return (
    <div
      className={cn('rich-content text-sm', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
