import { Clock, FileText, FolderOpen, ListTree, Monitor, Moon, Sun } from 'lucide-react';
import { newDocument, openDocument, openRecentDocument } from '../../lib/documentActions';
import type { OutlineHeading } from '../../lib/outline';
import type { ThemeMode } from '../../stores/themeStore';
import type { RecentFile } from '../../stores/fileStore';
import { cn } from '../../lib/utils';

export function FileSection({ recentFiles }: { recentFiles: RecentFile[] }) {
  const files = recentFiles.filter((file) => file.path);
  return <>
    <div className="px-3 py-2 space-y-1">
      <SidebarButton icon={<FileText size={16} />} label="新建文档" onClick={() => newDocument()} />
      <SidebarButton icon={<FolderOpen size={16} />} label="打开文件..." onClick={() => { void openDocument(); }} />
    </div>
    {files.length > 0 && <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-2 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
        <Clock size={12} className="inline mr-1.5" />最近文件
      </div>
      <div className="px-2">{files.map((file) => (
        <button key={file.path} onClick={() => { void openRecentDocument(file.path); }}
          className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors truncate">
          <FileText size={14} className="inline mr-2 text-[var(--text-muted)]" />{file.name}
        </button>
      ))}</div>
    </div>}
    <div className="flex-1" />
  </>;
}

export function OutlineSection({ headings, onSelect }: { headings: OutlineHeading[]; onSelect: (heading: OutlineHeading, index: number) => void }) {
  return <div className="flex-1 overflow-y-auto px-2 py-2">
    {headings.length === 0 ? <p className="px-3 py-3 text-xs text-[var(--text-muted)]">添加 Markdown 标题后会在此显示大纲</p>
      : headings.map((heading, index) => (
        <button key={`${heading.offset}-${index}`} onClick={() => onSelect(heading, index)} title={heading.text}
          style={{ paddingLeft: `${8 + (heading.level - 1) * 12}px` }}
          className="w-full flex items-center gap-2 py-1.5 pr-2 rounded-lg text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]">
          <ListTree size={12} className="shrink-0" /><span className="truncate">{heading.text}</span>
        </button>
      ))}
  </div>;
}

export function ThemeSwitcher({ theme, onChange }: { theme: ThemeMode; onChange: (theme: ThemeMode) => void }) {
  const options = [
    { value: 'light' as const, icon: <Sun size={13} />, label: '亮色' },
    { value: 'dark' as const, icon: <Moon size={13} />, label: '暗色' },
    { value: 'system' as const, icon: <Monitor size={13} />, label: '自动' },
  ];
  return <div className="px-2 py-2 border-t border-[var(--border-subtle)] shrink-0">
    <div className="flex items-center gap-0.5 p-0.5 bg-[var(--border-subtle)] rounded-lg">
      {options.map(({ value, icon, label }) => <button key={value} onClick={() => onChange(value)} title={label}
        className={cn('flex-1 flex items-center justify-center h-7 rounded-md transition-colors',
          theme === value ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>
        {icon}
      </button>)}
    </div>
  </div>;
}

function SidebarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick}
    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors">
    {icon}{label}
  </button>;
}
