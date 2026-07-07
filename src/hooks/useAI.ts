import { useCallback, useRef } from 'react';
import { useAIStore, type AIMessage, type AIConversation } from '../stores/aiStore';
import { useEditorStore } from '../stores/editorStore';
import { getAIClient } from '../lib/ai/aiClient';
import {
  ASSISTANT_SYSTEM_PROMPT, REWRITE_SYSTEM_PROMPT,
  TRANSLATE_SYSTEM_PROMPT, SUMMARIZE_SYSTEM_PROMPT,
  CONTINUE_SYSTEM_PROMPT,
} from '../lib/ai/prompts';

export function useAI() {
  const activeConversationId = useAIStore((s) => s.activeConversationId);
  const isPanelOpen = useAIStore((s) => s.isPanelOpen);
  const isGenerating = useAIStore((s) => s.isGenerating);
  const conversations = useAIStore((s) => s.conversations);
  const newConversation = useAIStore((s) => s.newConversation);
  const addMessage = useAIStore((s) => s.addMessage);
  const setGenerating = useAIStore((s) => s.setGenerating);
  const togglePanel = useAIStore((s) => s.togglePanel);

  const { content, setContent } = useEditorStore();
  const abortRef = useRef<(() => void) | null>(null);

  const ensureConversation = useCallback(() => {
    if (!activeConversationId) {
      newConversation();
    }
    if (!isPanelOpen) {
      togglePanel();
    }
  }, [activeConversationId, isPanelOpen, newConversation, togglePanel]);

  const sendMessage = useCallback(async (userMessage: string) => {
    ensureConversation();
    const convId = useAIStore.getState().activeConversationId!;
    addMessage(convId, { role: 'user', content: userMessage });
    setGenerating(true);
    addMessage(convId, { role: 'assistant', content: '' });

    const client = getAIClient();
    abortRef.current = () => client.abort();

    const messages: AIMessage[] = [
      { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
      ...getConvMessages(convId),
    ];

    await streamToLastMessage(client, messages, convId);
    setGenerating(false);
    abortRef.current = null;
  }, [ensureConversation, addMessage, setGenerating]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.();
  }, []);

  const rewrite = useCallback(async (selectedText: string) => {
    ensureConversation();
    const convId = useAIStore.getState().activeConversationId!;
    await runAction(selectedText, REWRITE_SYSTEM_PROMPT, '请帮我润色以下文字：', convId, abortRef);
  }, [ensureConversation]);

  const translate = useCallback(async (selectedText: string) => {
    ensureConversation();
    const convId = useAIStore.getState().activeConversationId!;
    await runAction(selectedText, TRANSLATE_SYSTEM_PROMPT, '请翻译以下文字：', convId, abortRef);
  }, [ensureConversation]);

  const summarize = useCallback(async (selectedText: string) => {
    ensureConversation();
    const convId = useAIStore.getState().activeConversationId!;
    await runAction(selectedText, SUMMARIZE_SYSTEM_PROMPT, '请总结以下内容：', convId, abortRef);
  }, [ensureConversation]);

  const continueWriting = useCallback(async () => {
    ensureConversation();
    const convId = useAIStore.getState().activeConversationId!;
    const context = content.slice(-500);
    await runAction(context, CONTINUE_SYSTEM_PROMPT, '请续写以下内容：', convId, abortRef);
  }, [ensureConversation, content]);

  const insertToEditor = useCallback((text: string) => {
    setContent(content ? content + '\n\n' + text : text);
  }, [content, setContent]);

  return {
    activeConversationId,
    isPanelOpen,
    isGenerating,
    conversations,
    newConversation,
    addMessage,
    setGenerating,
    togglePanel,
    sendMessage,
    stopGeneration,
    rewrite,
    translate,
    summarize,
    continueWriting,
    insertToEditor,
  };
}

async function runAction(
  text: string,
  systemPrompt: string,
  prefix: string,
  convId: string,
  abortRef: React.MutableRefObject<(() => void) | null>
) {
  const store = useAIStore.getState();
  store.addMessage(convId, { role: 'user', content: `${prefix}\n\n${text}` });
  store.addMessage(convId, { role: 'assistant', content: '' });
  store.setGenerating(true);

  const client = getAIClient();
  abortRef.current = () => client.abort();

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text },
  ];

  try {
    await streamToLastMessage(client, messages, convId);
  } finally {
    store.setGenerating(false);
    abortRef.current = null;
  }
}

async function streamToLastMessage(
  client: ReturnType<typeof getAIClient>,
  messages: AIMessage[],
  convId: string
) {
  let fullText = '';
  try {
    for await (const chunk of client.chat(messages)) {
      if (chunk.type === 'content') {
        fullText += chunk.text;
        updateLastMsg(convId, fullText);
      } else if (chunk.type === 'done') {
        updateLastMsg(convId, chunk.fullText);
      } else if (chunk.type === 'error') {
        updateLastMsg(convId, `❌ ${chunk.message}`);
      }
    }
  } catch (err: unknown) {
    updateLastMsg(convId, `❌ 错误: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function getConvMessages(convId: string): AIMessage[] {
  const store = useAIStore.getState();
  const conv: AIConversation | undefined = store.conversations.find((c: AIConversation) => c.id === convId);
  return conv?.messages.filter((m: AIMessage) => m.content !== '') || [];
}

function updateLastMsg(convId: string, content: string) {
  useAIStore.setState((state) => ({
    conversations: state.conversations.map((c: AIConversation) => {
      if (c.id !== convId) return c;
      const msgs = [...c.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { ...c, messages: msgs };
    }),
  }));
}
