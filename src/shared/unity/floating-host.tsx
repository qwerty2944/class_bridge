'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useUnityStore } from '@/shared/stores/unity-store';

/**
 * 유니티 캐릭터 전역 호스트.
 *
 * AppShell 에 한 번만 마운트되며 캐릭터 페이지 placeholder 위에 position:fixed 로 떠 있다.
 * 라우트가 바뀌어도 언마운트되지 않으므로 WebGL 인스턴스/에셋이 재로드되지 않는다.
 * 캐릭터 페이지가 rect 를 null 로 두면 화면에서 숨고 메모리에는 남아 있는다.
 */

const UNITY_OBJECT = 'SPUM_20260103203421028';

function FloatingUnityHostInner() {
  const { unityProvider, isLoaded, loadingProgression, sendMessage, unload } = useUnityContext({
    loaderUrl: '/unity/characterbuilder.loader.js',
    dataUrl: '/unity/characterbuilder.data',
    frameworkUrl: '/unity/characterbuilder.framework.js',
    codeUrl: '/unity/characterbuilder.wasm',
  });

  const rect = useUnityStore((s) => s.rect);
  const publishApi = useUnityStore((s) => s.publishApi);

  const send = useMemo(
    () => (method: string, param?: string | number) => {
      if (!isLoaded) return;
      try {
        sendMessage(UNITY_OBJECT, method, param ?? '');
      } catch (e) {
        console.warn('[Unity] sendMessage failed', method, e);
      }
    },
    [isLoaded, sendMessage],
  );

  useEffect(() => {
    publishApi({ isLoaded, loadingProgression, send });
  }, [isLoaded, loadingProgression, send, publishApi]);

  // 호스트가 언마운트되는 일은 정상 경로에선 없지만(=앱 종료/로그아웃) 안전망으로 unload.
  useEffect(() => {
    return () => {
      unload().catch(() => {});
    };
  }, [unload]);

  const visible = rect !== null;
  const style: React.CSSProperties = visible
    ? {
        position: 'fixed',
        left: rect!.left,
        top: rect!.top,
        width: rect!.width,
        height: rect!.height,
        zIndex: 10,
        pointerEvents: 'auto',
      }
    : {
        position: 'fixed',
        left: -99999,
        top: -99999,
        width: 1,
        height: 1,
        pointerEvents: 'none',
        opacity: 0,
      };

  return (
    <div style={style} aria-hidden={!visible}>
      <div className="relative h-full w-full">
        <Unity
          unityProvider={unityProvider}
          className="w-full h-full rounded-lg bg-gradient-to-b from-indigo-100/40 to-pink-100/40 dark:from-indigo-950/40 dark:to-pink-950/40"
          style={{ display: 'block', width: '100%', height: '100%' }}
          devicePixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
        />
        {visible && !isLoaded && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
              로딩 중 {Math.round(loadingProgression * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const FloatingUnityHost = dynamic(() => Promise.resolve(FloatingUnityHostInner), {
  ssr: false,
});
