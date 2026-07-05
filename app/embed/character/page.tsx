'use client';

/**
 * 캐릭터 렌더 전용 공개 임베드 페이지.
 *
 * Flutter 앱(웹)이 iframe 으로 띄운다. 외형 데이터는 쿼리 파라미터 `d` 로 받으므로
 * 인증/DB 접근이 없다: d = base64url(JSON.stringify({ appearance, colors, assetKeys }))
 *
 * 예: /embed/character?d=eyJhcHBlYXJhbmNlIjp7...
 */

import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { applyAppearance, applyAssetKey, applyColors } from '@/entities/character';
import {
  DEFAULT_APPEARANCE,
  DEFAULT_COLORS,
  type CharacterAppearance,
  type CharacterColors,
} from '@/shared/unity/types';

const UNITY_OBJECT = 'SPUM_20260103203421028';

interface EmbedPayload {
  appearance?: Partial<CharacterAppearance>;
  colors?: Partial<CharacterColors>;
  assetKeys?: string[];
}

function decodePayload(raw: string | null): EmbedPayload {
  if (!raw) return {};
  try {
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64)) as EmbedPayload;
  } catch {
    return {};
  }
}

function EmbedCharacterInner() {
  const params = useSearchParams();
  const payload = useMemo(() => decodePayload(params.get('d')), [params]);

  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: '/unity/characterbuilder.loader.js',
    dataUrl: '/unity/characterbuilder.data',
    frameworkUrl: '/unity/characterbuilder.framework.js',
    codeUrl: '/unity/characterbuilder.wasm',
  });

  useEffect(() => {
    if (!isLoaded) return;
    const send = (method: string, param?: string | number) => {
      try {
        sendMessage(UNITY_OBJECT, method, param ?? '');
      } catch {
        /* Unity 미준비 시 무시 */
      }
    };
    // Unity 씬 초기화가 끝나기 전 SendMessage 는 유실될 수 있어 약간 늦춰 적용
    const timer = setTimeout(() => {
      applyAppearance(send, { ...DEFAULT_APPEARANCE, ...payload.appearance });
      applyColors(send, { ...DEFAULT_COLORS, ...payload.colors });
      (payload.assetKeys ?? []).forEach((key) => applyAssetKey(send, key));
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoaded, sendMessage, payload]);

  return (
    <div className="h-dvh w-full bg-transparent flex items-center justify-center">
      {!isLoaded && (
        <p className="absolute text-sm text-muted-foreground">
          캐릭터 로딩 중... {Math.round(loadingProgression * 100)}%
        </p>
      )}
      {/* 세로 화각 고정인 Unity 카메라에서 무기가 잘리지 않도록 가로 비율 확보 */}
      <div className="w-full max-h-full aspect-[8/5]">
        <Unity
          unityProvider={unityProvider}
          className="w-full h-full"
          style={{ display: 'block', width: '100%', height: '100%' }}
          devicePixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
        />
      </div>
    </div>
  );
}

export default function EmbedCharacterPage() {
  return (
    <Suspense fallback={null}>
      <EmbedCharacterInner />
    </Suspense>
  );
}
