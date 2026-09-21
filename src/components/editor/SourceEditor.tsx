import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, drawSelection, dropCursor, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { markdown } from '@codemirror/lang-markdown';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { SOURCE_EDITOR_NAVIGATE, type SourceEditorNavigation } from '../../lib/sourceEditorEvents';

export interface SourceEditorHandle {
  getContent: () => string;
  insertSyntax: (prefix: string, suffix: string) => void;
  selectRange: (from: number, to: number) => void;
  focus: () => void;
}

interface Props {
  content: string;
  onChange: (content: string) => void;
  onReady?: (editor: SourceEditorHandle | null) => void;
}

export const SourceEditor = forwardRef<SourceEditorHandle, Props>(function SourceEditor({ content, onChange, onReady }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const changeTimerRef = useRef<number | null>(null);
  const externalUpdateRef = useRef(false);

  const apiRef = useRef<SourceEditorHandle>({
    getContent: () => viewRef.current?.state.doc.toString() ?? content,
    insertSyntax: (prefix, suffix) => {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      const selected = view.state.sliceDoc(from, to);
      view.dispatch({
        changes: { from, to, insert: prefix + selected + suffix },
        selection: { anchor: from + prefix.length, head: from + prefix.length + selected.length },
        scrollIntoView: true,
      });
      view.focus();
    },
    selectRange: (from, to) => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({ selection: { anchor: from, head: to }, scrollIntoView: true });
    },
    focus: () => viewRef.current?.focus(),
  });

  useImperativeHandle(ref, () => apiRef.current, []);

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: content,
        extensions: [
          lineNumbers(), highlightActiveLineGutter(), history(), drawSelection(), dropCursor(),
          indentOnInput(), bracketMatching(), closeBrackets(), markdown(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          EditorView.lineWrapping, highlightActiveLine(),
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged || externalUpdateRef.current) return;
            if (changeTimerRef.current) window.clearTimeout(changeTimerRef.current);
            changeTimerRef.current = window.setTimeout(() => {
              changeTimerRef.current = null;
              onChange(update.state.doc.toString());
            }, 40);
          }),
          EditorView.theme({
            '&': { height: '100%', backgroundColor: 'var(--bg-editor)', color: 'var(--text-primary)' },
            '.cm-scroller': { fontFamily: 'var(--font-mono)', fontSize: '14px', lineHeight: '1.65', padding: '18px 0' },
            '.cm-content': { padding: '0 24px', caretColor: 'var(--accent)' },
            '.cm-gutters': { backgroundColor: 'var(--bg-editor)', color: 'var(--text-muted)', border: 'none' },
            '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--accent-muted)' },
            '&.cm-focused': { outline: 'none' },
          }),
        ],
      }),
    });
    viewRef.current = view;
    onReady?.(apiRef.current);
    view.focus();
    return () => {
      if (changeTimerRef.current) {
        window.clearTimeout(changeTimerRef.current);
        onChange(view.state.doc.toString());
      }
      onReady?.(null);
      view.destroy();
      viewRef.current = null;
    };
  }, []); // The editor instance is intentionally created once.

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === content) return;
    externalUpdateRef.current = true;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: content } });
    externalUpdateRef.current = false;
  }, [content]);

  useEffect(() => {
    const navigate = (event: Event) => {
      const { from, to = from, focus = false } = (event as CustomEvent<SourceEditorNavigation>).detail;
      apiRef.current.selectRange(from, to);
      if (focus) apiRef.current.focus();
    };
    window.addEventListener(SOURCE_EDITOR_NAVIGATE, navigate);
    return () => window.removeEventListener(SOURCE_EDITOR_NAVIGATE, navigate);
  }, []);

  return <div ref={hostRef} className="h-full overflow-hidden editor-area" />;
});
