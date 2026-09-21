import { useEffect } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useEditorStore } from '../stores/editorStore';
import { useFileStore } from '../stores/fileStore';
import { loadDocument, refreshCurrentDocument, saveDocument } from '../lib/documentActions';
import { openFileByPath } from '../lib/fileOps';
import { isTauri } from '../lib/env';
import { watch } from '@tauri-apps/plugin-fs';
import { useToastStore } from '../stores/toastStore';

interface FindControls {
  open: (replace: boolean) => void;
  close: () => void;
}

export function useDocumentLifecycle({ open, close }: FindControls): void {
  const currentPath = useFileStore((state) => state.currentFile?.path);
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
      } else if (hasFile && event.key === 'F5') {
        event.preventDefault();
        void refreshCurrentDocument();
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
    if (!isTauri() || !currentPath) return;
    let cancelled = false;
    let unwatch: (() => void) | undefined;
    let lastDiskContent: string | null = null;
    let activeToastId: string | null = null;
    let reading = false;

    const readCurrentFile = async () => {
      const file = await openFileByPath(currentPath);
      return file?.content ?? null;
    };

    void readCurrentFile().then((content) => { lastDiskContent = content; });
    void watch(currentPath, async () => {
      if (cancelled || reading) return;
      reading = true;
      try {
        const diskContent = await readCurrentFile();
        if (cancelled || diskContent === lastDiskContent) return;
        lastDiskContent = diskContent;
        const toast = useToastStore.getState();
        if (activeToastId) toast.dismiss(activeToastId);

        if (diskContent === null) {
          activeToastId = toast.show('error', '当前文件已被移动或删除。', 0);
          return;
        }
        if (diskContent === useEditorStore.getState().getCurrentContent()) return;

        const modified = useEditorStore.getState().isModified;
        activeToastId = toast.show(
          'info',
          modified ? '原始文件已发生变化。刷新将覆盖当前未保存内容。' : '原始文件已发生变化，是否刷新？',
          0,
          [{
            label: '刷新',
            onClick: async () => {
              const file = await openFileByPath(currentPath);
              if (file && useFileStore.getState().currentFile?.path === currentPath && loadDocument(file)) {
                lastDiskContent = file.content;
              }
            },
          }],
        );
      } finally {
        reading = false;
      }
    }, { delayMs: 300 }).then((stop) => {
      if (cancelled) stop();
      else unwatch = stop;
    }).catch((error: unknown) => console.error('文件变更监听失败:', error));

    return () => {
      cancelled = true;
      unwatch?.();
      if (activeToastId) useToastStore.getState().dismiss(activeToastId);
    };
  }, [currentPath]);

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
      }).catch((error: unknown) => console.error('文件拖入监听失败:', error));
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
