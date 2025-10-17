// Helios Engine - Normal Story Generation
// Implements the multi-stage story generation process

import { generateWithRetry } from './apiService'

// Step 1: Create Strategic Blueprint
export const createBlueprint = async (premise, config) => {
  const prompt = `You are the Helios Story Engine, a master storyteller and narrative architect.

USER'S PREMISE: "${premise}"

STORY CONFIGURATION:
- Genre: ${config.genre}
- Narrative Structure: ${config.narrativeStructure}
- Pacing Profile: ${config.pacingProfile}
- Target Word Count: ${config.targetWordCount} words
- Language: ${config.language}

YOUR TASK - STEP 1: THE BLUEPRINT

Analyze this premise and create a strategic blueprint for the story. Your blueprint must include:

1. **Core Conflict**: Identify the central conflict and its thematic potential
2. **Genre Conventions**: Select the most relevant tropes and conventions for ${config.genre}
3. **Narrative Flow**: Determine how the ${config.narrativeStructure} and ${config.pacingProfile} pacing will shape the story
4. **Story Arc**: Outline the beginning, middle, and end at a high level

GUIDING PHILOSOPHY:
This story uses ${config.pacingProfile} pacing. ${getPacingGuidance(config.pacingProfile)}

Provide a detailed blueprint in JSON format with these exact keys:
{
  "coreConflict": "...",
  "theme": "...",
  "genreConventions": ["...", "..."],
  "narrativeApproach": "...",
  "storyArc": {
    "beginning": "...",
    "middle": "...",
    "end": "..."
  },
  "pacingStrategy": "..."
}

Return ONLY valid JSON, no additional text.`

  const messages = [{ role: 'user', content: prompt }]
  const response = await generateWithRetry(messages, { temperature: 0.7 })
  
  try {
    return JSON.parse(response)
  } catch (error) {
    console.error('Failed to parse blueprint JSON:', error)
    throw new Error('Invalid blueprint format from AI')
  }
}

// Step 2: Create Character and World Profiles
export const createCharactersAndWorld = async (premise, blueprint, config) => {
  const prompt = `You are the Helios Story Engine. Continue building the story.

PREMISE: "${premise}"
BLUEPRINT: ${JSON.stringify(blueprint, null, 2)}

YOUR TASK - STEP 2: WORLD & SOULS

Create deeply detailed profiles for the main characters and the story's world.

For each MAIN CHARACTER (2-4 characters), provide:
- Name
- Age and appearance
- Motivations (what they want)
- Fears (what they're afraid of)
- Internal conflict
- External conflict
- Secrets
- Character arc potential
- Distinct voice/personality

For the WORLD, provide:
- Key locations
- Rules of the world (especially important for ${config.genre})
- Atmosphere and tone
- Sensory details (sights, sounds, smells)
- Cultural/social context

Return as JSON with this structure:
{
  "characters": [
    {
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
    }
  ],
  "world": {
    "keyLocations": ["...", "..."],
    "worldRules": "...",
    "atmosphere": "...",
    "sensoryDetails": "...",
    "culturalContext": "..."
  }
}

Return ONLY valid JSON.`

  const messages = [{ role: 'user', content: prompt }]
  const response = await generateWithRetry(messages, { temperature: 0.8 })
  
  try {
    return JSON.parse(response)
  } catch (error) {
    console.error('Failed to parse characters JSON:', error)
    throw new Error('Invalid characters format from AI')
  }
}

// Step 3: Create Structural Scaffold (Plot Outline)
export const createPlotScaffold = async (premise, blueprint, charactersAndWorld, config) => {
  const prompt = `You are the Helios Story Engine. Continue building the story.

PREMISE: "${premise}"
BLUEPRINT: ${JSON.stringify(blueprint, null, 2)}
CHARACTERS & WORLD: ${JSON.stringify(charactersAndWorld, null, 2)}

YOUR TASK - STEP 3: STRUCTURAL SCAFFOLDING

Create a detailed plot outline based on the ${config.narrativeStructure} structure.

${getStructureGuidance(config.narrativeStructure)}

The outline should have 15-30 plot beats (scenes), depending on the target word count (${config.targetWordCount} words).

Each beat should include:
- Beat number
- Scene title
- Key events
- Character perspectives
- Emotional tone
- Plot purpose

Return as JSON:
{
  "structure": "${config.narrativeStructure}",
  "totalBeats": 20,
  "beats": [
    {
      "beatNumber": 1,
      "sceneTitle": "...",
      "keyEvents": "...",
      "characterPerspectives": ["..."],
      "emotionalTone": "...",
      "plotPurpose": "..."
    }
  ]
}

Return ONLY valid JSON.`

  const messages = [{ role: 'user', content: prompt }]
  const response = await generateWithRetry(messages, { temperature: 0.7, maxTokens: 6000 })
  
  try {
    return JSON.parse(response)
  } catch (error) {
    console.error('Failed to parse scaffold JSON:', error)
    throw new Error('Invalid scaffold format from AI')
  }
}

// Step 4: Generate Individual Chapter
export const generateChapter = async (chapterNumber, beats, allContext, config) => {
  const prompt = `You are the Helios Story Engine. Write the actual story content.

CONTEXT:
${JSON.stringify(allContext, null, 2)}

YOUR TASK - STEP 4: NARRATIVE WEAVING

Write Chapter ${chapterNumber} of the story. This chapter covers the following beats:
${JSON.stringify(beats, null, 2)}

WRITING GUIDELINES:
1. **Character Before Plot**: Decisions should feel earned
2. **Show, Don't Tell**: The golden rule
3. **Micro to Macro Tension**: Build suspense appropriately
4. **Sensory Immersion**: Ground the reader in the world
5. **Pacing Variation**: Vary sentence and scene length

PACING PROFILE: ${config.pacingProfile}
${getPacingGuidance(config.pacingProfile)}

Write the chapter as polished prose, ready for publication. Aim for approximately ${Math.floor(parseInt(config.targetWordCount) / 15)} words.

Return the chapter text directly, no JSON wrapper.`

  const messages = [{ role: 'user', content: prompt }]
  return await generateWithRetry(messages, { temperature: 0.9, maxTokens: 8000 })
}

// Helper: Get pacing guidance
function getPacingGuidance(pacingProfile) {
  switch (pacingProfile) {
    case 'slow-burn':
      return `For Slow Burn: Establish the normal world, show character, build relationships, and foreshadow before the inciting incident. Take your time to build reader investment through gradual immersion.`
    case 'cold-open':
      return `For Cold Open: Start directly with the inciting incident or moments immediately preceding it. Use action and dialogue to reveal character and context under pressure. Weave in necessary backstory later through flashbacks or dialogue.`
    case 'balanced':
      return `For Balanced Ignition: Create a compact and efficient introduction to the world and characters over a few chapters before launching the main plot. Balance setup with momentum.`
    default:
      return ''
  }
}

// Helper: Get structure guidance
function getStructureGuidance(structure) {
  switch (structure) {
    case 'three-act':
      return `Three-Act Structure: Act 1 (Setup), Act 2 (Confrontation), Act 3 (Resolution). Include key beats like the inciting incident, midpoint, and climax.`
    case 'heros-journey':
      return `Hero's Journey: Include beats like "Ordinary World", "Call to Adventure", "Meeting the Mentor", "Crossing the Threshold", "Tests", "Ordeal", "Reward", "Return".`
    case 'fichtean':
      return `Fichtean Curve: Start with rising action post-inciting incident. Build through a series of crises, each more intense than the last, leading to the climax.`
    case 'seven-point':
      return `Seven-Point Story: Hook, Plot Turn 1, Pinch Point 1, Midpoint, Pinch Point 2, Plot Turn 2, Resolution.`
    default:
      return 'Create a compelling narrative structure with clear beginning, middle, and end.'
  }
}

// Main orchestration function
export const generateFullStory = async (premise, config, onProgress) => {
  try {
    // Step 1: Blueprint
    onProgress({ stage: 'blueprint', progress: 10, message: 'Creating strategic blueprint...' })
    const blueprint = await createBlueprint(premise, config)
    
    // Step 2: Characters & World
    onProgress({ stage: 'characters', progress: 20, message: 'Developing characters and world...' })
    const charactersAndWorld = await createCharactersAndWorld(premise, blueprint, config)
    
    // Step 3: Plot Scaffold
    onProgress({ stage: 'scaffold', progress: 30, message: 'Building plot structure...' })
    const scaffold = await createPlotScaffold(premise, blueprint, charactersAndWorld, config)
    
    // Combine all context
    const allContext = {
      premise,
      config,
      blueprint,
      charactersAndWorld,
      scaffold
    }
    
    // Step 4: Generate chapters
    const totalChapters = 15
    const chapters = []
    const beatsPerChapter = Math.ceil(scaffold.beats.length / totalChapters)
    
    for (let i = 0; i < totalChapters; i++) {
      const chapterNumber = i + 1
      const startBeat = i * beatsPerChapter
      const endBeat = Math.min((i + 1) * beatsPerChapter, scaffold.beats.length)
      const chapterBeats = scaffold.beats.slice(startBeat, endBeat)
      
      onProgress({ 
        stage: 'generation', 
        progress: 30 + ((chapterNumber / totalChapters) * 70), 
        message: `Writing Chapter ${chapterNumber}/${totalChapters}...`,
        currentChapter: chapterNumber
      })
      
      const chapterContent = await generateChapter(chapterNumber, chapterBeats, allContext, config)
      
      chapters.push({
        id: chapterNumber,
        title: `Chapter ${chapterNumber}`,
        content: chapterContent,
        status: 'complete'
      })
      
      // Yield chapter as it's completed
      if (onProgress.onChapterComplete) {
        onProgress.onChapterComplete(chapters[chapters.length - 1])
      }
    }
    
    onProgress({ stage: 'complete', progress: 100, message: 'Story generation complete!' })
    
    return {
      metadata: allContext,
      chapters
    }
    
  } catch (error) {
    console.error('Story generation error:', error)
    throw error
  }
}

