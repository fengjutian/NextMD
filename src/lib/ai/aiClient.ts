import type { IAIClient } from './types';
import { OpenAIClient } from './providers/openai';
import { useAIStore } from '../../stores/aiStore';
import type { AIProvider } from '../../stores/aiStore';

/**
 * Create the appropriate AI client based on provider configuration.
 */
export function createAIClient(provider: AIProvider, apiKey: string, baseUrl?: string): IAIClient {
  switch (provider) {
    case 'openai':
    case 'deepseek':
    case 'minimax':
    case 'qwen':
    case 'kimi':
    default:
      return new OpenAIClient(apiKey, baseUrl);
  }
}

/**
 * Get a configured AI client from the current store state.
 */
export function getAIClient(): IAIClient {
  const { provider, apiKey, baseUrl } = useAIStore.getState();
  return createAIClient(provider, apiKey, baseUrl);
}
