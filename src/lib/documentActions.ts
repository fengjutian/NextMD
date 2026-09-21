import { useEditorStore } from '../stores/editorStore';
import { useFileStore } from '../stores/fileStore';
import { confirmDiscardChanges } from './confirmDiscard';
import { openFile, openFileByPath, saveFile, saveFileAs, type FileHandle } from './fileOps';

export function loadDocument(file: FileHandle): boolean {
  if (!confirmDiscardChanges()) return false;
  const files = useFileStore.getState();
  files.setCurrentFile({ name: file.name, path: file.path });
  useEditorStore.getState().setContent(file.content, false);
  if (file.path) files.addRecentFile(file.name, file.path);
  return true;
}

export function newDocument(content = ''): boolean {
  if (!confirmDiscardChanges()) return false;
  useFileStore.getState().setCurrentFile({ name: '未命名.md' });
  useEditorStore.getState().setContent(content, content.length > 0);
  return true;
}

export function closeDocument(): boolean {
  if (!confirmDiscardChanges()) return false;
  useFileStore.getState().setCurrentFile(null);
  useEditorStore.getState().setContent('', false);
  return true;
}

export async function openDocument(): Promise<boolean> {
  const file = await openFile();
  return file ? loadDocument(file) : false;
}

export async function openRecentDocument(path?: string): Promise<boolean> {
  const file = path ? await openFileByPath(path) : null;
  return file ? loadDocument(file) : openDocument();
}

export async function saveDocument(saveAs = false): Promise<boolean> {
  const file = useFileStore.getState().currentFile;
  if (!file && !saveAs) return false;
  const content = useEditorStore.getState().content;
  const result = saveAs
    ? await saveFileAs(file?.name || 'untitled.md', content)
    : await saveFile(file!.name, file!.path, content);
  if (!result || useFileStore.getState().currentFile !== file) return false;
  const files = useFileStore.getState();
  files.setCurrentFile({ name: result.name, path: result.path });
  files.addRecentFile(result.name, result.path);
  if (useEditorStore.getState().content === content) useEditorStore.getState().markSaved();
  return true;
}
