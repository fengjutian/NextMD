import { useState, useEffect } from 'react';
import { Minus, Square, X, FileText } from 'lucide-react';
import { isTauri } from '../../lib/env';
import { useAIStore } from '../../stores/aiStore';

// Tauri window API — only imported when in Tauri
let tauriWindow: {
  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
} | null = null;

async function getTauriWindow() {
  if (!tauriWindow && isTauri()) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    tauriWindow = {
      minimize: () => win.minimize(),
      toggleMaximize: () => win.toggleMaximize(),
      close: () => win.close(),
      isMaximized: () => win.isMaximized(),
    };
  }
  return tauriWindow;
}

export function Titlebar() {
  if (!isTauri()) {
    return <BrowserHeader />;
  }
  return <TauriTitlebar />;
}

function TauriTitlebar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    getTauriWindow().then((win) => {
      if (win) win.isMaximized().then(setMaximized);
    });
  }, []);

  return (
    <div
      className="flex items-center justify-between h-9 px-3 glass shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pl-2">
        NextMD
      </div>
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => getTauriWindow().then((w) => w?.minimize())}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
          title="最小化"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => getTauriWindow().then(async (w) => {
            if (!w) return;
            await w.toggleMaximize();
            setMaximized(await w.isMaximized());
          })}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
          title={maximized ? '还原' : '最大化'}
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => getTauriWindow().then((w) => w?.close())}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white text-[var(--text-secondary)]"
          title="关闭"
        >
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
      </div>
    </header>
  );
}
