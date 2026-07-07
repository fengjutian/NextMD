import { FileText, FolderOpen, Clock, Settings, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFileStore } from '../../stores/fileStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { recentFiles, setCurrentFile } = useFileStore();

  return (
    <aside
      className={cn(
        'flex flex-col h-full glass transition-all duration-300 ease-out shrink-0',
        'border-r border-[var(--border-subtle)]',
        collapsed ? 'w-0 overflow-hidden border-none' : 'w-[240px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 shrink-0">
        <span className="text-xs font-medium text-[var(--text-secondary)] tracking-wide">
          文件
        </span>
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-3 py-2 space-y-1">
        <SidebarButton icon={<FileText size={16} />} label="新建文档" />
        <SidebarButton icon={<FolderOpen size={16} />} label="打开文件..." />
      </div>

      {/* Recent files */}
      {recentFiles.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            <Clock size={12} className="inline mr-1.5" />
            最近文件
          </div>
          <div className="px-2">
            {recentFiles.map((f) => (
              <button
                key={f.name}
                onClick={() => setCurrentFile({ name: f.name, path: f.path })}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors truncate"
              >
                <FileText size={14} className="inline mr-2 text-[var(--text-muted)]" />
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-2 py-2 border-t border-[var(--border-subtle)] shrink-0">
        <SidebarButton icon={<Settings size={16} />} label="设置" />
      </div>
    </aside>
  );
}

function SidebarButton({ icon, label, onClick }: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
