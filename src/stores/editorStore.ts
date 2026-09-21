import { create } from 'zustand';

export type ViewMode = 'wysiwyg' | 'source' | 'split';

interface EditorState {
  content: string;
  viewMode: ViewMode;
  isModified: boolean;
  focusMode: boolean;
  /** Callback registered by MdEditor for inserting markdown syntax */
  insertMarkdown: ((prefix: string, suffix?: string) => void) | null;

  setContent: (content: string, markModified?: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  markSaved: () => void;
  toggleFocusMode: () => void;
  registerInsertMarkdown: (fn: ((prefix: string, suffix?: string) => void) | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: '',
  viewMode: 'wysiwyg',
  isModified: false,
  focusMode: false,
  insertMarkdown: null,

  setContent: (content, markModified = true) => set({ content, isModified: markModified }),
  setViewMode: (viewMode) => set({ viewMode }),
  markSaved: () => set({ isModified: false }),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  registerInsertMarkdown: (fn) => set({ insertMarkdown: fn }),
}));
