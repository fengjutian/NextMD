import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'openai' | 'deepseek' | 'mock';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: number;
}

interface AIState {
  provider: AIProvider;
  apiKey: string;
  model: string;
  temperature: number;
  baseUrl: string;
  conversations: AIConversation[];
  activeConversationId: string | null;
  isGenerating: boolean;
  isPanelOpen: boolean;

  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setTemperature: (t: number) => void;
  setBaseUrl: (url: string) => void;
  setGenerating: (v: boolean) => void;
  togglePanel: () => void;
  addMessage: (convId: string, msg: AIMessage) => void;
  newConversation: () => string;
  deleteConversation: (convId: string) => void;
}

const newId = () => crypto.randomUUID();

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      provider: 'deepseek',
      apiKey: '',
      model: 'deepseek-v4-flash',
      temperature: 0.7,
      baseUrl: 'https://api.deepseek.com/v1',
      conversations: [],
      activeConversationId: null,
      isGenerating: false,
      isPanelOpen: false,

      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setTemperature: (temperature) => set({ temperature }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),

      addMessage: (convId, msg) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== convId) return c;
            const messages = [...c.messages, msg];
            // Auto-name: use first user message as title
            const firstUserMsg = messages.find((m) => m.role === 'user');
            const title = firstUserMsg ? firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '') : c.title;
            return { ...c, messages, title };
          }),
        })),

      deleteConversation: (convId) =>
        set((s) => {
          const filtered = s.conversations.filter((c) => c.id !== convId);
          return {
            conversations: filtered,
            activeConversationId: s.activeConversationId === convId
              ? (filtered[filtered.length - 1]?.id || null)
              : s.activeConversationId,
          };
        }),

      newConversation: () => {
        const id = newId();
        set((s) => ({
          conversations: [
            ...s.conversations,
            { id, title: '新对话', messages: [], createdAt: Date.now() },
          ],
          activeConversationId: id,
        }));
        return id;
      },
    }),
    {
      name: 'nextmd-ai',
      partialize: (state) => ({
        provider: state.provider,
        model: state.model,
        temperature: state.temperature,
        baseUrl: state.baseUrl,
        conversations: state.conversations,
      }),
    }
  )
);
