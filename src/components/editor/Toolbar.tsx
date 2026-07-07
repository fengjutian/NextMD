import { useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ListTodo, Quote, Minus,
  Link, Image, Table, Code2
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { cn } from '../../lib/utils';

export function Toolbar() {
  const { viewMode, setViewMode, content, setContent } = useEditorStore();

  const insertMarkdown = useCallback((prefix: string, suffix = '') => {
    // In WYSIWYG mode, TipTap handles formatting natively via its own toolbar
    // This is for source mode or for inserting block-level elements
    const textarea = document.querySelector('textarea');
    if (textarea instanceof HTMLTextAreaElement) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.slice(start, end);
      const newText = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
      setContent(newText);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          end + prefix.length
        );
      });
    }
  }, [content, setContent]);

  const buttons = [
    { icon: <Bold size={16} />, label: '粗体', action: () => insertMarkdown('**', '**') },
    { icon: <Italic size={16} />, label: '斜体', action: () => insertMarkdown('*', '*') },
    { icon: <Underline size={16} />, label: '下划线', action: () => insertMarkdown('<u>', '</u>') },
    { icon: <Strikethrough size={16} />, label: '删除线', action: () => insertMarkdown('~~', '~~') },
    { type: 'divider' as const },
    { icon: <Heading1 size={16} />, label: 'H1', action: () => insertMarkdown('\n# ', '\n') },
    { icon: <Heading2 size={16} />, label: 'H2', action: () => insertMarkdown('\n## ', '\n') },
    { icon: <Heading3 size={16} />, label: 'H3', action: () => insertMarkdown('\n### ', '\n') },
    { type: 'divider' as const },
    { icon: <List size={16} />, label: '无序列表', action: () => insertMarkdown('\n- ', '\n') },
    { icon: <ListOrdered size={16} />, label: '有序列表', action: () => insertMarkdown('\n1. ', '\n') },
    { icon: <ListTodo size={16} />, label: '任务列表', action: () => insertMarkdown('\n- [ ] ', '\n') },
    { icon: <Quote size={16} />, label: '引用', action: () => insertMarkdown('\n> ', '\n') },
    { type: 'divider' as const },
    { icon: <Link size={16} />, label: '链接', action: () => insertMarkdown('[', '](url)') },
    { icon: <Image size={16} />, label: '图片', action: () => insertMarkdown('![', '](url)') },
    { icon: <Table size={16} />, label: '表格', action: () => insertMarkdown('\n| 列1 | 列2 |\n| --- | --- |\n|     |     |\n') },
    { icon: <Code2 size={16} />, label: '代码块', action: () => insertMarkdown('\n```\n', '\n```\n') },
    { icon: <Minus size={16} />, label: '分隔线', action: () => insertMarkdown('\n---\n') },
    { icon: <Code size={16} />, label: '行内代码', action: () => insertMarkdown('`', '`') },
  ];

  return (
    <div className="flex items-center gap-0.5 h-10 px-3 shrink-0 border-b border-[var(--border-subtle)] glass overflow-x-auto">
      {buttons.map((btn, i) => {
        if ('type' in btn && btn.type === 'divider') {
          return <div key={i} className="w-px h-5 bg-[var(--border-subtle)] mx-1 shrink-0" />;
        }
        return (
          <button
            key={i}
            onClick={btn.action}
            title={btn.label}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg shrink-0',
              'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]',
              'transition-colors'
            )}
          >
            {btn.icon}
          </button>
        );
      })}

      <div className="flex-1" />

      {/* View mode toggle */}
      <div className="flex items-center gap-0.5 bg-[var(--border-subtle)] rounded-lg p-0.5 shrink-0">
        {(['wysiwyg', 'source', 'split'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
              viewMode === mode
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {{ wysiwyg: '所见即所得', source: '源码', split: '分屏' }[mode]}
          </button>
        ))}
      </div>
    </div>
  );
}
