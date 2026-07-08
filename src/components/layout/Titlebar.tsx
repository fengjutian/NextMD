import { useState } from 'react';
import { Minus, Square, X, FileText, Home } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '../../lib/env';
import { useAIStore } from '../../stores/aiStore';
import { useFileStore } from '../../stores/fileStore';

export function Titlebar() {
  if (!isTauri()) {
    return <BrowserHeader />;
  }
  return <TauriTitlebar />;
}

function TauriTitlebar() {
  const [maximized, setMaximized] = useState(false);
  const { setCurrentFile } = useFileStore();

  const minimize = () => invoke('minimize_window').catch(() => {});
  const maximize = () => invoke('maximize_window').then(() => setMaximized(!maximized)).catch(() => {});
  const close = () => invoke('close_window').catch(() => {});

  return (
    <div className="flex items-center justify-between h-9 px-3 glass shrink-0 titlebar-drag">
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pl-2 titlebar-no-drag">
        <button
          onClick={() => setCurrentFile(null)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors"
          title="首页"
        >
          <Home size={13} />
        </button>
        NextMD
      </div>
      <div className="flex items-center gap-1 titlebar-no-drag">
        <button
          onClick={minimize}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
          title="最小化"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={maximize}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
          title={maximized ? '还原' : '最大化'}
        >
          <Square size={12} />
        </button>
        <button
          onClick={close}
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
