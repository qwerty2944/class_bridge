import 'dart:math';

/// 웹 `src/entities/reward/model/level.ts` 이식 — 레벨 공식의 단일 출처.
int levelForXp(num xp) => max(1, sqrt(xp / 50).floor() + 1);

num xpThresholdForLevel(int level) => pow(level - 1, 2) * 50;
