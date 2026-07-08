import { createOpenAI } from '@ai-sdk/openai';
import { streamText, APICallError, NoOutputGeneratedError } from 'ai';
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

      // Separate system message from conversation messages (AI SDK v4 requires system in separate field)
      const systemMsg = messages.find((m) => m.role === 'system');
      const conversation = messages.filter((m) => m.role !== 'system');

      const result = streamText({
        model: openai.chat(options.model || 'deepseek-v4-flash'),
        messages: conversation.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        ...(systemMsg ? { system: systemMsg.content } : {}),
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
      } else if (err instanceof APICallError) {
        const status = err.statusCode;
        if (status === 401) yield { type: 'error', message: 'API Key 无效，请在 AI 设置中检查 Key 是否正确' };
        else if (status === 403) yield { type: 'error', message: '无权限访问，请检查 API Key 是否有访问权限' };
        else if (status === 404) yield { type: 'error', message: '模型不存在，请检查模型名称是否正确' };
        else if (status === 429) yield { type: 'error', message: '请求太频繁，请稍后再试' };
        else if (status && status >= 500) yield { type: 'error', message: '服务端错误，请稍后再试' };
        else yield { type: 'error', message: `API 错误 (${status}): ${err.message}` };
      } else if (err instanceof NoOutputGeneratedError) {
        yield { type: 'error', message: 'AI 未返回内容，请检查 API 设置或稍后重试' };
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
