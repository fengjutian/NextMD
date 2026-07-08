import { cn } from '../../lib/utils';

interface FollowUpSuggestionsProps {
  onSelect: (question: string) => void;
  context?: string;
}

const DEFAULT_SUGGESTIONS = [
  '能详细展开讲讲吗？',
  '给我一个具体例子',
  '用更简单的话解释一下',
  '这和前面的内容有什么关联？',
];

const WRITING_SUGGESTIONS = [
  '帮我润色这篇文档',
  '把这段改成列表形式',
  '加一个总结段落',
  '翻译成英文',
];

export function FollowUpSuggestions({ onSelect, context }: FollowUpSuggestionsProps) {
  const suggestions = context?.includes('写作') || context?.includes('文档') ? WRITING_SUGGESTIONS : DEFAULT_SUGGESTIONS;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2 shrink-0 border-t border-[var(--border-subtle)]">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={cn(
            'px-2.5 py-1 text-[11px] rounded-full border border-[var(--border-default)]',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]',
            'transition-colors shrink-0'
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
