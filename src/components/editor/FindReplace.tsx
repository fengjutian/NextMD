import { useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { ChevronDown, ChevronUp, Replace, Search, X } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { findMatches, findEditorMatches } from '../../lib/editorSearch';
import { updateSearchHighlights } from '../../lib/searchHighlight';
import { navigateSourceEditor } from '../../lib/sourceEditorEvents';

interface Props {
  open: boolean;
  replaceOpen: boolean;
  editor: Editor | null;
  onOpen: (replace: boolean) => void;
  onClose: () => void;
}

export function FindReplace({ open, replaceOpen, editor, onOpen, onClose }: Props) {
  const content = useEditorStore((state) => state.content);
  const setContent = useEditorStore((state) => state.setContent);
  const viewMode = useEditorStore((state) => state.viewMode);
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = useMemo(() => {
    if (viewMode === 'wysiwyg' && editor) {
      return findEditorMatches(editor, query);
    }
    return findMatches(content, query);
  }, [content, query, viewMode, editor]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { setActive(-1); }, [query, viewMode]);
  useEffect(() => {
    if (!editor) return;
    updateSearchHighlights(editor, open && viewMode === 'wysiwyg' ? matches : [], active);
    return () => updateSearchHighlights(editor, [], -1);
  }, [active, editor, matches, open, viewMode]);

  const showMatch = (index: number) => {
    if (!matches.length) return;
    const next = (index + matches.length) % matches.length;
    setActive(next);
    const match = matches[next];
    if (viewMode === 'wysiwyg' && editor) {
      updateSearchHighlights(editor, matches, next);
      requestAnimationFrame(() => {
        editor.view.dom.querySelector('.search-match-active')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputRef.current?.focus();
      });
      return;
    }
    requestAnimationFrame(() => {
      navigateSourceEditor({ from: match.from, to: match.to });
      inputRef.current?.focus();
    });
  };

  const replaceCurrent = () => {
    if (!matches.length) return;
    const match = matches[Math.max(0, Math.min(active, matches.length - 1))];
    if (viewMode === 'wysiwyg' && editor) {
      editor.view.dispatch(editor.state.tr.insertText(replacement, match.from, match.to));
    } else {
      setContent(content.slice(0, match.from) + replacement + content.slice(match.to));
    }
    setActive(-1);
  };

  const replaceAll = () => {
    if (!matches.length) return;
    if (viewMode === 'wysiwyg' && editor) {
      const transaction = editor.state.tr;
      for (let i = matches.length - 1; i >= 0; i--) {
        transaction.insertText(replacement, matches[i].from, matches[i].to);
      }
      editor.view.dispatch(transaction);
    } else {
      let next = content;
      for (let i = matches.length - 1; i >= 0; i--) {
        next = next.slice(0, matches[i].from) + replacement + next.slice(matches[i].to);
      }
      setContent(next);
    }
    setActive(-1);
  };

  if (!open) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-xs">
      <Search size={15} className="text-[var(--text-muted)]" />
      <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') { event.preventDefault(); showMatch(active + (event.shiftKey ? -1 : 1)); }
          if (event.key === 'Escape') onClose();
        }}
        placeholder={viewMode === 'wysiwyg' ? '查找可见文本' : '查找 Markdown 内容'} aria-label="查找内容"
        className="min-w-32 flex-1 rounded border border-[var(--border-default)] bg-[var(--bg-editor)] px-2 py-1 text-[var(--text-primary)] outline-none" />
      <span className="min-w-12 text-center text-[var(--text-muted)]">{matches.length ? `${Math.max(0, Math.min(active + 1, matches.length))}/${matches.length}` : '0/0'}</span>
      <button onClick={() => showMatch(active - 1)} disabled={!matches.length} aria-label="上一处" title="上一处" className="disabled:opacity-40"><ChevronUp size={16} /></button>
      <button onClick={() => showMatch(active + 1)} disabled={!matches.length} aria-label="下一处" title="下一处" className="disabled:opacity-40"><ChevronDown size={16} /></button>
      <button onClick={() => onOpen(!replaceOpen)} aria-label="切换替换" title="切换替换" className="px-1"><Replace size={15} /></button>
      {replaceOpen && <>
        <input value={replacement} onChange={(event) => setReplacement(event.target.value)} placeholder="替换为" aria-label="替换内容"
          className="min-w-28 flex-1 rounded border border-[var(--border-default)] bg-[var(--bg-editor)] px-2 py-1 text-[var(--text-primary)] outline-none" />
        <button onClick={replaceCurrent} disabled={!matches.length} className="rounded px-2 py-1 hover:bg-[var(--border-subtle)] disabled:opacity-40">替换</button>
        <button onClick={replaceAll} disabled={!matches.length} className="rounded px-2 py-1 hover:bg-[var(--border-subtle)] disabled:opacity-40">全部替换</button>
      </>}
      <button onClick={onClose} aria-label="关闭查找" title="关闭" className="px-1"><X size={16} /></button>
    </div>
  );
}
