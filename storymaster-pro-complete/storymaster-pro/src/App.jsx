import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { BookOpen, Globe, Sparkles, Library, Settings, ChevronRight, Loader2, Book, Edit3, Key, Download, Trash2, AlertCircle } from 'lucide-react'
import { ApiSettings } from './components/ApiSettings.jsx'
import { ChapterEditor } from './components/ChapterEditor.jsx'
import { generateFullStory } from './services/heliosEngine.js'
import { generateAdultStory } from './services/hadesEngine.js'
import { generateChapter } from './services/heliosEngine.js'
import { generateEroticChapter } from './services/hadesEngine.js'
import { getApiKeys } from './services/apiService.js'
import { exportStory } from './services/exportService.js'
import './App.css'

function App() {
  const [language, setLanguage] = useState('en')
  const [screen, setScreen] = useState('onboarding')
  const [storyIdea, setStoryIdea] = useState('')
  const [isAdultMode, setIsAdultMode] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ stage: '', progress: 0, message: '' })
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showChapterEditor, setShowChapterEditor] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  
  const [config, setConfig] = useState({
    title: '',
    genre: '',
    subGenre: '',
    narrativeStructure: '',
    pacingProfile: '',
    targetWordCount: '',
    language: 'en',
    eroticGenre: '',
    kinks: '',
    intensityLevel: '',
    powerDynamic: ''
  })

  useEffect(() => {
    const savedProjects = localStorage.getItem('storymaster_projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('storymaster_projects', JSON.stringify(projects))
    }
  }, [projects])

  const translations = {
    en: {
      appTitle: 'StoryMaster Pro',
      onboardingPlaceholder: 'Tell me your story idea...',
      startCreating: 'Start Creating',
      switchToAdult: 'Adult Mode (18+)',
      switchToNormal: 'Normal Mode',
      configuration: 'Story Configuration',
      title: 'Story Title',
      genre: 'Genre',
      subGenre: 'Sub-Genre',
      narrativeStructure: 'Narrative Structure',
      pacingProfile: 'Pacing Profile',
      targetWordCount: 'Target Word Count',
      generateStory: 'Generate Story',
      generationDashboard: 'Generation Dashboard',
      projectLibrary: 'Project Library',
      chapters: 'Chapters',
      generating: 'Generating...',
      complete: 'Complete',
      adultWarning: 'Adult Content Warning',
      adultWarningText: 'This mode generates explicit adult content. You must be 18 years or older to continue.',
      confirmAge: 'I am 18 years or older',
      cancel: 'Cancel',
      eroticGenre: 'Erotic Genre',
      kinks: 'Kinks & Fetishes',
      intensityLevel: 'Intensity Level',
      powerDynamic: 'Power Dynamic',
      backToHome: 'Back to Home',
      viewLibrary: 'View Library',
      noProjects: 'No projects yet. Start creating your first story!',
      chapterProgress: 'Chapter Progress',
      readEdit: 'Read/Edit',
      apiSettings: 'API Settings',
      configureApi: 'Configure API',
      apiNotConfigured: 'Please configure your API settings first',
      export: 'Export Book',
      exportFormat: 'Export Format',
      exportButton: 'Download',
      deleteProject: 'Delete Project',
      deleteConfirm: 'Are you sure you want to delete this project?',
      error: 'Error',
      errorOccurred: 'An error occurred during generation'
    },
    he: {
      appTitle: 'StoryMaster Pro',
      onboardingPlaceholder: 'ספר לי את רעיון הסיפור שלך...',
      startCreating: 'התחל ליצור',
      switchToAdult: 'מצב למבוגרים (18+)',
      switchToNormal: 'מצב רגיל',
      configuration: 'הגדרות הסיפור',
      title: 'כותרת הסיפור',
      genre: 'ז\'אנר',
      subGenre: 'תת-ז\'אנר',
      narrativeStructure: 'מבנה נרטיבי',
      pacingProfile: 'פרופיל קצב',
      targetWordCount: 'מספר מילים יעד',
      generateStory: 'צור סיפור',
      generationDashboard: 'לוח יצירה',
      projectLibrary: 'ספריית פרויקטים',
      chapters: 'פרקים',
      generating: 'יוצר...',
      complete: 'הושלם',
      adultWarning: 'אזהרת תוכן למבוגרים',
      adultWarningText: 'מצב זה יוצר תוכן מפורש למבוגרים. עליך להיות בן 18 ומעלה כדי להמשיך.',
      confirmAge: 'אני בן 18 ומעלה',
      cancel: 'ביטול',
      eroticGenre: 'ז\'אנר אירוטי',
      kinks: 'העדפות ופטישים',
      intensityLevel: 'רמת עוצמה',
      powerDynamic: 'דינמיקת כוח',
      backToHome: 'חזרה לבית',
      viewLibrary: 'צפה בספרייה',
      noProjects: 'אין פרויקטים עדיין. התחל ליצור את הסיפור הראשון שלך!',
      chapterProgress: 'התקדמות פרקים',
      readEdit: 'קרא/ערוך',
      apiSettings: 'הגדרות API',
      configureApi: 'הגדר API',
      apiNotConfigured: 'אנא הגדר את הגדרות ה-API תחילה',
      export: 'ייצא ספר',
      exportFormat: 'פורמט ייצוא',
      exportButton: 'הורד',
      deleteProject: 'מחק פרויקט',
      deleteConfirm: 'האם אתה בטוח שברצונך למחוק פרויקט זה?',
      error: 'שגיאה',
      errorOccurred: 'אירעה שגיאה במהלך היצירה'
    }
  }

  const t = translations[language]
  const isRTL = language === 'he'

  const handleAdultModeToggle = () => {
    if (!isAdultMode) {
      setAgeConfirmed(false)
    } else {
      setIsAdultMode(false)
    }
  }

  const confirmAdultMode = () => {
    setIsAdultMode(true)
    setAgeConfirmed(true)
  }

  const handleSubmitIdea = () => {
    if (storyIdea.trim()) {
      setScreen('configuration')
    }
  }

  const handleGenerateStory = async () => {
    const apiKeys = getApiKeys()
    if (!apiKeys || Object.keys(apiKeys).length === 0) {
      alert(t.apiNotConfigured)
      setShowApiSettings(true)
      return
    }

    const newProject = {
      id: Date.now(),
      title: config.title || 'Untitled Story',
      idea: storyIdea,
      config: { ...config },
      isAdult: isAdultMode,
      chapters: [],
      progress: 0,
      status: 'generating',
      createdAt: new Date().toISOString()
    }
    
    setCurrentProject(newProject)
    setProjects([newProject, ...projects])
    setScreen('generation')
    
    try {
      const progressCallback = (progress) => {
        setGenerationProgress(progress)
        setCurrentProject(prev => ({ ...prev, progress: progress.progress }))
      }
      
      progressCallback.onChapterComplete = (chapter) => {
        setCurrentProject(prev => {
          const updated = { ...prev, chapters: [...prev.chapters, chapter] }
          setProjects(prevProjects => prevProjects.map(p => p.id === updated.id ? updated : p))
          return updated
        })
      }
      
      const result = isAdultMode 
        ? await generateAdultStory(storyIdea, config, progressCallback)
        : await generateFullStory(storyIdea, config, progressCallback)
      
      setCurrentProject(prev => {
        const updated = { ...prev, status: 'complete', chapters: result.chapters, metadata: result.metadata }
        setProjects(prevProjects => prevProjects.map(p => p.id === updated.id ? updated : p))
        return updated
      })
      
    } catch (error) {
      console.error('Generation error:', error)
      alert(`${t.error}: ${error.message}`)
      setCurrentProject(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }))
    }
  }

  const handleSaveChapter = (chapterId, newContent) => {
    setCurrentProject(prev => {
      const updated = {
        ...prev,
        chapters: prev.chapters.map(ch => 
          ch.id === chapterId ? { ...ch, content: newContent } : ch
        )
      }
      setProjects(prevProjects => prevProjects.map(p => p.id === updated.id ? updated : p))
      return updated
    })
  }

  const handleRegenerateChapter = async (chapterId, instructions) => {
    // Implementation would call the AI again with the instruction
    console.log('Regenerating chapter', chapterId, 'with instructions:', instructions)
    // For now, just a placeholder
    alert('Regeneration feature coming soon!')
  }

  const handleExport = async (format) => {
    try {
      await exportStory(currentProject, format)
      setShowExportDialog(false)
    } catch (error) {
      alert(`Export error: ${error.message}`)
    }
  }

  const handleDeleteProject = (projectId) => {
    if (confirm(t.deleteConfirm)) {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId))
      if (currentProject?.id === projectId) {
        resetToHome()
      }
    }
  }

  const resetToHome = () => {
    setScreen('onboarding')
    setStoryIdea('')
    setCurrentProject(null)
    setGenerationProgress({ stage: '', progress: 0, message: '' })
    setConfig({
      title: '',
      genre: '',
      subGenre: '',
      narrativeStructure: '',
      pacingProfile: '',
      targetWordCount: '',
      language: 'en',
      eroticGenre: '',
      kinks: '',
      intensityLevel: '',
      powerDynamic: ''
    })
  }

  const openChapterEditor = (chapter) => {
    setSelectedChapter(chapter)
    setShowChapterEditor(true)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white \${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: language === 'he' ? 'Assistant, sans-serif' : 'Inter, sans-serif' }}>
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.appTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setShowApiSettings(true)} className="border-white/20 hover:bg-white/10">
              <Key className="w-4 h-4 mr-2" />
              {t.apiSettings}
            </Button>

            <Button variant="outline" size="sm" onClick={() => setLanguage(language === 'en' ? 'he' : 'en')} className="border-white/20 hover:bg-white/10">
              <Globe className="w-4 h-4 mr-2" />
              {language === 'en' ? 'עברית' : 'English'}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant={isAdultMode ? "destructive" : "outline"} size="sm" className={isAdultMode ? "" : "border-white/20 hover:bg-white/10"} onClick={handleAdultModeToggle}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAdultMode ? t.switchToNormal : t.switchToAdult}
                </Button>
              </DialogTrigger>
              {!ageConfirmed && (
                <DialogContent className="bg-gray-900 border-white/20">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white">{t.adultWarning}</DialogTitle>
                    <DialogDescription className="text-gray-300">{t.adultWarningText}</DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-3 justify-end mt-4">
                    <Button variant="outline" onClick={() => setAgeConfirmed(false)}>{t.cancel}</Button>
                    <Button onClick={confirmAdultMode} className="bg-red-600 hover:bg-red-700">{t.confirmAge}</Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>

            <Button variant="ghost" size="sm" onClick={() => setScreen('library')} className="hover:bg-white/10">
              <Library className="w-4 h-4 mr-2" />
              {t.projectLibrary}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {screen === 'onboarding' && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">{t.appTitle}</h2>
              <p className="text-gray-400 text-lg">{language === 'en' ? 'Transform your ideas into professionally written novels' : 'הפוך את הרעיונות שלך לרומנים מקצועיים'}</p>
            </div>

            <div className="relative">
              <Textarea value={storyIdea} onChange={(e) => setStoryIdea(e.target.value)} placeholder={t.onboardingPlaceholder} className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-lg resize-none focus:border-purple-500/50 focus:ring-purple-500/20 transition-all" onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { handleSubmitIdea() } }} />
              <Button onClick={handleSubmitIdea} disabled={!storyIdea.trim()} className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg transition-all transform hover:scale-[1.02]">
                {t.startCreating}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {projects.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">{language === 'en' ? 'Recent Projects' : 'פרויקטים אחרונים'}</h3>
                <div className="grid gap-4">
                  {projects.slice(0, 3).map(project => (
                    <Card key={project.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer" onClick={() => { setCurrentProject(project); setScreen('generation') }}>
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>{project.title}</span>
                          <span className="text-sm text-gray-400">{project.status === 'complete' ? t.complete : t.generating}</span>
                        </CardTitle>
                        <CardDescription className="text-gray-400">{project.idea.substring(0, 100)}...</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {screen === 'configuration' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Button variant="ghost" onClick={resetToHome} className="mb-6 hover:bg-white/10">
              <ChevronRight className={`w-4 h-4 \${isRTL ? '' : 'rotate-180'} mr-2`} />
              {t.backToHome}
            </Button>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <Settings className="w-6 h-6 text-purple-400" />
                  {t.configuration}
                </CardTitle>
                <CardDescription className="text-gray-400">{storyIdea}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">{t.title}</Label>
                  <Input id="title" value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder={language === 'en' ? 'Enter your story title' : 'הזן את כותרת הסיפור'} />
                </div>

                {!isAdultMode ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-white">{t.genre}</Label>
                      <Select value={config.genre} onValueChange={(value) => setConfig({ ...config, genre: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={language === 'en' ? 'Select genre' : 'בחר ז\'אנר'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="fantasy">Fantasy</SelectItem>
                          <SelectItem value="scifi">Science Fiction</SelectItem>
                          <SelectItem value="thriller">Thriller</SelectItem>
                          <SelectItem value="romance">Romance</SelectItem>
                          <SelectItem value="mystery">Mystery</SelectItem>
                          <SelectItem value="literary">Literary Fiction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="narrativeStructure" className="text-white">{t.narrativeStructure}</Label>
                      <Select value={config.narrativeStructure} onValueChange={(value) => setConfig({ ...config, narrativeStructure: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={language === 'en' ? 'Select structure' : 'בחר מבנה'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="three-act">Three-Act Structure</SelectItem>
                          <SelectItem value="heros-journey">Hero's Journey</SelectItem>
                          <SelectItem value="fichtean">Fichtean Curve</SelectItem>
                          <SelectItem value="seven-point">Seven-Point Story</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pacingProfile" className="text-white">{t.pacingProfile}</Label>
                      <Select value={config.pacingProfile} onValueChange={(value) => setConfig({ ...config, pacingProfile: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={language === 'en' ? 'Select pacing' : 'בחר קצב'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="slow-burn">Slow Burn</SelectItem>
                          <SelectItem value="cold-open">Cold Open</SelectItem>
                          <SelectItem value="balanced">Balanced Ignition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wordCount" className="text-white">{t.targetWordCount}</Label>
                      <Select value={config.targetWordCount} onValueChange={(value) => setConfig({ ...config, targetWordCount: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={language === 'en' ? 'Select word count' : 'בחר מספר מילים'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="50000">50,000 words</SelectItem>
                          <SelectItem value="75000">75,000 words</SelectItem>
                          <SelectItem value="100000">100,000 words</SelectItem>
                          <SelectItem value="150000">150,000 words</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eroticGenre" className="text-white">{t.eroticGenre}</Label>
                      <Select value={config.eroticGenre} onValueChange={(value) => setConfig({ ...config, eroticGenre: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={language === 'en' ? 'Select erotic genre' : 'בחר ז\'אנר אירוטי'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="erotic-romance">Erotic Romance</SelectItem>
                          <SelectItem value="erotic-thriller">Erotic Thriller</SelectItem>
                          <SelectItem value="erotic-fantasy">Erotic Fantasy</SelectItem>
                          <SelectItem value="erotic-horror">Erotic Horror</SelectItem>
                          <SelectItem value="dark-romance">Dark Romance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="intensityLevel" className="text-white">{t.intensityLevel}</Label>
                      <Select value={config.intensityLevel} onValueChange={(value) => setConfig({ ...config, intensityLevel: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={language === 'en' ? 'Select intensity' : 'בחר עוצמה'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="explicit">Explicit</SelectItem>
                          <SelectItem value="graphic">Graphic / Uncensored</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="powerDynamic" className="text-white">{t.powerDynamic}</Label>
                      <Select value={config.powerDynamic} onValueChange={(value) => setConfig({ ...config, powerDynamic: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={language === 'en' ? 'Select dynamic' : 'בחר דינמיקה'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="dom-sub">Dom/Sub</SelectItem>
                          <SelectItem value="switch">Switch</SelectItem>
                          <SelectItem value="equal">Equal Partners</SelectItem>
                          <SelectItem value="predator-prey">Predator/Prey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wordCount" className="text-white">{t.targetWordCount}</Label>
                      <Select value={config.targetWordCount} onValueChange={(value) => setConfig({ ...config, targetWordCount: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={language === 'en' ? 'Select word count' : 'בחר מספר מילים'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="50000">50,000 words</SelectItem>
                          <SelectItem value="75000">75,000 words</SelectItem>
                          <SelectItem value="100000">100,000 words</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="kinks" className="text-white">{t.kinks}</Label>
                      <Textarea id="kinks" value={config.kinks} onChange={(e) => setConfig({ ...config, kinks: e.target.value })} className="bg-white/5 border-white/10 text-white min-h-[100px]" placeholder={language === 'en' ? 'Describe specific kinks, fetishes, and preferences...' : 'תאר העדפות ופטישים ספציפיים...'} />
                    </div>
                  </div>
                )}

                <Button onClick={handleGenerateStory} disabled={!config.title} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg transition-all transform hover:scale-[1.02]">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t.generateStory}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {screen === 'generation' && currentProject && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={resetToHome} className="hover:bg-white/10">
                <ChevronRight className={`w-4 h-4 \${isRTL ? '' : 'rotate-180'} mr-2`} />
                {t.backToHome}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowExportDialog(true)} disabled={currentProject.status !== 'complete'} className="border-white/20 hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  {t.export}
                </Button>
                <Button variant="outline" onClick={() => setScreen('library')} className="border-white/20 hover:bg-white/10">
                  <Library className="w-4 h-4 mr-2" />
                  {t.viewLibrary}
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="aspect-[2/3] bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-4 flex items-center justify-center">
                    <Book className="w-24 h-24 text-white/50" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{currentProject.title}</h2>
                  <p className="text-gray-400 text-sm mb-4">{currentProject.idea.substring(0, 150)}...</p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{t.chapterProgress}</span>
                        <span className="text-white">{currentProject.chapters.length} / 15</span>
                      </div>
                      <Progress value={currentProject.progress} className="h-2" />
                    </div>
                    
                    {currentProject.status === 'generating' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">{generationProgress.message || t.generating}</span>
                        </div>
                        <p className="text-xs text-gray-500">{generationProgress.stage}</p>
                      </div>
                    )}
                    
                    {currentProject.status === 'complete' && (
                      <div className="text-green-400 text-sm font-semibold">✓ {t.complete}</div>
                    )}

                    {currentProject.status === 'error' && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{t.errorOccurred}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    {t.chapters}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {currentProject.chapters.map((chapter) => (
                      <Card key={chapter.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-semibold flex-shrink-0">{chapter.id}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold">{chapter.title}</h4>
                              <p className="text-gray-400 text-sm truncate">{chapter.content.substring(0, 80)}...</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="hover:bg-white/10 flex-shrink-0" onClick={() => openChapterEditor(chapter)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            {t.readEdit}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {currentProject.status === 'generating' && (
                      <Card className="bg-white/5 border-white/10 border-dashed">
                        <CardContent className="p-4 flex items-center gap-3">
                          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                          <span className="text-gray-400">{generationProgress.message || t.generating}</span>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {screen === 'library' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Library className="w-8 h-8 text-purple-400" />
                {t.projectLibrary}
              </h2>
              <Button variant="outline" onClick={resetToHome} className="border-white/20 hover:bg-white/10">
                <ChevronRight className={`w-4 h-4 \${isRTL ? '' : 'rotate-180'} mr-2`} />
                {t.backToHome}
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">{t.noProjects}</p>
                  <Button onClick={resetToHome} className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">{t.startCreating}</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group relative">
                    <CardContent className="p-6 cursor-pointer" onClick={() => { setCurrentProject(project); setScreen('generation') }}>
                      <div className="aspect-[2/3] bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-4 flex items-center justify-center">
                        <Book className="w-16 h-16 text-white/50" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.idea}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{project.chapters.length} {t.chapters}</span>
                        <span className={`text-sm font-semibold \${project.status === 'complete' ? 'text-green-400' : 'text-purple-400'}`}>
                          {project.status === 'complete' ? t.complete : t.generating}
                        </span>
                      </div>
                    </CardContent>
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-red-400" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ApiSettings isOpen={showApiSettings} onClose={() => setShowApiSettings(false)} language={language} />
      
      {selectedChapter && (
        <ChapterEditor 
          chapter={selectedChapter} 
          isOpen={showChapterEditor} 
          onClose={() => setShowChapterEditor(false)}
          onSave={handleSaveChapter}
          onRegenerate={handleRegenerateChapter}
          isAdultMode={isAdultMode}
          language={language}
        />
      )}

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">{t.export}</DialogTitle>
            <DialogDescription className="text-gray-300">{t.exportFormat}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button onClick={() => handleExport('txt')} className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export as TXT
            </Button>
            <Button onClick={() => handleExport('rtf')} className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export as RTF
            </Button>
            <Button onClick={() => handleExport('docx')} className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export as HTML (for Word)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
