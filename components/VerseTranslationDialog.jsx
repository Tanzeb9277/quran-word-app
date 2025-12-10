'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function VerseTranslationDialog({ open, onOpenChange, surahNumber, verseNumber }) {
  const [activeTab, setActiveTab] = useState('translation')
  const [translationData, setTranslationData] = useState(null)
  const [tafsirData, setTafsirData] = useState(null)
  const [loadingTranslation, setLoadingTranslation] = useState(false)
  const [loadingTafsir, setLoadingTafsir] = useState(false)
  const [translationError, setTranslationError] = useState(null)
  const [tafsirError, setTafsirError] = useState(null)

  useEffect(() => {
    if (open && surahNumber && verseNumber) {
      // Reset state when dialog opens
      setTranslationData(null)
      setTafsirData(null)
      setTranslationError(null)
      setTafsirError(null)
      setActiveTab('translation')
      
      // Fetch translation and tafsir
      fetchTranslation()
      fetchTafsir()
    }
  }, [open, surahNumber, verseNumber])

  const fetchTranslation = async () => {
    if (!surahNumber || !verseNumber) return
    
    setLoadingTranslation(true)
    setTranslationError(null)
    
    try {
      const response = await fetch(`/api/translations/verse/${surahNumber}/${verseNumber}`)
      const result = await response.json()
      
      if (result.success) {
        setTranslationData(result.data)
      } else {
        setTranslationError(result.error || 'Failed to fetch translation')
      }
    } catch (error) {
      console.error('Error fetching translation:', error)
      setTranslationError('Network error occurred while fetching translation')
    } finally {
      setLoadingTranslation(false)
    }
  }

  const fetchTafsir = async () => {
    if (!surahNumber || !verseNumber) return
    
    setLoadingTafsir(true)
    setTafsirError(null)
    
    try {
      const response = await fetch(`/api/tafsir/${surahNumber}/${verseNumber}`)
      const result = await response.json()
      
      if (result.success) {
        setTafsirData(result.data)
      } else {
        setTafsirError(result.error || 'Failed to fetch tafsir')
      }
    } catch (error) {
      console.error('Error fetching tafsir:', error)
      setTafsirError('Network error occurred while fetching tafsir')
    } finally {
      setLoadingTafsir(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Verse {surahNumber}:{verseNumber}
          </DialogTitle>
          <DialogDescription>
            Translation and Tafsir Ibn Kathir
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="translation">Translation</TabsTrigger>
            <TabsTrigger value="tafsir">Tafsir</TabsTrigger>
          </TabsList>

          <TabsContent value="translation" className="mt-4">
            {loadingTranslation ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading translation...</span>
              </div>
            ) : translationError ? (
              <div className="py-8 text-center">
                <p className="text-red-600 dark:text-red-400">{translationError}</p>
              </div>
            ) : translationData ? (
              <div className="space-y-4">
                {Array.isArray(translationData) ? (
                  translationData.map((translation, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {translation.translation_source || 'Translation'}
                        </span>
                      </div>
                      <div className="text-gray-900 dark:text-gray-100 leading-relaxed">
                        {translation.display_translation || translation.translation}
                      </div>
                      {translation.has_footnotes && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {translation.footnote_count} footnote{translation.footnote_count !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {translationData.translation_source || 'Translation'}
                      </span>
                    </div>
                    <div className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {translationData.display_translation || translationData.translation}
                    </div>
                    {translationData.has_footnotes && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {translationData.footnote_count} footnote{translationData.footnote_count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No translation data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="tafsir" className="mt-4">
            {loadingTafsir ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tafsir...</span>
              </div>
            ) : tafsirError ? (
              <div className="py-8 text-center">
                <p className="text-red-600 dark:text-red-400">{tafsirError}</p>
              </div>
            ) : tafsirData ? (
              <div className="space-y-4">
                {tafsirData.all_verse_refs && (
                  <div className="text-sm text-gray-600 dark:text-white mb-2">
                    <strong className="dark:text-white">Verse References:</strong> {tafsirData.all_verse_refs}
                  </div>
                )}
                {tafsirData.tafsir_html ? (
                  <div 
                    className="prose prose-sm max-w-none text-gray-900 dark:text-white leading-relaxed prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-900 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-li:text-gray-900 dark:prose-li:text-white prose-ul:text-gray-900 dark:prose-ul:text-white prose-ol:text-gray-900 dark:prose-ol:text-white prose-blockquote:text-gray-900 dark:prose-blockquote:text-white dark:[&_*]:text-white dark:[&_a]:text-blue-400"
                    dangerouslySetInnerHTML={{ 
                      __html: `<style>
                        .dark .tafsir-content-wrapper * {
                          color: white !important;
                        }
                        .dark .tafsir-content-wrapper a {
                          color: rgb(96 165 250) !important;
                        }
                      </style><div class="tafsir-content-wrapper">${tafsirData.tafsir_html}</div>`
                    }}
                  />
                ) : tafsirData.tafsir_text ? (
                  <div className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                    {tafsirData.tafsir_text}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 dark:text-white">
                    No tafsir content available
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-white">
                No tafsir data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

