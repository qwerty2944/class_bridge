'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Coins, Lock, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { useCurrentTenant } from '@/features/tenant-switch';
import { createShopItem, deleteShopItem, fetchShopItems, purchase } from '@/entities/shop-item';
import { ensureCharacter, fetchCharacter, fetchInventory } from '@/entities/character';
import { CATEGORY_LABEL_KO, type ShopCategory } from '@/shared/unity/types';

export function ShopClient() {
  const { tenantId, userId, profile, has } = useCurrentTenant();
  const itemsQ = useQuery({
    queryKey: ['shop', tenantId],
    enabled: !!tenantId,
    queryFn: () => fetchShopItems(tenantId!),
  });
  const charQ = useQuery({
    queryKey: ['character', tenantId, userId],
    enabled: !!tenantId && !!userId && has('student'),
    queryFn: () => ensureCharacter({ tenantId: tenantId!, userId: userId!, fullName: profile?.full_name }),
  });
  const ownedQ = useQuery({
    queryKey: ['inventory-ids', charQ.data?.id],
    enabled: !!charQ.data?.id,
    queryFn: async () => {
      const rows = await fetchInventory(charQ.data!.id);
      return new Set(rows.map((r) => r.shop_item_id));
    },
  });

  const isDirector = has('director');

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-pink-500" /> 캐릭터 상점
          </h1>
          <p className="text-sm text-muted-foreground">
            {isDirector ? '학원 상점 카탈로그를 관리합니다.' : '코인으로 아이템을 구매해 캐릭터에 장착하세요.'}
          </p>
        </div>
        {charQ.data && (
          <Badge variant="outline" className="text-base px-3 py-1 gap-1">
            <Coins className="h-4 w-4 text-amber-500" /> {charQ.data.coins.toLocaleString()}
          </Badge>
        )}
        {isDirector && <NewShopItemDialog />}
      </header>

      {itemsQ.isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {itemsQ.data?.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-10">상점 아이템이 없습니다.</p>
          )}
          {itemsQ.data?.map((item) => {
            const owned = ownedQ.data?.has(item.id) ?? false;
            const locked = (charQ.data?.level ?? 1) < item.min_level;
            const canAfford = (charQ.data?.coins ?? 0) >= item.price;
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-indigo-100 to-pink-100 dark:from-indigo-950/40 dark:to-pink-950/40 grid place-items-center text-2xl font-bold">
                    {CATEGORY_LABEL_KO[item.category as ShopCategory]?.slice(0, 1) ?? '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {CATEGORY_LABEL_KO[item.category as ShopCategory]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description ?? '—'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Coins className="h-4 w-4 text-amber-500" /> {item.price}
                    </span>
                    {item.min_level > 1 && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" /> Lv.{item.min_level}
                      </span>
                    )}
                  </div>
                  {isDirector ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={async () => {
                        if (!confirm('삭제할까요?')) return;
                        await deleteShopItem(item.id);
                        toast.success('삭제됨');
                        itemsQ.refetch();
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> 삭제
                    </Button>
                  ) : has('student') ? (
                    <PurchaseButton
                      itemId={item.id}
                      price={item.price}
                      coins={charQ.data?.coins ?? 0}
                      characterId={charQ.data?.id}
                      owned={owned}
                      locked={locked}
                      canAfford={canAfford}
                    />
                  ) : (
                    <Button size="sm" className="w-full" variant="outline" disabled>
                      학생만 구매 가능
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PurchaseButton({
  itemId,
  price,
  coins,
  characterId,
  owned,
  locked,
  canAfford,
}: {
  itemId: string;
  price: number;
  coins: number;
  characterId: string | undefined;
  owned: boolean;
  locked: boolean;
  canAfford: boolean;
}) {
  const qc = useQueryClient();
  const buy = useMutation({
    mutationFn: () => purchase({ characterId: characterId!, itemId, price, coins }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['character'] });
      qc.invalidateQueries({ queryKey: ['inventory', characterId] });
      qc.invalidateQueries({ queryKey: ['inventory-ids', characterId] });
      toast.success(`구매 완료! −${price.toLocaleString()} 코인`);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (owned)
    return (
      <Button size="sm" variant="secondary" className="w-full" disabled>
        보유 중
      </Button>
    );
  if (locked)
    return (
      <Button size="sm" variant="outline" className="w-full" disabled>
        레벨 부족
      </Button>
    );
  return (
    <Button size="sm" className="w-full" disabled={!canAfford || buy.isPending} onClick={() => buy.mutate()}>
      {canAfford ? '구매' : '코인 부족'}
    </Button>
  );
}

const CATEGORIES: ShopCategory[] = ['hair', 'cloth', 'armor', 'pant', 'helmet', 'back', 'weapon', 'accessory'];

function NewShopItemDialog() {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'cloth' as ShopCategory,
    asset_index: '1',
    price: 100,
    min_level: 1,
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!tenantId || !form.name.trim()) return;
    setBusy(true);
    try {
      await createShopItem({
        tenant_id: tenantId,
        name: form.name,
        description: form.description || null,
        category: form.category,
        asset_key: `${form.category}:${form.asset_index}`,
        icon_url: null,
        price: form.price,
        min_level: form.min_level,
      });
      qc.invalidateQueries({ queryKey: ['shop', tenantId] });
      toast.success('추가됨');
      setOpen(false);
      setForm({ name: '', description: '', category: 'cloth', asset_index: '1', price: 100, min_level: 1 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> 아이템 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 상점 아이템</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>이름</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>설명</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>카테고리</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ShopCategory })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABEL_KO[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unity 인덱스/타입</Label>
              <Input
                value={form.asset_index}
                onChange={(e) => setForm({ ...form, asset_index: e.target.value })}
                placeholder="예: 7 또는 sword,3"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>가격</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>잠금 레벨</Label>
              <Input
                type="number"
                value={form.min_level}
                onChange={(e) => setForm({ ...form, min_level: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
