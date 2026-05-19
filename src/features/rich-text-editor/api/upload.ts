'use client';

import { FunctionsHttpError } from '@supabase/supabase-js';
import { createClient } from '@/shared/api/supabase/client';

export interface UploadedAttachment {
  url: string;
  kind: 'image' | 'pdf';
  name: string;
}

/** attachment-upload 엣지함수 호출 — 이미지는 AVIF 변환, PDF는 그대로 저장 후 공개 URL 반환. */
export async function uploadAttachment(file: File): Promise<UploadedAttachment> {
  const form = new FormData();
  form.append('file', file);

  const { data, error } = await createClient().functions.invoke('attachment-upload', {
    body: form,
  });

  if (error) {
    let message = '업로드에 실패했습니다.';
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json();
        if (body?.error) message = body.error as string;
      } catch {
        // 본문 파싱 실패 시 기본 메시지 유지
      }
    }
    throw new Error(message);
  }

  return data as UploadedAttachment;
}
