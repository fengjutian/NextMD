import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { useAIStore, type AIProvider } from '../../stores/aiStore';

const PROVIDERS: { value: AIProvider; label: string; help: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', help: 'api.deepseek.com/v1' },
  { value: 'openai', label: 'OpenAI / 兼容', help: '任何 OpenAI 兼容 API' },
  { value: 'mock', label: 'Mock（测试）', help: '开发环境模拟回复' },
];

interface AISettingsProps {
  triggerClass?: string;
}

export function AISettings({ triggerClass }: AISettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const store = useAIStore();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="AI 设置"
        className={triggerClass}
      >
        <Settings size={14} />
      </button>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-80 p-5 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-default)]"
            style={{ background: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[var(--text-primary)]">AI 模型配置</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
              >
                <X size={14} />
              </button>
            </div>

            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1.5">服务商</label>
            <div className="space-y-1 mb-4">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => store.setProvider(p.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    store.provider === p.value
                      ? 'bg-[var(--accent-muted)] text-[var(--accent)] font-medium'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-[11px] opacity-60">{p.help}</div>
                </button>
              ))}
            </div>

            {store.provider !== 'mock' && (
              <>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">API 端点</label>
                <input
                  type="text"
                  value={store.baseUrl}
                  onChange={(e) => store.setBaseUrl(e.target.value)}
                  className="w-full mb-3 px-2.5 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-window)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />

                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">API Key</label>
                <input
                  type="password"
                  value={store.apiKey}
                  onChange={(e) => store.setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full mb-3 px-2.5 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-window)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]"
                />
              </>
            )}

            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">模型</label>
            <input
              type="text"
              value={store.model}
              onChange={(e) => store.setModel(e.target.value)}
              placeholder="deepseek-chat"
              className="w-full mb-3 px-2.5 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-window)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />

            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              温度：{store.temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={store.temperature}
              onChange={(e) => store.setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
