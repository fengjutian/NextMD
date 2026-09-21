import { Bold } from '@tiptap/extension-bold';

const CJK_ADJACENT_STRONG = /\*\*(\S(?:[^*\n]*?\S)?)\*\*(?=[\p{L}\p{N}])/u;
const CJK_ADJACENT_STRONG_AT_START = new RegExp(`^${CJK_ADJACENT_STRONG.source}`, 'u');

/** Tiptap bold mark with support for a closing ** directly followed by CJK text. */
export const CjkBold = Bold.extend({
  markdownTokenizer: {
    name: 'cjkStrong',
    level: 'inline',
    start(src) {
      return src.search(CJK_ADJACENT_STRONG);
    },
    tokenize(src, _tokens, lexer) {
      const match = CJK_ADJACENT_STRONG_AT_START.exec(src);
      if (!match) return undefined;

      return {
        type: 'strong',
        raw: match[0],
        text: match[1],
        tokens: lexer.inlineTokens(match[1]),
      };
    },
  },
});
