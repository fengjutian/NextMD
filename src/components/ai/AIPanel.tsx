import { useAI } from '../../hooks/useAI';
import { AIChat } from './AIChat';
import { AIInput } from './AIInput';
import { FollowUpSuggestions } from './FollowUpSuggestions';
import { X, Plus, GripVertical } from 'lucide-react';
import { useAIStore, type AIConversation } from '../../stores/aiStore';
import { useEditorStore } from '../../stores/editorStore';
import { EditorContext } from '../editor/MdEditor';
import { cn } from '../../lib/utils';
import { useContext, useState, useCallback, useEffect, useRef } from 'react';

export function AIPanel() {
  const {
    isPanelOpen, togglePanel,
    conversations, activeConversationId,
    isGenerating, stopGeneration,
    sendMessage, insertToEditor,
    continueWriting, rewrite, translate, summarize,
    newConversation, resendMessage, editMessage,
  } = useAI();

  const activeConv = conversations.find((c: AIConversation) => c.id === activeConversationId);
  const messages = activeConv?.messages || [];
  const editor = useContext(EditorContext);
  const { content } = useEditorStore();

  // Get selected text from TipTap editor (works even after focus moves to button)
  const getSelectedText = () => {
    if (!editor) return window.getSelection()?.toString() || '';
    const { from, to } = editor.state.selection;
    return from !== to ? editor.state.doc.textBetween(from, to) : window.getSelection()?.toString() || '';
  };

  // Resizable panel
  const [panelWidth, setPanelWidth] = useState(340);
  const resizing = useRef(false);
  const startX = useRef(0);
  const startW = useRef(340);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    resizing.current = true;
    startX.current = e.clientX;
    startW.current = panelWidth;
    e.preventDefault();
  }, [panelWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const delta = startX.current - e.clientX;
      setPanelWidth(Math.max(260, Math.min(800, startW.current + delta)));
    };
    const onMouseUp = () => { resizing.current = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (!isPanelOpen) return null;

  return (
    <div className="shrink-0 flex h-full" style={{ width: panelWidth }}>
      {/* Drag handle */}
      <div
        className="w-1.5 shrink-0 cursor-col-resize hover:bg-[var(--accent)] hover:bg-opacity-30 transition-colors flex items-center justify-center group"
        onMouseDown={onMouseDown}
      >
        <GripVertical size={12} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Panel content */}
      <div className="flex-1 flex flex-col h-full border-l border-[var(--border-subtle)] glass">
      {/* Header with thread tabs */}
      <div className="flex items-center justify-between px-4 h-10 shrink-0 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-1 overflow-x-auto flex-1 mr-2">
          {conversations.slice(0, 10).map((conv) => (
            <div key={conv.id} className={cn(
              'flex items-center gap-0.5 px-2 py-1 rounded-md shrink-0 transition-colors group',
              activeConversationId === conv.id
                ? 'bg-[var(--accent-muted)]'
                : 'hover:bg-[var(--border-subtle)]'
            )}>
              <button
                onClick={() => useAIStore.setState({ activeConversationId: conv.id })}
                className={cn(
                  'text-[11px] font-medium whitespace-nowrap',
                  activeConversationId === conv.id
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {conv.title || '新对话'}
              </button>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); useAIStore.getState().deleteConversation(conv.id); }}
                  className="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={newConversation} title="新对话" className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]">
            <Plus size={14} />
          </button>
          <button onClick={togglePanel} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-1.5 px-3 py-2 shrink-0 border-b border-[var(--border-subtle)] overflow-x-auto">
        <ActionChip label="续写" onClick={() => continueWriting()} disabled={isGenerating} />
        <ActionChip label="润色" onClick={() => {
          const sel = getSelectedText();
          if (sel) rewrite(sel); else rewrite(content);
        }} disabled={isGenerating} />
        <ActionChip label="翻译" onClick={() => {
          const sel = getSelectedText();
          if (sel) translate(sel); else translate(content);
        }} disabled={isGenerating} />
        <ActionChip label="总结" onClick={() => {
          const sel = getSelectedText();
          if (sel) summarize(sel); else summarize(content);
        }} disabled={isGenerating} />
      </div>

      {/* Messages */}
      <AIChat
        messages={messages}
        isGenerating={isGenerating}
        onInsert={insertToEditor}
        onResend={resendMessage}
        onEdit={(old, text) => editMessage(old, text)}
      />

      {/* Follow-up suggestions */}
      {!isGenerating && messages.length > 0 && (
        <FollowUpSuggestions onSelect={(q) => sendMessage(q)} />
      )}

      {/* Input */}
      <AIInput
        onSend={sendMessage}
        isGenerating={isGenerating}
        onStop={stopGeneration}
      />
      </div>
    </div>
  );
}

function ActionChip({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}
