import { useState } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { isTauri } from '../../lib/env';

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isTauri()) return null;

  const handleMinimize = () => { /* Tauri window minimize */ };
  const handleMaximize = () => { setIsMaximized(!isMaximized); };
  const handleClose = () => { /* Tauri window close */ };

  return (
    <div
      className="flex items-center justify-between h-9 px-3 glass shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pl-2">
        NextMD
      </div>

      {/* macOS traffic lights will show natively; Windows controls */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleMinimize}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
        >
          <Square size={12} />
        </button>
        <button
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white text-[var(--text-secondary)]"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
