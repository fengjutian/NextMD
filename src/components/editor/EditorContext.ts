import { createContext } from 'react';
import type { Editor } from '@tiptap/react';

export const EditorContext = createContext<Editor | null>(null);
