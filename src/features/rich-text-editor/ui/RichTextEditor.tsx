'use client';

import { useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { toast } from 'sonner';
import { Bold, Heading2, ImageIcon, Italic, List, Loader2, Paperclip } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { uploadAttachment } from '../api/upload';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** 에디터 본문 최소 높이 (Tailwind 클래스). 기본 'min-h-[140px]'. */
  minHeight?: string;
}

/** TipTap 기반 WYSIWYG 에디터 — 서식 + 이미지/PDF 첨부 + 클립보드 paste / 드래그 드롭. value 는 HTML 문자열. */
export function RichTextEditor({ value, onChange, placeholder, minHeight }: Props) {
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // 클립보드/드래그한 이미지를 엣지함수 업로드 → AVIF 변환된 URL 로 삽입.
  const insertFromFile = async (file: File): Promise<void> => {
    setUploading(true);
    try {
      const res = await uploadAttachment(file);
      if (!editor) return;
      if (res.kind === 'image') {
        editor.chain().focus().setImage({ src: res.url, alt: res.name }).run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent(
            `<p><a href="${res.url}" target="_blank" rel="noreferrer">📄 ${res.name}</a></p>`,
          )
          .run();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder ?? '내용을 입력하세요…' }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn('rich-content px-3 py-2 outline-none', minHeight ?? 'min-h-[140px]'),
      },
      // 붙여넣기에 이미지가 있으면 엣지함수로 업로드해 삽입 (텍스트 paste 는 기본 동작).
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              void insertFromFile(file);
              return true;
            }
          }
        }
        return false;
      },
      // 드래그앤드롭 이미지도 동일 처리.
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'));
        if (!imageFile) return false;
        event.preventDefault();
        void insertFromFile(imageFile);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const handleFile = (file: File | undefined) => {
    if (file) void insertFromFile(file);
  };

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-0.5 border-b p-1">
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton onClick={() => imageInputRef.current?.click()} disabled={uploading} title="이미지 첨부">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => pdfInputRef.current?.click()} disabled={uploading} title="PDF 첨부">
          <Paperclip className="h-4 w-4" />
        </ToolbarButton>
        {uploading && <Loader2 className="ml-1 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <EditorContent editor={editor} />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function ToolbarButton({
  children,
  active,
  ...props
}: React.ComponentProps<'button'> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50',
        active && 'bg-accent text-foreground',
      )}
      {...props}
    >
      {children}
    </button>
  );
}
