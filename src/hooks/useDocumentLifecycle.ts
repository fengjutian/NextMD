import { useEffect } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useEditorStore } from '../stores/editorStore';
import { useFileStore } from '../stores/fileStore';
import { loadDocument, saveDocument } from '../lib/documentActions';
import { openFileByPath } from '../lib/fileOps';
import { isTauri } from '../lib/env';

interface FindControls {
  open: (replace: boolean) => void;
  close: () => void;
}

export function useDocumentLifecycle({ open, close }: FindControls): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const hasFile = !!useFileStore.getState().currentFile;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (mod && key === 's') {
        event.preventDefault();
        void saveDocument(event.shiftKey);
      } else if (hasFile && mod && (key === 'f' || key === 'h')) {
        event.preventDefault();
        open(key === 'h');
      } else if (event.key === 'Escape') {
        close();
      } else if (hasFile && event.key === 'F8') {
        event.preventDefault();
        useEditorStore.getState().toggleFocusMode();
      } else if (hasFile && event.key === 'F9') {
        event.preventDefault();
        useEditorStore.getState().toggleTypewriterMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, close]);

  useEffect(() => {
    const handleUnload = (event: BeforeUnloadEvent) => {
      if (useEditorStore.getState().isModified) event.preventDefault();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  useEffect(() => {
    if (isTauri()) {
      let cancelled = false;
      let unlisten: (() => void) | undefined;
      void getCurrentWebviewWindow().onDragDropEvent(async (event) => {
        if (event.payload.type !== 'drop') return;
        const path = event.payload.paths[0];
        if (!path || !/\.(md|markdown|txt|mdx)$/i.test(path)) return;
        const file = await openFileByPath(path);
        if (file && !cancelled) loadDocument(file);
      }).then((stop) => {
        if (cancelled) stop();
        else unlisten = stop;
      });
      return () => { cancelled = true; unlisten?.(); };
    }

    const handleDragOver = (event: DragEvent) => { event.preventDefault(); event.stopPropagation(); };
    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer?.files?.[0];
      if (!file || !/\.(md|markdown|txt|mdx)$/i.test(file.name)) return;
      loadDocument({ name: file.name, content: await file.text() });
    };
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);
}
