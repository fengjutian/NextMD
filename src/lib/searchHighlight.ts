import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { SearchMatch } from './editorSearch';

interface HighlightState {
  matches: SearchMatch[];
  active: number;
}

const searchHighlightKey = new PluginKey<DecorationSet>('searchHighlight');

export const SearchHighlight = Extension.create({
  name: 'searchHighlight',
  addProseMirrorPlugins() {
    return [new Plugin({
      key: searchHighlightKey,
      state: {
        init: () => DecorationSet.empty,
        apply(transaction, decorations) {
          const update = transaction.getMeta(searchHighlightKey) as HighlightState | undefined;
          if (update) {
            return DecorationSet.create(transaction.doc, update.matches.map((match, index) =>
              Decoration.inline(match.from, match.to, {
                class: index === update.active ? 'search-match search-match-active' : 'search-match',
              }),
            ));
          }
          return transaction.docChanged ? decorations.map(transaction.mapping, transaction.doc) : decorations;
        },
      },
      props: {
        decorations: (state) => searchHighlightKey.getState(state) || DecorationSet.empty,
      },
    })];
  },
});

export function updateSearchHighlights(editor: Editor, matches: SearchMatch[], active: number): void {
  editor.view.dispatch(editor.state.tr.setMeta(searchHighlightKey, { matches, active }));
}
