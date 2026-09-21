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
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import { useEditorStore, type ViewMode } from '../../stores/editorStore';
import { Toolbar } from './Toolbar';
import { cn } from '../../lib/utils';
import { EditorContext } from './EditorContext';
import { SearchHighlight } from '../../lib/searchHighlight';
import { SourceEditor, type SourceEditorHandle } from './SourceEditor';
import { MarkdownCodeBlock } from './MarkdownCodeBlock';
import { insertMarkdownSyntax, runEditorCommand, type EditorCommand } from '../../lib/editorCommands';
import { enableTableDrag } from '../../lib/tableDrag';
import { ResizableTableRow } from '../../lib/resizableTableRow';
import { CjkBold } from './CjkBold';

interface MdEditorProps {
  mode: ViewMode;
  onEditorReady?: (editor: Editor | null) => void;
}

export function MdEditor({ mode, onEditorReady }: MdEditorProps) {
  const content = useEditorStore((state) => state.content);
  const setContent = useEditorStore((state) => state.setContent);
  const focusMode = useEditorStore((state) => state.focusMode);
  const typewriterMode = useEditorStore((state) => state.typewriterMode);
  const sourceEditorRef = useRef<SourceEditorHandle>(null);
  const wysiwygScrollRef = useRef<HTMLDivElement>(null);

  const syncingRef = useRef(false);
  const updateTimerRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<{ revision: number; content: string } | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, bold: false }),
      CjkBold,
      MarkdownCodeBlock,
      Markdown,
      Placeholder.configure({ placeholder: '开始写作...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Image.configure({ allowBase64: true }),
      Table.configure({ resizable: true }),
      ResizableTableRow,
      TableCell,
      TableHeader,
      SearchHighlight,
    ],
    content,
    contentType: 'markdown',
    editorProps: { attributes: { class: 'tiptap editor-area' } },
    onUpdate: ({ editor, transaction }) => {
      if (syncingRef.current) return;
      if (transaction.getMeta('nextmd:visual-only')) return;
      if (updateTimerRef.current) window.clearTimeout(updateTimerRef.current);
      const revision = useEditorStore.getState().contentRevision;
      const nextContent = editor.getMarkdown();
      pendingUpdateRef.current = { revision, content: nextContent };
      updateTimerRef.current = window.setTimeout(() => {
        updateTimerRef.current = null;
        pendingUpdateRef.current = null;
        // A file load/save happened after this update was queued. Discard the
        // stale callback so it cannot turn a freshly loaded file dirty.
        if (useEditorStore.getState().contentRevision !== revision) return;
        setContent(nextContent);
      }, 60);
    },
  });

  useEffect(() => {
    if (!editor || mode !== 'wysiwyg') return;
    useEditorStore.getState().registerContentReader(() => editor.getMarkdown());
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
        const pending = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        if (pending && useEditorStore.getState().contentRevision === pending.revision) {
          setContent(pending.content);
        }
      }
      useEditorStore.getState().registerContentReader(null);
    };
  }, [editor, mode, setContent]);

  useEffect(() => {
    if (mode !== 'wysiwyg' || !editor || !onEditorReady) return;
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [editor, mode, onEditorReady]);

  useEffect(() => {
    if (!editor || mode !== 'wysiwyg') return;
    return enableTableDrag(editor);
  }, [editor, mode]);

  useEffect(() => {
    const runMenuCommand = (event: Event) => {
      const detail = (event as CustomEvent<{ command: EditorCommand; prefix: string; suffix: string }>).detail;
      if (mode === 'wysiwyg' && editor) runEditorCommand(editor, detail.command);
      else insertMarkdownSyntax(sourceEditorRef.current, useEditorStore.getState().content, detail.prefix, detail.suffix, setContent);
    };
    window.addEventListener('nextmd:editor-command', runMenuCommand);
    return () => window.removeEventListener('nextmd:editor-command', runMenuCommand);
  }, [editor, mode, setContent]);

  // Sync editor when content changes externally (e.g. file load or drop)
  const lastContentRef = useRef(content);
  useEffect(() => {
    if (editor && content !== lastContentRef.current && mode === 'wysiwyg') {
      if (editor.getMarkdown() !== content) {
        if (updateTimerRef.current) {
          window.clearTimeout(updateTimerRef.current);
          updateTimerRef.current = null;
          pendingUpdateRef.current = null;
        }
        syncingRef.current = true;
        try {
          editor.commands.setContent(content, { contentType: 'markdown', emitUpdate: false });
        } finally {
          syncingRef.current = false;
        }
      }
      lastContentRef.current = content;
    }
  }, [content, editor, mode]);

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
        <Toolbar sourceEditorRef={sourceEditorRef} />
        {mode === 'source' ? (
          <div className="flex-1 overflow-hidden">
            <SourceEditor ref={sourceEditorRef} content={content} onChange={setContent}
              onReady={(source) => useEditorStore.getState().registerContentReader(source ? source.getContent : null)} />
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
