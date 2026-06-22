import { describe, expect, it } from 'vitest';

import { extractAssistantContent, resolveLlmConfig } from './llm.js';

describe('chat llm config', () => {
  it('prefers MINIMAX_API_KEY and MiniMax-M3 defaults', () => {
    const prev = {
      MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
      MINIMAX_MODEL: process.env.MINIMAX_MODEL,
      CHAT_LLM_API_KEY: process.env.CHAT_LLM_API_KEY,
      CHAT_LLM_BASE_URL: process.env.CHAT_LLM_BASE_URL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    };

    process.env.MINIMAX_API_KEY = 'test-minimax-key';
    process.env.MINIMAX_MODEL = 'MiniMax-M3';
    delete process.env.CHAT_LLM_API_KEY;
    delete process.env.CHAT_LLM_BASE_URL;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;

    const config = resolveLlmConfig();
    expect(config.apiKey).toBe('test-minimax-key');
    expect(config.baseUrl).toBe('https://api.minimax.io/v1');
    expect(config.model).toBe('MiniMax-M3');
    expect(config.provider).toBe('minimax');

    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('strips MiniMax thinking tags from content', () => {
    const content = extractAssistantContent({
      content:
        '<redacted_thinking>\nPlan the answer.\n</redacted_thinking>\n\nGovernance starts with decision rights.',
    });
    expect(content).toBe('Governance starts with decision rights.');
  });
});
