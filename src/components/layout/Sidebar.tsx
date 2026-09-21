import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFileStore } from '../../stores/fileStore';
import { useThemeStore } from '../../stores/themeStore';
import { FileSection, ThemeSwitcher } from './SidebarSections';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const recentFiles = useFileStore((state) => state.recentFiles);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <>
      {collapsed && (
        <button
          onClick={onToggle}
          className="shrink-0 w-8 h-full flex items-start justify-center pt-2 bg-[var(--bg-editor)] hover:bg-[var(--border-subtle)] transition-colors"
          title="展开侧边栏"
        >
          <PanelLeftOpen size={14} className="text-[var(--text-muted)]" />
        </button>
      )}

      <aside
        className={cn(
          'flex flex-col h-full bg-[var(--bg-editor)] transition-all duration-300 ease-out shrink-0',
          'border-r border-[var(--border-subtle)]',
          collapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-[240px] opacity-100'
        )}
      >
        <div className="flex items-center justify-between px-4 h-10 shrink-0">
          <div className="text-xs font-medium text-[var(--text-primary)]">文件</div>
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>

        <FileSection recentFiles={recentFiles} />
        <ThemeSwitcher theme={theme} onChange={setTheme} />
      </aside>
    </>
  );
}
