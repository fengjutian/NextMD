import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeStore } from '../../stores/themeStore';
import { getOutline, type OutlineHeading } from '../../lib/outline';
import { FileSection, OutlineSection, ThemeSwitcher } from './SidebarSections';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { currentFile, recentFiles } = useFileStore();
  const { content, viewMode } = useEditorStore();
  const { theme, setTheme } = useThemeStore();
  const [section, setSection] = useState<'files' | 'outline'>('files');
  const headings = currentFile && section === 'outline' ? getOutline(content) : [];

  const jumpToHeading = (heading: OutlineHeading, index: number) => {
    if (viewMode === 'wysiwyg') {
      const element = document.querySelectorAll('.tiptap.editor-area h1, .tiptap.editor-area h2, .tiptap.editor-area h3, .tiptap.editor-area h4, .tiptap.editor-area h5, .tiptap.editor-area h6')[index];
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea.editor-area');
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(heading.offset, heading.offset);
    const line = content.slice(0, heading.offset).split('\n').length - 1;
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24;
    textarea.scrollTop = Math.max(0, line * lineHeight - textarea.clientHeight / 3);
  };

  return (
    <>
      {collapsed && (
        <button
          onClick={onToggle}
          className="shrink-0 w-8 h-full flex items-start justify-center pt-2 hover:bg-[var(--border-subtle)] transition-colors"
          title="展开侧边栏"
        >
          <PanelLeftOpen size={14} className="text-[var(--text-muted)]" />
        </button>
      )}

      <aside
        className={cn(
          'flex flex-col h-full glass transition-all duration-300 ease-out shrink-0',
          'border-r border-[var(--border-subtle)]',
          collapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-[240px] opacity-100'
        )}
      >
        <div className="flex items-center justify-between px-4 h-10 shrink-0">
          <div className="flex items-center gap-3 text-xs font-medium">
            <button onClick={() => setSection('files')} className={section === 'files' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>文件</button>
            {currentFile && <button onClick={() => setSection('outline')} className={section === 'outline' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>大纲</button>}
          </div>
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>

        {section === 'outline' && currentFile
          ? <OutlineSection headings={headings} onSelect={jumpToHeading} />
          : <FileSection recentFiles={recentFiles} />}
        <ThemeSwitcher theme={theme} onChange={setTheme} />
      </aside>
    </>
  );
}
