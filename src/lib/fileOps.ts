import { isTauri } from './env';
import type { FileHandle } from './fileOps.tauri';

export type { FileHandle };

type FileOpsModule = {
  openFile: () => Promise<FileHandle | null>;
  saveFile: (currentName: string, currentPath: string | undefined, content: string) => Promise<{ name: string; path?: string } | null>;
  saveFileAs: (currentName: string, content: string) => Promise<{ name: string; path?: string } | null>;
};

let _ops: FileOpsModule | null = null;

async function getOps(): Promise<FileOpsModule> {
  if (!_ops) {
    if (isTauri()) {
      _ops = await import('./fileOps.tauri');
    } else {
      _ops = await import('./fileOps.web');
    }
  }
  return _ops;
}

export async function openFile(): Promise<FileHandle | null> {
  return (await getOps()).openFile();
}

export async function saveFile(
  currentName: string,
  currentPath: string | undefined,
  content: string
): Promise<{ name: string; path?: string } | null> {
  return (await getOps()).saveFile(currentName, currentPath, content);
}

export async function saveFileAs(
  currentName: string,
  content: string
): Promise<{ name: string; path?: string } | null> {
  return (await getOps()).saveFileAs(currentName, content);
}
