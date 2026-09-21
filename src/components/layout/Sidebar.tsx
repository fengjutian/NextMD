import { FileText, FolderOpen, Clock, PanelLeftOpen, PanelLeftClose, Sun, Moon, Monitor, ListTree } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeStore } from '../../stores/themeStore';
import { newDocument, openDocument, openRecentDocument } from '../../lib/documentActions';
import { getOutline, type OutlineHeading } from '../../lib/outline';

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

        {section === 'outline' && currentFile ? (
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {headings.length === 0 ? (
              <p className="px-3 py-3 text-xs text-[var(--text-muted)]">添加 Markdown 标题后会在此显示大纲</p>
            ) : headings.map((heading, index) => (
              <button key={`${heading.offset}-${index}`} onClick={() => jumpToHeading(heading, index)}
                title={heading.text}
                style={{ paddingLeft: `${8 + (heading.level - 1) * 12}px` }}
                className="w-full flex items-center gap-2 py-1.5 pr-2 rounded-lg text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]">
                <ListTree size={12} className="shrink-0" /><span className="truncate">{heading.text}</span>
              </button>
            ))}
          </div>
        ) : <>
        <div className="px-3 py-2 space-y-1">
          <SidebarButton icon={<FileText size={16} />} label="新建文档" onClick={() => newDocument()} />
          <SidebarButton icon={<FolderOpen size={16} />} label="打开文件..." onClick={() => { void openDocument(); }} />
        </div>

        {recentFiles.filter((f) => f.path).length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
              <Clock size={12} className="inline mr-1.5" />最近文件
            </div>
            <div className="px-2">
              {recentFiles.filter((f) => f.path).map((f) => (
                <button
                  key={f.name + f.lastOpened}
                  onClick={() => { void openRecentDocument(f.path); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors truncate"
                >
                  <FileText size={14} className="inline mr-2 text-[var(--text-muted)]" />{f.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1" />
        </>}

        <div className="px-2 py-2 border-t border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-0.5 p-0.5 bg-[var(--border-subtle)] rounded-lg">
            {([
              { value: 'light' as const, icon: <Sun size={13} />, label: '亮色' },
              { value: 'dark' as const, icon: <Moon size={13} />, label: '暗色' },
              { value: 'system' as const, icon: <Monitor size={13} />, label: '自动' },
            ]).map(({ value, icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={cn(
                  'flex-1 flex items-center justify-center h-7 rounded-md transition-colors',
                  theme === value
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarButton({ icon, label, onClick }: {
  icon: React.ReactNode; label: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors"
    >
      {icon}{label}
    </button>
  );
}
