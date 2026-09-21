import { useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Cpu, KeyRound, Server, Settings, Thermometer, X, Zap } from 'lucide-react';
import { useAIStore, type AIProvider } from '../../stores/aiStore';
import { createAIClient } from '../../lib/ai/aiClient';
import { cn } from '../../lib/utils';

const PROVIDERS: { value: AIProvider; label: string; help: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', help: 'DeepSeek 官方 API' },
  { value: 'openai', label: 'OpenAI / 兼容', help: '支持 OpenAI 协议的服务' },
  { value: 'mock', label: 'Mock（测试）', help: '无需密钥的本地模拟响应' },
];

export function AISettings({ triggerClass }: { triggerClass?: string }) {
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const store = useAIStore();

  const selectProvider = (provider: AIProvider) => {
    store.setProvider(provider);
    setResult(null);
  };

  const testConnection = async () => {
    if (store.provider === 'mock') return setResult({ ok: true, msg: 'Mock 模式无需测试连接' });
    setTesting(true);
    setResult(null);
    try {
      const client = createAIClient(store.provider, store.apiKey, store.baseUrl);
      for await (const chunk of client.chat([{ role: 'user', content: 'hi' }], { model: store.model })) {
        if (chunk.type === 'content') {
          setResult({ ok: true, msg: '连接成功，AI 已响应' });
          break;
        }
        if (chunk.type === 'error') {
          setResult({ ok: false, msg: chunk.message });
          break;
        }
        if (chunk.type === 'done') {
          setResult({ ok: false, msg: 'AI 没有返回内容，请检查模型名称' });
          break;
        }
      }
    } catch (error: unknown) {
      setResult({ ok: false, msg: error instanceof Error ? error.message : String(error) });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button title="AI 设置" className={triggerClass}><Settings size={14} /></button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(620px,calc(100vh-48px))] w-[min(760px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-lg)] focus:outline-none">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-6">
            <div>
              <Dialog.Title className="text-base font-semibold text-[var(--text-primary)]">AI 模型设置</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--text-muted)]">配置用于续写、润色、翻译和总结的模型服务</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button aria-label="关闭设置" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]"><X size={16} /></button>
            </Dialog.Close>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)] max-sm:grid-cols-1">
            <aside className="overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-window)] p-4 max-sm:border-b max-sm:border-r-0">
              <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">服务商</div>
              <div className="space-y-1.5">
                {PROVIDERS.map((provider) => {
                  const active = provider.value === store.provider;
                  return (
                    <button key={provider.value} onClick={() => selectProvider(provider.value)} className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                      active ? 'border-[var(--accent)] bg-[var(--accent-muted)]' : 'border-transparent hover:bg-[var(--border-subtle)]',
                    )}>
                      <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', active ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)]')}><Cpu size={14} /></span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-sm font-medium', active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>{provider.label}</span>
                        <span className="mt-0.5 block text-[11px] leading-4 text-[var(--text-muted)]">{provider.help}</span>
                      </span>
                      {active && <Check className="mt-1 shrink-0 text-[var(--accent)]" size={14} />}
                    </button>
                  );
                })}
              </div>
            </aside>

            <main className="min-h-0 overflow-y-auto p-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">连接配置</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">配置会保存在当前设备上。</p>
              <div className="mt-5 space-y-5">
                {store.provider !== 'mock' && <>
                  <Field label="API 端点" icon={<Server size={14} />} hint="服务商提供的兼容接口地址">
                    <input type="url" value={store.baseUrl} onChange={(e) => store.setBaseUrl(e.target.value)} placeholder="https://api.example.com/v1" className="settings-input" />
                  </Field>
                  <Field label="API Key" icon={<KeyRound size={14} />} hint="密钥仅用于向所选服务发起请求">
                    <input type="password" value={store.apiKey} onChange={(e) => store.setApiKey(e.target.value)} placeholder="sk-..." autoComplete="off" className="settings-input" />
                  </Field>
                </>}
                <Field label="模型" icon={<Cpu size={14} />} hint="填写服务商支持的准确模型名称">
                  <input type="text" value={store.model} onChange={(e) => store.setModel(e.target.value)} placeholder="deepseek-chat" className="settings-input" />
                </Field>
                <Field label="温度" icon={<Thermometer size={14} />} hint="数值越低回答越稳定，数值越高表达越灵活">
                  <div className="flex items-center gap-4">
                    <input type="range" min="0" max="2" step="0.1" value={store.temperature} onChange={(e) => store.setTemperature(Number(e.target.value))} className="min-w-0 flex-1 accent-[var(--accent)]" />
                    <output className="w-12 rounded-lg border border-[var(--border-default)] bg-[var(--bg-window)] px-2 py-1.5 text-center text-xs tabular-nums text-[var(--text-secondary)]">{store.temperature.toFixed(1)}</output>
                  </div>
                </Field>
              </div>
            </main>
          </div>

          <footer className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-6 py-3">
            <div className="min-w-0 flex-1">{result && <p className={cn('truncate text-xs', result.ok ? 'text-green-600' : 'text-red-500')} title={result.msg}>{result.ok ? '连接正常：' : '连接失败：'}{result.msg}</p>}</div>
            <div className="flex shrink-0 items-center gap-2">
              {store.provider !== 'mock' && <button onClick={testConnection} disabled={testing} className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border-default)] px-4 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] disabled:opacity-50"><Zap size={14} />{testing ? '正在测试…' : '测试连接'}</button>}
              <Dialog.Close asChild><button className="h-9 rounded-lg bg-[var(--accent)] px-5 text-xs font-medium text-white hover:opacity-90">完成</button></Dialog.Close>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, icon, hint, children }: { label: string; icon: ReactNode; hint: string; children: ReactNode }) {
  return <label className="block">
    <span className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"><span className="text-[var(--text-muted)]">{icon}</span>{label}</span>
    {children}
    <span className="mt-1.5 block text-[11px] text-[var(--text-muted)]">{hint}</span>
  </label>;
}
