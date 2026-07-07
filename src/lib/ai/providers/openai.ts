import type { IAIClient, AIMessage, ChatOptions, AIChunk } from '../types';

/**
 * OpenAI / OpenAI-compatible API provider.
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

    const body = JSON.stringify({
      model: options.model || 'gpt-4o',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body,
        signal: this.controller.signal,
      });

      if (!response.ok) {
        const err = await response.text();
        yield { type: 'error', message: `API 错误 (${response.status}): ${err}` };
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield { type: 'error', message: '无法读取响应流' };
        return;
      }

      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done', fullText };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              yield { type: 'content', text: content };
            }
          } catch {
            // Skip malformed SSE
          }
        }
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
