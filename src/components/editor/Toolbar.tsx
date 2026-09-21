import { useContext, type RefObject } from 'react';
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
import { EditorContext } from './EditorContext';
import { cn } from '../../lib/utils';
import { insertMarkdownSyntax, runEditorCommand, type EditorCommand } from '../../lib/editorCommands';
import type { SourceEditorHandle } from './SourceEditor';

export function Toolbar({ sourceEditorRef }: { sourceEditorRef: RefObject<SourceEditorHandle | null> }) {
  const viewMode = useEditorStore((state) => state.viewMode);
  const isPanelOpen = useAIStore((state) => state.isPanelOpen);
  const togglePanel = useAIStore((state) => state.togglePanel);
  const editor = useContext(EditorContext);
  const isWysiwyg = viewMode === 'wysiwyg' && !!editor;

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    isWysiwyg ? editor?.isActive(name, attrs) ?? false : false;

  const Btn = ({ icon, label, cmd, srcPrefix, srcSuffix, activeName, activeAttrs }: {
    icon: React.ReactNode; label: string; cmd?: EditorCommand;
    srcPrefix?: string; srcSuffix?: string; activeName?: string; activeAttrs?: Record<string, unknown>;
  }) => {
    const active = activeName ? isActive(activeName, activeAttrs) : false;
    return (
      <button
        onClick={() => {
          if (isWysiwyg && cmd && editor) runEditorCommand(editor, cmd);
          else {
            const state = useEditorStore.getState();
            insertMarkdownSyntax(sourceEditorRef.current, state.content, srcPrefix || '', srcSuffix || '', state.setContent);
          }
        }}
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

      <div className="flex items-center gap-0.5 h-10 px-3 shrink-0 border-b border-[var(--border-subtle)] glass">
        {/* Left spacer */}
        <div className="flex-1" />

        {/* Center: editing buttons */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          <>
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
              <Btn icon={<Link size={16} />} label="链接" cmd="link" srcPrefix="[文字](" srcSuffix=")" activeName="link" />
              <Btn icon={<Image size={16} />} label="图片" cmd="image" srcPrefix="![描述](" srcSuffix=")" />
              <Btn icon={<Table size={16} />} label="表格" cmd="table" srcPrefix="| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |" />
              <Btn icon={<Code2 size={16} />} label="代码块" cmd="codeblock" srcPrefix="```\n" srcSuffix="\n```" activeName="codeBlock" />
              <Btn icon={<Minus size={16} />} label="分隔线" cmd="hr" srcPrefix="---" />
          </>
        </div>

        {/* Right spacer + AI */}
        <div className="flex-1 flex justify-end">
          <button onClick={togglePanel} title="AI 助手" className={cn(
            'flex items-center gap-1.5 h-8 px-2.5 rounded-lg shrink-0 transition-colors mr-1.5 text-xs font-medium',
            isPanelOpen ? 'bg-[var(--accent-muted)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
          )}>
            <Sparkles size={14} /><span className="hidden sm:inline">AI</span>
          </button>
        </div>
      </div>
    </>
  );
}

function BubbleBtn({ editor, cmd, icon, label, active, activeAttrs, link }: {
  editor: Editor;
  cmd: EditorCommand | 'link'; icon?: React.ReactNode; label?: string;
  active?: string; activeAttrs?: Record<string, unknown>; link?: boolean;
}) {
  const isActive = active ? editor.isActive(active, activeAttrs) : false;
  const handleClick = () => {
    if (link) {
      runEditorCommand(editor, 'link');
      return;
    }
    runEditorCommand(editor, cmd as EditorCommand);
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
