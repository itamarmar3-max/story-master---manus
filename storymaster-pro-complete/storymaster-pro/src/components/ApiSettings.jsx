import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Settings, Key, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { getApiKeys, saveApiKeys, getApiSettings, saveApiSettings, fetchOpenRouterModels, API_PROVIDERS } from '../services/apiService'

export function ApiSettings({ isOpen, onClose, language = 'en' }) {
  const [apiKeys, setApiKeys] = useState({})
  const [settings, setSettings] = useState({})
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)

  const translations = {
    en: {
      title: 'API Settings',
      description: 'Configure your AI provider and API keys',
      provider: 'AI Provider',
      apiKey: 'API Key',
      model: 'Model',
      temperature: 'Temperature',
      maxTokens: 'Max Tokens',
      save: 'Save Settings',
      testConnection: 'Test Connection',
      loadModels: 'Load Models',
      openrouter: 'OpenRouter (Recommended)',
      google: 'Google Gemini',
      deepseek: 'DeepSeek',
      mistral: 'Mistral AI',
      enterKey: 'Enter your API key',
      selectModel: 'Select a model',
      connectionSuccess: 'Connection successful!',
      connectionFailed: 'Connection failed. Check your API key.',
      modelsFetched: 'models available',
      getApiKey: 'Get API Key',
      openrouterInfo: 'OpenRouter gives you access to 100+ models including GPT-4, Claude, Gemini, and more.',
      securityNote: 'Your API keys are stored locally in your browser and never sent to our servers.'
    },
    he: {
      title: 'הגדרות API',
      description: 'הגדר את ספק ה-AI ומפתחות ה-API שלך',
      provider: 'ספק AI',
      apiKey: 'מפתח API',
      model: 'מודל',
      temperature: 'טמפרטורה',
      maxTokens: 'מקסימום טוקנים',
      save: 'שמור הגדרות',
      testConnection: 'בדוק חיבור',
      loadModels: 'טען מודלים',
      openrouter: 'OpenRouter (מומלץ)',
      google: 'Google Gemini',
      deepseek: 'DeepSeek',
      mistral: 'Mistral AI',
      enterKey: 'הזן את מפתח ה-API שלך',
      selectModel: 'בחר מודל',
      connectionSuccess: 'החיבור הצליח!',
      connectionFailed: 'החיבור נכשל. בדוק את מפתח ה-API.',
      modelsFetched: 'מודלים זמינים',
      getApiKey: 'קבל מפתח API',
      openrouterInfo: 'OpenRouter נותן לך גישה ל-100+ מודלים כולל GPT-4, Claude, Gemini ועוד.',
      securityNote: 'מפתחות ה-API שלך נשמרים מקומית בדפדפן שלך ולעולם לא נשלחים לשרתים שלנו.'
    }
  }

  const t = translations[language]

  useEffect(() => {
    setApiKeys(getApiKeys())
    setSettings(getApiSettings())
  }, [])

  const handleProviderChange = (provider) => {
    setSettings({ ...settings, provider })
    setModels([])
    setConnectionStatus(null)
  }

  const handleApiKeyChange = (provider, key) => {
    const newKeys = { ...apiKeys, [provider]: key }
    setApiKeys(newKeys)
    saveApiKeys(newKeys)
  }

  const handleLoadModels = async () => {
    if (!apiKeys[settings.provider]) {
      alert('Please enter an API key first')
      return
    }

    if (settings.provider !== API_PROVIDERS.OPENROUTER) {
      alert('Model loading is only available for OpenRouter')
      return
    }

    setLoadingModels(true)
    try {
      const fetchedModels = await fetchOpenRouterModels(apiKeys[settings.provider])
      setModels(fetchedModels)
      setConnectionStatus({ success: true, message: `${fetchedModels.length} ${t.modelsFetched}` })
    } catch (error) {
      setConnectionStatus({ success: false, message: error.message })
    } finally {
      setLoadingModels(false)
    }
  }

  const handleSave = () => {
    saveApiSettings(settings)
    onClose()
  }

  const providerLinks = {
    [API_PROVIDERS.OPENROUTER]: 'https://openrouter.ai/keys',
    [API_PROVIDERS.GOOGLE]: 'https://makersuite.google.com/app/apikey',
    [API_PROVIDERS.DEEPSEEK]: 'https://platform.deepseek.com/api_keys',
    [API_PROVIDERS.MISTRAL]: 'https://console.mistral.ai/api-keys'
  }

  const defaultModels = {
    [API_PROVIDERS.OPENROUTER]: [
      { id: 'x-ai/grok-2-1212', name: 'Grok 2' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' }
    ],
    [API_PROVIDERS.GOOGLE]: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }
    ],
    [API_PROVIDERS.DEEPSEEK]: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' }
    ],
    [API_PROVIDERS.MISTRAL]: [
      { id: 'mistral-large-latest', name: 'Mistral Large' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium' }
    ]
  }

  const availableModels = models.length > 0 ? models : (defaultModels[settings.provider] || [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-400" />
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Security Note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
            <Key className="w-5 h-5 text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-300">{t.securityNote}</p>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label className="text-white">{t.provider}</Label>
            <Select value={settings.provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value={API_PROVIDERS.OPENROUTER}>{t.openrouter}</SelectItem>
                <SelectItem value={API_PROVIDERS.GOOGLE}>{t.google}</SelectItem>
                <SelectItem value={API_PROVIDERS.DEEPSEEK}>{t.deepseek}</SelectItem>
                <SelectItem value={API_PROVIDERS.MISTRAL}>{t.mistral}</SelectItem>
              </SelectContent>
            </Select>
            
            {settings.provider === API_PROVIDERS.OPENROUTER && (
              <p className="text-sm text-gray-400 mt-2">{t.openrouterInfo}</p>
            )}
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white">{t.apiKey}</Label>
              <a
                href={providerLinks[settings.provider]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                {t.getApiKey} →
              </a>
            </div>
            <Input
              type="password"
              value={apiKeys[settings.provider] || ''}
              onChange={(e) => handleApiKeyChange(settings.provider, e.target.value)}
              placeholder={t.enterKey}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Load Models Button (OpenRouter only) */}
          {settings.provider === API_PROVIDERS.OPENROUTER && (
            <Button
              onClick={handleLoadModels}
              disabled={!apiKeys[settings.provider] || loadingModels}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loadingModels ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t.loadModels}
                </>
              )}
            </Button>
          )}

          {/* Connection Status */}
          {connectionStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              connectionStatus.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {connectionStatus.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{connectionStatus.message}</span>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="text-white">{t.model}</Label>
            <Select value={settings.model} onValueChange={(value) => setSettings({ ...settings, model: value })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder={t.selectModel} />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20 max-h-60">
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name || model.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">{t.temperature}</Label>
              <Input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature || 0.8}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">{t.maxTokens}</Label>
              <Input
                type="number"
                min="1000"
                step="1000"
                value={settings.maxTokens || 4000}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6"
          >
            {t.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

