'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TenantState {
  currentTenantId: string | null;
  currentOrgId: string | null;
  setTenant: (id: string | null) => void;
  setOrg: (id: string | null) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentTenantId: null,
      currentOrgId: null,
      setTenant: (id) => set({ currentTenantId: id, currentOrgId: null }),
      setOrg: (id) => set({ currentOrgId: id }),
    }),
    { name: 'class-bridge.tenant' },
  ),
);
