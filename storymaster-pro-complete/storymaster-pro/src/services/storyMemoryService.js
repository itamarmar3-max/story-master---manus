import { generateWithRetry } from './apiService.js'

const MEMORY_FALLBACK = {
  continuitySummary: '',
  activeThreads: [],
  unresolvedQuestions: [],
  characterState: []
}

const sanitizeJson = (text) => {
  const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  const source = (markdownMatch ? markdownMatch[1] : text).trim()

  const start = source.indexOf('{')
  const end = source.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No valid JSON object in memory response')
  }

  const normalized = source
    .slice(start, end + 1)
    .replace(/,\s*([}\]])/g, '$1')

  return JSON.parse(normalized)
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
