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
import { ToastContainer } from './ToastContainer';
import { saveFile, saveFileAs } from '../../lib/fileOps';
import { isTauri } from '../../lib/env';
import { confirmDiscardChanges } from '../../lib/confirmDiscard';
import { openFileByPath } from '../../lib/fileOps';
import { FindReplace } from '../editor/FindReplace';
import type { Editor } from '@tiptap/react';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [findOpen, setFindOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [richEditor, setRichEditor] = useState<Editor | null>(null);
  const { currentFile, setCurrentFile, addRecentFile } = useFileStore();
  const { viewMode, content, isModified, markSaved } = useEditorStore();

  // Save handler
  const handleSave = useCallback(async () => {
    if (!currentFile) return;
    const result = await saveFile(currentFile.name, currentFile.path, content);
    if (result) {
      if (useFileStore.getState().currentFile !== currentFile) return;
      setCurrentFile({ name: result.name, path: result.path });
      addRecentFile(result.name, result.path);
      if (useFileStore.getState().currentFile?.path === result.path &&
          useEditorStore.getState().content === content) markSaved();
    }
  }, [currentFile, content, setCurrentFile, addRecentFile, markSaved]);

  // Save As handler
  const handleSaveAs = useCallback(async () => {
    const result = await saveFileAs(currentFile?.name || 'untitled.md', content);
    if (result) {
      if (useFileStore.getState().currentFile !== currentFile) return;
      setCurrentFile({ name: result.name, path: result.path });
      addRecentFile(result.name, result.path);
      if (useFileStore.getState().currentFile?.path === result.path &&
          useEditorStore.getState().content === content) markSaved();
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
      if (currentFile && mod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindOpen(true);
        setReplaceOpen(false);
      }
      if (currentFile && mod && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setFindOpen(true);
        setReplaceOpen(true);
      }
      if (e.key === 'Escape' && findOpen) setFindOpen(false);
      if (currentFile && e.key === 'F8') {
        e.preventDefault();
        useEditorStore.getState().toggleFocusMode();
      }
      if (currentFile && e.key === 'F9') {
        e.preventDefault();
        useEditorStore.getState().toggleTypewriterMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleSaveAs, currentFile, findOpen]);

  useEffect(() => {
    const openFind = () => { setFindOpen(true); setReplaceOpen(false); };
    window.addEventListener('nextmd:find', openFind);
    return () => window.removeEventListener('nextmd:find', openFind);
  }, []);

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

  // Drag-and-drop file open
  useEffect(() => {
    if (isTauri()) {
      let unlisten: (() => void) | undefined;
      (async () => {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        unlisten = await getCurrentWebviewWindow().onDragDropEvent(async (event) => {
          if (event.payload.type !== 'drop') return;
          const paths = event.payload.paths;
          if (!paths || paths.length === 0) return;
          const path = paths[0];
          if (!/\.(md|markdown|txt|mdx)$/i.test(path)) return;
          const result = await openFileByPath(path);
          if (result) {
            if (!confirmDiscardChanges()) return;
            setCurrentFile({ name: result.name, path: result.path });
            useEditorStore.getState().setContent(result.content, false);
            addRecentFile(result.name, result.path);
          }
        });
      })();
      return () => { unlisten?.(); };
    }
    // Web/browser drag-drop
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['md', 'markdown', 'txt', 'mdx'].includes(ext)) return;
      const content = await file.text();
      if (!confirmDiscardChanges()) return;
      setCurrentFile({ name: file.name });
      useEditorStore.getState().setContent(content, false);
      addRecentFile(file.name);
    };
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [setCurrentFile, addRecentFile]);

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
        <ToastContainer />
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
        <div className="flex-1 flex flex-col overflow-hidden">
          <FindReplace open={findOpen} replaceOpen={replaceOpen} editor={richEditor}
            onOpen={(replace) => { setFindOpen(true); setReplaceOpen(replace); }}
            onClose={() => setFindOpen(false)} />
          <div className="flex-1 flex overflow-hidden">
          {/* WYSIWYG or Source */}
          {(viewMode === 'wysiwyg' || viewMode === 'source') && (
            <div className="flex-1 overflow-hidden">
              <MdEditor mode={viewMode} onEditorReady={setRichEditor} />
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

        {/* AI Panel */}
        <AIPanel />
      </div>

      <StatusBar />
      <ToastContainer />
    </div>
  );
}
