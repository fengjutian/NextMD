import { useCallback, useContext } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ListTodo, Quote, Minus,
  Link, Image, Table, Code2, Sparkles
} from 'lucide-react';
import { BubbleMenu } from '@tiptap/react/menus';
import { useEditorStore } from '../../stores/editorStore';
import { useAIStore } from '../../stores/aiStore';
import { EditorContext } from '../editor/MdEditor';
import { cn } from '../../lib/utils';

export function Toolbar() {
  const { viewMode, setViewMode, content, setContent } = useEditorStore();
  const { isPanelOpen, togglePanel } = useAIStore();
  const editor = useContext(EditorContext);
  const isWysiwyg = viewMode === 'wysiwyg' && !!editor;

  const runWysiwyg = useCallback((cmd: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    switch (cmd) {
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
    }
  }, [editor]);

  const insertSource = useCallback((prefix: string, suffix = '') => {
    const textarea = document.querySelector('textarea');
    if (textarea instanceof HTMLTextAreaElement) {
      const start = textarea.selectionStart, end = textarea.selectionEnd;
      const selected = content.slice(start, end);
      setContent(content.slice(0, start) + prefix + selected + suffix + content.slice(end));
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      });
    } else {
      setContent(content ? content + '\n' + prefix + suffix : prefix + suffix);
    }
  }, [content, setContent]);

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    isWysiwyg ? editor?.isActive(name, attrs) ?? false : false;

  const Btn = ({ icon, label, cmd, srcPrefix, srcSuffix, activeName, activeAttrs }: {
    icon: React.ReactNode; label: string; cmd?: string;
    srcPrefix?: string; srcSuffix?: string; activeName?: string; activeAttrs?: Record<string, unknown>;
  }) => {
    const active = activeName ? isActive(activeName, activeAttrs) : false;
    return (
      <button
        onClick={() => isWysiwyg && cmd ? runWysiwyg(cmd) : insertSource(srcPrefix || '', srcSuffix || '')}
        title={label}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-colors',
          active
            ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
        )}
      >
        {icon}
      </button>
    );
  };

  return (
    <>
      {isWysiwyg && (
        <BubbleMenu editor={editor!}>
          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-[var(--bg-card)] shadow-[var(--shadow-lg)] border border-[var(--border-subtle)]">
            <BubbleBtn editor={editor!} cmd="bold" icon={<Bold size={14} />} active="bold" />
            <BubbleBtn editor={editor!} cmd="italic" icon={<Italic size={14} />} active="italic" />
            <BubbleBtn editor={editor!} cmd="strike" icon={<Strikethrough size={14} />} active="strike" />
            <BubbleBtn editor={editor!} cmd="code" icon={<Code size={14} />} active="code" />
            <div className="w-px h-4 bg-[var(--border-subtle)] mx-0.5" />
            <BubbleBtn editor={editor!} cmd="h1" label="H1" active="heading" activeAttrs={{ level: 1 }} />
            <BubbleBtn editor={editor!} cmd="h2" label="H2" active="heading" activeAttrs={{ level: 2 }} />
            <BubbleBtn editor={editor!} cmd="h3" label="H3" active="heading" activeAttrs={{ level: 3 }} />
            <div className="w-px h-4 bg-[var(--border-subtle)] mx-0.5" />
            <BubbleBtn editor={editor!} cmd="quote" icon={<Quote size={14} />} active="blockquote" />
            <BubbleBtn editor={editor!} cmd="link" icon={<Link size={14} />} active="link" link />
          </div>
        </BubbleMenu>
      )}

      <div className="flex items-center gap-0.5 h-10 px-3 shrink-0 border-b border-[var(--border-subtle)] glass overflow-x-auto">
        <Btn icon={<Bold size={16} />} label="粗体" cmd="bold" srcPrefix="**" srcSuffix="**" activeName="bold" />
        <Btn icon={<Italic size={16} />} label="斜体" cmd="italic" srcPrefix="*" srcSuffix="*" activeName="italic" />
        <Btn icon={<Strikethrough size={16} />} label="删除线" cmd="strike" srcPrefix="~~" srcSuffix="~~" activeName="strike" />
        <Btn icon={<Code size={16} />} label="行内代码" cmd="code" srcPrefix="`" srcSuffix="`" activeName="code" />

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1.5 shrink-0" />

        <Btn icon={<Heading1 size={16} />} label="一级标题" cmd="h1" srcPrefix="# " activeName="heading" activeAttrs={{ level: 1 }} />
        <Btn icon={<Heading2 size={16} />} label="二级标题" cmd="h2" srcPrefix="## " activeName="heading" activeAttrs={{ level: 2 }} />
        <Btn icon={<Heading3 size={16} />} label="三级标题" cmd="h3" srcPrefix="### " activeName="heading" activeAttrs={{ level: 3 }} />

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1.5 shrink-0" />

        <Btn icon={<List size={16} />} label="无序列表" cmd="bullet" srcPrefix="- " activeName="bulletList" />
        <Btn icon={<ListOrdered size={16} />} label="有序列表" cmd="ordered" srcPrefix="1. " activeName="orderedList" />
        <Btn icon={<ListTodo size={16} />} label="任务列表" cmd="task" srcPrefix="- [ ] " activeName="taskList" />
        <Btn icon={<Quote size={16} />} label="引用" cmd="quote" srcPrefix="> " activeName="blockquote" />

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1.5 shrink-0" />

        <Btn icon={<Link size={16} />} label="链接" srcPrefix="[文字](" srcSuffix=")" />
        <Btn icon={<Image size={16} />} label="图片" srcPrefix="![描述](" srcSuffix=")" />
        <Btn icon={<Table size={16} />} label="表格" srcPrefix="| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |" />
        <Btn icon={<Code2 size={16} />} label="代码块" cmd="codeblock" srcPrefix="```\n" srcSuffix="\n```" activeName="codeBlock" />
        <Btn icon={<Minus size={16} />} label="分隔线" cmd="hr" srcPrefix="---" />

        <div className="flex-1" />

        <button onClick={togglePanel} title="AI 助手" className={cn(
          'flex items-center gap-1.5 h-8 px-2.5 rounded-lg shrink-0 transition-colors mr-1.5 text-xs font-medium',
          isPanelOpen ? 'bg-[var(--accent-muted)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
        )}>
          <Sparkles size={14} /><span className="hidden sm:inline">AI</span>
        </button>

        <div className="flex items-center gap-0.5 bg-[var(--border-subtle)] rounded-lg p-0.5 shrink-0">
          {(['wysiwyg', 'source', 'split'] as const).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)} className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap',
              viewMode === mode ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}>
              {{ wysiwyg: '所见即所得', source: '源码', split: '分屏' }[mode]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function BubbleBtn({ editor, cmd, icon, label, active, activeAttrs, link }: {
  editor: Editor;
  cmd: string; icon?: React.ReactNode; label?: string;
  active?: string; activeAttrs?: Record<string, unknown>; link?: boolean;
}) {
  const isActive = active ? editor.isActive(active, activeAttrs) : false;
  const handleClick = () => {
    const c = editor.chain().focus();
    if (link) {
      const url = window.prompt('链接地址:');
      if (url) c.setLink({ href: url }).run();
      return;
    }
    switch (cmd) {
      case 'bold': c.toggleBold().run(); break;
      case 'italic': c.toggleItalic().run(); break;
      case 'strike': c.toggleStrike().run(); break;
      case 'code': c.toggleCode().run(); break;
      case 'h1': c.toggleHeading({ level: 1 }).run(); break;
      case 'h2': c.toggleHeading({ level: 2 }).run(); break;
      case 'h3': c.toggleHeading({ level: 3 }).run(); break;
      case 'quote': c.toggleBlockquote().run(); break;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
        isActive ? 'bg-[var(--accent-muted)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]',
        label && 'text-xs font-bold'
      )}
    >
      {icon || label}
    </button>
  );
}
