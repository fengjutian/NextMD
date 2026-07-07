import { useState } from 'react';
import { Titlebar } from './Titlebar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { WelcomeScreen } from './WelcomeScreen';
import { useFileStore } from '../../stores/fileStore';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentFile } = useFileStore();

  return (
    <div className="flex flex-col h-full bg-[var(--bg-window)]">
      <Titlebar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {currentFile ? (
            <div className="flex-1 flex items-center justify-center bg-[var(--bg-editor)]">
              {/* Placeholder: TipTap editor coming in Phase 2 */}
              <div className="text-center">
                <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">
                  编辑器 — Phase 2
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  正在编辑: {currentFile.name}
                </p>
              </div>
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </main>
      </div>

      <StatusBar />
    </div>
  );
}
