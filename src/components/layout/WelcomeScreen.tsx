import { FileText, FolderOpen, FilePlus } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';

export function WelcomeScreen() {
  const { recentFiles, setCurrentFile } = useFileStore();
  const { setContent } = useEditorStore();

  const handleNewFile = () => {
    setCurrentFile({ name: '未命名.md' });
    setContent('');
  };

  const handleOpenFile = () => {
    // Phase 3: Tauri native dialog
    // For now, use browser fallback
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const content = await file.text();
      setCurrentFile({ name: file.name });
      setContent(content);
    };
    input.click();
  };

  const templates = [
    { label: '空白文档', icon: <FilePlus size={18} />, content: '' },
    { label: '会议纪要', icon: <FileText size={18} />, content: '# 会议纪要\n\n**日期**：\n**参会人**：\n\n## 议题\n\n## 决议\n\n## 待办\n\n- [ ] ' },
    { label: '技术文档', icon: <FileText size={18} />, content: '# 技术文档\n\n## 概述\n\n## 架构\n\n## API\n\n## 使用方式\n' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--bg-editor)]">
      <div className="text-center max-w-md animate-in fade-in">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-orange-400 flex items-center justify-center shadow-[var(--shadow-md)]">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            NextMD
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Markdown 编辑器
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={handleNewFile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--text-primary)] text-white text-sm font-medium shadow-[var(--shadow-sm)] hover:opacity-90 transition-opacity"
          >
            <FileText size={16} />
            新建文档
          </button>
          <button
            onClick={handleOpenFile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium border border-[var(--border-default)] shadow-[var(--shadow-sm)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <FolderOpen size={16} />
            打开文件
          </button>
        </div>

        {/* Recent files */}
        {recentFiles.length > 0 && (
          <div className="text-left mb-8">
            <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
              最近文件
            </h3>
            <div className="space-y-0.5">
              {recentFiles.slice(0, 5).map((f) => (
                <button
                  key={f.name}
                  onClick={() => setCurrentFile({ name: f.name, path: f.path })}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors flex items-center gap-2"
                >
                  <FileText size={14} className="text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <span className="text-[11px] text-[var(--text-muted)] ml-auto shrink-0">
                    {timeAgo(f.lastOpened)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        <div className="text-left">
          <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
            快速模板
          </h3>
          <div className="flex gap-2">
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setCurrentFile({ name: '未命名.md' });
                  setContent(t.content);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return `${Math.floor(days / 7)}周前`;
}
