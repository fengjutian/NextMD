import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ScrollToBottom, { useScrollToBottom, useAtBottom } from 'react-scroll-to-bottom';
import { User, Sparkles, Copy, ChevronDown } from 'lucide-react';
import type { AIMessage } from '../../stores/aiStore';
import { cn } from '../../lib/utils';

interface AIChatProps {
  messages: AIMessage[];
  isGenerating: boolean;
  onInsert: (text: string) => void;
}

export function AIChat({ messages, isGenerating, onInsert }: AIChatProps) {
  const visibleMessages = messages.filter((m) => m.content);

  return (
    <ScrollToBottom className="flex-1 overflow-y-auto px-3 py-3" initialScrollBehavior="auto">
      <ScrollToBottomContent
        visibleMessages={visibleMessages}
        isGenerating={isGenerating}
        messages={messages}
        onInsert={onInsert}
      />
    </ScrollToBottom>
  );
}

function ScrollToBottomContent({
  visibleMessages,
  isGenerating,
  messages,
  onInsert,
}: {
  visibleMessages: AIMessage[];
  isGenerating: boolean;
  messages: AIMessage[];
  onInsert: (text: string) => void;
}) {
  const scrollToBottom = useScrollToBottom();
  const atBottom = useAtBottom();

  return (
    <>
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
          onInsert={() => onInsert(msg.content)}
        />
      ))}

      {isGenerating && messages[messages.length - 1]?.content === '' && (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm px-1">
          <Sparkles size={14} className="animate-pulse" />
          思考中...
        </div>
      )}

      {/* Scroll-to-bottom button when user scrolled up */}
      {!atBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="sticky bottom-0 mx-auto block rounded-full px-3 py-1 text-xs bg-[var(--accent)] text-white shadow-md hover:opacity-90 transition-opacity"
        >
          ↓ 滚动到底部
        </button>
      )}
    </>
  );
}

function ChatBubble({ message, onInsert }: { message: AIMessage; onInsert: () => void }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex gap-2 mb-4', isUser && 'justify-end')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={14} className="text-[var(--accent)]" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[var(--accent)] text-white rounded-br-md'
            : 'bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-bl-md'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-xs max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}

        {!isUser && message.content && (
          <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {copied ? <span>✓ 已复制</span> : <><Copy size={11} /> 复制</>}
            </button>
            <button
              onClick={onInsert}
              className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronDown size={11} /> 插入文档
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-white" />
        </div>
      )}
    </div>
  );
}
