import { useState } from 'react';
import { Minus, Square, X, FileText } from 'lucide-react';
import { isTauri } from '../../lib/env';
import { useAIStore } from '../../stores/aiStore';

export function Titlebar() {
  if (!isTauri()) {
    return <BrowserHeader />;
  }
  return <TauriTitlebar />;
}

function TauriTitlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div
      className="flex items-center justify-between h-9 px-3 glass shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pl-2">
        NextMD
      </div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
        >
          <Minus size={14} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]">
          <Square size={12} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white text-[var(--text-secondary)]">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function BrowserHeader() {
  const { isPanelOpen, togglePanel } = useAIStore();

  return (
    <header className="flex items-center justify-between h-10 px-4 shrink-0 border-b border-[var(--border-subtle)] glass">
      <div className="flex items-center gap-3">
        <FileText size={18} className="text-[var(--accent)]" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">NextMD</span>
        <span className="text-[11px] text-[var(--text-muted)]">Markdown 编辑器</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={togglePanel}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {isPanelOpen ? '关闭 AI' : 'AI 助手'}
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
