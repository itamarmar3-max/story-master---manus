/**
 * @jest-environment jsdom
 */
import { generateText, API_PROVIDERS } from './src/services/apiService.js';

// Mock global fetch
global.fetch = jest.fn();

describe('OpenRouter Compatibility and Error Handling', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();

    // Set up default settings and keys
    localStorage.setItem('storymaster_api_settings', JSON.stringify({
      provider: API_PROVIDERS.OPENROUTER,
      model: 'openai/gpt-3.5-turbo',
      temperature: 0.8
    }));
    localStorage.setItem('storymaster_api_keys', JSON.stringify({
      openrouter: 'sk-or-v1-test-key'
    }));
  });

  test('should flatten system messages into the first user message for OpenRouter', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test response' } }]
      })
    });

    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' }
    ];

    await generateText(messages);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('openrouter.ai/api/v1/chat/completions'),
      expect.objectContaining({
        body: expect.stringContaining('"role":"user","content":"You are a helpful assistant.\\n\\nHello!"')
      })
    );

    // Ensure no system message is sent
    const lastCallBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(lastCallBody.messages.find(m => m.role === 'system')).toBeUndefined();
  });

  test('should handle multiple system messages correctly', async () => {
     fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test response' } }]
      })
    });

    const messages = [
      { role: 'system', content: 'Instruction 1' },
      { role: 'system', content: 'Instruction 2' },
      { role: 'user', content: 'Prompt' }
    ];

    await generateText(messages);

    const lastCallBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(lastCallBody.messages[0].content).toBe('Instruction 1\n\nInstruction 2\n\nPrompt');
  });

  test('should provide concise error messages for OpenRouter provider failures', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      clone: function() { return this; },
      json: async () => ({
        error: { message: 'Provider returned error: capacity exceeded' }
      })
    });

    try {
      await generateText([{ role: 'user', content: 'test' }]);
    } catch (error) {
      expect(error.message).toContain('OpenRouter error for model');
      expect(error.message).not.toContain('this is usually a provider-side outage');
      expect(error.message).toContain('capacity exceeded');
    }
  });
});
