import { useAIStore, type AIConversation, type AIMessage } from '../../stores/aiStore';
import { useToastStore } from '../../stores/toastStore';
import { getAIClient } from './aiClient';

export function getConvMessages(convId: string): AIMessage[] {
  const conv = useAIStore.getState().conversations.find((item) => item.id === convId);
  return conv?.messages.filter((message) => message.content !== '') || [];
}

function updateLastMsg(convId: string, content: string): void {
  useAIStore.setState((state) => ({
    conversations: state.conversations.map((conv: AIConversation) => {
      if (conv.id !== convId) return conv;
      const messages = [...conv.messages];
      for (let index = messages.length - 1; index >= 0; index--) {
        if (messages[index].role === 'assistant') {
          messages[index] = { ...messages[index], content };
          break;
        }
      }
      return { ...conv, messages };
    }),
  }));
}

export async function streamToLastMessage(
  client: ReturnType<typeof getAIClient>,
  messages: AIMessage[],
  convId: string,
): Promise<void> {
  const { model, temperature } = useAIStore.getState();
  const toast = useToastStore.getState();
  let fullText = '';
  try {
    for await (const chunk of client.chat(messages, { model, temperature })) {
      if (chunk.type === 'content') {
        fullText += chunk.text;
        updateLastMsg(convId, fullText);
      } else if (chunk.type === 'done') {
        updateLastMsg(convId, chunk.fullText);
      } else if (chunk.type === 'error') {
        updateLastMsg(convId, `❌ ${chunk.message}`);
        toast.show('error', chunk.message);
      }
    }
  } catch (error: unknown) {
    const message = `❌ 错误: ${error instanceof Error ? error.message : String(error)}`;
    updateLastMsg(convId, message);
    toast.show('error', message.replace('❌ ', ''));
  }
}

export async function runAction(
  text: string,
  systemPrompt: string,
  prefix: string,
  convId: string,
  abortRef: { current: (() => void) | null },
): Promise<void> {
  const store = useAIStore.getState();
  if (store.isGenerating) return;
  store.addMessage(convId, { role: 'user', content: `${prefix}\n\n${text}` });
  store.setGenerating(true);

  if (store.provider !== 'mock' && !store.apiKey.trim()) {
    store.addMessage(convId, {
      role: 'assistant',
      content: '⚠️ 尚未配置 API Key\n\n请点击工具栏齿轮图标 ⚙️ → 选择服务商 → 输入 API Key。',
    });
    store.setGenerating(false);
    return;
  }

  store.addMessage(convId, { role: 'assistant', content: '' });
  const client = getAIClient();
  abortRef.current = () => client.abort();
  try {
    await streamToLastMessage(client, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ], convId);
  } finally {
    store.setGenerating(false);
    abortRef.current = null;
  }
}
