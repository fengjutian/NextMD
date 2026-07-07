import type { FileHandle } from './fileOps.tauri';

/**
 * In the browser, we cannot read files by path (security restriction).
 * Returns null so callers can fall back to the file picker.
 */
export async function openFileByPath(_filePath: string): Promise<FileHandle | null> {
  return null;
}

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
    // Fallback for browsers without cancel detection
    const onFocus = () => {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!input.files?.length) {
          resolve(null);
        }
      }, 300);
    };
    window.addEventListener('focus', onFocus);
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

export async function saveFileAs(
  currentName: string,
  content: string
): Promise<{ name: string; path?: string } | null> {
  return saveFile(currentName, undefined, content);
}
