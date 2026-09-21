import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Replace, Search, X } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

interface Props {
  open: boolean;
  replaceOpen: boolean;
  onOpen: (replace: boolean) => void;
  onClose: () => void;
}

export function FindReplace({ open, replaceOpen, onOpen, onClose }: Props) {
  const { content, setContent, setViewMode } = useEditorStore();
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = useMemo(() => {
    if (!query) return [];
    const found: number[] = [];
    const haystack = content.toLowerCase();
    const needle = query.toLowerCase();
    let from = 0;
    while (from < content.length) {
      const position = haystack.indexOf(needle, from);
      if (position < 0) break;
      found.push(position);
      from = position + Math.max(needle.length, 1);
    }
    return found;
  }, [content, query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const showMatch = (index: number) => {
    if (!matches.length) return;
    const next = (index + matches.length) % matches.length;
    setActive(next);
    setViewMode('source');
    requestAnimationFrame(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>('textarea.editor-area');
      if (!textarea) return;
      const position = matches[next];
      textarea.focus();
      textarea.setSelectionRange(position, position + query.length);
      const line = content.slice(0, position).split('\n').length - 1;
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24;
      textarea.scrollTop = Math.max(0, line * lineHeight - textarea.clientHeight / 3);
    });
  };

  const replaceCurrent = () => {
    if (!matches.length) return;
    const index = Math.max(0, Math.min(active, matches.length - 1));
    const position = matches[index];
    setContent(content.slice(0, position) + replacement + content.slice(position + query.length));
    setActive(-1);
  };

  const replaceAll = () => {
    if (!matches.length) return;
    let next = content;
    for (let i = matches.length - 1; i >= 0; i--) {
      const position = matches[i];
      next = next.slice(0, position) + replacement + next.slice(position + query.length);
    }
    setContent(next);
    setActive(-1);
  };

  if (!open) return (
    <div className="flex justify-end border-b border-[var(--border-subtle)] bg-[var(--bg-editor)] px-2 py-1">
      <button onClick={() => onOpen(false)} title="查找 (Ctrl+F)" aria-label="查找" className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Search size={15} /></button>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-xs">
      <Search size={15} className="text-[var(--text-muted)]" />
      <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(-1); }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') { event.preventDefault(); showMatch(active + (event.shiftKey ? -1 : 1)); }
          if (event.key === 'Escape') onClose();
        }}
        placeholder="查找 Markdown 内容" aria-label="查找内容"
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
