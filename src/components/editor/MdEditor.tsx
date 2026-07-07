import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Markdown } from '@tiptap/markdown';

import { useEditorStore, type ViewMode } from '../../stores/editorStore';
import { cn } from '../../lib/utils';

interface MdEditorProps {
  mode: ViewMode;
}

export function MdEditor({ mode }: MdEditorProps) {
  const { content, setContent } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Placeholder.configure({ placeholder: '开始写作...' }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Image.configure({ allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Markdown,
    ],
    content,
    contentType: 'markdown',
    editorProps: {
      attributes: {
        class: 'tiptap editor-area',
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getMarkdown());
    },
  });

  // Sync editor when content changes externally (e.g. file load)
  const lastContentRef = useRef(content);
  useEffect(() => {
    if (editor && content !== lastContentRef.current && mode === 'wysiwyg') {
      if (editor.getMarkdown() !== content) {
        editor.commands.setContent(content, { contentType: 'markdown' });
      }
      lastContentRef.current = content;
    }
  }, [content, editor, mode]);

  // Focus textarea when switching to source mode
  useEffect(() => {
    if (mode === 'source' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  if (mode === 'source') {
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={cn(
          'w-full h-full resize-none outline-none border-none px-8 py-6',
          'font-mono text-sm leading-relaxed',
          'bg-[var(--bg-editor)] text-[var(--text-primary)]',
          'editor-area'
        )}
        placeholder="开始写作..."
        spellCheck={false}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-editor)]">
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}
