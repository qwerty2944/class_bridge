'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { JoinRequestRole, TenantJoinRequest } from '@/shared/types/database';
import type { JoinRequestWithProfile, JoinRequestWithTenant } from '../model/types';

const sb = () => createClient();

// user_id / decided_by 둘 다 profiles 를 가리켜 임베드 시 제약조건명으로 구분.
const SELECT_WITH_REQUESTER = '*, requester:profiles!tenant_join_requests_user_id_fkey(*)';

export async function createJoinRequest(input: {
  tenantId: string;
  userId: string;
  requestedRole: JoinRequestRole;
  message?: string | null;
}): Promise<TenantJoinRequest> {
  const client = sb();

  // 이미 활성 멤버면 요청 불가.
  const { count: memberCount } = await client
    .from('tenant_members')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', input.tenantId)
    .eq('user_id', input.userId)
    .eq('status', 'active');
  if ((memberCount ?? 0) > 0) {
    throw new Error('이미 이 학원의 멤버입니다.');
  }

  // 대기 중인 요청이 있으면 중복 방지.
  const { count: pendingCount } = await client
    .from('tenant_join_requests')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', input.tenantId)
    .eq('user_id', input.userId)
    .eq('status', 'pending');
  if ((pendingCount ?? 0) > 0) {
    throw new Error('이미 가입 요청을 보냈습니다. 학원장 승인을 기다려주세요.');
  }

  const { data, error } = await client
    .from('tenant_join_requests')
    .insert({
      tenant_id: input.tenantId,
      user_id: input.userId,
      requested_role: input.requestedRole,
      message: input.message?.trim() || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TenantJoinRequest;
}

export async function fetchPendingJoinRequests(tenantId: string): Promise<JoinRequestWithProfile[]> {
  const { data, error } = await sb()
    .from('tenant_join_requests')
    .select(SELECT_WITH_REQUESTER)
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as JoinRequestWithProfile[];
}

export async function fetchMyJoinRequests(userId: string): Promise<JoinRequestWithTenant[]> {
  const { data, error } = await sb()
    .from('tenant_join_requests')
    .select('*, tenant:tenants(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as JoinRequestWithTenant[];
}

// 승인 — tenant_members 행 생성 + 요청 상태 갱신.
export async function approveJoinRequest(args: {
  request: TenantJoinRequest;
  deciderId: string;
}): Promise<void> {
  const client = sb();
  const { request, deciderId } = args;

  const { error: memberErr } = await client.from('tenant_members').insert({
    tenant_id: request.tenant_id,
    user_id: request.user_id,
    role: request.requested_role,
    status: 'active',
  });
  if (memberErr && !memberErr.message.includes('duplicate')) {
    throw memberErr;
  }

  const { error } = await client
    .from('tenant_join_requests')
    .update({
      status: 'approved',
      decided_by: deciderId,
      decided_at: new Date().toISOString(),
    })
    .eq('id', request.id);
  if (error) throw error;
}

export async function rejectJoinRequest(id: string, deciderId: string): Promise<void> {
  const { error } = await sb()
    .from('tenant_join_requests')
    .update({
      status: 'rejected',
      decided_by: deciderId,
      decided_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}
