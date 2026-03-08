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
const OPENROUTER_FALLBACK_MODEL = 'google/gemini-2.0-flash-exp:free'

const DEFAULT_MODELS_BY_PROVIDER = {
  [API_PROVIDERS.OPENROUTER]: DEFAULT_OPENROUTER_MODEL,
  [API_PROVIDERS.GOOGLE]: 'gemini-2.0-flash-exp',
  [API_PROVIDERS.DEEPSEEK]: 'deepseek-chat',
  [API_PROVIDERS.MISTRAL]: 'mistral-large-latest'
}

export const getDefaultModelForProvider = (provider) => DEFAULT_MODELS_BY_PROVIDER[provider]

const isModelCompatibleWithProvider = (provider, model) => {
  if (!model) return false

  switch (provider) {
    case API_PROVIDERS.OPENROUTER:
      return model.includes('/')
    case API_PROVIDERS.GOOGLE:
      return model.startsWith('gemini-')
    case API_PROVIDERS.DEEPSEEK:
      return model.startsWith('deepseek')
    case API_PROVIDERS.MISTRAL:
      return model.startsWith('mistral')
    default:
      return false
  }
}

const resolveModelForProvider = (provider, requestedModel) => {
  if (requestedModel) {
    if (!isModelCompatibleWithProvider(provider, requestedModel)) {
      throw new Error(`Selected model "${requestedModel}" is not compatible with provider "${provider}".`)
    }

    return requestedModel
  }

  return getDefaultModelForProvider(provider)
}

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

const extractTextOrThrow = (value, label) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label}: Empty response payload`)
  }

  return value
}

const isOpenRouterProviderFailure = (message = '') => {
  const normalized = String(message).toLowerCase()
  return normalized.includes('provider returned error') || normalized.includes('no endpoints found')
}

const formatSuggestedModels = (models = []) => models.slice(0, 3).map((model) => model.id).join(', ')

const buildOpenRouterProviderDiagnostic = async (apiKey, selectedModel, originalError) => {
  try {
    const models = await fetchOpenRouterFreeModels(apiKey)
    const suggested = formatSuggestedModels(models)

    return (
      `Model "${selectedModel}" is currently unavailable on OpenRouter providers (this is usually a provider-side outage/capacity issue, not an account-credit issue). ` +
      'Your API key is valid because model discovery succeeded. ' +
      `${suggested ? `Try one of these currently free models: ${suggested}. ` : ''}` +
      `Original error: ${originalError.message}`
    )
  } catch {
    return (
      `Model "${selectedModel}" is currently unavailable on OpenRouter providers. ` +
      'This may be a provider-side outage or temporary routing issue. ' +
      `Original error: ${originalError.message}`
    )
  }
}

const enrichOpenRouterErrorMessage = (error, model) => {
  if (!error?.message) {
    return error
  }

  if (!isOpenRouterProviderFailure(error.message)) {
    return error
  }

  const enriched = new Error(
    `OpenRouter provider error for model "${model}". ` +
    'This is usually caused by model/provider availability or routing issues (not necessarily credits). Try another model and test again. ' +
    `Original error: ${error.message}`
  )
  enriched.cause = error
  return enriched
}

// Get API keys from localStorage
export const getApiKeys = () => {
  const keys = localStorage.getItem('storymaster_api_keys')
  return keys ? JSON.parse(keys) : {}
}

// Save API keys to localStorage
export const saveApiKeys = (keys) => {
  try {
    localStorage.setItem('storymaster_api_keys', JSON.stringify(keys))
  } catch (error) {
    console.warn('Failed to persist API keys to localStorage:', error)
    throw new Error('Failed to save API keys locally. Browser storage quota may be full.')
  }
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
  try {
    localStorage.setItem('storymaster_api_settings', JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to persist API settings to localStorage:', error)
    throw new Error('Failed to save API settings locally. Browser storage quota may be full.')
  }
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
  return models.filter((model) => model.id?.includes(':free') || Number(model.pricing?.prompt) === 0)
}

export const validateProviderConnection = async (provider, apiKey, model) => {
  const pingMessages = [{ role: 'user', content: 'Reply with the single word: OK' }]

  let result
  try {
    result = await generateText(pingMessages, {
      provider,
      apiKey,
      model,
      maxTokens: 16,
      temperature: 0,
    })
  } catch (error) {
    const selectedModel = model || getDefaultModelForProvider(provider)

    if (provider === API_PROVIDERS.OPENROUTER && isOpenRouterProviderFailure(error?.message)) {
      throw new Error(await buildOpenRouterProviderDiagnostic(apiKey, selectedModel, error))
    }

    throw error
  }

  return { ok: true, message: result }
}

// Generate text using OpenRouter
const generateWithOpenRouter = async (apiKey, model, messages, options = {}) => {
  const requestedModel = model || DEFAULT_OPENROUTER_MODEL

  const requestBody = {
    model: requestedModel,
    messages,
    temperature: options.temperature ?? 0.8,
    stream: false
  }

  if (typeof options.maxTokens === 'number') {
    requestBody.max_tokens = options.maxTokens
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
    return extractTextOrThrow(data.choices?.[0]?.message?.content, 'OpenRouter API Error')
  }

  const retries = [requestBody]

  if (requestBody.max_tokens !== undefined) {
    const withoutMaxTokens = { ...requestBody }
    delete withoutMaxTokens.max_tokens
    retries.push(withoutMaxTokens)
  }

  if (requestedModel === DEFAULT_OPENROUTER_MODEL) {
    retries.push({
      ...requestBody,
      model: OPENROUTER_FALLBACK_MODEL,
    })
  }

  let lastError

  for (const candidateBody of retries) {
    try {
      return await executeRequest(candidateBody)
    } catch (error) {
      lastError = error

      if (!isOpenRouterProviderFailure(error?.message)) {
        break
      }
    }
  }

  const finalError = enrichOpenRouterErrorMessage(lastError, requestedModel)
  console.error('OpenRouter API Error:', finalError)
  throw finalError
}

// Generate text using Google Gemini
const generateWithGoogle = async (apiKey, model, messages, options = {}) => {
  try {
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const response = await fetch(`${GOOGLE_BASE_URL}/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.8,
          maxOutputTokens: options.maxTokens
        }
      })
    })

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Google API Error'))
    }

    const data = await response.json()
    return extractTextOrThrow(data.candidates?.[0]?.content?.parts?.[0]?.text, 'Google API Error')
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
        model,
        messages,
        temperature: options.temperature ?? 0.8,
        max_tokens: options.maxTokens
      })
    })

    if (!response.ok) {
      throw new Error(await readApiError(response, 'DeepSeek API Error'))
    }

    const data = await response.json()
    return extractTextOrThrow(data.choices?.[0]?.message?.content, 'DeepSeek API Error')
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
        model,
        messages,
        temperature: options.temperature ?? 0.8,
        max_tokens: options.maxTokens
      })
    })

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Mistral API Error'))
    }

    const data = await response.json()
    return extractTextOrThrow(data.choices?.[0]?.message?.content, 'Mistral API Error')
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
  const requestedModel = options.model || settings.model
  const model = resolveModelForProvider(provider, requestedModel)
  const apiKey = options.apiKey || apiKeys[provider]

  if (!apiKey) {
    throw new Error(`No API key found for provider: ${provider}. Please add your API key in the settings.`)
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

      if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('403')) {
        throw error
      }

      if (i < maxRetries - 1) {
        const retryDelay = Number(error.retryAfterMs) || Math.pow(2, i) * 1000
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw lastError
}

export { API_PROVIDERS }
