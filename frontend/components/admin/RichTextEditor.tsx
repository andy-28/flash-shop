"use client";

import { useCallback, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Heading2, Heading3, Image, Italic, Link, List, ListOrdered, Quote, Redo2, Strikethrough, Undo2 } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Write content..." }: Readonly<RichTextEditorProps>) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[220px] px-4 py-3 outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return <div className="min-h-[260px] animate-pulse rounded-md border border-[#2A2A2A] bg-[#1E1E1E]" />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#2A2A2A] bg-[#1E1E1E]">
      <div className="flex flex-wrap gap-1 border-b border-[#2A2A2A] bg-black/30 p-2">
        <ToolbarButton active={editor.isActive("bold")} icon={Bold} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton active={editor.isActive("italic")} icon={Italic} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton active={editor.isActive("strike")} icon={Strikethrough} label="Strike" onClick={() => editor.chain().focus().toggleStrike().run()} />
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} icon={Heading2} label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} icon={Heading3} label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolbarButton active={editor.isActive("bulletList")} icon={List} label="Bullets" onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton active={editor.isActive("orderedList")} icon={ListOrdered} label="Numbered" onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton active={editor.isActive("blockquote")} icon={Quote} label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton active={editor.isActive("link")} icon={Link} label="Link" onClick={setLink} />
        <ToolbarButton icon={Image} label="Image" onClick={() => setShowImagePicker((current) => !current)} />
        <ToolbarButton icon={Undo2} label="Undo" onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton icon={Redo2} label="Redo" onClick={() => editor.chain().focus().redo().run()} />
      </div>
      {showImagePicker ? (
        <div className="border-b border-[#2A2A2A] p-3">
          <MediaPicker
            folder="content"
            onChange={(url) => {
              editor.chain().focus().setImage({ src: url }).run();
              setShowImagePicker(false);
            }}
          />
        </div>
      ) : null}
      <EditorContent className="rich-text-editor text-sm leading-7 text-white" editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active = false,
  icon: Icon,
  label,
  onClick,
}: Readonly<{ active?: boolean; icon: typeof Bold; label: string; onClick: () => void }>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-8 items-center justify-center rounded-md transition ${
        active ? "bg-white text-black" : "text-[#A0A0A0] hover:bg-white/10 hover:text-white"
      }`}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  );
}
