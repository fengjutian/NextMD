import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Settings, X, Zap } from 'lucide-react';
import { useAIStore, type AIProvider } from '../../stores/aiStore';
import { createAIClient } from '../../lib/ai/aiClient';

const PROVIDERS: { value: AIProvider; label: string; help: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', help: 'api.deepseek.com/v1' },
  { value: 'openai', label: 'OpenAI / 兼容', help: '任何 OpenAI 兼容 API' },
  { value: 'mock', label: 'Mock（测试）', help: '开发环境模拟回复' },
];

interface AISettingsProps {
  triggerClass?: string;
}

export function AISettings({ triggerClass }: AISettingsProps) {
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const store = useAIStore();

  const handleTest = async () => {
    if (store.provider === 'mock') {
      setTestResult({ ok: true, msg: 'Mock 模式无需测试' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const client = createAIClient(store.provider, store.apiKey, store.baseUrl);
      for await (const chunk of client.chat(
        [{ role: 'user', content: 'hi' }],
        { model: store.model },
      )) {
        if (chunk.type === 'content') {
          setTestResult({ ok: true, msg: '连接成功！AI 已响应' });
          break;
        }
        if (chunk.type === 'error') {
          setTestResult({ ok: false, msg: chunk.message });
          break;
        }
        if (chunk.type === 'done') {
          setTestResult({ ok: false, msg: 'AI 无输出，请检查模型名称' });
          break;
        }
      }
    } catch (err: unknown) {
      setTestResult({ ok: false, msg: err instanceof Error ? err.message : String(err) });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button title="AI 设置" className={triggerClass}>
          <Settings size={14} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/15 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border-default)] p-5 shadow-[var(--shadow-lg)]"
          style={{ background: 'var(--bg-card)' }}
        >
          <Dialog.Title className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center justify-between">
            AI 模型配置
            <Dialog.Close asChild>
              <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-muted)]">
                <X size={14} />
              </button>
            </Dialog.Close>
          </Dialog.Title>

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
            placeholder="deepseek-v4-flash"
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

          {store.provider !== 'mock' && (
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
              <button
                onClick={handleTest}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]"
              >
                <Zap size={13} />
                {testing ? '测试中...' : '测试连接'}
              </button>
              {testResult && (
                <p className={`mt-2 text-xs ${testResult.ok ? 'text-green-500' : 'text-red-400'}`}>
                  {testResult.ok ? '✅ ' : '❌ '}{testResult.msg}
                </p>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
