import { create } from 'zustand';

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
}

const newId = () => crypto.randomUUID();

export const useAIStore = create<AIState>((set) => ({
  provider: 'deepseek',
  apiKey: '',
  model: 'deepseek-chat',
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
      conversations: s.conversations.map((c) =>
        c.id === convId ? { ...c, messages: [...c.messages, msg] } : c
      ),
    })),

  newConversation: () => {
    const id = newId();
    set((s) => ({
      conversations: [
        ...s.conversations,
        {
          id,
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
        },
      ],
      activeConversationId: id,
    }));
    return id;
  },
}));
