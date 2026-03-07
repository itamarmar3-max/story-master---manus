// Helios Engine - Normal Story Generation
// Implements the multi-stage story generation process with continuity memory

import { generateWithRetry } from './apiService.js'
import { buildContinuityPacket, createInitialMemoryState, updateStoryMemory } from './storyMemoryService.js'

const parseJsonFromResponse = (response, label = 'AI JSON') => {
  const markdownMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
  const contentToParse = markdownMatch ? markdownMatch[1] : response

  const startIndex = contentToParse.indexOf('{')
  const endIndex = contentToParse.lastIndexOf('}')

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`${label}: no valid JSON object found`)
  }

  const jsonString = contentToParse
    .substring(startIndex, endIndex + 1)
    .replace(/,\s*([}\]])/g, '$1')

  return JSON.parse(jsonString)
}

const requestJson = async (prompt, options = {}, label = 'AI JSON') => {
  const messages = [
    { role: 'system', content: 'Return only valid JSON matching exactly the requested schema.' },
    { role: 'user', content: prompt }
  ]

  const response = await generateWithRetry(messages, options)

  try {
    return parseJsonFromResponse(response, label)
  } catch {
    const repairResponse = await generateWithRetry([
      { role: 'system', content: 'Convert the following content into strict valid JSON only.' },
      { role: 'user', content: response }
    ], { ...options, temperature: 0 })

    return parseJsonFromResponse(repairResponse, `${label} (repair)`)
  }
}

export const createBlueprint = async (premise, config, options = {}) => {
  const prompt = `You are the Helios Story Engine, a master storyteller and narrative architect.

USER'S PREMISE: "${premise}"

STORY CONFIGURATION:
- Genre: ${config.genre}
- Narrative Structure: ${config.narrativeStructure}
- Pacing Profile: ${config.pacingProfile}
- Target Word Count: ${config.targetWordCount} words
- Language: ${config.language}

Create blueprint JSON with keys:
{
  "coreConflict": "...",
  "theme": "...",
  "genreConventions": ["..."],
  "narrativeApproach": "...",
  "storyArc": {"beginning": "...", "middle": "...", "end": "..."},
  "pacingStrategy": "..."
}`

  return await requestJson(prompt, { ...options, temperature: 0.7, maxTokens: 2400 }, 'Blueprint')
}

export const createCharactersAndWorld = async (premise, blueprint, config, options = {}) => {
  const prompt = `Continue the same story.
PREMISE: "${premise}"
BLUEPRINT: ${JSON.stringify(blueprint, null, 2)}

Return JSON:
{
  "characters": [{
    "name": "...",
    "age": "...",
    "appearance": "...",
    "motivations": "...",
    "fears": "...",
    "internalConflict": "...",
    "externalConflict": "...",
    "secrets": "...",
    "characterArc": "...",
    "voice": "..."
  }],
  "world": {
    "keyLocations": ["..."],
    "worldRules": "...",
    "atmosphere": "...",
    "sensoryDetails": "...",
    "culturalContext": "..."
  }
}`

  return await requestJson(prompt, { ...options, temperature: 0.75, maxTokens: 3000 }, 'CharactersAndWorld')
}

export const createPlotScaffold = async (premise, blueprint, charactersAndWorld, config, options = {}) => {
  const prompt = `Continue the same story.
PREMISE: "${premise}"
BLUEPRINT: ${JSON.stringify(blueprint, null, 2)}
CHARACTERS & WORLD: ${JSON.stringify(charactersAndWorld, null, 2)}

Use ${config.narrativeStructure} and ${config.pacingProfile}. Build 15-30 beats.
Return JSON:
{
  "structure": "${config.narrativeStructure}",
  "totalBeats": 20,
  "beats": [{
    "beatNumber": 1,
    "sceneTitle": "...",
    "keyEvents": "...",
    "characterPerspectives": ["..."],
    "emotionalTone": "...",
    "plotPurpose": "..."
  }]
}`

  return await requestJson(prompt, { ...options, temperature: 0.7, maxTokens: 4200 }, 'PlotScaffold')
}

export const generateChapter = async (chapterNumber, beats, allContext, config, continuityPacket, options = {}) => {
  const prompt = `You are the Helios Story Engine. Write Chapter ${chapterNumber}.

CONTEXT:
${JSON.stringify(allContext, null, 2)}

BEATS FOR THIS CHAPTER:
${JSON.stringify(beats, null, 2)}

CONTINUITY MEMORY (MANDATORY):
${JSON.stringify(continuityPacket, null, 2)}

HARD CONSTRAINTS:
1) Begin from the immediate consequence of the previous chapter recap.
2) Keep names, motivations, and unresolved threads consistent.
3) Carry at least one active thread forward in this chapter.
4) End with a clear handoff to the next chapter.
5) Follow user requirements and tone.

Write polished prose, about ${Math.floor(parseInt(config.targetWordCount) / 15)} words.
Return only chapter text.`

  return await generateWithRetry([{ role: 'user', content: prompt }], { ...options, temperature: 0.85, maxTokens: 8000 })
}

function getChapterTitle(chapterNumber, beats) {
  const firstBeatTitle = beats?.[0]?.sceneTitle?.trim()
  return firstBeatTitle ? `Chapter ${chapterNumber}: ${firstBeatTitle}` : `Chapter ${chapterNumber}`
}

export const generateFullStory = async (premise, config, onProgress, generationOptions = {}) => {
  try {
    const { apiKey, ...restConfig } = config
    const options = { ...(apiKey ? { apiKey } : {}), ...generationOptions }

    onProgress({ stage: 'blueprint', progress: 10, message: 'Creating strategic blueprint...' })
    const blueprint = await createBlueprint(premise, restConfig, options)

    onProgress({ stage: 'characters', progress: 20, message: 'Developing characters and world...' })
    const charactersAndWorld = await createCharactersAndWorld(premise, blueprint, restConfig, options)

    onProgress({ stage: 'scaffold', progress: 30, message: 'Building plot structure...' })
    const scaffold = await createPlotScaffold(premise, blueprint, charactersAndWorld, restConfig, options)

    const allContext = { premise, config, blueprint, charactersAndWorld, scaffold }
    const totalChapters = 15
    const chapters = []
    const beats = Array.isArray(scaffold.beats) ? scaffold.beats : []
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
        currentChapter: chapterNumber,
      })

      const continuityPacket = buildContinuityPacket(memoryState, chapterNumber)
      const chapterContent = await generateChapter(chapterNumber, chapterBeats, allContext, restConfig, continuityPacket, options)

      const chapter = {
        id: chapterNumber,
        title: getChapterTitle(chapterNumber, chapterBeats),
        content: chapterContent,
        status: 'complete',
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
    console.error('Story generation error:', error)
    throw error
  }
}
