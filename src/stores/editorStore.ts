import { create } from 'zustand';

export type ViewMode = 'wysiwyg' | 'source' | 'split';

interface EditorState {
  content: string;
  viewMode: ViewMode;
  isModified: boolean;

  setContent: (content: string, markModified?: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  markSaved: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: '',
  viewMode: 'wysiwyg',
  isModified: false,

  setContent: (content, markModified = true) => set({ content, isModified: markModified }),
  setViewMode: (viewMode) => set({ viewMode }),
  markSaved: () => set({ isModified: false }),
}));
