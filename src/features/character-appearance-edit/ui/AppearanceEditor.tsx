'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { updateCharacter } from '@/entities/character';
import type { CharacterAppearance, CharacterColors } from '@/shared/unity/types';

const NUMERIC_FIELDS: { key: keyof CharacterAppearance; label: string; max: number }[] = [
  { key: 'bodyIndex', label: '몸', max: 5 },
  { key: 'eyeIndex', label: '눈', max: 10 },
  { key: 'hairIndex', label: '머리', max: 15 },
  { key: 'facehairIndex', label: '얼굴털', max: 10 },
  { key: 'clothIndex', label: '옷', max: 10 },
  { key: 'armorIndex', label: '갑옷', max: 10 },
  { key: 'pantIndex', label: '바지', max: 8 },
  { key: 'helmetIndex', label: '투구', max: 6 },
  { key: 'backIndex', label: '망토', max: 5 },
];

const COLOR_FIELDS: { key: keyof CharacterColors; label: string }[] = [
  { key: 'hair', label: '머리색' },
  { key: 'eye', label: '눈색' },
  { key: 'cloth', label: '옷색' },
  { key: 'armor', label: '갑옷색' },
  { key: 'pant', label: '바지색' },
];

export function AppearanceEditor({
  characterId,
  appearance,
  colors,
}: {
  characterId: string;
  appearance: CharacterAppearance;
  colors: CharacterColors;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<CharacterAppearance>(appearance);
  const [draftColors, setDraftColors] = useState<CharacterColors>(colors);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateCharacter(characterId, { appearance: draft, colors: draftColors });
      qc.invalidateQueries({ queryKey: ['character'] });
      toast.success('외형 저장됨');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4 max-h-[460px] overflow-auto pr-1">
        <div className="grid grid-cols-3 gap-3">
          {NUMERIC_FIELDS.map((f) => (
            <div key={f.key}>
              <Label className="text-xs">{f.label}</Label>
              <Input
                type="number"
                min={0}
                max={f.max}
                value={draft[f.key]}
                onChange={(e) => setDraft({ ...draft, [f.key]: Math.max(0, Math.min(f.max, Number(e.target.value || 0))) })}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_FIELDS.map((f) => (
            <div key={f.key}>
              <Label className="text-xs">{f.label}</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={draftColors[f.key]}
                  onChange={(e) => setDraftColors({ ...draftColors, [f.key]: e.target.value })}
                  className="h-9 w-12 rounded border bg-background"
                />
                <Input
                  value={draftColors[f.key]}
                  onChange={(e) => setDraftColors({ ...draftColors, [f.key]: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={save} disabled={busy} className="w-full">
          저장
        </Button>
      </CardContent>
    </Card>
  );
}
