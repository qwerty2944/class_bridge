'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Coins, Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useCurrentTenant } from '@/features/tenant-switch';
import {
  ensureCharacter,
  equipExclusive,
  fetchCharacter,
  fetchInventory,
  setEquipped,
  updateCharacter,
} from '@/entities/character';
import type { StudentCharacter, InventoryRow } from '@/entities/character';
import { xpThresholdForLevel } from '@/entities/reward';
import { useUnity } from '@/shared/unity/provider';
import { useUnityStore } from '@/shared/stores/unity-store';
import { applyAppearance, applyAssetKey, applyColors } from '@/entities/character';
import {
  CATEGORY_LABEL_KO,
  DEFAULT_APPEARANCE,
  DEFAULT_COLORS,
  type CharacterAppearance,
  type CharacterColors,
} from '@/shared/unity/types';
import { AppearanceEditor } from '@/features/character-appearance-edit';

export function CharacterClient({ targetUserId }: { targetUserId: string | null }) {
  const { tenantId, userId, profile } = useCurrentTenant();
  const viewedUserId = targetUserId ?? userId;
  const isOwner = !!userId && viewedUserId === userId;

  const charQ = useQuery({
    queryKey: ['character', tenantId, viewedUserId],
    enabled: !!tenantId && !!viewedUserId,
    queryFn: async () => {
      if (isOwner) {
        return ensureCharacter({ tenantId: tenantId!, userId: userId!, fullName: profile?.full_name });
      }
      return fetchCharacter(tenantId!, viewedUserId!);
    },
  });
  const invQ = useQuery({
    queryKey: ['inventory', charQ.data?.id],
    enabled: !!charQ.data?.id,
    queryFn: () => fetchInventory(charQ.data!.id),
  });

  if (charQ.isLoading) return <Skeleton className="h-[480px]" />;
  if (!charQ.data) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          캐릭터가 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <CharacterScene
      character={charQ.data}
      inventory={invQ.data ?? []}
      inventoryLoading={invQ.isLoading}
      isOwner={isOwner}
    />
  );
}

function CharacterScene({
  character,
  inventory,
  inventoryLoading,
  isOwner,
}: {
  character: StudentCharacter;
  inventory: InventoryRow[];
  inventoryLoading: boolean;
  isOwner: boolean;
}) {
  const [draftAppearance, setDraftAppearance] = useState<CharacterAppearance>(character.appearance);
  const [draftColors, setDraftColors] = useState<CharacterColors>(character.colors);

  // 저장 후 query refetch 로 character 가 갱신되면 draft 도 동기화.
  useEffect(() => {
    setDraftAppearance(character.appearance);
    setDraftColors(character.colors);
  }, [character.appearance, character.colors]);

  const xpInLevel = character.xp - xpThresholdForLevel(character.level);
  const xpForNext = xpThresholdForLevel(character.level + 1) - xpThresholdForLevel(character.level);
  const progress = Math.min(100, Math.max(0, (xpInLevel / Math.max(1, xpForNext)) * 100));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" /> {character.name ?? '내 캐릭터'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isOwner ? '과제로 XP를 모아 레벨업하고 상점에서 아이템을 장착하세요.' : '학생의 캐릭터 (읽기 전용)'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-base px-3 py-1 gap-1">
            <Trophy className="h-4 w-4" /> Lv. {character.level}
          </Badge>
          <Badge variant="outline" className="text-base px-3 py-1 gap-1">
            <Coins className="h-4 w-4 text-amber-500" /> {character.coins.toLocaleString()}
          </Badge>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <UnityAnchor>
              <UnityCharacterSync appearance={draftAppearance} colors={draftColors} inventory={inventory.filter((r) => r.equipped)} />
            </UnityAnchor>
            <div className="p-5 border-t">
              <p className="text-xs text-muted-foreground mb-1.5">
                XP {character.xp} / {xpThresholdForLevel(character.level + 1)}
              </p>
              <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Tabs defaultValue="inventory">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="inventory">인벤토리</TabsTrigger>
              {isOwner && <TabsTrigger value="appearance">외형</TabsTrigger>}
            </TabsList>
            <TabsContent value="inventory" className="mt-3">
              <InventoryPanel characterId={character.id} inventory={inventory} canEdit={isOwner} loading={inventoryLoading} />
            </TabsContent>
            {isOwner && (
              <TabsContent value="appearance" className="mt-3">
                <AppearanceEditor
                  characterId={character.id}
                  appearance={draftAppearance}
                  colors={draftColors}
                  onAppearanceChange={setDraftAppearance}
                  onColorsChange={setDraftColors}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/**
 * 캐릭터 페이지의 유니티 위치 placeholder.
 *
 * 자기 영역(getBoundingClientRect)을 store 의 rect 로 게시하면 AppShell 의
 * FloatingUnityHost 가 그 위에 position:fixed 로 캔버스를 올린다. 언마운트 시 rect=null
 * 로 두면 호스트는 화면 밖으로 숨어 인스턴스만 유지한다.
 */
function UnityAnchor({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const request = useUnityStore((s) => s.request);
  const setRect = useUnityStore((s) => s.setRect);

  useEffect(() => {
    request();
    const el = ref.current;
    if (!el) return;
    const publish = () => {
      const r = el.getBoundingClientRect();
      setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener('scroll', publish, { passive: true, capture: true });
    window.addEventListener('resize', publish);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', publish, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', publish);
      setRect(null);
    };
  }, [request, setRect]);

  return (
    // Unity 카메라는 세로 화각 고정이라 정사각형 캔버스에서는 옆으로 뻗은 무기가 잘린다.
    // 가로 비율(8:5)을 확보해 무기까지 항상 화면에 들어오게 한다.
    <div ref={ref} className="aspect-[8/5] w-full max-w-[640px] mx-auto">
      {children}
    </div>
  );
}

function UnityCharacterSync({
  appearance,
  colors,
  inventory,
}: {
  appearance: CharacterAppearance;
  colors: CharacterColors;
  inventory: { item: { asset_key: string; category: string } }[];
}) {
  const { isLoaded, send } = useUnity();
  useEffect(() => {
    if (!isLoaded) return;
    applyAppearance(send, appearance);
    applyColors(send, colors);
    inventory.forEach((row) => applyAssetKey(send, row.item.asset_key));
  }, [isLoaded, appearance, colors, inventory, send]);
  return null;
}

function InventoryPanel({
  characterId,
  inventory,
  canEdit,
  loading,
}: {
  characterId: string;
  inventory: Awaited<ReturnType<typeof fetchInventory>>;
  canEdit: boolean;
  loading: boolean;
}) {
  const qc = useQueryClient();
  const equip = useMutation({
    mutationFn: ({ id, category }: { id: string; category: string }) =>
      equipExclusive(characterId, id, category),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', characterId] });
      toast.success('장착됨');
    },
  });
  const unequip = useMutation({
    mutationFn: (id: string) => setEquipped(id, false),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', characterId] }),
  });

  if (loading) return <Skeleton className="h-40" />;
  if (inventory.length === 0)
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          보유 아이템이 없습니다. 상점에서 구매해 보세요.
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
      {inventory.map((row) => (
        <Card key={row.id}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-gradient-to-br from-indigo-100 to-pink-100 grid place-items-center text-xs font-semibold">
              {CATEGORY_LABEL_KO[row.item.category as keyof typeof CATEGORY_LABEL_KO]?.slice(0, 1) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{row.item.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {CATEGORY_LABEL_KO[row.item.category as keyof typeof CATEGORY_LABEL_KO]}
              </p>
            </div>
            {canEdit ? (
              row.equipped ? (
                <Button size="sm" variant="secondary" onClick={() => unequip.mutate(row.id)}>
                  해제
                </Button>
              ) : (
                <Button size="sm" onClick={() => equip.mutate({ id: row.id, category: row.item.category })}>
                  장착
                </Button>
              )
            ) : row.equipped ? (
              <Badge>장착</Badge>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
