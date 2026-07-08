import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles, Copy, Check, ChevronDown, RefreshCw, Pencil, X, Send } from 'lucide-react';
import type { AIMessage } from '../../stores/aiStore';
import { cn } from '../../lib/utils';

interface ChatBubbleProps {
  message: AIMessage;
  onInsert?: () => void;
  onResend?: (newContent: string) => void;
  onEdit?: (newContent: string) => void;
  className?: string;
}

export function ChatBubble({ message, onInsert, onResend, onEdit, className }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = () => {
    onResend?.(message.content);
  };

  const handleEdit = () => {
    setEditContent(message.content);
    setEditing(true);
  };

  const handleSaveEdit = () => {
    onEdit?.(editContent);
    setEditing(false);
  };

  return (
    <div className={cn('flex gap-2 group', isUser && 'justify-end', className)}>
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
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[60px] resize-none bg-white/20 rounded-lg px-2 py-1.5 text-sm outline-none text-white placeholder:text-white/50"
              rows={3}
            />
            <div className="flex items-center gap-1.5 justify-end">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white">
                <X size={12} /> 取消
              </button>
              <button onClick={handleSaveEdit} className="flex items-center gap-1 text-[11px] bg-white/20 hover:bg-white/30 rounded-md px-2 py-0.5 text-white">
                <Send size={11} /> 重新发送
              </button>
            </div>
          </div>
        ) : (
          <>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-xs max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-[var(--border-subtle)]">
              {isUser ? (
                <>
                  {onEdit && (
                    <button onClick={handleEdit} className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white">
                      <Pencil size={11} /> 编辑
                    </button>
                  )}
                  {onResend && (
                    <button onClick={handleResend} className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white">
                      <RefreshCw size={11} /> 重新发送
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button onClick={handleCopy} className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    {copied ? <><Check size={11} /> 已复制</> : <><Copy size={11} /> 复制</>}
                  </button>
                  {onInsert && (
                    <button onClick={onInsert} className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      <ChevronDown size={11} /> 插入文档
                    </button>
                  )}
                </>
              )}
            </div>
          </>
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
