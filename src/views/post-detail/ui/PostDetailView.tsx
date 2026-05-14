'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Pin, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { Textarea } from '@/shared/ui/textarea';
import { useRouter } from 'next/navigation';
import {
  addComment,
  deleteComment,
  deletePost,
  fetchComments,
  fetchPost,
  togglePinned,
} from '@/entities/post';
import { useCurrentTenant } from '@/features/tenant-switch';
import { CATEGORY_LABEL } from '@/shared/types/database';

export function PostDetailClient({ postId }: { postId: string }) {
  const router = useRouter();
  const { userId, has } = useCurrentTenant();
  const qc = useQueryClient();
  const pQ = useQuery({ queryKey: ['post', postId], queryFn: () => fetchPost(postId) });
  const cQ = useQuery({ queryKey: ['post-comments', postId], queryFn: () => fetchComments(postId) });
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  const pin = useMutation({
    mutationFn: (next: boolean) => togglePinned(postId, next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('고정 토글됨');
    },
  });
  const remove = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      toast.success('삭제됨');
      router.replace('/board');
    },
  });
  const delComment = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['post-comments', postId] }),
  });

  if (pQ.isLoading || !pQ.data) return <Skeleton className="h-40" />;
  const p = pQ.data;
  const isAuthor = userId === p.author_id;
  const canManage = isAuthor || has('director');

  const submit = async () => {
    if (!content.trim() || !userId) return;
    setBusy(true);
    try {
      await addComment({ post_id: postId, author_id: userId, content });
      setContent('');
      qc.invalidateQueries({ queryKey: ['post-comments', postId] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/board">
          <ArrowLeft className="h-4 w-4" /> 게시판
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {p.pinned && <Pin className="h-4 w-4 text-amber-500" />}
            <Badge variant={p.category === 'notice' ? 'default' : 'secondary'}>{CATEGORY_LABEL[p.category]}</Badge>
            <CardTitle className="ml-1">{p.title}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {p.author?.full_name ?? '—'} · {new Date(p.created_at).toLocaleString('ko-KR')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{p.content_md ?? ''}</p>
          {canManage && (
            <div className="flex gap-2 pt-2 border-t">
              {has('director') && (
                <Button size="sm" variant="outline" onClick={() => pin.mutate(!p.pinned)}>
                  <Pin className="h-4 w-4" /> {p.pinned ? '고정 해제' : '고정'}
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm('삭제할까요?')) remove.mutate();
                }}
              >
                <Trash2 className="h-4 w-4" /> 삭제
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>댓글</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {cQ.isLoading ? (
              <Skeleton className="h-12" />
            ) : cQ.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">첫 댓글을 남겨보세요.</p>
            ) : (
              cQ.data?.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{c.author?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{c.author?.full_name ?? '—'}</span>{' '}
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString('ko-KR')}</span>
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                  {(c.author_id === userId || has('director')) && (
                    <Button size="icon" variant="ghost" onClick={() => delComment.mutate(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="space-y-2 pt-3 border-t">
            <Textarea
              rows={2}
              placeholder="댓글을 남겨보세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={submit} disabled={busy || !content.trim()} size="sm">
              댓글 달기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
