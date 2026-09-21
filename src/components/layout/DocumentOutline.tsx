import type { Editor } from '@tiptap/react';
import { ChevronLeft, ListTree } from 'lucide-react';
import { useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { getOutline } from '../../lib/outline';
import { navigateSourceEditor } from '../../lib/sourceEditorEvents';
import { useEditorStore } from '../../stores/editorStore';

interface Props {
  editor: Editor | null;
}

export function DocumentOutline({ editor }: Props) {
  const [width, setWidth] = useState(() => {
    const saved = Number(window.localStorage.getItem('nextmd-outline-width'));
    return Number.isFinite(saved) && (saved === 0 || (saved >= 160 && saved <= 420)) ? saved : 208;
  });
  const content = useEditorStore((state) => state.content);
  const viewMode = useEditorStore((state) => state.viewMode);
  const outlineContent = useDebouncedValue(content, 120);
  const headings = useMemo(() => getOutline(outlineContent), [outlineContent]);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const resize = (moveEvent: PointerEvent) => {
      const candidate = Math.max(0, Math.min(420, startWidth + startX - moveEvent.clientX));
      setWidth(candidate < 100 ? 0 : Math.max(160, candidate));
    };
    const stop = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', stop);
      setWidth((current) => {
        window.localStorage.setItem('nextmd-outline-width', String(current));
        return current;
      });
    };
    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', stop, { once: true });
  };

  const jumpToHeading = (index: number) => {
    const heading = headings[index];
    if (viewMode === 'wysiwyg' && editor) {
      const elements = editor.view.dom.querySelectorAll('h1, h2, h3, h4, h5, h6');
      elements[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    navigateSourceEditor({ from: heading.offset, focus: true });
  };

  return (
    <aside
      style={{ width }}
      className={`relative hidden xl:flex shrink-0 flex-col bg-[var(--bg-editor)] ${width ? 'border-l border-[var(--border-subtle)]' : ''}`}
    >
      <div
        role="separator"
        aria-label="调整目录宽度"
        aria-orientation="vertical"
        onPointerDown={startResize}
        onDoubleClick={() => { setWidth(208); window.localStorage.setItem('nextmd-outline-width', '208'); }}
        className="absolute inset-y-0 -left-1 z-20 w-2 cursor-col-resize touch-none hover:bg-[var(--accent-muted)]"
      />
      {width === 0 ? (
        <button
          type="button"
          onClick={() => { setWidth(208); window.localStorage.setItem('nextmd-outline-width', '208'); }}
          title="展开目录（也可以向左拖动）"
          aria-label="展开目录"
          className="absolute right-0 top-3 z-30 flex h-8 w-5 items-center justify-center rounded-l-md border border-r-0 border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] shadow-sm hover:text-[var(--text-primary)]"
        >
          <ChevronLeft size={13} />
        </button>
      ) : <>
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--border-subtle)] px-4 text-xs font-medium text-[var(--text-secondary)]">
          <ListTree size={14} />大纲
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="文档标题">
        {headings.length === 0 ? (
          <p className="px-2 py-2 text-xs leading-5 text-[var(--text-muted)]">添加 Markdown 标题后将在此显示</p>
        ) : headings.map((heading, index) => (
          <button
            key={`${heading.offset}-${index}`}
            type="button"
            onClick={() => jumpToHeading(index)}
            title={heading.text}
            style={{ paddingLeft: `${8 + (heading.level - 1) * 10}px` }}
            className="block w-full truncate rounded-md py-1.5 pr-2 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]"
          >
            {heading.text}
          </button>
        ))}
        </nav>
      </>}
    </aside>
  );
}
