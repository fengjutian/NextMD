/* oxlint-disable react/only-export-components */
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { MermaidDiagram } from './MermaidDiagram';

const lowlight = createLowlight(common);

function MarkdownCodeBlockView({ node }: NodeViewProps) {
  const language = String(node.attrs.language ?? '');
  return (
    <NodeViewWrapper className="my-4">
      <pre className="code-block"><NodeViewContent /></pre>
      {language === 'mermaid' && <MermaidDiagram chart={node.textContent} />}
    </NodeViewWrapper>
  );
}

export const MarkdownCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MarkdownCodeBlockView);
  },
}).configure({ lowlight });
