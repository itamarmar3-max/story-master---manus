// context.test.js
import { generateFullStory, summarizeChapter } from './src/services/heliosEngine.js';
import * as apiService from './src/services/apiService.js';

// Mock the apiService
jest.mock('./src/services/apiService.js');

test('should use summaries for long stories', async () => {
  // 1. Configure API settings for the test
  apiService.getApiSettings.mockReturnValue({
    provider: 'openrouter',
    model: 'dummy-model',
    temperature: 0.8,
  });
  apiService.getApiKeys.mockReturnValue({
    openrouter: 'dummy-api-key',
  });

  // 2. Define the story premise and config
  const premise = 'A space explorer discovers a new planet.';
  const config = {
    genre: 'sci-fi',
    narrativeStructure: 'heros-journey',
    pacingProfile: 'balanced',
    targetWordCount: 100000,
    language: 'en',
  };

  // 3. Mock the generateWithRetry function
  let callCount = 0;
  apiService.generateWithRetry.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      return Promise.resolve(JSON.stringify({
        coreConflict: 'Man vs. Nature',
        theme: 'The spirit of exploration',
      }));
    } else if (callCount === 2) {
      return Promise.resolve(JSON.stringify({
        characters: [{ name: 'Kael' }],
        world: { keyLocations: ['Planet X'] },
      }));
    } else if (callCount === 3) {
      return Promise.resolve(JSON.stringify({
        structure: 'heros-journey',
        totalBeats: 5,
        beats: [
          { beatNumber: 1, sceneTitle: 'The Landing' },
          { beatNumber: 2, sceneTitle: 'First Contact' },
          { beatNumber: 3, sceneTitle: 'The Storm' },
          { beatNumber: 4, sceneTitle: 'The Escape' },
          { beatNumber: 5, sceneTitle: 'The Return' },
        ],
      }));
    } else if (callCount > 3 && callCount <= 18) {
      return Promise.resolve(`This is test chapter ${callCount - 3}.`);
    }
    return Promise.resolve('This is a summary.');
  });

  // 4. Generate the story
  const story = await generateFullStory(premise, config, () => {});

  // 5. Validate the output
  expect(story).toBeDefined();
  expect(story.chapters).toBeDefined();
  expect(story.chapters.length).toBe(15);
  expect(apiService.generateWithRetry).toHaveBeenCalledTimes(31); // 3 setup calls + 15 chapter calls + 13 summary calls
});
