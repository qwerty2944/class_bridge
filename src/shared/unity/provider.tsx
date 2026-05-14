'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Unity, useUnityContext } from 'react-unity-webgl';
import type { CharacterAppearance, CharacterColors } from './types';

interface UnityCtxValue {
  isLoaded: boolean;
  loadingProgression: number;
  send: (method: string, param?: string | number) => void;
}

const UnityCtx = createContext<UnityCtxValue | null>(null);

const UNITY_OBJECT = 'SPUM_20260103203421028';

export function UnityProvider({ children }: { children: ReactNode }) {
  const { unityProvider, isLoaded, loadingProgression, sendMessage, unload } = useUnityContext({
    loaderUrl: '/unity/characterbuilder.loader.js',
    dataUrl: '/unity/characterbuilder.data',
    frameworkUrl: '/unity/characterbuilder.framework.js',
    codeUrl: '/unity/characterbuilder.wasm',
  });

  useEffect(() => {
    return () => {
      unload().catch(() => {});
    };
  }, [unload]);

  const value = useMemo<UnityCtxValue>(() => {
    return {
      isLoaded,
      loadingProgression,
      send: (method, param) => {
        if (!isLoaded) return;
        try {
          sendMessage(UNITY_OBJECT, method, param ?? '');
        } catch (e) {
          console.warn('[Unity] sendMessage failed', method, e);
        }
      },
    };
  }, [isLoaded, loadingProgression, sendMessage]);

  return (
    <UnityCtx.Provider value={value}>
      <div className="relative">
        <Unity
          unityProvider={unityProvider}
          className="w-full h-full rounded-lg bg-gradient-to-b from-indigo-100/40 to-pink-100/40 dark:from-indigo-950/40 dark:to-pink-950/40"
          style={{ display: 'block', width: '100%', height: '100%' }}
          devicePixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
        />
        {!isLoaded && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
              로딩 중 {Math.round(loadingProgression * 100)}%
            </div>
          </div>
        )}
      </div>
      <div className="hidden">{children}</div>
    </UnityCtx.Provider>
  );
}

export function useUnity() {
  const ctx = useContext(UnityCtx);
  if (!ctx) throw new Error('useUnity must be used within UnityProvider');
  return ctx;
}

export const UnityProviderClient = dynamic(() => Promise.resolve(UnityProvider), { ssr: false });
