import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Edit3, Save, X, RefreshCw, Loader2, Copy, Check } from 'lucide-react'

export function ChapterEditor({ chapter, isOpen, onClose, onSave, onRegenerate, isAdultMode, language = 'en' }) {
  const [content, setContent] = useState(chapter?.content || '')
  const [isEditing, setIsEditing] = useState(false)
  const [regeneratePrompt, setRegeneratePrompt] = useState('')
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const translations = {
    en: {
      chapterTitle: 'Chapter',
      edit: 'Edit',
      save: 'Save Changes',
      cancel: 'Cancel',
      regenerate: 'Regenerate Chapter',
      regeneratePrompt: 'Regeneration Instructions',
      regeneratePlaceholder: 'e.g., "Make this scene more dramatic" or "Add more dialogue"',
      regenerateButton: 'Regenerate',
      regenerating: 'Regenerating...',
      wordCount: 'words',
      copy: 'Copy',
      copied: 'Copied!',
      close: 'Close'
    },
    he: {
      chapterTitle: 'פרק',
      edit: 'ערוך',
      save: 'שמור שינויים',
      cancel: 'ביטול',
      regenerate: 'צור מחדש',
      regeneratePrompt: 'הוראות ליצירה מחדש',
      regeneratePlaceholder: 'לדוגמה: "הפוך את הסצנה ליותר דרמטית" או "הוסף יותר דיאלוגים"',
      regenerateButton: 'צור מחדש',
      regenerating: 'יוצר מחדש...',
      wordCount: 'מילים',
      copy: 'העתק',
      copied: 'הועתק!',
      close: 'סגור'
    }
  }

  const t = translations[language]
  const isRTL = language === 'he'

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length

  const handleSave = () => {
    onSave(chapter.id, content)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setContent(chapter.content)
    setIsEditing(false)
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      await onRegenerate(chapter.id, regeneratePrompt)
      setShowRegenerateDialog(false)
      setRegeneratePrompt('')
    } catch (error) {
      console.error('Regeneration error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!chapter) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-white/20 max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center justify-between">
              <span>{t.chapterTitle} {chapter.id}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-normal">{wordCount} {t.wordCount}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4">
            {isEditing ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[500px] bg-white/5 border-white/10 text-white font-serif text-base leading-relaxed resize-none"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            ) : (
              <div className="prose prose-invert max-w-none">
                <div 
                  className="whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-200 bg-white/5 p-6 rounded-lg border border-white/10"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {content}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} className="border-white/20 hover:bg-white/10">
                  <X className="w-4 h-4 mr-2" />
                  {t.cancel}
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {t.save}
                </Button>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="border-white/20 hover:bg-white/10">
                    <Edit3 className="w-4 h-4 mr-2" />
                    {t.edit}
                  </Button>
                  <Button variant="outline" onClick={handleCopy} className="border-white/20 hover:bg-white/10">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? t.copied : t.copy}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRegenerateDialog(true)}
                    className="border-purple-500/50 hover:bg-purple-500/10 text-purple-400"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.regenerate}
                  </Button>
                  <Button variant="outline" onClick={onClose} className="border-white/20 hover:bg-white/10">
                    {t.close}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent className="bg-gray-900 border-white/20" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="text-xl text-white">{t.regenerate}</DialogTitle>
            <DialogDescription className="text-gray-300">
              {t.regeneratePrompt}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <Textarea
              value={regeneratePrompt}
              onChange={(e) => setRegeneratePrompt(e.target.value)}
              placeholder={t.regeneratePlaceholder}
              className="min-h-[120px] bg-white/5 border-white/10 text-white"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRegenerateDialog(false)}
                disabled={isRegenerating}
                className="border-white/20 hover:bg-white/10"
              >
                {t.cancel}
              </Button>
              <Button 
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.regenerating}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.regenerateButton}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

