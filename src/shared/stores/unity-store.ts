'use client';

import { create } from 'zustand';

/**
 * 유니티 캐릭터 인스턴스 전역 상태.
 *
 * 캐릭터 페이지는 한 번만 유니티를 로드하고, 다른 라우트로 갔다가 돌아와도
 * 재로딩이 일어나지 않도록 한다. AppShell 에서 FloatingUnityHost 가 마운트되어
 * 유니티 캔버스를 항상 유지하고, 캐릭터 페이지의 placeholder 위에 위치를 맞춰 띄운다.
 *
 * - `requested`: 한 번이라도 캐릭터 페이지가 열리면 true. 이후 호스트가 마운트된 채 유지.
 * - `rect`: 현재 표시될 위치(픽셀). 캐릭터 페이지가 활성일 때만 설정, 떠나면 null.
 * - `isLoaded`/`loadingProgression`/`send`: 호스트가 유니티 상태/조작 API 를 게시.
 */

export interface UnityAnchorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface UnityState {
  requested: boolean;
  rect: UnityAnchorRect | null;
  isLoaded: boolean;
  loadingProgression: number;
  send: (method: string, param?: string | number) => void;
  request: () => void;
  setRect: (rect: UnityAnchorRect | null) => void;
  publishApi: (api: {
    isLoaded: boolean;
    loadingProgression: number;
    send: (method: string, param?: string | number) => void;
  }) => void;
}

const noopSend: UnityState['send'] = () => {
  // 호스트 마운트 전에는 무시.
};

export const useUnityStore = create<UnityState>((set) => ({
  requested: false,
  rect: null,
  isLoaded: false,
  loadingProgression: 0,
  send: noopSend,
  request: () => set({ requested: true }),
  setRect: (rect) => set({ rect }),
  publishApi: ({ isLoaded, loadingProgression, send }) =>
    set({ isLoaded, loadingProgression, send }),
}));
