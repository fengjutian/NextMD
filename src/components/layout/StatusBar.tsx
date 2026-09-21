import { Eye, Braces, Columns2, Focus, AlignCenterVertical, Download, Search } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { useToastStore } from '../../stores/toastStore';
import { exportHtml } from '../../lib/exportHtml';
import { useEditorStore, type ViewMode } from '../../stores/editorStore';
import { AISettings } from '../ai/AISettings';
import { cn } from '../../lib/utils';

const MODES: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'wysiwyg', icon: <Eye size={12} />, label: '所见即所得' },
  { mode: 'source', icon: <Braces size={12} />, label: '源码' },
  { mode: 'split', icon: <Columns2 size={12} />, label: '分屏' },
];

export function StatusBar() {
  const { viewMode, setViewMode, isModified, content, focusMode, toggleFocusMode, typewriterMode, toggleTypewriterMode } = useEditorStore();
  const currentFile = useFileStore((state) => state.currentFile);
  const showToast = useToastStore((state) => state.show);
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
  const lineCount = content ? content.split('\n').length : 0;

  const handleExportHtml = async () => {
    if (!currentFile) return;
    try {
      if (await exportHtml(content, currentFile.name)) showToast('success', 'HTML 导出完成');
    } catch (error) {
      showToast('error', `HTML 导出失败：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="flex items-center justify-between h-7 px-4 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] glass shrink-0">
      <div className="flex items-center gap-0.5">
        {MODES.map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            title={label}
            className={cn(
              'w-6 h-5 flex items-center justify-center rounded transition-colors',
              viewMode === mode ? 'text-[var(--text-primary)]' : 'hover:text-[var(--text-secondary)]'
            )}
          >
            {icon}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {currentFile && <button onClick={() => window.dispatchEvent(new Event('nextmd:find'))}
          title="查找 (Ctrl+F)" aria-label="查找" className="rounded px-1 py-0.5 hover:text-[var(--text-primary)]">
          <Search size={12} />
        </button>}
        {currentFile && <button onClick={handleExportHtml} title="导出 HTML" aria-label="导出 HTML"
          className="flex items-center gap-1 rounded px-1 py-0.5 hover:text-[var(--text-primary)]">
          <Download size={12} /><span>HTML</span>
        </button>}
        <button onClick={toggleFocusMode} title="专注模式 (F8，仅所见即所得)" aria-label="切换专注模式"
          className={cn('flex items-center gap-1 rounded px-1 py-0.5', focusMode && viewMode === 'wysiwyg' ? 'text-[var(--accent)]' : 'hover:text-[var(--text-primary)]')}>
          <Focus size={12} /><span>专注</span>
        </button>
        <button onClick={toggleTypewriterMode} title="打字机模式 (F9，仅所见即所得)" aria-label="切换打字机模式"
          className={cn('flex items-center gap-1 rounded px-1 py-0.5', typewriterMode && viewMode === 'wysiwyg' ? 'text-[var(--accent)]' : 'hover:text-[var(--text-primary)]')}>
          <AlignCenterVertical size={12} /><span>打字机</span>
        </button>
        <span>字数 {wordCount}</span>
        <span>行 {lineCount}</span>
        {isModified && <span className="text-[var(--accent)]">● 未保存</span>}
        <AISettings triggerClass="flex items-center gap-1 px-1 py-0.5 rounded hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer" />
      </div>
    </div>
  );
}
