/**
 * 'HH:MM' 또는 'HH:MM:SS' 시간 문자열을 12시간 컨벤션으로 표시.
 * 자정(00:xx) 은 '12:xx' 로 — 한국 학원 운영시간 컨텍스트에서 '00시' 가 어색하다는 피드백.
 * 그 외 시간(01~23) 은 24시간제 그대로 유지해 정보 손실 없게.
 */
export function formatHHMM(time: string | null | undefined): string {
  if (!time) return '';
  const m = time.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return time;
  const h = parseInt(m[1], 10);
  const mm = m[2];
  const h12 = h === 0 ? 12 : h;
  return `${String(h12).padStart(2, '0')}:${mm}`;
}
