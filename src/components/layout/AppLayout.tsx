import { useState, useEffect, useCallback } from 'react';
import { Titlebar } from './Titlebar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { WelcomeScreen } from './WelcomeScreen';
import { MdEditor } from '../editor/MdEditor';
import { MdPreview } from '../editor/MdPreview';
import { AIPanel } from '../ai/AIPanel';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { saveFile, saveFileAs } from '../../lib/fileOps';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { currentFile, setCurrentFile, addRecentFile } = useFileStore();
  const { viewMode, content, isModified, markSaved } = useEditorStore();

  // Save handler
  const handleSave = useCallback(async () => {
    if (!currentFile) return;
    const result = await saveFile(currentFile.name, currentFile.path, content);
    if (result) {
      setCurrentFile({ name: result.name, path: result.path });
      addRecentFile(result.name, result.path);
      markSaved();
    }
  }, [currentFile, content, setCurrentFile, addRecentFile, markSaved]);

  // Save As handler
  const handleSaveAs = useCallback(async () => {
    const result = await saveFileAs(currentFile?.name || 'untitled.md', content);
    if (result) {
      setCurrentFile({ name: result.name, path: result.path });
      addRecentFile(result.name, result.path);
      markSaved();
    }
  }, [currentFile, content, setCurrentFile, addRecentFile, markSaved]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAs();
        } else {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleSaveAs]);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isModified) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isModified]);

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

        {/* AI Panel */}
        <AIPanel />
      </div>

      <StatusBar />
    </div>
  );
}
