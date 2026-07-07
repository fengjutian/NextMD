import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile, exists } from '@tauri-apps/plugin-fs';

export interface FileHandle {
  name: string;
  path?: string;
  content: string;
}

/**
 * Open a file using native dialog and read its contents.
 */
export async function openFile(): Promise<FileHandle | null> {
  try {
    const selected = await open({
      title: '打开 Markdown 文件',
      multiple: false,
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'mdx', 'txt'] },
      ],
    });

    if (!selected) return null;

    const path = selected as string;
    const content = await readTextFile(path);
    const name = path.split(/[/\\]/).pop() || 'untitled.md';
    return { name, path, content };
  } catch (err) {
    console.error('打开文件失败:', err);
    return null;
  }
}

/**
 * Save content to a file using native dialog.
 */
export async function saveFile(
  currentName: string,
  currentPath: string | undefined,
  content: string
): Promise<{ name: string; path: string } | null> {
  try {
    let targetPath: string | null = null;

    if (currentPath && (await exists(currentPath).catch(() => false))) {
      targetPath = currentPath;
    } else {
      targetPath = await save({
        title: '保存 Markdown 文件',
        defaultPath: currentName || 'untitled.md',
        filters: [
          { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
        ],
      });
    }

    if (!targetPath) return null;

    await writeTextFile(targetPath, content);
    const name = targetPath.split(/[/\\]/).pop() || 'untitled.md';
    return { name, path: targetPath };
  } catch (err) {
    console.error('保存文件失败:', err);
    return null;
  }
}

/**
 * Save As (always shows dialog).
 */
export async function saveFileAs(
  currentName: string,
  content: string
): Promise<{ name: string; path: string } | null> {
  try {
    const targetPath = await save({
      title: '另存为...',
      defaultPath: currentName || 'untitled.md',
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
      ],
    });

    if (!targetPath) return null;

    await writeTextFile(targetPath, content);
    const name = targetPath.split(/[/\\]/).pop() || 'untitled.md';
    return { name, path: targetPath };
  } catch (err) {
    console.error('另存为失败:', err);
    return null;
  }
}
