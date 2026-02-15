// API Service for StoryMaster Pro
// Handles OpenRouter, Google Gemini, DeepSeek, and Mistral integrations

const API_PROVIDERS = {
  OPENROUTER: 'openrouter',
  GOOGLE: 'google',
  DEEPSEEK: 'deepseek',
  MISTRAL: 'mistral'
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const GOOGLE_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'
const MISTRAL_BASE_URL = 'https://api.mistral.ai/v1'
const DEFAULT_OPENROUTER_MODEL = 'openrouter/auto'

const DEFAULT_MODELS_BY_PROVIDER = {
  [API_PROVIDERS.OPENROUTER]: DEFAULT_OPENROUTER_MODEL,
  [API_PROVIDERS.GOOGLE]: 'gemini-2.0-flash-exp',
  [API_PROVIDERS.DEEPSEEK]: 'deepseek-chat',
  [API_PROVIDERS.MISTRAL]: 'mistral-large-latest'
}

const getDefaultModelForProvider = (provider) => DEFAULT_MODELS_BY_PROVIDER[provider]


const safeJson = async (response) => {
  const text = await response.text()
  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

const readApiError = async (response, fallbackLabel = 'API Error') => {
  const payload = await safeJson(response)
  return payload.error?.message || payload.message || `${fallbackLabel}: ${response.status} ${response.statusText}`
}

// Get API keys from localStorage
export const getApiKeys = () => {
  const keys = localStorage.getItem('storymaster_api_keys')
  return keys ? JSON.parse(keys) : {}
}

// Save API keys to localStorage
export const saveApiKeys = (keys) => {
  localStorage.setItem('storymaster_api_keys', JSON.stringify(keys))
}

// Get selected provider and model
export const getApiSettings = () => {
  const settings = localStorage.getItem('storymaster_api_settings')
  return settings ? JSON.parse(settings) : {
    provider: API_PROVIDERS.OPENROUTER,
    model: DEFAULT_OPENROUTER_MODEL,
    temperature: 0.8
  }
}

// Save API settings
export const saveApiSettings = (settings) => {
  localStorage.setItem('storymaster_api_settings', JSON.stringify(settings))
}

// Fetch available models from OpenRouter
export const fetchOpenRouterModels = async (apiKey) => {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'StoryMaster Pro'
      }
    })

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Failed to fetch models'))
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error)
    throw error
  }
}

export const fetchOpenRouterFreeModels = async (apiKey) => {
  const models = await fetchOpenRouterModels(apiKey)
  return models.filter((model) => model.id?.includes(':free') || model.pricing?.prompt === '0')
}

// Generate text using OpenRouter
const generateWithOpenRouter = async (apiKey, model, messages, options = {}) => {
  const requestedModel = model || DEFAULT_OPENROUTER_MODEL

  const requestBody = {
    model: requestedModel,
    messages: messages,
    temperature: options.temperature || 0.8,
    max_tokens: options.maxTokens,
    stream: false
  }

  const executeRequest = async (body) => {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'StoryMaster Pro'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(await readApiError(response))
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('OpenRouter API Error: Empty response payload')
    }
    return content
  }

  try {
    const primaryResponse = await executeRequest(requestBody)
    if (!primaryResponse) {
      throw new Error('OpenRouter returned an empty completion response')
    }
    return primaryResponse
  } catch (error) {
    const shouldFallback = requestedModel !== DEFAULT_OPENROUTER_MODEL && /no endpoints found|not a valid model|model.*not found/i.test(error.message)

    if (shouldFallback) {
      console.warn(`Model "${requestedModel}" unavailable. Falling back to "${DEFAULT_OPENROUTER_MODEL}".`)
      return await executeRequest({ ...requestBody, model: DEFAULT_OPENROUTER_MODEL })
    }

    console.error('OpenRouter API Error:', error)
    throw error
  }
}

// Generate text using Google Gemini
const generateWithGoogle = async (apiKey, model, messages, options = {}) => {
  try {
    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const response = await fetch(`${GOOGLE_BASE_URL}/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: options.temperature || 0.8,
          maxOutputTokens: options.maxTokens
        }
      })
    })

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Google API Error'))
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) {
      throw new Error('Google API Error: Empty response payload')
    }
    return content
  } catch (error) {
    console.error('Google API Error:', error)
    throw error
  }
}

// Generate text using DeepSeek
const generateWithDeepSeek = async (apiKey, model, messages, options = {}) => {
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature || 0.8,
        max_tokens: options.maxTokens
      })
    })

    if (!response.ok) {
      throw new Error(await readApiError(response, 'DeepSeek API Error'))
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('DeepSeek API Error: Empty response payload')
    }
    return content
  } catch (error) {
    console.error('DeepSeek API Error:', error)
    throw error
  }
}

// Generate text using Mistral
const generateWithMistral = async (apiKey, model, messages, options = {}) => {
  try {
    const response = await fetch(`${MISTRAL_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature || 0.8,
        max_tokens: options.maxTokens
      })
    })

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Mistral API Error'))
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Mistral API Error: Empty response payload')
    }
    return content
  } catch (error) {
    console.error('Mistral API Error:', error)
    throw error
  }
}

// Main generate function - routes to appropriate provider
export const generateText = async (messages, options = {}) => {
  const apiKeys = getApiKeys()
  const settings = getApiSettings()

  const provider = options.provider || settings.provider
  const model = options.model || settings.model || getDefaultModelForProvider(provider)
  const apiKey = options.apiKey || apiKeys[provider]

  if (!apiKey) {
    throw new Error(`No API key found for provider: ${provider}. Please add your API key in the settings.`);
  }

  const genOptions = {
    temperature: options.temperature ?? settings.temperature,
    maxTokens: options.maxTokens
  }

  switch (provider) {
    case API_PROVIDERS.OPENROUTER:
      return await generateWithOpenRouter(apiKey, model, messages, genOptions)
    case API_PROVIDERS.GOOGLE:
      return await generateWithGoogle(apiKey, model, messages, genOptions)
    case API_PROVIDERS.DEEPSEEK:
      return await generateWithDeepSeek(apiKey, model, messages, genOptions)
    case API_PROVIDERS.MISTRAL:
      return await generateWithMistral(apiKey, model, messages, genOptions)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

// Retry with exponential backoff
export const generateWithRetry = async (messages, options = {}, maxRetries = 3) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateText(messages, options)
    } catch (error) {
      lastError = error
      
      // Don't retry on authentication errors
      if (error.message.includes('API key') || error.message.includes('401')) {
        throw error
      }
      
      // Exponential backoff
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

export { API_PROVIDERS }
