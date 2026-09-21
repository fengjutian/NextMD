import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { isTauri } from './env';

const PAGE_STYLE = `
  :root { color-scheme: light dark; font-family: system-ui, sans-serif; line-height: 1.7; }
  body { max-width: 800px; margin: 0 auto; padding: 48px 24px; overflow-wrap: break-word; }
  h1, h2, h3 { line-height: 1.3; margin-top: 1.5em; }
  a { color: #b97200; }
  img { max-width: 100%; height: auto; }
  pre { padding: 16px; overflow-x: auto; background: rgba(128,128,128,.12); border-radius: 8px; }
  code { font-family: ui-monospace, monospace; }
  blockquote { border-left: 3px solid #d99a34; margin-left: 0; padding-left: 16px; color: #666; }
  table { border-collapse: collapse; display: block; overflow-x: auto; }
  th, td { border: 1px solid #aaa; padding: 6px 12px; }
  hr { border: 0; border-top: 1px solid #aaa; }
  @media (prefers-color-scheme: dark) { blockquote { color: #aaa; } a { color: #ffc46b; } }
`;

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function createHtmlDocument(markdown: string, title: string): string {
  const body = renderToStaticMarkup(<ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>);
  return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>${PAGE_STYLE}</style></head><body><main>${body}</main></body></html>\n`;
}

export async function exportHtml(markdown: string, fileName: string): Promise<boolean> {
  const title = fileName.replace(/\.(md|markdown|mdx|txt)$/i, '') || '文档';
  const outputName = `${title}.html`;
  const html = createHtmlDocument(markdown, title);
  if (isTauri()) {
    const path = await save({ title: '导出 HTML', defaultPath: outputName,
      filters: [{ name: 'HTML', extensions: ['html'] }] });
    if (!path) return false;
    await writeTextFile(path, html);
    return true;
  }
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = outputName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
