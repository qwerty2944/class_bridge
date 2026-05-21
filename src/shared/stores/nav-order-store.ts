'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 사이드바 NAV 항목 순서를 사용자별 로컬에 저장.
 *
 * 저장 단위는 NAV 항목의 `href` 문자열 배열. 새 NAV 항목이 코드에 추가되면 저장된
 * 순서에 없으므로 sortByStoredOrder 가 끝에 붙여 노출한다. 역할(role) 필터로 일부
 * 항목이 빠져도 안전.
 */
interface NavOrderState {
  order: string[];
  setOrder: (hrefs: string[]) => void;
  reset: () => void;
}

export const useNavOrderStore = create<NavOrderState>()(
  persist(
    (set) => ({
      order: [],
      setOrder: (order) => set({ order }),
      reset: () => set({ order: [] }),
    }),
    { name: 'class-bridge.nav-order' },
  ),
);

// 저장된 순서대로 정렬하고, 저장 안 된 새 항목은 원래 순서대로 끝에 붙인다.
export function sortByStoredOrder<T extends { href: string }>(items: T[], stored: string[]): T[] {
  if (!stored.length) return items;
  const byHref = new Map(items.map((it) => [it.href, it]));
  const ordered: T[] = [];
  for (const href of stored) {
    const it = byHref.get(href);
    if (it) {
      ordered.push(it);
      byHref.delete(href);
    }
  }
  for (const it of items) {
    if (byHref.has(it.href)) ordered.push(it);
  }
  return ordered;
}
