import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Titlebar } from './Titlebar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { WelcomeScreen } from './WelcomeScreen';
import { ToastContainer } from './ToastContainer';
import { MdEditor } from '../editor/MdEditor';
import { FindReplace } from '../editor/FindReplace';
import { AIPanel } from '../ai/AIPanel';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { useDocumentLifecycle } from '../../hooks/useDocumentLifecycle';

const MdPreview = lazy(() => import('../editor/MdPreview').then((module) => ({ default: module.MdPreview })));

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [findOpen, setFindOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [richEditor, setRichEditor] = useState<Editor | null>(null);
  const currentFile = useFileStore((state) => state.currentFile);
  const viewMode = useEditorStore((state) => state.viewMode);

  const openFind = useCallback((replace: boolean) => {
    setFindOpen(true);
    setReplaceOpen(replace);
  }, []);
  const closeFind = useCallback(() => setFindOpen(false), []);
  useDocumentLifecycle({ open: openFind, close: closeFind });

  useEffect(() => {
    const handler = () => openFind(false);
    window.addEventListener('nextmd:find', handler);
    return () => window.removeEventListener('nextmd:find', handler);
  }, [openFind]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-window)]">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
        {!currentFile ? <WelcomeScreen /> : (
          <>
            <div className="flex-1 flex flex-col overflow-hidden">
              <FindReplace open={findOpen} replaceOpen={replaceOpen} editor={richEditor}
                onOpen={openFind} onClose={closeFind} />
              <div className="flex-1 flex overflow-hidden">
                {viewMode === 'split' ? (
                  <>
                    <div className="flex-1 border-r border-[var(--border-subtle)] overflow-hidden">
                      <MdEditor mode="source" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <Suspense fallback={<div className="h-full bg-[var(--bg-preview)]" />}><MdPreview /></Suspense>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 overflow-hidden">
                    <MdEditor mode={viewMode} onEditorReady={setRichEditor} />
                  </div>
                )}
              </div>
            </div>
            <AIPanel editor={richEditor} />
          </>
        )}
      </div>
      <StatusBar />
      <ToastContainer />
    </div>
  );
}
