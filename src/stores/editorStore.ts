import { create } from 'zustand';

export type ViewMode = 'wysiwyg' | 'source' | 'split';

interface EditorState {
  content: string;
  viewMode: ViewMode;
  isModified: boolean;

  setContent: (content: string) => void;
  setViewMode: (mode: ViewMode) => void;
  markSaved: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: '',
  viewMode: 'wysiwyg',
  isModified: false,

  setContent: (content) => set({ content, isModified: true }),
  setViewMode: (viewMode) => set({ viewMode }),
  markSaved: () => set({ isModified: false }),
}));
