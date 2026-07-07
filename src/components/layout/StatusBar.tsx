import { useEditorStore } from '../../stores/editorStore';

export function StatusBar() {
  const { viewMode, isModified, content } = useEditorStore();
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div className="flex items-center justify-between h-7 px-4 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] glass shrink-0">
      <div className="flex items-center gap-4">
        <span className="capitalize">{viewMode}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>字数 {wordCount}</span>
        <span>行 {lineCount}</span>
        {isModified && <span className="text-[var(--accent)]">● 未保存</span>}
      </div>
    </div>
  );
}
