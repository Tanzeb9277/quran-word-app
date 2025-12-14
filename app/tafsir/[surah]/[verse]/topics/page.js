'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Tag, Check, Loader2, Maximize2, X } from 'lucide-react'

export default function TafsirTopicsPage({ params }) {
  const [topics, setTopics] = useState([])
  const [assignedTopics, setAssignedTopics] = useState([])
  const [selectedTopics, setSelectedTopics] = useState(new Set())
  const [tafsirData, setTafsirData] = useState(null)
  const [tafsirLoading, setTafsirLoading] = useState(true)
  const [isTafsirFullscreen, setIsTafsirFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  
  // Unwrap params Promise
  const resolvedParams = use(params)
  const surah = resolvedParams?.surah
  const verse = resolvedParams?.verse

  useEffect(() => {
    if (surah && verse) {
      fetchTafsir()
      fetchData()
    }
  }, [surah, verse])

  const fetchTafsir = async () => {
    try {
      setTafsirLoading(true)
      const response = await fetch(`/api/tafsir/${surah}/${verse}`)
      const result = await response.json()
      
      if (result.success) {
        setTafsirData(result.data)
      }
    } catch (error) {
      console.error('Error fetching tafsir:', error)
    } finally {
      setTafsirLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all available topics
      const topicsResponse = await fetch('/api/topics')
      const topicsData = await topicsResponse.json()

      // Fetch already assigned topics for this verse
      const assignedResponse = await fetch(`/api/tafsir/${surah}/${verse}/topics`)
      const assignedData = await assignedResponse.json()

      if (topicsData.success) {
        setTopics(topicsData.data || [])
      } else {
        setError(topicsData.error || 'Failed to fetch topics')
      }

      if (assignedData.success) {
        const assigned = assignedData.data || []
        setAssignedTopics(assigned)
        // Pre-select already assigned topics
        const assignedTopicIds = new Set(assigned.map(t => t.topic_id))
        setSelectedTopics(assignedTopicIds)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTopic = (topicId) => {
    const newSelected = new Set(selectedTopics)
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId)
    } else {
      newSelected.add(topicId)
    }
    setSelectedTopics(newSelected)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)

      const topicIds = Array.from(selectedTopics)
      const assignedBy = 'user' // You can change this to get from user session/auth

      // Use verse_range from tafsir data (all_verse_refs or primary_verse_ref)
      const verseRange = tafsirData?.all_verse_refs || tafsirData?.primary_verse_ref || null

      const response = await fetch(`/api/tafsir/${surah}/${verse}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_ids: topicIds,
          assigned_by: assignedBy,
          verse_range: verseRange
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setAssignedTopics(data.data || [])
        // Show success message briefly
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        setError(data.error || 'Failed to save topics')
      }
    } catch (err) {
      console.error('Error saving topics:', err)
      setError('Failed to save topics. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="theme-container">
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="theme-container">
      <div className="w-full max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Verse
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Assign Topics to Tafsir
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Surah {surah}, Verse {verse}
          </p>
        </div>

        {/* Tafsir Display */}
        {tafsirLoading ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            </CardContent>
          </Card>
        ) : tafsirData && (
          <>
            {/* Regular Tafsir Display */}
            {!isTafsirFullscreen && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        📚 Tafsir Ibn Kathir
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Surah {tafsirData.surah}, Verse {tafsirData.ayah}
                        {tafsirData.all_verse_refs && (
                          <span className="ml-2">• References: {tafsirData.all_verse_refs}</span>
                        )}
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => setIsTafsirFullscreen(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ml-4"
                      aria-label="Expand tafsir to fullscreen"
                      title="Expand to fullscreen"
                    >
                      <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-relaxed prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-strong:text-gray-800 dark:prose-strong:text-gray-200 prose-a:text-blue-600 dark:prose-a:text-blue-400">
                    {tafsirData.tafsir_html ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: `<style>
                            .dark .tafsir-content-wrapper * {
                              color: rgb(229 231 235) !important;
                            }
                            .dark .tafsir-content-wrapper a {
                              color: rgb(96 165 250) !important;
                            }
                          </style><div class="tafsir-content-wrapper">${tafsirData.tafsir_html}</div>`
                        }}
                      />
                    ) : tafsirData.tafsir_text ? (
                      <p className="whitespace-pre-wrap">{tafsirData.tafsir_text}</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No tafsir content available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fullscreen Tafsir Modal */}
            {isTafsirFullscreen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-90 dark:bg-opacity-95 z-50 flex flex-col"
                onClick={() => setIsTafsirFullscreen(false)}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gray-900 dark:bg-gray-800 border-b border-gray-700">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      📚 Tafsir Ibn Kathir
                    </h3>
                    <div className="text-sm text-gray-300">
                      Surah {tafsirData.surah}, Verse {tafsirData.ayah}
                    </div>
                    {tafsirData.all_verse_refs && (
                      <div className="text-xs text-gray-400 mt-1">
                        Verse References: {tafsirData.all_verse_refs}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsTafsirFullscreen(false)}
                    className="p-2 hover:bg-gray-700 rounded transition-colors ml-4"
                    aria-label="Close fullscreen"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                {/* Content */}
                <div 
                  className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6 bg-gray-900 dark:bg-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-w-4xl mx-auto">
                    {tafsirData.tafsir_html ? (
                      <div 
                        className="prose prose-lg max-w-none text-white leading-relaxed prose-headings:text-white prose-p:text-white prose-strong:text-white prose-a:text-blue-400 dark:[&_*]:text-white"
                        dangerouslySetInnerHTML={{ 
                          __html: `<style>
                            .tafsir-fullscreen-content * {
                              color: white !important;
                            }
                            .tafsir-fullscreen-content a {
                              color: rgb(96 165 250) !important;
                            }
                          </style><div class="tafsir-fullscreen-content">${tafsirData.tafsir_html}</div>`
                        }}
                      />
                    ) : tafsirData.tafsir_text ? (
                      <p className="text-lg leading-relaxed text-white whitespace-pre-wrap">
                        {tafsirData.tafsir_text}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-center">
                        No tafsir content available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-300 font-medium">
              ✓ Topics saved successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Topics Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Available Topics
            </CardTitle>
            <CardDescription>
              Select one or more topics that relate to this tafsir. 
              {selectedTopics.size > 0 && (
                <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                  {selectedTopics.size} topic{selectedTopics.size !== 1 ? 's' : ''} selected
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topics.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No topics available. Please add topics to the database first.
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {topics.map((topic) => {
                  const isSelected = selectedTopics.has(topic.topic_id)
                  return (
                    <button
                      key={topic.topic_id}
                      onClick={() => toggleTopic(topic.topic_id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5 ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {topic.name}
                          </div>
                          {topic.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {topic.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currently Assigned Topics */}
        {assignedTopics.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Currently Assigned Topics</CardTitle>
              <CardDescription>
                These topics are currently assigned to this tafsir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {assignedTopics.map((assigned) => (
                  <Badge
                    key={assigned.id}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {assigned.topic_name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save {selectedTopics.size > 0 ? `(${selectedTopics.size})` : 'Changes'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

