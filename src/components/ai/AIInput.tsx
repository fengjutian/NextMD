import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface AIInputProps {
  onSend: (message: string) => void;
  isGenerating: boolean;
  onStop: () => void;
}

export function AIInput({ onSend, isGenerating, onStop }: AIInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [input, isGenerating, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="p-3 border-t border-[var(--border-subtle)] shrink-0">
      <div className="flex items-end gap-2 bg-[var(--border-subtle)] rounded-xl px-3 py-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] max-h-[120px] editor-area"
        />

        {isGenerating ? (
          <button
            onClick={onStop}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500 text-white shrink-0 hover:bg-red-600 transition-colors"
          >
            <Square size={12} fill="white" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--accent)] text-white shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
