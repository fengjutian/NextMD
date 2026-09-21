import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import type { AIMessage } from '../../stores/aiStore';
import { ChatBubble } from './ChatBubble';

interface AIChatProps {
  messages: AIMessage[];
  isGenerating: boolean;
  onInsert: (text: string) => void;
  onResend: (index: number) => void;
  onEdit: (index: number, newContent: string) => void;
}

export function AIChat({ messages, isGenerating, onInsert, onResend, onEdit }: AIChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating) {
      // Instant scroll during streaming to avoid jitter
      bottomRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    } else {
      // Smooth scroll when generation completes
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  const visibleMessages = messages.map((message, index) => ({ message, index })).filter(({ message }) => message.content);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 editor-area">
      {visibleMessages.length === 0 && (
        <div className="text-center py-10">
          <Sparkles size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
          <p className="text-sm text-[var(--text-muted)]">AI 助手已就绪</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">使用上方快捷操作或直接输入问题</p>
        </div>
      )}

      {visibleMessages.map(({ message: msg, index }) => (
        <ChatBubble
          key={`${msg.role}-${index}`}
          message={msg}
          onInsert={msg.role === 'assistant' ? () => onInsert(msg.content) : undefined}
          onResend={msg.role === 'user' ? () => onResend(index) : undefined}
          onEdit={msg.role === 'user' ? (newContent) => onEdit(index, newContent) : undefined}
        />
      ))}

      {isGenerating && messages[messages.length - 1]?.content === '' && (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm px-1">
          <Sparkles size={14} className="animate-pulse" /> 思考中...
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
