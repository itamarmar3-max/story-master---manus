// test.js
import { generateFullStory } from './src/services/heliosEngine.js';
import * as apiService from './src/services/apiService.js';

// Mock the apiService
jest.mock('./src/services/apiService.js');

test('should generate a story successfully', async () => {
  // 1. Configure API settings for the test
  apiService.getApiSettings.mockReturnValue({
    provider: 'openrouter',
    model: 'dummy-model',
    temperature: 0.8,
    maxTokens: 20000,
  });
  apiService.getApiKeys.mockReturnValue({
    openrouter: 'dummy-api-key',
  });

  // 2. Define the story premise and config
  const premise = 'A detective discovers a conspiracy in a futuristic city.';
  const config = {
    genre: 'sci-fi',
    narrativeStructure: 'three-act',
    pacingProfile: 'balanced',
    targetWordCount: 50000,
    language: 'en',
  };

  // 3. Mock the generateWithRetry function
  let callCount = 0;
  apiService.generateWithRetry.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      return Promise.resolve(JSON.stringify({
        coreConflict: 'Man vs. Machine',
        theme: 'The nature of consciousness',
      }));
    } else if (callCount === 2) {
      return Promise.resolve(JSON.stringify({
        characters: [{ name: 'Jax' }],
        world: { keyLocations: ['Neo-Kyoto'] },
      }));
    } else if (callCount === 3) {
      return Promise.resolve(JSON.stringify({
        structure: 'three-act',
        totalBeats: 1,
        beats: [{ beatNumber: 1, sceneTitle: 'The Discovery' }],
      }));
    }
    return Promise.resolve('This is a test chapter.');
  });

  // 4. Generate the story
  const story = await generateFullStory(premise, config, () => {});

  // 5. Validate the output
  expect(story).toBeDefined();
  expect(story.chapters).toBeDefined();
  expect(story.chapters.length).toBeGreaterThan(0);
});
