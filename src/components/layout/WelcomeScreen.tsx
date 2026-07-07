import { FileText, FolderOpen, FilePlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { openFile, openFileByPath } from '../../lib/fileOps';

export function WelcomeScreen() {
  const { recentFiles, setCurrentFile, addRecentFile } = useFileStore();
  const { setContent } = useEditorStore();

  const handleNewFile = () => {
    setCurrentFile({ name: '未命名.md' });
    setContent('', false);
    addRecentFile('未命名.md', undefined);
  };

  const handleOpenFile = async () => {
    const result = await openFile();
    if (!result) return;
    setCurrentFile({ name: result.name, path: result.path });
    setContent(result.content, false);
    addRecentFile(result.name, result.path);
  };

  const handleOpenRecentFile = async (filePath?: string) => {
    const result = filePath ? await openFileByPath(filePath) : null;
    if (result) {
      setCurrentFile({ name: result.name, path: result.path });
      setContent(result.content, false);
      addRecentFile(result.name, result.path);
      return;
    }
    handleOpenFile();
  };

  const templates = [
    { label: '空白文档', icon: <FilePlus size={18} />, content: '' },
    { label: '会议纪要', icon: <FileText size={18} />, content: '# 会议纪要\n\n**日期**：\n**参会人**：\n\n## 议题\n\n## 决议\n\n## 待办\n\n- [ ] ' },
    { label: '技术文档', icon: <FileText size={18} />, content: '# 技术文档\n\n## 概述\n\n## 架构\n\n## API\n\n## 使用方式\n' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--bg-editor)]">
      <div className="text-center max-w-lg px-8 py-12">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-orange-400 flex items-center justify-center shadow-[var(--shadow-md)]">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">NextMD</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Markdown 编辑器</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            onClick={handleNewFile}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--text-primary)] text-white text-sm font-medium shadow-[var(--shadow-sm)] hover:opacity-90 transition-opacity"
          >
            <FileText size={16} />新建文档
          </button>
          <button
            onClick={handleOpenFile}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium border border-[var(--border-default)] shadow-[var(--shadow-sm)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <FolderOpen size={16} />打开文件
          </button>
        </div>

        {recentFiles.length > 0 && (
          <div className="text-left mb-8">
            <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">最近文件</h3>
            <div className="space-y-0.5">
              {recentFiles.slice(0, 5).map((f) => (
                <button
                  key={f.name + f.lastOpened}
                  onClick={() => handleOpenRecentFile(f.path)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors flex items-center gap-2"
                >
                  <FileText size={14} className="text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <span className="text-[11px] text-[var(--text-muted)] ml-auto shrink-0">{timeAgo(f.lastOpened)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-left">
          <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">快速模板</h3>
          <div className="flex gap-2">
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setCurrentFile({ name: '未命名.md' });
                  setContent(t.content, false);
                  addRecentFile('未命名.md', undefined);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  return formatDistanceToNow(ts, { addSuffix: true, locale: zhCN });
}
