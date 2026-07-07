import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useAIStore, type AIProvider } from '../../stores/aiStore';

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'mock', label: 'Mock（开发测试）' },
  { value: 'openai', label: 'OpenAI / 兼容 API' },
];

export function AISettings() {
  const [isOpen, setIsOpen] = useState(false);
  const store = useAIStore();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="AI 设置"
        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
      >
        <Settings size={14} />
      </button>
    );
  }

  return (
    <div className="absolute right-0 top-10 w-72 p-4 bg-[var(--bg-card)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--border-default)] z-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--text-primary)]">AI 设置</span>
        <button
          onClick={() => setIsOpen(false)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--border-subtle)] text-[var(--text-muted)]"
        >
          <X size={12} />
        </button>
      </div>

      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Provider</label>
      <select
        value={store.provider}
        onChange={(e) => store.setProvider(e.target.value as AIProvider)}
        className="w-full mb-3 px-2.5 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-window)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
      >
        {PROVIDERS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {store.provider !== 'mock' && (
        <>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">API 端点</label>
          <input
            type="text"
            value={store.baseUrl}
            onChange={(e) => store.setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full mb-3 px-2.5 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-window)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />

          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">API 密钥</label>
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
        placeholder="gpt-4o"
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
        className="w-full mb-3 accent-[var(--accent)]"
      />
    </div>
  );
}
