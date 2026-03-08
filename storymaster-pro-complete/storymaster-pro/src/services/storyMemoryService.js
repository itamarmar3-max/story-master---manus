import { generateWithRetry } from './apiService.js'

const MEMORY_FALLBACK = {
  continuitySummary: '',
  activeThreads: [],
  unresolvedQuestions: [],
  characterState: []
}

const sanitizeJson = (text) => {
  // 1. Try to find content within any markdown JSON block first
  const markdownMatches = [...text.matchAll(/```json\s*([\s\S]*?)\s*```/g)]
  let candidates = markdownMatches.map(m => m[1])

  // 2. If no markdown blocks, treat the entire response as a candidate
  if (candidates.length === 0) {
    candidates = [text]
  }

  // 3. Try to extract the largest {...} or [...] object/array from each candidate
  for (const candidateText of candidates) {
    const startObj = candidateText.indexOf('{')
    const startArr = candidateText.indexOf('[')
    const startIndex = (startObj !== -1 && (startArr === -1 || startObj < startArr)) ? startObj : startArr

    const endObj = candidateText.lastIndexOf('}')
    const endArr = candidateText.lastIndexOf(']')
    const endIndex = (endObj !== -1 && (endArr === -1 || endObj > endArr)) ? endObj : endArr

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonString = candidateText
        .substring(startIndex, endIndex + 1)
        .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas

      try {
        return JSON.parse(jsonString)
      } catch (e) {
        console.warn('Failed to parse candidate JSON in storyMemoryService:', e)
      }
    }
  }

  throw new Error('No valid JSON object or array found in memory response')
}

export const createInitialMemoryState = (premise, config) => ({
  premise,
  userGoals: {
    genre: config.genre || config.eroticGenre,
    pacing: config.pacingProfile,
    intensity: config.intensityLevel,
    styleMode: config.styleMode,
  },
  chapterRecaps: [],
  continuitySummary: '',
  activeThreads: [],
  unresolvedQuestions: [],
  characterState: [],
})

export const updateStoryMemory = async (state, chapter, options = {}) => {
  const prompt = `You maintain continuity for a novel-in-progress.

CURRENT MEMORY:
${JSON.stringify({
  continuitySummary: state.continuitySummary,
  activeThreads: state.activeThreads,
  unresolvedQuestions: state.unresolvedQuestions,
  characterState: state.characterState,
}, null, 2)}

NEW CHAPTER (${chapter.id}):
Title: ${chapter.title}
Content:
${chapter.content}

Return ONLY valid JSON in this exact structure:
{
  "continuitySummary": "7-10 sentence cumulative summary preserving causality",
  "activeThreads": ["plot thread still moving", "..."] ,
  "unresolvedQuestions": ["question", "..."],
  "characterState": [
    { "name": "", "state": "emotional+goal+conflict update in one sentence" }
  ],
  "chapterRecap": "2-3 sentence recap of this chapter ending with immediate consequences"
}`

  const messages = [{ role: 'user', content: prompt }]

  try {
    const response = await generateWithRetry(messages, { ...options, temperature: 0.3, maxTokens: 1400 })
    const parsed = sanitizeJson(response)

    return {
      ...state,
      continuitySummary: parsed.continuitySummary || state.continuitySummary,
      activeThreads: parsed.activeThreads || state.activeThreads,
      unresolvedQuestions: parsed.unresolvedQuestions || state.unresolvedQuestions,
      characterState: parsed.characterState || state.characterState,
      chapterRecaps: [
        ...state.chapterRecaps,
        {
          chapterId: chapter.id,
          recap: parsed.chapterRecap || '',
        }
      ]
    }
  } catch (error) {
    console.warn('Failed to update memory state, preserving previous memory:', error)
    return {
      ...state,
      chapterRecaps: [
        ...state.chapterRecaps,
        {
          chapterId: chapter.id,
          recap: chapter.content.slice(0, 300)
        }
      ]
    }
  }
}

export const buildContinuityPacket = (state, chapterNumber) => {
  const previousRecaps = state.chapterRecaps.slice(-3)

  return {
    chapterNumber,
    continuitySummary: state.continuitySummary || MEMORY_FALLBACK.continuitySummary,
    activeThreads: (state.activeThreads || MEMORY_FALLBACK.activeThreads).slice(0, 8),
    unresolvedQuestions: (state.unresolvedQuestions || MEMORY_FALLBACK.unresolvedQuestions).slice(0, 6),
    characterState: (state.characterState || MEMORY_FALLBACK.characterState).slice(0, 8),
    recentChapterRecaps: previousRecaps,
  }
}
