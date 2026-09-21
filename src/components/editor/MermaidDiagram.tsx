import { memo, useEffect, useId, useState } from 'react';

interface Props {
  chart: string;
}

let initializedTheme = '';

export const MermaidDiagram = memo(function MermaidDiagram({ chart }: Props) {
  const reactId = useId();
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default';
        if (initializedTheme !== theme) {
          mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme });
          initializedTheme = theme;
        }
        const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}-${Date.now()}`;
        const result = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(result.svg);
          setError('');
        }
      } catch (reason) {
        if (!cancelled) {
          setSvg('');
          setError(reason instanceof Error ? reason.message : 'Mermaid 图表渲染失败');
        }
      }
    };
    void render();
    return () => { cancelled = true; };
  }, [chart, reactId]);

  if (error) {
    return (
      <div className="my-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-900 dark:bg-red-950/30">
        <div className="mb-2 text-red-600 dark:text-red-300">{error}</div>
        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[var(--text-secondary)]">{chart}</pre>
      </div>
    );
  }
  if (!svg) return <div className="my-4 min-h-24 animate-pulse rounded-xl bg-[var(--border-subtle)]" />;
  return <div className="my-6 overflow-x-auto rounded-xl py-2 text-center [&>svg]:mx-auto [&>svg]:max-h-[75vh] [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
});
