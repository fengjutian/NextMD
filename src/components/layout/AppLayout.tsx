import { useState } from 'react';
import { Titlebar } from './Titlebar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { WelcomeScreen } from './WelcomeScreen';
import { Toolbar } from '../editor/Toolbar';
import { MdEditor } from '../editor/MdEditor';
import { MdPreview } from '../editor/MdPreview';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentFile } = useFileStore();
  const { viewMode } = useEditorStore();

  // No file open: show welcome
  if (!currentFile) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-window)]">
        <Titlebar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <WelcomeScreen />
        </div>
        <StatusBar />
      </div>
    );
  }

  // File open: show editor
  return (
    <div className="flex flex-col h-full bg-[var(--bg-window)]">
      <Titlebar />
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Editor area */}
        <div className="flex-1 flex overflow-hidden">
          {/* WYSIWYG or Source */}
          {(viewMode === 'wysiwyg' || viewMode === 'source') && (
            <div className="flex-1 overflow-hidden">
              <MdEditor mode={viewMode} />
            </div>
          )}

          {/* Split: source + preview side by side */}
          {viewMode === 'split' && (
            <>
              <div className="flex-1 border-r border-[var(--border-subtle)] overflow-hidden">
                <MdEditor mode="source" />
              </div>
              <div className="flex-1 overflow-hidden">
                <MdPreview />
              </div>
            </>
          )}
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
