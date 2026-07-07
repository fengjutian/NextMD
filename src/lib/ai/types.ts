export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export type AIChunk =
  | { type: 'content'; text: string }
  | { type: 'done'; fullText: string }
  | { type: 'error'; message: string };

/** AI Client interface — implement for each provider */
export interface IAIClient {
  /** Stream chat completion. Returns an async iterable of chunks. */
  chat(messages: AIMessage[], options?: ChatOptions): AsyncIterable<AIChunk>;
  /** Abort the current streaming request */
  abort(): void;
}
