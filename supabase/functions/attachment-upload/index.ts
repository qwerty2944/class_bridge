// 수업 첨부파일 업로드 엣지함수.
// 이미지는 리사이즈 + AVIF 변환, PDF는 그대로 — class-attachments 버킷에 저장.
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from 'https://deno.land/x/imagemagick_deno@0.0.31/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

await initializeImageMagick();

const BUCKET = 'class-attachments';
const MAX_DIMENSION = 1600;
const AVIF_QUALITY = 50;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST 요청만 허용됩니다.' }, 405);

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return json({ error: 'file 필드가 필요합니다.' }, 400);

    const input = new Uint8Array(await file.arrayBuffer());
    let output: Uint8Array;
    let ext: string;
    let kind: 'image' | 'pdf';
    let contentType: string;

    if (file.type.startsWith('image/')) {
      // 리사이즈 후 AVIF 변환.
      output = await ImageMagick.read(input, (img): Uint8Array => {
        const longest = Math.max(img.width, img.height);
        if (longest > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / longest;
          img.resize(Math.round(img.width * scale), Math.round(img.height * scale));
        }
        img.quality = AVIF_QUALITY;
        return img.write(MagickFormat.Avif, (data) => new Uint8Array(data));
      });
      ext = 'avif';
      kind = 'image';
      contentType = 'image/avif';
    } else if (file.type === 'application/pdf') {
      output = input;
      ext = 'pdf';
      kind = 'pdf';
      contentType = 'application/pdf';
    } else {
      return json({ error: '이미지 또는 PDF 파일만 업로드할 수 있습니다.' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const path = `class/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, output, { contentType, upsert: false });
    if (error) return json({ error: error.message }, 500);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return json({ url: data.publicUrl, kind, name: file.name });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
