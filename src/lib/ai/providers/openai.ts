import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { IAIClient, AIMessage, ChatOptions, AIChunk } from '../types';

/**
 * OpenAI / OpenAI-compatible API provider using Vercel AI SDK.
 */
export class OpenAIClient implements IAIClient {
  private apiKey: string;
  private baseUrl: string;
  private controller: AbortController | null = null;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async *chat(messages: AIMessage[], options: ChatOptions = {}): AsyncIterable<AIChunk> {
    this.controller = new AbortController();

    try {
      const openai = createOpenAI({
        baseURL: this.baseUrl,
        apiKey: this.apiKey,
        name: 'openai',
      });

      const result = streamText({
        model: openai.chat(options.model || 'gpt-4o'),
        messages: messages.map((m) => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })),
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens,
        abortSignal: this.controller.signal,
      });

      let fullText = '';
      for await (const text of result.textStream) {
        fullText += text;
        yield { type: 'content', text };
      }
      yield { type: 'done', fullText };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        yield { type: 'error', message: '生成已停止' };
      } else {
        yield {
          type: 'error',
          message: `请求失败: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    }
  }

  abort(): void {
    this.controller?.abort();
    this.controller = null;
  }
}
