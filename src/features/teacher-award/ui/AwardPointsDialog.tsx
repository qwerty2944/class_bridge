'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Coins, Gift } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useCurrentTenant } from '@/features/tenant-switch';
import { awardFromTeacher } from '@/entities/reward';

/** 선생/원장이 학생에게 코인/XP를 지급하는 다이얼로그. */
export function AwardPointsDialog({
  studentUserId,
  studentFullName,
}: {
  studentUserId: string;
  studentFullName?: string | null;
}) {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [coins, setCoins] = useState('100');
  const [xp, setXp] = useState('0');
  const [note, setNote] = useState('');

  const award = useMutation({
    mutationFn: () =>
      awardFromTeacher({
        tenantId: tenantId!,
        studentUserId,
        studentFullName,
        coinAmount: Number(coins) || 0,
        xpAmount: Number(xp) || 0,
        note: note.trim() || null,
      }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['character', tenantId, studentUserId] });
      toast.success(
        result.leveledUp
          ? `지급 완료! 레벨업 Lv.${result.oldLevel} → Lv.${result.newLevel} 🎉`
          : `코인 ${result.coinsAdded.toLocaleString()} / XP ${result.xpAdded.toLocaleString()} 지급 완료`
      );
      setOpen(false);
      setNote('');
    },
    onError: () => toast.error('지급에 실패했습니다'),
  });

  const coinNum = Number(coins) || 0;
  const xpNum = Number(xp) || 0;
  const invalid = coinNum < 0 || xpNum < 0 || (coinNum === 0 && xpNum === 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Gift className="h-4 w-4" /> 포인트 지급
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            {studentFullName ?? '학생'}에게 포인트 지급
          </DialogTitle>
          <DialogDescription>
            지급한 코인으로 학생이 상점에서 아이템을 구매할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="award-coins">코인</Label>
            <Input
              id="award-coins"
              type="number"
              min={0}
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="award-xp">XP</Label>
            <Input
              id="award-xp"
              type="number"
              min={0}
              value={xp}
              onChange={(e) => setXp(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="award-note">사유 (선택)</Label>
            <Input
              id="award-note"
              placeholder="예: 수업 태도 우수"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => award.mutate()}
            disabled={invalid || award.isPending || !tenantId}
          >
            {award.isPending ? '지급 중...' : '지급'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
