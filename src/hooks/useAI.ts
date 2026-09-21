import { useCallback, useRef } from 'react';
import { useAIStore, type AIMessage, type AIConversation } from '../stores/aiStore';
import { useEditorStore } from '../stores/editorStore';
import { getAIClient } from '../lib/ai/aiClient';
import { getConvMessages, runAction, streamToLastMessage } from '../lib/ai/conversation';
import {
  ASSISTANT_SYSTEM_PROMPT, REWRITE_SYSTEM_PROMPT,
  TRANSLATE_SYSTEM_PROMPT, SUMMARIZE_SYSTEM_PROMPT,
  CONTINUE_SYSTEM_PROMPT,
} from '../lib/ai/prompts';

export function useAI() {
  // Use full store subscription to avoid selector infinite loops in React 19 + Zustand v5
  const store = useAIStore();
  const { content, setContent } = useEditorStore();
  const abortRef = useRef<(() => void) | null>(null);

  const ensureConversation = useCallback(() => {
    const state = useAIStore.getState();
    let convId = state.activeConversationId;
    if (!convId) {
      convId = state.newConversation();
    }
    if (!state.isPanelOpen) {
      state.togglePanel();
    }
    return convId;
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (useAIStore.getState().isGenerating) return;
    const convId = ensureConversation();
    const state = useAIStore.getState();
    state.addMessage(convId, { role: 'user', content: userMessage });
    state.setGenerating(true);

    // Check API key before calling
    if (!state.apiKey.trim()) {
      state.addMessage(convId, {
        role: 'assistant',
        content: '⚠️ 尚未配置 API Key\n\n请点击工具栏齿轮图标 ⚙️ → 选择服务商 → 输入 API Key → 测试连接。\n\nDeepSeek API Key 可在 [platform.deepseek.com](https://platform.deepseek.com/api_keys) 免费获取。',
      });
      state.setGenerating(false);
      return;
    }

    state.addMessage(convId, { role: 'assistant', content: '' });

    const client = getAIClient();
    abortRef.current = () => client.abort();

    const messages: AIMessage[] = [
      { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
      ...getConvMessages(convId),
    ];

    try {
      await streamToLastMessage(client, messages, convId);
    } finally {
      state.setGenerating(false);
      abortRef.current = null;
    }
  }, [ensureConversation]);

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

  const resendMessage = useCallback(async (index: number) => {
    const state = useAIStore.getState();
    if (state.isGenerating) return;
    const convId = state.activeConversationId;
    if (!convId) return;
    const conv = state.conversations.find((c: AIConversation) => c.id === convId);
    if (conv && conv.messages[index]?.role === 'user') {
      const msgContent = conv.messages[index].content;
      const msgs = conv.messages.slice(0, index);
      useAIStore.setState({
        conversations: state.conversations.map((c) =>
          c.id === convId ? { ...c, messages: msgs } : c
        ),
      });
      await sendMessage(msgContent);
    }
  }, [sendMessage]);

  const editMessage = useCallback(async (index: number, newContent: string) => {
    const state = useAIStore.getState();
    if (state.isGenerating) return;
    const convId = state.activeConversationId;
    if (!convId) return;
    const conv = state.conversations.find((c: AIConversation) => c.id === convId);
    if (conv && conv.messages[index]?.role === 'user') {
      const msgs = conv.messages.slice(0, index);
      useAIStore.setState({
        conversations: state.conversations.map((c) =>
          c.id === convId ? { ...c, messages: msgs } : c
        ),
      });
      await sendMessage(newContent);
    }
  }, [sendMessage]);

  return {
    ...store,
    sendMessage,
    stopGeneration, rewrite, translate, summarize, continueWriting,
    insertToEditor, resendMessage, editMessage,
  };
}
