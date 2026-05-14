'use client';

import { useMemo } from 'react';
import { useSession } from '@/entities/user';
import { useTenantStore } from '@/shared/stores/tenant-store';
import type { Role } from '@/shared/types/database';

export function useCurrentTenant() {
  const { memberships, userId, profile, loading } = useSession();
  const currentTenantId = useTenantStore((s) => s.currentTenantId);
  const setTenant = useTenantStore((s) => s.setTenant);

  const tenantId = currentTenantId ?? memberships[0]?.tenant_id ?? null;
  const myRoles = useMemo(
    () => memberships.filter((m) => m.tenant_id === tenantId).map((m) => m.role) as Role[],
    [memberships, tenantId],
  );
  const tenant = memberships.find((m) => m.tenant_id === tenantId)?.tenant ?? null;

  const has = (role: Role) => myRoles.includes(role);

  return {
    userId,
    profile,
    tenantId,
    tenant,
    roles: myRoles,
    has,
    loading,
    setTenant,
    memberships,
  };
}
