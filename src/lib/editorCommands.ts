import type { Editor } from '@tiptap/react';
import type { SourceEditorHandle } from '../components/editor/SourceEditor';

export type EditorCommand =
  | 'bold' | 'italic' | 'strike' | 'code'
  | 'h1' | 'h2' | 'h3'
  | 'bullet' | 'ordered' | 'task'
  | 'quote' | 'hr' | 'codeblock'
  | 'link' | 'image' | 'table';

export function runEditorCommand(editor: Editor, command: EditorCommand): void {
  const chain = editor.chain().focus();
  switch (command) {
    case 'bold': chain.toggleBold().run(); break;
    case 'italic': chain.toggleItalic().run(); break;
    case 'strike': chain.toggleStrike().run(); break;
    case 'code': chain.toggleCode().run(); break;
    case 'h1': chain.toggleHeading({ level: 1 }).run(); break;
    case 'h2': chain.toggleHeading({ level: 2 }).run(); break;
    case 'h3': chain.toggleHeading({ level: 3 }).run(); break;
    case 'bullet': chain.toggleBulletList().run(); break;
    case 'ordered': chain.toggleOrderedList().run(); break;
    case 'task': chain.toggleTaskList().run(); break;
    case 'quote': chain.toggleBlockquote().run(); break;
    case 'hr': chain.setHorizontalRule().run(); break;
    case 'codeblock': chain.toggleCodeBlock().run(); break;
    case 'link': {
      const current = editor.getAttributes('link').href as string | undefined;
      const href = window.prompt('链接地址:', current || 'https://');
      if (href === null) break;
      if (!href.trim()) editor.chain().focus().unsetLink().run();
      else editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
      break;
    }
    case 'image': {
      const src = window.prompt('图片地址:');
      if (src?.trim()) editor.chain().focus().setImage({ src: src.trim() }).run();
      break;
    }
    case 'table': chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break;
  }
}

export function insertMarkdownSyntax(
  sourceEditor: SourceEditorHandle | null,
  content: string,
  prefix: string,
  suffix: string,
  setContent: (content: string) => void,
): void {
  if (!sourceEditor) {
    setContent(content ? `${content}\n${prefix}${suffix}` : `${prefix}${suffix}`);
    return;
  }
  sourceEditor.insertSyntax(prefix, suffix);
}
