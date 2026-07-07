import { FileText, FolderOpen, Clock, ChevronLeft, ChevronRight, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeStore } from '../../stores/themeStore';
import { openFile, openFileByPath } from '../../lib/fileOps';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { recentFiles, setCurrentFile, addRecentFile } = useFileStore();
  const { setContent } = useEditorStore();
  const { theme, setTheme } = useThemeStore();

  const handleOpenFile = async () => {
    const result = await openFile();
    if (!result) return;
    setCurrentFile({ name: result.name, path: result.path });
    setContent(result.content, false);
    addRecentFile(result.name, result.path);
  };

  const handleOpenRecentFile = async (filePath?: string) => {
    const result = filePath ? await openFileByPath(filePath) : null;
    if (result) {
      setCurrentFile({ name: result.name, path: result.path });
      setContent(result.content, false);
      addRecentFile(result.name, result.path);
      return;
    }
    handleOpenFile();
  };

  const handleNewFile = () => {
    setCurrentFile({ name: '未命名.md' });
    setContent('', false);
    addRecentFile('未命名.md', undefined);
  };

  return (
    <>
      {collapsed && (
        <button
          onClick={onToggle}
          className="shrink-0 w-8 h-full flex items-start justify-center pt-2 hover:bg-[var(--border-subtle)] transition-colors"
          title="展开侧边栏"
        >
          <ChevronRight size={14} className="text-[var(--text-muted)]" />
        </button>
      )}

      <aside
        className={cn(
          'flex flex-col h-full glass transition-all duration-300 ease-out shrink-0',
          'border-r border-[var(--border-subtle)]',
          collapsed ? 'w-0 overflow-hidden border-none' : 'w-[240px]'
        )}
      >
        <div className="flex items-center justify-between px-4 h-10 shrink-0">
          <span className="text-xs font-medium text-[var(--text-secondary)] tracking-wide">文件</span>
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
          >
            <ChevronLeft size={14} />
          </button>
        </div>

        <div className="px-3 py-2 space-y-1">
          <SidebarButton icon={<FileText size={16} />} label="新建文档" onClick={handleNewFile} />
          <SidebarButton icon={<FolderOpen size={16} />} label="打开文件..." onClick={handleOpenFile} />
        </div>

        {recentFiles.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
              <Clock size={12} className="inline mr-1.5" />最近文件
            </div>
            <div className="px-2">
              {recentFiles.map((f) => (
                <button
                  key={f.name + f.lastOpened}
                  onClick={() => handleOpenRecentFile(f.path)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors truncate"
                >
                  <FileText size={14} className="inline mr-2 text-[var(--text-muted)]" />{f.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
