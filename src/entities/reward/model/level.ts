export function levelForXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export function xpThresholdForLevel(level: number) {
  return Math.pow(level - 1, 2) * 50;
}
