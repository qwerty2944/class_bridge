'use client';

import { useUnityStore } from '@/shared/stores/unity-store';

/**
 * 유니티 API 접근 훅.
 *
 * 실제 Unity 인스턴스는 AppShell 의 FloatingUnityHost 가 한 번 마운트해 전역 store 에
 * isLoaded/loadingProgression/send 를 게시한다. 캐릭터 페이지가 라우트 전환을 해도
 * 호스트는 살아 있으므로 재로드가 일어나지 않는다.
 */
export function useUnity() {
  const isLoaded = useUnityStore((s) => s.isLoaded);
  const loadingProgression = useUnityStore((s) => s.loadingProgression);
  const send = useUnityStore((s) => s.send);
  return { isLoaded, loadingProgression, send };
}
