import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import { useEditorStore, type ViewMode } from '../../stores/editorStore';
import { cn } from '../../lib/utils';

interface MdEditorProps {
  mode: ViewMode;
}

export function MdEditor({ mode }: MdEditorProps) {
  const { content, setContent } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Placeholder.configure({ placeholder: '开始写作...' }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Image.configure({ allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none outline-none min-h-full px-8 py-6 editor-area',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const md = htmlToMarkdown(html);
      setContent(md);
    },
  });

  // Sync editor when content changes externally (e.g. file load)
  const lastContentRef = useRef(content);
  useEffect(() => {
    if (editor && content !== lastContentRef.current && mode === 'wysiwyg') {
      const html = markdownToHtml(content);
      if (editor.getHTML() !== html) {
        editor.commands.setContent(html);
      }
      lastContentRef.current = content;
    }
  }, [content, editor, mode]);

  // Focus textarea when switching to source mode
  useEffect(() => {
    if (mode === 'source' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  if (mode === 'source') {
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={cn(
          'w-full h-full resize-none outline-none border-none px-8 py-6',
          'font-mono text-sm leading-relaxed',
          'bg-[var(--bg-editor)] text-[var(--text-primary)]',
          'editor-area'
        )}
        placeholder="开始写作..."
        spellCheck={false}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-editor)]">
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}

// ---- Lightweight markdown ↔ HTML converters ----

function markdownToHtml(md: string): string {
  if (!md) return '';
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Images & Links
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // Task list
    .replace(/^- \[x\] (.+)$/gm, '<p><input type="checkbox" checked> $1</p>')
    .replace(/^- \[ \] (.+)$/gm, '<p><input type="checkbox"> $1</p>')
    // Unordered list
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Code block
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, '').replace(/```$/, '');
      return `<pre><code>${code}</code></pre>`;
    })
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

function htmlToMarkdown(html: string): string {
  if (!html || html === '<p></p>') return '';

  let md = html
    // Unwrap paragraphs
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    // Headers
    .replace(/<h1>(.+?)<\/h1>/g, '# $1')
    .replace(/<h2>(.+?)<\/h2>/g, '## $1')
    .replace(/<h3>(.+?)<\/h3>/g, '### $1')
    .replace(/<h4>(.+?)<\/h4>/g, '#### $1')
    // Bold & Italic
    .replace(/<strong><em>(.+?)<\/em><\/strong>/g, '***$1***')
    .replace(/<strong>(.+?)<\/strong>/g, '**$1**')
    .replace(/<em>(.+?)<\/em>/g, '*$1*')
    // Code
    .replace(/<pre><code>(.+?)<\/code><\/pre>/g, (_, c) => `\`\`\`\n${c}\n\`\`\``)
    .replace(/<code>(.+?)<\/code>/g, '`$1`')
    // Links
    .replace(/<a href="(.+?)">(.+?)<\/a>/g, '[$2]($1)')
    // Images
    .replace(/<img src="(.+?)" alt="(.+?)">/g, '![$2]($1)')
    // Lists
    .replace(/<li>(.+?)<\/li>/g, '- $1')
    .replace(/<blockquote>(.+?)<\/blockquote>/g, '> $1')
    .replace(/<hr\s*\/?>/g, '---')
    // Clean up
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Trim extra whitespace
    .replace(/\n{3,}/g, '\n\n');

  return md.trim();
}
