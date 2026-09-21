/* oxlint-disable react/only-export-components */
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { ChevronUp, Pencil } from 'lucide-react';
import { useState } from 'react';
import { MermaidDiagram } from './MermaidDiagram';

const lowlight = createLowlight(common);

function MarkdownCodeBlockView({ node }: NodeViewProps) {
  const language = String(node.attrs.language ?? '');
  const isMermaid = language.toLowerCase() === 'mermaid';
  const [editing, setEditing] = useState(false);
  return (
    <NodeViewWrapper className="relative my-4">
      {isMermaid && (
        <button
          type="button"
          contentEditable={false}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => setEditing((value) => !value)}
          className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-secondary)] shadow-sm hover:text-[var(--text-primary)]"
        >
          {editing ? <ChevronUp size={12} /> : <Pencil size={12} />}
          {editing ? '收起源码' : '编辑源码'}
        </button>
      )}
      <div className={isMermaid && !editing ? 'hidden' : undefined}>
        <pre className="code-block"><NodeViewContent /></pre>
      </div>
      {isMermaid && <div contentEditable={false}><MermaidDiagram chart={node.textContent} /></div>}
    </NodeViewWrapper>
  );
}

export const MarkdownCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MarkdownCodeBlockView);
  },
}).configure({ lowlight });
