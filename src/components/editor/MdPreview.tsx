import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useEditorStore } from '../../stores/editorStore';

export function MdPreview() {
  const { content } = useEditorStore();

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-preview)] text-[var(--text-muted)] text-sm">
        在源码模式下编辑，此处将实时预览
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-preview)] px-8 py-6 editor-area">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            img: ({ src, alt }) => (
              <img src={src} alt={alt} className="rounded-lg my-4 max-w-full" loading="lazy" />
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                {children}
              </a>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[0.875em] font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-[var(--bg-window)] rounded-xl p-4 overflow-x-auto my-4 border border-[var(--border-subtle)]">
                {children}
              </pre>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-[var(--border-default)] rounded-lg">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-[var(--border-default)] px-4 py-2 bg-[var(--border-subtle)] text-left text-sm font-medium">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-[var(--border-default)] px-4 py-2 text-sm">
                {children}
              </td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-3 border-[var(--accent)] pl-4 my-4 text-[var(--text-secondary)] italic">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
