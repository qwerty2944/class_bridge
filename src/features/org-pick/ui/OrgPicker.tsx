'use client';

import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useCurrentTenant } from '@/features/tenant-switch';
import { fetchOrganizations, fetchOrganizationsForUser } from '@/entities/organization';

export function OrgPicker({
  value,
  onChange,
  placeholder = '반 선택',
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
}) {
  const { tenantId, userId, has } = useCurrentTenant();
  const orgsQ = useQuery({
    queryKey: ['orgs', tenantId, userId, has('director') ? 'all' : 'mine'],
    enabled: !!tenantId && !!userId,
    queryFn: () =>
      has('director') ? fetchOrganizations(tenantId!) : fetchOrganizationsForUser(tenantId!, userId!),
  });

  return (
    <Select value={value ?? ''} onValueChange={(v) => onChange(v || null)}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {orgsQ.data?.length === 0 && (
          <div className="p-3 text-xs text-muted-foreground">반이 없습니다.</div>
        )}
        {orgsQ.data?.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
