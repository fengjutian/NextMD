import { useEffect, useRef, createContext } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import { useEditorStore, type ViewMode } from '../../stores/editorStore';
import { Toolbar } from './Toolbar';
import { cn } from '../../lib/utils';

export const EditorContext = createContext<Editor | null>(null);

interface MdEditorProps {
  mode: ViewMode;
}

export function MdEditor({ mode }: MdEditorProps) {
  const { content, setContent, focusMode } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncingRef = useRef(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'code-block' } } }),
      Markdown,
      Placeholder.configure({ placeholder: '开始写作...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Image.configure({ allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    contentType: 'markdown',
    editorProps: { attributes: { class: 'tiptap editor-area' } },
    onUpdate: ({ editor }) => {
      const md = editor.getMarkdown();
      if (syncingRef.current) return;
      setContent(md);
    },
  });

  // Sync editor when content changes externally (e.g. file load or drop)
  const lastContentRef = useRef(content);
  useEffect(() => {
    if (editor && content !== lastContentRef.current && mode === 'wysiwyg') {
      if (editor.getMarkdown() !== content) {
        syncingRef.current = true;
        try {
          editor.commands.setContent(content, { contentType: 'markdown' });
        } finally {
          syncingRef.current = false;
        }
      }
      lastContentRef.current = content;
    }
  }, [content, editor, mode]);

  useEffect(() => {
    if (mode === 'source' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (!editor || mode !== 'wysiwyg') return;
    const root = editor.view.dom;
    if (!focusMode) {
      root.classList.remove('focus-mode');
      root.querySelector('[data-focus-active]')?.removeAttribute('data-focus-active');
      return;
    }
    root.classList.add('focus-mode');
    const updateActiveBlock = () => {
      root.querySelector('[data-focus-active]')?.removeAttribute('data-focus-active');
      let node: Node | null = editor.view.domAtPos(editor.state.selection.from).node;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      if (node === root) node = root.firstChild;
      while (node && node.parentNode !== root) node = node.parentNode;
      if (node instanceof HTMLElement) node.setAttribute('data-focus-active', '');
    };
    updateActiveBlock();
    editor.on('transaction', updateActiveBlock);
    return () => {
      editor.off('transaction', updateActiveBlock);
      root.classList.remove('focus-mode');
      root.querySelector('[data-focus-active]')?.removeAttribute('data-focus-active');
    };
  }, [editor, focusMode, mode]);

  return (
    <EditorContext.Provider value={editor}>
      <div className="flex flex-col h-full">
        <Toolbar />
        {mode === 'source' ? (
          <div className="flex-1 overflow-hidden">
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
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[var(--bg-editor)]">
            <EditorContent editor={editor} className="h-full" />
          </div>
        )}
      </div>
    </EditorContext.Provider>
  );
}
