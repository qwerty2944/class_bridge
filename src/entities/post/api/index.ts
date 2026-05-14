'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Post, PostCategory, PostComment } from '@/shared/types/database';
import type { PostWithAuthor, CommentWithAuthor } from '../model/types';

const sb = () => createClient();

export async function fetchPosts(args: { tenantId: string; organizationId?: string | null }): Promise<PostWithAuthor[]> {
  let q = sb()
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('tenant_id', args.tenantId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (args.organizationId !== undefined) {
    if (args.organizationId === null) q = q.is('organization_id', null);
    else q = q.eq('organization_id', args.organizationId);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as PostWithAuthor[];
}

export async function fetchPost(id: string): Promise<PostWithAuthor | null> {
  const { data } = await sb()
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('id', id)
    .maybeSingle();
  return (data as PostWithAuthor) ?? null;
}

export async function createPost(input: {
  tenant_id: string;
  organization_id?: string | null;
  title: string;
  content_md?: string;
  category: PostCategory;
  author_id: string;
}) {
  const { data, error } = await sb().from('posts').insert(input).select().single();
  if (error) throw error;
  return data as Post;
}

export async function deletePost(id: string) {
  const { error } = await sb().from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function togglePinned(id: string, pinned: boolean) {
  const { error } = await sb().from('posts').update({ pinned }).eq('id', id);
  if (error) throw error;
}

export async function fetchComments(postId: string): Promise<CommentWithAuthor[]> {
  const { data, error } = await sb()
    .from('post_comments')
    .select('*, author:profiles(*)')
    .eq('post_id', postId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as CommentWithAuthor[];
}

export async function addComment(input: { post_id: string; author_id: string; content: string }) {
  const { data, error } = await sb().from('post_comments').insert(input).select().single();
  if (error) throw error;
  return data as PostComment;
}

export async function deleteComment(id: string) {
  const { error } = await sb().from('post_comments').delete().eq('id', id);
  if (error) throw error;
}
