import type { Editor } from '@tiptap/react';
import { ChevronRight, ListTree } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { getOutline } from '../../lib/outline';
import { navigateSourceEditor, SOURCE_EDITOR_VIEWPORT } from '../../lib/sourceEditorEvents';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[data-outline-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    if (viewMode !== 'wysiwyg' || !editor) return;
    const scrollArea = editor.view.dom.closest<HTMLElement>('.overflow-y-auto');
    if (!scrollArea) return;
    let frame = 0;
    const updateActiveHeading = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = scrollArea.getBoundingClientRect().top + 96;
        const elements = [...editor.view.dom.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')];
        let next = 0;
        for (let index = 0; index < elements.length; index++) {
          if (elements[index].getBoundingClientRect().top <= top) next = index;
          else break;
        }
        setActiveIndex(next);
      });
    };
    updateActiveHeading();
    scrollArea.addEventListener('scroll', updateActiveHeading, { passive: true });
    editor.on('update', updateActiveHeading);
    return () => {
      cancelAnimationFrame(frame);
      scrollArea.removeEventListener('scroll', updateActiveHeading);
      editor.off('update', updateActiveHeading);
    };
  }, [editor, viewMode]);

  useEffect(() => {
    if (viewMode === 'wysiwyg') return;
    const updateFromSource = (event: Event) => {
      const offset = (event as CustomEvent<{ offset: number }>).detail.offset;
      let next = 0;
      for (let index = 0; index < headings.length; index++) {
        if (headings[index].offset <= offset) next = index;
        else break;
      }
      setActiveIndex(next);
    };
    window.addEventListener(SOURCE_EDITOR_VIEWPORT, updateFromSource);
    return () => window.removeEventListener(SOURCE_EDITOR_VIEWPORT, updateFromSource);
  }, [headings, viewMode]);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const resize = (moveEvent: PointerEvent) => {
      const candidate = Math.max(0, Math.min(420, startWidth + moveEvent.clientX - startX));
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
    setActiveIndex(index);
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
      className={`relative hidden xl:flex shrink-0 flex-col bg-[var(--bg-editor)] ${width ? 'border-r border-[var(--border-subtle)]' : ''}`}
    >
      <div
        role="separator"
        aria-label="调整目录宽度"
        aria-orientation="vertical"
        onPointerDown={startResize}
        onDoubleClick={() => { setWidth(208); window.localStorage.setItem('nextmd-outline-width', '208'); }}
        className="absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize touch-none hover:bg-[var(--accent-muted)]"
      />
      {width === 0 ? (
        <button
          type="button"
          onClick={() => { setWidth(208); window.localStorage.setItem('nextmd-outline-width', '208'); }}
          title="展开大纲（也可以向右拖动）"
          aria-label="展开目录"
          className="absolute left-0 top-3 z-30 flex h-8 w-5 items-center justify-center rounded-r-md border border-l-0 border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] shadow-sm hover:text-[var(--text-primary)]"
        >
          <ChevronRight size={13} />
        </button>
      ) : <>
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--border-subtle)] px-4 text-xs font-medium text-[var(--text-secondary)]">
          <ListTree size={14} />大纲
        </div>
        <nav ref={navRef} className="flex-1 overflow-y-auto px-2 py-3" aria-label="文档标题">
        {headings.length === 0 ? (
          <p className="px-2 py-2 text-xs leading-5 text-[var(--text-muted)]">添加 Markdown 标题后将在此显示</p>
        ) : headings.map((heading, index) => (
          <button
            key={`${heading.offset}-${index}`}
            type="button"
            onClick={() => jumpToHeading(index)}
            title={heading.text}
            data-outline-active={activeIndex === index}
            style={{ paddingLeft: `${8 + (heading.level - 1) * 10}px` }}
            className={`block w-full truncate rounded-md border-l-2 py-1.5 pr-2 text-left text-xs transition-colors ${activeIndex === index
              ? 'border-[var(--accent)] bg-[var(--accent-muted)] font-medium text-[var(--text-primary)]'
              : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]'}`}
          >
            {heading.text}
          </button>
        ))}
        </nav>
      </>}
    </aside>
  );
}
