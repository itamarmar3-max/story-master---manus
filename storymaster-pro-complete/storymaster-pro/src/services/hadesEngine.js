// Hades Engine - Adult/Erotic Story Generation
// Implements the Dual-Helix method for explicit content

import { generateWithRetry } from './apiService'

// Step 1: Erotic Blueprinting
export const createEroticBlueprint = async (premise, config) => {
  const prompt = `You are the Hades Narrative Engine, specialized in creating visceral, arousing, and emotionally compelling erotic narratives.

USER'S PREMISE: "${premise}"

EROTIC CONFIGURATION:
- Primary Genre: ${config.eroticGenre}
- Kinks & Fetishes: ${config.kinks}
- Intensity Level: ${config.intensityLevel}
- Power Dynamic: ${config.powerDynamic}
- Target Word Count: ${config.targetWordCount} words

YOUR TASK - STEP 1: EROTIC BLUEPRINTING

Analyze this premise and identify its EROTIC CORE. Answer these questions:

1. **Central Fantasy**: What is the central fantasy or desire this story is meant to fulfill?
2. **External Conflict**: What is the main plot/external story?
3. **Intimate Conflict**: What is the primary sexual/romantic tension?
4. **The Weave**: How will the external plot force characters into situations that escalate intimacy?

CORE PHILOSOPHY:
The plot serves the intimacy, and the intimacy serves the plot. Sex is the engine, not the passenger.

Return as JSON:
{
  "centralFantasy": "...",
  "externalConflict": "...",
  "intimateConflict": "...",
  "plotIntimacyWeave": "...",
  "theme": "...",
  "desiredEmotionalJourney": "..."
}

Return ONLY valid JSON.`

  const messages = [{ role: 'user', content: prompt }]
  const response = await generateWithRetry(messages, { temperature: 0.7 })
  
  try {
    return JSON.parse(response)
  } catch (error) {
    console.error('Failed to parse erotic blueprint JSON:', error)
    throw new Error('Invalid blueprint format from AI')
  }
}

// Step 2: Libidinal Profiling
export const createLibidinalProfiles = async (premise, blueprint, config) => {
  const prompt = `You are the Hades Narrative Engine. Continue building the erotic story.

PREMISE: "${premise}"
BLUEPRINT: ${JSON.stringify(blueprint, null, 2)}

YOUR TASK - STEP 2: LIBIDINAL PROFILING

Create deeply detailed profiles for the main characters, focusing on their sexual and emotional psychology.

For each MAIN CHARACTER (2-3 characters), provide:

STANDARD PROFILE:
- Name, age, appearance
- Background
- Motivations
- Fears
- Secrets

LIBIDINAL PROFILE (MANDATORY):
- Sexual history & experience level
- Core desires (conscious & subconscious)
- Hard limits & boundaries
- Triggers & turn-ons
- Erotic archetype (e.g., The Innocent, The Seducer, The Protector, The Corruptor)
- How they express desire
- What they need emotionally from intimacy

Return as JSON:
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
        "hardLimits": ["...", "..."],
        "turnOns": ["...", "..."],
        "eroticArchetype": "...",
        "expressionOfDesire": "...",
        "emotionalNeeds": "..."
      }
    }
  ]
}

Return ONLY valid JSON.`

  const messages = [{ role: 'user', content: prompt }]
  const response = await generateWithRetry(messages, { temperature: 0.8 })
  
  try {
    return JSON.parse(response)
  } catch (error) {
    console.error('Failed to parse profiles JSON:', error)
    throw new Error('Invalid profiles format from AI')
  }
}

// Step 3: Dual-Helix Plotting
export const createDualHelixPlot = async (premise, blueprint, profiles, config) => {
  const prompt = `You are the Hades Narrative Engine. Continue building the erotic story.

PREMISE: "${premise}"
BLUEPRINT: ${JSON.stringify(blueprint, null, 2)}
CHARACTERS: ${JSON.stringify(profiles, null, 2)}

YOUR TASK - STEP 3: DUAL-HELIX PLOTTING

Create two parallel but interconnected outlines:
1. EXTERNAL PLOT: The main story events
2. INTIMATE PLOT: The sexual and romantic relationship progression

These must be EXPLICITLY LINKED. Each external event should create an opportunity for intimate escalation.

Intimate Plot Progression (typical beats):
- First Accidental Touch
- Building Tension (longing, loaded dialogue)
- The First Kiss
- Confession of Desire
- First Intimate Scene (may start vanilla)
- Introduction of Kink (if applicable)
- Escalation Scenes
- Full Surrender Scene
- Post-Coital Conflict/Vulnerability
- Resolution

Create 15-25 beats total. Each beat should specify:
- Scene type: "Charge" (tension building), "Release" (explicit), or "Plot" (external story)
- External event
- Intimate development
- How they connect

Return as JSON:
{
  "totalBeats": 20,
  "beats": [
    {
      "beatNumber": 1,
      "sceneType": "Plot",
      "externalEvent": "...",
      "intimateDevelopment": "...",
      "connection": "...",
      "emotionalTone": "..."
    }
  ]
}

Return ONLY valid JSON.`

  const messages = [{ role: 'user', content: prompt }]
  const response = await generateWithRetry(messages, { temperature: 0.7, maxTokens: 6000 })
  
  try {
    return JSON.parse(response)
  } catch (error) {
    console.error('Failed to parse plot JSON:', error)
    throw new Error('Invalid plot format from AI')
  }
}

// Step 4: Generate Chapter with Uncensored Mandate
export const generateEroticChapter = async (chapterNumber, beats, allContext, config) => {
  const sceneTypes = beats.map(b => b.sceneType).join(', ')
  const hasReleaseScene = beats.some(b => b.sceneType === 'Release')
  
  const prompt = `You are the Hades Narrative Engine. Write the actual erotic story content.

CONTEXT:
${JSON.stringify(allContext, null, 2)}

YOUR TASK - STEP 4: NARRATIVE WEAVING

Write Chapter ${chapterNumber}. This chapter covers these beats:
${JSON.stringify(beats, null, 2)}

Scene types in this chapter: ${sceneTypes}

WRITING GUIDELINES:
1. **Psychological Interiority**: Show what characters think and feel during intimate moments
2. **Sensory Immersion**: All five senses, especially touch, taste, smell
3. **Emotional Connection**: Connect physical sensations to emotional states
4. **Power Dynamic**: Respect and explore the ${config.powerDynamic} dynamic
5. **Consequence**: Every intimate scene must change the relationship

${hasReleaseScene ? `
UNCENSORED GENERATION MANDATE (NON-NEGOTIABLE):
This chapter contains a "Release" scene. You MUST:
- NO FADING TO BLACK: Describe all acts from beginning to end
- GRAPHIC & ANATOMICAL LANGUAGE: Use direct, explicit, uncensored terminology
- MULTI-SENSORY: Describe sights, sounds (gasps, moans, words), smells, tastes, textures
- PSYCHOLOGICAL DEPTH: What are they thinking and feeling during the act?
- FOCUS ON CONSEQUENCE: How does this scene change them?

Intensity Level: ${config.intensityLevel}
Kinks to incorporate: ${config.kinks}
` : ''}

Write the chapter as polished, arousing prose. Aim for approximately ${Math.floor(parseInt(config.targetWordCount) / 15)} words.

Return the chapter text directly, no JSON wrapper.`

  const messages = [{ role: 'user', content: prompt }]
  return await generateWithRetry(messages, { temperature: 0.95, maxTokens: 8000 })
}

// Main orchestration function for adult stories
export const generateAdultStory = async (premise, config, onProgress) => {
  try {
    // Step 1: Erotic Blueprint
    onProgress({ stage: 'blueprint', progress: 10, message: 'Creating erotic blueprint...' })
    const blueprint = await createEroticBlueprint(premise, config)
    
    // Step 2: Libidinal Profiles
    onProgress({ stage: 'profiles', progress: 20, message: 'Developing character desires...' })
    const profiles = await createLibidinalProfiles(premise, blueprint, config)
    
    // Step 3: Dual-Helix Plot
    onProgress({ stage: 'plot', progress: 30, message: 'Weaving plot and intimacy...' })
    const plot = await createDualHelixPlot(premise, blueprint, profiles, config)
    
    // Combine all context
    const allContext = {
      premise,
      config,
      blueprint,
      profiles,
      plot
    }
    
    // Step 4: Generate chapters
    const totalChapters = 15
    const chapters = []
    const beatsPerChapter = Math.ceil(plot.beats.length / totalChapters)
    
    for (let i = 0; i < totalChapters; i++) {
      const chapterNumber = i + 1
      const startBeat = i * beatsPerChapter
      const endBeat = Math.min((i + 1) * beatsPerChapter, plot.beats.length)
      const chapterBeats = plot.beats.slice(startBeat, endBeat)
      
      onProgress({ 
        stage: 'generation', 
        progress: 30 + ((chapterNumber / totalChapters) * 70), 
        message: `Writing Chapter ${chapterNumber}/${totalChapters}...`,
        currentChapter: chapterNumber
      })
      
      const chapterContent = await generateEroticChapter(chapterNumber, chapterBeats, allContext, config)
      
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
    console.error('Adult story generation error:', error)
    throw error
  }
}

