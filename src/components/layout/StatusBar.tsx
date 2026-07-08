import { useEditorStore } from '../../stores/editorStore';
import { AISettings } from '../ai/AISettings';

export function StatusBar() {
  const { isModified, content } = useEditorStore();
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div className="flex items-center justify-between h-7 px-4 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] glass shrink-0">
      <div className="flex items-center gap-3">
        {/* <span className="capitalize">{{ wysiwyg: '所见即所得', source: '源码', split: '分屏' }[viewMode]}</span> */}
      </div>
      <div className="flex items-center gap-3">
        <span>字数 {wordCount}</span>
        <span>行 {lineCount}</span>
        {isModified && <span className="text-[var(--accent)]">● 未保存</span>}
        <AISettings triggerClass="flex items-center gap-1 px-1 py-0.5 rounded hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer" />
      </div>
    </div>
  );
}
