import { useAI } from '../../hooks/useAI';
import { AIChat } from './AIChat';
import { AIInput } from './AIInput';
import { Sparkles, X, Plus } from 'lucide-react';
import type { AIConversation } from '../../stores/aiStore';

export function AIPanel() {
  const {
    isPanelOpen, togglePanel,
    conversations, activeConversationId,
    isGenerating, stopGeneration,
    sendMessage, insertToEditor,
    continueWriting, rewrite, translate, summarize,
    newConversation,
  } = useAI();

  const activeConv = conversations.find((c: AIConversation) => c.id === activeConversationId);
  const messages = activeConv?.messages || [];

  if (!isPanelOpen) return null;

  return (
    <div className="w-[340px] shrink-0 flex flex-col h-full border-l border-[var(--border-subtle)] glass">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 shrink-0 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">AI 助手</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={newConversation}
            title="新对话"
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={togglePanel}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-1.5 px-3 py-2 shrink-0 border-b border-[var(--border-subtle)] overflow-x-auto">
        <ActionChip label="续写" onClick={continueWriting} disabled={isGenerating} />
        <ActionChip label="润色" onClick={() => {
          const sel = window.getSelection()?.toString();
          if (sel && !isGenerating) rewrite(sel);
        }} disabled={isGenerating} />
        <ActionChip label="翻译" onClick={() => {
          const sel = window.getSelection()?.toString();
          if (sel && !isGenerating) translate(sel);
        }} disabled={isGenerating} />
        <ActionChip label="总结" onClick={() => {
          const sel = window.getSelection()?.toString();
          if (sel && !isGenerating) summarize(sel);
        }} disabled={isGenerating} />
      </div>

      {/* Messages */}
      <AIChat messages={messages} isGenerating={isGenerating} onInsert={insertToEditor} />

      {/* Input */}
      <AIInput
        onSend={sendMessage}
        isGenerating={isGenerating}
        onStop={stopGeneration}
      />
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
