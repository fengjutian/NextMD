import type { JSONContent } from '@tiptap/core';

const CJK_ADJACENT_STRONG = /\*\*(\S(?:[^*\n]*?\S)?)\*\*(?=[\p{L}\p{N}])/gu;

/** Repair strong marks that CommonMark leaves literal when the closing marker touches CJK text. */
export function repairCjkStrongMarks(document: JSONContent): JSONContent {
  const visit = (node: JSONContent, insideCodeBlock = false): JSONContent => {
    const inCode = insideCodeBlock || node.type === 'codeBlock';
    if (!inCode && node.type === 'text' && node.text && !node.marks?.some((mark) => mark.type === 'code')) {
      const matches = [...node.text.matchAll(CJK_ADJACENT_STRONG)];
      if (matches.length) {
        const content: JSONContent[] = [];
        let offset = 0;
        for (const match of matches) {
          const index = match.index;
          if (index > offset) content.push({ type: 'text', text: node.text.slice(offset, index), marks: node.marks });
          content.push({ type: 'text', text: match[1], marks: [...(node.marks ?? []), { type: 'bold' }] });
          offset = index + match[0].length;
        }
        if (offset < node.text.length) content.push({ type: 'text', text: node.text.slice(offset), marks: node.marks });
        return { type: 'fragment', content };
      }
    }
    if (!node.content) return node;
    const content = node.content.flatMap((child) => {
      const repaired = visit(child, inCode);
      return repaired.type === 'fragment' ? repaired.content ?? [] : [repaired];
    });
    return { ...node, content };
  };
  return visit(document);
}
