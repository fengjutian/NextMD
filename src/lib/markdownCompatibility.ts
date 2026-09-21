const CJK_STRONG_BOUNDARY = '<!--nextmd-cjk-strong-->';

/** Let the rich editor recognize strong emphasis immediately followed by CJK text. */
export function prepareMarkdownForRichEditor(markdown: string): string {
  let fence: string | null = null;
  return markdown.split('\n').map((line) => {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      fence = fence === marker ? null : marker;
      return line;
    }
    if (fence) return line;
    return line.split(/(`+[^`]*`+)/g).map((part, index) => index % 2
      ? part
      : part.replace(/(\*\*(?=\S)[^*\n]+?\S\*\*)(?=[\p{L}\p{N}])/gu, `$1${CJK_STRONG_BOUNDARY}`)
    ).join('');
  }).join('\n');
}

export function cleanRichEditorMarkdown(markdown: string): string {
  return markdown.replaceAll(CJK_STRONG_BOUNDARY, '');
}
