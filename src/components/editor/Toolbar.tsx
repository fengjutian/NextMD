import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ListTodo, Quote, Minus,
  Link, Image, Table, Code2, Sparkles
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useAIStore } from '../../stores/aiStore';
import { cn } from '../../lib/utils';

export function Toolbar() {
  const { viewMode, setViewMode, insertMarkdown } = useEditorStore();
  const { isPanelOpen, togglePanel } = useAIStore();

  const insert = (prefix: string, suffix = '') => insertMarkdown?.(prefix, suffix);

  const ToolbarBtn = ({ icon, label, onClick: handleClick }: {
    icon: React.ReactNode; label: string; onClick: () => void;
  }) => (
    <button
      onClick={handleClick}
      title={label}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg shrink-0',
        'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]',
        'transition-colors'
      )}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-0.5 h-10 px-3 shrink-0 border-b border-[var(--border-subtle)] glass overflow-x-auto">
      <ToolbarBtn icon={<Bold size={16} />} label="粗体" onClick={() => insert('**', '**')} />
      <ToolbarBtn icon={<Italic size={16} />} label="斜体" onClick={() => insert('*', '*')} />
      <ToolbarBtn icon={<Strikethrough size={16} />} label="删除线" onClick={() => insert('~~', '~~')} />
      <ToolbarBtn icon={<Code size={16} />} label="行内代码" onClick={() => insert('`', '`')} />

      <div className="w-px h-5 bg-[var(--border-subtle)] mx-1.5 shrink-0" />

      <ToolbarBtn icon={<Heading1 size={16} />} label="一级标题" onClick={() => insert('# ', '')} />
      <ToolbarBtn icon={<Heading2 size={16} />} label="二级标题" onClick={() => insert('## ', '')} />
      <ToolbarBtn icon={<Heading3 size={16} />} label="三级标题" onClick={() => insert('### ', '')} />

      <div className="w-px h-5 bg-[var(--border-subtle)] mx-1.5 shrink-0" />

      <ToolbarBtn icon={<List size={16} />} label="无序列表" onClick={() => insert('- ', '')} />
      <ToolbarBtn icon={<ListOrdered size={16} />} label="有序列表" onClick={() => insert('1. ', '')} />
      <ToolbarBtn icon={<ListTodo size={16} />} label="任务列表" onClick={() => insert('- [ ] ', '')} />
      <ToolbarBtn icon={<Quote size={16} />} label="引用" onClick={() => insert('> ', '')} />

      <div className="w-px h-5 bg-[var(--border-subtle)] mx-1.5 shrink-0" />

      <ToolbarBtn icon={<Link size={16} />} label="链接" onClick={() => insert('[链接文字](', ')')} />
      <ToolbarBtn icon={<Image size={16} />} label="图片" onClick={() => insert('![图片描述](', ')')} />
      <ToolbarBtn icon={<Table size={16} />} label="表格" onClick={() => insert('| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |', '')} />
      <ToolbarBtn icon={<Code2 size={16} />} label="代码块" onClick={() => insert('```\n', '\n```')} />
      <ToolbarBtn icon={<Minus size={16} />} label="分隔线" onClick={() => insert('---', '')} />

      <div className="flex-1" />

      {/* AI toggle */}
      <button
        onClick={togglePanel}
        title="AI 助手"
        className={cn(
          'flex items-center gap-1.5 h-8 px-2.5 rounded-lg shrink-0 transition-colors mr-1.5',
          'text-xs font-medium',
          isPanelOpen
            ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
        )}
      >
        <Sparkles size={14} />
        <span className="hidden sm:inline">AI</span>
      </button>

      {/* View mode toggle */}
      <div className="flex items-center gap-0.5 bg-[var(--border-subtle)] rounded-lg p-0.5 shrink-0">
        {([
          { value: 'wysiwyg' as const, label: '所见即所得' },
          { value: 'source' as const, label: '源码' },
          { value: 'split' as const, label: '分屏' },
        ]).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setViewMode(value)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap',
              viewMode === value
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
