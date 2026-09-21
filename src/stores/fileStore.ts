import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentFile {
  name: string;
  path?: string;
  lastOpened: number; // timestamp
}

interface FileState {
  currentFile: { name: string; path?: string } | null;
  recentFiles: RecentFile[];

  setCurrentFile: (file: { name: string; path?: string } | null) => void;
  addRecentFile: (name: string, path?: string) => void;
  clearRecentFiles: () => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set) => ({
      currentFile: null,
      recentFiles: [],

      setCurrentFile: (file) => set({ currentFile: file }),
      addRecentFile: (name, path) =>
        set((state) => {
          const filtered = state.recentFiles.filter((f) => path ? f.path !== path : !(f.name === name && !f.path));
          return {
            recentFiles: [{ name, path, lastOpened: Date.now() }, ...filtered].slice(0, 10),
          };
        }),
      clearRecentFiles: () => set({ recentFiles: [] }),
    }),
    {
      name: 'nextmd-files',
      partialize: (state) => ({ recentFiles: state.recentFiles }),
    }
  )
);
