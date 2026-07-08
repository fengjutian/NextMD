import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import type { AIMessage } from '../../stores/aiStore';
import { ChatBubble } from './ChatBubble';

interface AIChatProps {
  messages: AIMessage[];
  isGenerating: boolean;
  onInsert: (text: string) => void;
  onResend: (content: string) => void;
  onEdit: (oldContent: string, newContent: string) => void;
}

export function AIChat({ messages, isGenerating, onInsert, onResend, onEdit }: AIChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const visibleMessages = messages.filter((m) => m.content);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 editor-area">
      {visibleMessages.length === 0 && (
        <div className="text-center py-10">
          <Sparkles size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
          <p className="text-sm text-[var(--text-muted)]">AI 助手已就绪</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">使用上方快捷操作或直接输入问题</p>
        </div>
      )}

      {visibleMessages.map((msg, i) => (
        <ChatBubble
          key={`${msg.role}-${i}-${msg.content.length}`}
          message={msg}
          onInsert={msg.role === 'assistant' ? () => onInsert(msg.content) : undefined}
          onResend={msg.role === 'user' ? () => onResend(msg.content) : undefined}
          onEdit={msg.role === 'user' ? (newContent) => onEdit(msg.content, newContent) : undefined}
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
