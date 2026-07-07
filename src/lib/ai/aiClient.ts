import type { IAIClient } from './types';
import { OpenAIClient } from './providers/openai';
import { MockClient } from './providers/mock';
import { useAIStore } from '../../stores/aiStore';
import type { AIProvider } from '../../stores/aiStore';

/**
 * Create the appropriate AI client based on provider configuration.
 */
export function createAIClient(provider: AIProvider, apiKey: string, baseUrl?: string): IAIClient {
  switch (provider) {
    case 'openai':
      return new OpenAIClient(apiKey, baseUrl);
    case 'mock':
    default:
      return new MockClient();
  }
}

/**
 * Get a configured AI client from the current store state.
 */
export function getAIClient(): IAIClient {
  const { provider, apiKey, baseUrl } = useAIStore.getState();
  return createAIClient(provider, apiKey, baseUrl);
}
