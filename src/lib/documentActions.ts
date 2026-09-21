import { useEditorStore } from '../stores/editorStore';
import { useFileStore } from '../stores/fileStore';
import { confirmDiscardChanges } from './confirmDiscard';
import { openFile, openFileByPath, saveFile, saveFileAs, type FileHandle } from './fileOps';

let documentEpoch = 0;

export function loadDocument(file: FileHandle): boolean {
  if (!confirmDiscardChanges()) return false;
  documentEpoch++;
  const files = useFileStore.getState();
  files.setCurrentFile({ name: file.name, path: file.path });
  useEditorStore.getState().setContent(file.content, false);
  if (file.path) files.addRecentFile(file.name, file.path);
  return true;
}

export function newDocument(content = ''): boolean {
  if (!confirmDiscardChanges()) return false;
  documentEpoch++;
  useFileStore.getState().setCurrentFile({ name: '未命名.md' });
  useEditorStore.getState().setContent(content, content.length > 0);
  return true;
}

export function closeDocument(): boolean {
  if (!confirmDiscardChanges()) return false;
  documentEpoch++;
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

export async function refreshCurrentDocument(): Promise<boolean> {
  const path = useFileStore.getState().currentFile?.path;
  if (!path) return false;
  const file = await openFileByPath(path);
  return file ? loadDocument(file) : false;
}

let saveTail: Promise<void> = Promise.resolve();

export async function saveDocument(saveAs = false): Promise<boolean> {
  if (!useFileStore.getState().currentFile) return false;
  const requestedEpoch = documentEpoch;
  const previous = saveTail;
  let release = () => {};
  saveTail = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    const file = useFileStore.getState().currentFile;
    if (!file || documentEpoch !== requestedEpoch) return false;
    const content = useEditorStore.getState().getCurrentContent();
    const result = saveAs
      ? await saveFileAs(file.name, content)
      : await saveFile(file.name, file.path, content);
    if (!result || documentEpoch !== requestedEpoch) return false;
    const files = useFileStore.getState();
    files.setCurrentFile({ name: result.name, path: result.path });
    files.addRecentFile(result.name, result.path);
    if (useEditorStore.getState().getCurrentContent() === content) {
      useEditorStore.getState().setContent(content, false);
    }
    return true;
  } finally {
    release();
  }
}
