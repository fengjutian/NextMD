import { isTauri } from './env';
import * as tauriOps from './fileOps.tauri';
import * as webOps from './fileOps.web';
import type { FileHandle } from './fileOps.tauri';

export type { FileHandle };

const ops = isTauri() ? tauriOps : webOps;

export async function openFile(): Promise<FileHandle | null> {
  return ops.openFile();
}

export async function saveFile(
  currentName: string,
  currentPath: string | undefined,
  content: string
): Promise<{ name: string; path?: string } | null> {
  return ops.saveFile(currentName, currentPath, content);
}

export async function saveFileAs(
  currentName: string,
  content: string
): Promise<{ name: string; path?: string } | null> {
  return ops.saveFileAs(currentName, content);
}

/** Open file directly by path (Tauri only, skips dialog) */
export async function openFileByPath(filePath: string): Promise<FileHandle | null> {
  if (isTauri()) {
    return tauriOps.openFileByPath(filePath);
  }
  return null;
}
