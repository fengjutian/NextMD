import type { IAIClient, AIMessage, ChatOptions, AIChunk } from '../types';

/**
 * Mock AI provider for development and testing.
 * Simulates a streaming response with a delay.
 */
export class MockClient implements IAIClient {
  private aborted = false;

  async *chat(messages: AIMessage[], _options?: ChatOptions): AsyncIterable<AIChunk> {
    this.aborted = false;

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    // Generate a mock response based on user input
    const response = generateMockResponse(lastUserMsg);

    // Simulate character-by-character streaming
    for (let i = 0; i < response.length; i++) {
      if (this.aborted) {
        yield { type: 'error', message: '生成已停止' };
        return;
      }
      await sleep(30); // Simulate network delay
      yield { type: 'content', text: response[i] };
    }

    yield { type: 'done', fullText: response };
  }

  abort(): void {
    this.aborted = true;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('你好') || lower.includes('hello') || lower.includes('hi')) {
    return '你好！我是 NextMD 的 AI 助手。我可以帮你写作、润色文字、翻译内容，或者回答关于 Markdown 的问题。有什么我可以帮助你的吗？';
  }

  if (lower.includes('翻译') || lower.includes('translate')) {
    return '好的，以下是翻译结果：\n\n这是一段模拟的翻译内容。在实际使用中，这里会显示由 AI 模型生成的准确翻译。你可以配置 OpenAI 或 Anthropic API 密钥来获得真实的翻译功能。';
  }

  if (lower.includes('润色') || lower.includes('改写') || lower.includes('polish')) {
    return '以下是润色后的版本：\n\n这段文字经过 AI 润色，语法更加流畅，表达更加清晰自然。在实际使用中，AI 会根据你的原文风格进行智能改写。\n\n**主要改进：**\n- 优化了句式结构\n- 替换了重复用词\n- 增强了表达力度';
  }

  if (lower.includes('markdown') || lower.includes('语法')) {
    return '**Markdown 常用语法速查：**\n\n# 标题\n## 二级标题\n### 三级标题\n\n**粗体** *斜体* ~~删除线~~\n\n- 无序列表\n- 项目\n\n1. 有序列表\n2. 项目\n\n`行内代码`\n\n```\n代码块\n```\n\n> 引用\n\n[链接](url)\n\n![图片](url)\n\n| 表格 | 列 |\n| --- | --- |\n| 数据 | 值 |';
  }

  if (lower.includes('总结') || lower.includes('摘要') || lower.includes('summarize')) {
    return '这是一段模拟的总结内容。\n\n在实际使用中，AI 会分析你提供的原文，提取关键信息，并生成结构清晰的摘要。\n\n你可以切换到真实的 AI Provider 来使用此功能。';
  }

  return `收到你的消息：「${input.slice(0, 50)}${input.length > 50 ? '...' : ''}」

这是一个模拟回复。当前使用的是 **Mock Provider**，用于开发和测试。

要使用真实的 AI 功能，请：
1. 打开 AI 设置
2. 选择 Provider（OpenAI / Anthropic）
3. 填入你的 API 密钥
4. 开始真正的 AI 对话`;
}
