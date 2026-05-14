'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  addParentLink,
  fetchParentLinks,
  removeParentLink,
} from '@/entities/membership';
import { searchStudentsInTenant } from '@/entities/user';
import type { Profile } from '@/shared/types/database';

interface Props {
  tenantId: string;
  parentUserId: string;
  parentName: string;
  trigger: React.ReactNode;
}

export function ParentChildrenDialog({ tenantId, parentUserId, parentName, trigger }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  const linksQ = useQuery({
    queryKey: ['parent-links', tenantId, parentUserId],
    enabled: open && !!tenantId && !!parentUserId,
    queryFn: () => fetchParentLinks(tenantId, parentUserId),
  });

  const add = useMutation({
    mutationFn: (studentUserId: string) =>
      addParentLink({ tenant_id: tenantId, parent_user_id: parentUserId, student_user_id: studentUserId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-links', tenantId, parentUserId] });
      toast.success('자녀 연결됨');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const remove = useMutation({
    mutationFn: (linkId: string) => removeParentLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-links', tenantId, parentUserId] });
      toast.success('연결 해제됨');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const onSearch = async () => {
    setSearching(true);
    try {
      const r = await searchStudentsInTenant(tenantId, query);
      const linkedIds = new Set((linksQ.data ?? []).map((l) => l.student_user_id));
      setResults(r.filter((p) => !linkedIds.has(p.id)));
    } finally {
      setSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{parentName} 의 자녀 관리</DialogTitle>
          <DialogDescription>이 학부모 계정과 학생을 연결하면 학부모가 자녀 데이터를 볼 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">현재 자녀</h4>
            {linksQ.isLoading ? (
              <Skeleton className="h-12" />
            ) : (linksQ.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-3 text-center rounded-md border bg-muted/30">
                연결된 자녀가 없습니다.
              </p>
            ) : (
              <ul className="space-y-1">
                {(linksQ.data ?? []).map((l) => (
                  <li key={l.id} className="flex items-center gap-3 rounded-md border p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{l.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{l.student?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground truncate">{l.student?.email}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('이 연결을 해제할까요?')) remove.mutate(l.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">자녀 추가</h4>
            <div className="flex gap-2">
              <Input
                placeholder="학생 이름 또는 이메일"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSearch();
                  }
                }}
              />
              <Button onClick={onSearch} variant="secondary" disabled={searching}>
                검색
              </Button>
            </div>
            <div className="mt-2 space-y-1 max-h-60 overflow-auto">
              {results.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                  </div>
                  <Button size="sm" disabled={add.isPending} onClick={() => add.mutate(r.id)} className="gap-1">
                    <UserPlus className="h-3.5 w-3.5" /> 추가
                  </Button>
                </div>
              ))}
              {!searching && query && results.length === 0 && (
                <p className="text-xs text-muted-foreground py-2 text-center">검색 결과가 없습니다.</p>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
