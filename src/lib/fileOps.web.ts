import type { FileHandle } from './fileOps.tauri';

/**
 * Open a file using browser File API.
 */
export function openFile(): Promise<FileHandle | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const content = await file.text();
      resolve({ name: file.name, content });
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Save file using browser download API.
 */
export async function saveFile(
  currentName: string,
  _currentPath: string | undefined,
  content: string
): Promise<{ name: string; path?: string } | null> {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentName || 'untitled.md';
  a.click();
  URL.revokeObjectURL(url);
  return { name: currentName || 'untitled.md' };
}

/**
 * Save file as (browser: same as saveFile since no filesystem access).
 */
export async function saveFileAs(
  currentName: string,
  content: string
): Promise<{ name: string; path?: string } | null> {
  return saveFile(currentName, undefined, content);
}
