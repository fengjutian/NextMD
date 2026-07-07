import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile, exists } from '@tauri-apps/plugin-fs';

export interface FileHandle {
  name: string;
  path?: string;
  content: string;
}

/**
 * Open a file using native dialog and read its contents.
 * Tauri-only implementation.
 */
export async function openFile(): Promise<FileHandle | null> {
  const selected = await open({
    title: '打开 Markdown 文件',
    multiple: false,
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown', 'mdx', 'txt'],
      },
    ],
  });

  if (!selected) return null;

  // selected is the file path string
  const path = selected as string;
  const content = await readTextFile(path);

  // Extract filename from path
  const name = path.split(/[/\\]/).pop() || 'untitled.md';

  return { name, path, content };
}

/**
 * Save content to a file using native dialog.
 * Returns the saved file path, or null if cancelled.
 */
export async function saveFile(
  currentName: string,
  currentPath: string | undefined,
  content: string
): Promise<{ name: string; path: string } | null> {
  let targetPath: string | null = null;

  if (currentPath && (await exists(currentPath))) {
    // File already has a path, save directly
    targetPath = currentPath;
  } else {
    // New file or path unknown, show save dialog
    targetPath = await save({
      title: '保存 Markdown 文件',
      defaultPath: currentName || 'untitled.md',
      filters: [
        {
          name: 'Markdown',
          extensions: ['md', 'markdown', 'txt'],
        },
      ],
    });
  }

  if (!targetPath) return null;

  await writeTextFile(targetPath, content);

  const name = targetPath.split(/[/\\]/).pop() || 'untitled.md';
  return { name, path: targetPath };
}

/**
 * Save content directly to a known path (no dialog).
 * Used for "Save As" functionality.
 */
export async function saveFileAs(
  currentName: string,
  content: string
): Promise<{ name: string; path: string } | null> {
  const targetPath = await save({
    title: '另存为...',
    defaultPath: currentName || 'untitled.md',
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown', 'txt'],
      },
    ],
  });

  if (!targetPath) return null;

  await writeTextFile(targetPath, content);

  const name = targetPath.split(/[/\\]/).pop() || 'untitled.md';
  return { name, path: targetPath };
}
