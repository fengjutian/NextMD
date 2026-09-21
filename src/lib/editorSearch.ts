import type { Editor } from '@tiptap/react';

export interface SearchMatch { from: number; to: number }

export function findMatches(content: string, query: string, positions?: number[]): SearchMatch[] {
  if (!query) return [];
  const matches: SearchMatch[] = [];
  const haystack = content.toLowerCase();
  const needle = query.toLowerCase();
  for (let from = 0; from < content.length;) {
    const index = haystack.indexOf(needle, from);
    if (index < 0) break;
    const start = positions ? positions[index] : index;
    const end = positions ? positions[index + query.length - 1] + 1 : index + query.length;
    if (start >= 0 && end > start) matches.push({ from: start, to: end });
    from = index + Math.max(query.length, 1);
  }
  return matches;
}

export function findEditorMatches(editor: Editor, query: string): SearchMatch[] {
  let text = '';
  const positions: number[] = [];
  let previousEnd = -1;
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    if (previousEnd >= 0 && pos > previousEnd) {
      text += '\n';
      positions.push(-1);
    }
    text += node.text;
    for (let i = 0; i < node.text.length; i++) positions.push(pos + i);
    previousEnd = pos + node.text.length;
  });
  return findMatches(text, query, positions);
}
