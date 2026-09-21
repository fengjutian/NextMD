import { useEffect, useRef } from 'react';
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
import { EditorContext } from './EditorContext';

interface MdEditorProps {
  mode: ViewMode;
  onEditorReady?: (editor: Editor | null) => void;
}

export function MdEditor({ mode, onEditorReady }: MdEditorProps) {
  const { content, setContent, focusMode, typewriterMode } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wysiwygScrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (mode !== 'wysiwyg' || !editor || !onEditorReady) return;
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [editor, mode, onEditorReady]);

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

  useEffect(() => {
    if (!editor || mode !== 'wysiwyg' || !typewriterMode) return;
    const scrollArea = wysiwygScrollRef.current;
    if (!scrollArea) return;
    let frame = 0;
    const centerCaret = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!editor.isFocused) return;
        const caret = editor.view.coordsAtPos(editor.state.selection.from);
        const viewport = scrollArea.getBoundingClientRect();
        scrollArea.scrollTop += (caret.top + caret.bottom) / 2 - (viewport.top + viewport.bottom) / 2;
      });
    };
    centerCaret();
    editor.on('transaction', centerCaret);
    editor.on('focus', centerCaret);
    return () => {
      cancelAnimationFrame(frame);
      editor.off('transaction', centerCaret);
      editor.off('focus', centerCaret);
    };
  }, [editor, mode, typewriterMode]);

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
          <div ref={wysiwygScrollRef} className={cn('flex-1 overflow-y-auto bg-[var(--bg-editor)]', typewriterMode && 'typewriter-mode')}>
            <EditorContent editor={editor} className="h-full" />
          </div>
        )}
      </div>
    </EditorContext.Provider>
  );
}
