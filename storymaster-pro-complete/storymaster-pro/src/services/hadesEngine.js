// Hades Engine - Adult/Erotic Story Generation
// Implements the Dual-Helix method for mature story generation with continuity memory

import { generateWithRetry } from './apiService.js'
import { buildContinuityPacket, createInitialMemoryState, updateStoryMemory } from './storyMemoryService.js'

const parseJsonFromResponse = (response, errorLabel) => {
  const markdownMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
  const contentToParse = markdownMatch ? markdownMatch[1] : response

  const startIndex = contentToParse.indexOf('{')
  const endIndex = contentToParse.lastIndexOf('}')

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`${errorLabel}: no JSON object found`)
  }

  const jsonString = contentToParse
    .substring(startIndex, endIndex + 1)
    .replace(/,\s*([}\]])/g, '$1')

  return JSON.parse(jsonString)
}

const requestJson = async (prompt, options, label) => {
  const response = await generateWithRetry([{ role: 'user', content: prompt }], options)

  try {
    return parseJsonFromResponse(response, label)
  } catch {
    const repaired = await generateWithRetry([
      { role: 'system', content: 'Convert to strict valid JSON only, no markdown.' },
      { role: 'user', content: response }
    ], { ...options, temperature: 0 })

    return parseJsonFromResponse(repaired, `${label} (repair)`)
  }
}

const getStyleDirective = (styleMode) => {
  switch (styleMode) {
    case 'pornographic':
      return 'Prioritize raw arousal and direct sensual prose while maintaining coherent character psychology.'
    case 'classic-literary':
      return 'Use elegant literary prose with emphasis on emotional nuance and restrained sensuality.'
    default:
      return 'Balance sensual intensity with literary storytelling and emotional continuity.'
  }
}

const getExplicitnessDirective = (explicitnessMode) => {
  switch (explicitnessMode) {
    case 'maximum':
      return 'Use highly direct mature descriptions with no fade-outs in intimate scenes.'
    case 'uncensored':
      return 'Use direct mature language where appropriate and keep intimate scenes on-page.'
    default:
      return 'Use sensual mature language with optional restraint when it improves narrative quality.'
  }
}

export const createEroticBlueprint = async (premise, config, options = {}) => {
  const prompt = `You are the Hades Narrative Engine.

PREMISE: "${premise}"
EROTIC CONFIGURATION:
- Primary Genre: ${config.eroticGenre}
- Kinks & Fetishes: ${config.kinks}
- Intensity Level: ${config.intensityLevel}
- Power Dynamic: ${config.powerDynamic}

Return ONLY JSON:
{
  "centralFantasy": "...",
  "externalConflict": "...",
  "intimateConflict": "...",
  "plotIntimacyWeave": "...",
  "theme": "...",
  "desiredEmotionalJourney": "..."
}`

  return await requestJson(prompt, { ...options, temperature: 0.7, maxTokens: 2400 }, 'EroticBlueprint')
}

export const createLibidinalProfiles = async (premise, blueprint, config, options = {}) => {
  const prompt = `Continue the same story.
PREMISE: "${premise}"
BLUEPRINT: ${JSON.stringify(blueprint, null, 2)}

Return ONLY JSON:
{
  "characters": [
    {
      "name": "...",
      "age": "...",
      "appearance": "...",
      "background": "...",
      "motivations": "...",
      "fears": "...",
      "secrets": "...",
      "libidinalProfile": {
        "sexualHistory": "...",
        "experienceLevel": "...",
        "consciousDesires": "...",
        "subconsciousDesires": "...",
        "hardLimits": ["..."],
        "turnOns": ["..."],
        "eroticArchetype": "...",
        "expressionOfDesire": "...",
        "emotionalNeeds": "..."
      }
    }
  ]
}`

  return await requestJson(prompt, { ...options, temperature: 0.75, maxTokens: 3200 }, 'EroticProfiles')
}

export const createDualHelixPlot = async (premise, blueprint, profiles, config, options = {}) => {
  const prompt = `Continue the same story.
PREMISE: "${premise}"
BLUEPRINT: ${JSON.stringify(blueprint, null, 2)}
CHARACTERS: ${JSON.stringify(profiles, null, 2)}

Create 15-25 beats with linked plot+intimacy progression.
Return ONLY JSON:
{
  "totalBeats": 20,
  "beats": [
    {
      "beatNumber": 1,
      "sceneType": "Charge",
      "externalEvent": "...",
      "intimateDevelopment": "...",
      "connection": "...",
      "emotionalTone": "..."
    }
  ]
}`

  return await requestJson(prompt, { ...options, temperature: 0.7, maxTokens: 4200 }, 'DualHelixPlot')
}

export const generateEroticChapter = async (chapterNumber, beats, allContext, config, continuityPacket, options = {}) => {
  const hasReleaseScene = beats.some((b) => b.sceneType === 'Release')

  const prompt = `You are the Hades Narrative Engine. Write Chapter ${chapterNumber}.

CONTEXT:
${JSON.stringify(allContext, null, 2)}

BEATS:
${JSON.stringify(beats, null, 2)}

CONTINUITY MEMORY (MANDATORY):
${JSON.stringify(continuityPacket, null, 2)}

GUIDELINES:
- Power dynamic: ${config.powerDynamic}
- Style mode: ${config.styleMode || 'balanced'} (${getStyleDirective(config.styleMode)})
- Explicitness mode: ${config.explicitnessMode || 'literary-erotic'} (${getExplicitnessDirective(config.explicitnessMode)})
- Intensity level: ${config.intensityLevel}
- Kinks to incorporate where relevant: ${config.kinks}
- Keep continuity with the previous chapter ending and unresolved threads.

${hasReleaseScene ? 'This chapter contains a release beat: keep emotional consequences and clear progression visible.' : ''}

Write approximately ${Math.floor(parseInt(config.targetWordCount) / 15)} words.
Return only chapter text.`

  return await generateWithRetry([{ role: 'user', content: prompt }], { ...options, temperature: 0.9, maxTokens: 8000 })
}

export const generateAdultStory = async (premise, config, onProgress, generationOptions = {}) => {
  try {
    const { apiKey, ...restConfig } = config
    const options = { ...(apiKey ? { apiKey } : {}), ...generationOptions }

    onProgress({ stage: 'blueprint', progress: 10, message: 'Creating erotic blueprint...' })
    const blueprint = await createEroticBlueprint(premise, restConfig, options)

    onProgress({ stage: 'profiles', progress: 20, message: 'Developing character desires...' })
    const profiles = await createLibidinalProfiles(premise, blueprint, restConfig, options)

    onProgress({ stage: 'plot', progress: 30, message: 'Weaving plot and intimacy...' })
    const plot = await createDualHelixPlot(premise, blueprint, profiles, restConfig, options)

    const allContext = { premise, config, blueprint, profiles, plot }
    const totalChapters = 15
    const chapters = []
    const beats = Array.isArray(plot.beats) ? plot.beats : []
    const beatsPerChapter = Math.max(1, Math.ceil(beats.length / totalChapters))
    let memoryState = createInitialMemoryState(premise, restConfig)

    for (let i = 0; i < totalChapters; i++) {
      const chapterNumber = i + 1
      const startBeat = i * beatsPerChapter
      const endBeat = Math.min((i + 1) * beatsPerChapter, beats.length)
      const chapterBeats = beats.slice(startBeat, endBeat)

      onProgress({
        stage: 'generation',
        progress: 30 + ((chapterNumber / totalChapters) * 70),
        message: `Writing Chapter ${chapterNumber}/${totalChapters}...`,
        currentChapter: chapterNumber
      })

      const continuityPacket = buildContinuityPacket(memoryState, chapterNumber)
      const chapterContent = await generateEroticChapter(chapterNumber, chapterBeats, allContext, restConfig, continuityPacket, options)

      const chapter = {
        id: chapterNumber,
        title: chapterBeats?.[0]?.externalEvent ? `Chapter ${chapterNumber}: ${chapterBeats[0].externalEvent}` : `Chapter ${chapterNumber}`,
        content: chapterContent,
        status: 'complete'
      }

      chapters.push(chapter)
      memoryState = await updateStoryMemory(memoryState, chapter, options)

      if (onProgress.onChapterComplete) {
        onProgress.onChapterComplete(chapter)
      }
    }

    onProgress({ stage: 'complete', progress: 100, message: 'Story generation complete!' })

    return {
      metadata: {
        ...allContext,
        memoryState,
      },
      chapters,
    }
  } catch (error) {
    console.error('Adult story generation error:', error)
    throw error
  }
}
