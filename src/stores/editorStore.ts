import { create } from 'zustand';

export type ViewMode = 'wysiwyg' | 'source' | 'split';

interface EditorState {
  content: string;
  savedContent: string;
  contentRevision: number;
  viewMode: ViewMode;
  isModified: boolean;
  focusMode: boolean;
  typewriterMode: boolean;
  contentReader: (() => string) | null;
  /** Callback registered by MdEditor for inserting markdown syntax */
  insertMarkdown: ((prefix: string, suffix?: string) => void) | null;

  setContent: (content: string, markModified?: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  getCurrentContent: () => string;
  registerContentReader: (reader: (() => string) | null) => void;
  setSavedBaseline: (content: string) => void;
  markSaved: () => void;
  toggleFocusMode: () => void;
  toggleTypewriterMode: () => void;
  registerInsertMarkdown: (fn: ((prefix: string, suffix?: string) => void) | null) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  content: '',
  savedContent: '',
  contentRevision: 0,
  viewMode: 'wysiwyg',
  isModified: false,
  focusMode: false,
  typewriterMode: false,
  contentReader: null,
  insertMarkdown: null,

  setContent: (content, markModified) => set((state) => {
    const savedContent = markModified === false ? content : state.savedContent;
    return {
      content,
      savedContent,
      isModified: markModified ?? content !== savedContent,
      contentRevision: state.contentRevision + 1,
    };
  }),
  setViewMode: (viewMode) => set((state) => ({
    viewMode,
    content: state.contentReader?.() ?? state.content,
  })),
  getCurrentContent: () => get().contentReader?.() ?? get().content,
  registerContentReader: (contentReader) => set({ contentReader }),
  setSavedBaseline: (savedContent) => set({ savedContent, isModified: false }),
  markSaved: () => set((state) => ({ savedContent: state.getCurrentContent(), isModified: false })),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  toggleTypewriterMode: () => set((state) => ({ typewriterMode: !state.typewriterMode })),
  registerInsertMarkdown: (fn) => set({ insertMarkdown: fn }),
}));
