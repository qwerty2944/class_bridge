'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Profile } from '@/shared/types/database';

const sb = () => createClient();

// tenant 안에서 role='student' 인 회원을 이름/이메일로 검색.
// 학부모 자녀 매칭 다이얼로그 등에서 사용.
export async function searchStudentsInTenant(tenantId: string, query: string): Promise<Profile[]> {
  if (!tenantId) return [];
  const trimmed = query.trim();
  const sbc = sb();
  let req = sbc
    .from('tenant_members')
    .select('user_id, profile:profiles(*)')
    .eq('tenant_id', tenantId)
    .eq('role', 'student')
    .eq('status', 'active')
    .limit(20);

  const { data, error } = await req;
  if (error) throw error;
  const rows = (data ?? []) as { profile: Profile | null }[];
  const profiles = rows.map((r) => r.profile).filter((p): p is Profile => !!p);
  if (!trimmed) return profiles.slice(0, 10);
  const q = trimmed.toLowerCase();
  return profiles
    .filter((p) => (p.full_name ?? '').toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q))
    .slice(0, 10);
}
