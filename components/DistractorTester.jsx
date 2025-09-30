"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DistractorTester() {
  const [testData, setTestData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [strategy, setStrategy] = useState('easy')
  const [wordsPerVerse, setWordsPerVerse] = useState(3)
  const [surah, setSurah] = useState('')
  const [verse, setVerse] = useState('')

  const testDistractors = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        strategy,
        wordsPerVerse: wordsPerVerse.toString()
      })
      
      if (surah) params.append('surah', surah)
      if (verse) params.append('verse', verse)
      
      const response = await fetch(`/api/words/distractors?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setTestData(result.data)
        console.log('Distractor test result:', result.data)
      } else {
        setError(result.error || 'Failed to test distractors')
        console.error('Error testing distractors:', result.error)
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Network error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Run initial test when component mounts
    testDistractors()
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verse Distractor Generator Tester</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="surah" className="text-sm">Surah:</Label>
                <Input
                  id="surah"
                  type="number"
                  placeholder="Random"
                  value={surah}
                  onChange={(e) => setSurah(e.target.value)}
                  className="w-20"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="verse" className="text-sm">Verse:</Label>
                <Input
                  id="verse"
                  type="number"
                  placeholder="Random"
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  className="w-20"
                />
              </div>
              
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (Different)</SelectItem>
                  <SelectItem value="simple">Simple (Common)</SelectItem>
                  <SelectItem value="length">Length-Based</SelectItem>
                  <SelectItem value="different-surah">Different Surah</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="smart">Smart (Current)</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="surah">Same Surah</SelectItem>
                  <SelectItem value="phonetic">Phonetic</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={wordsPerVerse.toString()} onValueChange={(value) => setWordsPerVerse(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 words</SelectItem>
                  <SelectItem value="3">3 words</SelectItem>
                  <SelectItem value="4">4 words</SelectItem>
                  <SelectItem value="5">5 words</SelectItem>
                  <SelectItem value="6">6 words</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={testDistractors} 
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 mb-4">
              Error: {error}
            </div>
          )}
          
          {testData && (
            <div className="space-y-6">
              {/* Verse Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Verse Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p><strong>Surah:</strong> {testData.verse.surah_number}</p>
                    <p><strong>Verse:</strong> {testData.verse.verse}</p>
                  </div>
                  <div>
                    <p><strong>Total Words:</strong> {testData.totalWords}</p>
                    <p><strong>Selected Words:</strong> {testData.selectedWords}</p>
                  </div>
                  <div>
                    <p><strong>Strategy:</strong> {testData.strategy}</p>
                    <p><strong>Distractors per Word:</strong> 1</p>
                  </div>
                </div>
              </div>

              {/* Word Results */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Word Analysis</h3>
                {testData.wordResults.map((wordResult, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Target Word */}
                      <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                        <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">
                          Target Word {index + 1}
                        </h4>
                        {wordResult.word.image_url && (
                          <div className="mb-3">
                            <img 
                              src={wordResult.word.image_url} 
                              alt="Word image"
                              className="max-w-full h-auto rounded border"
                              style={{ maxHeight: '100px' }}
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <p><strong>Translation:</strong> {wordResult.word.translation}</p>
                          <p><strong>Transliteration:</strong> {wordResult.word.transliteration}</p>
                          <p><strong>Root:</strong> {wordResult.word.root_arabic} ({wordResult.word.root_latin})</p>
                          <p><strong>Location:</strong> {wordResult.word.location}</p>
                          <p><strong>Grammar:</strong> {wordResult.word.grammar}</p>
                        </div>
                      </div>

                      {/* Distractor */}
                      <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                        <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400">
                          Distractor
                        </h4>
                        {wordResult.distractors[0]?.image_url && (
                          <div className="mb-3">
                            <img 
                              src={wordResult.distractors[0].image_url} 
                              alt="Distractor image"
                              className="max-w-full h-auto rounded border"
                              style={{ maxHeight: '100px' }}
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <p><strong>Translation:</strong> {wordResult.distractors[0]?.translation || 'No distractor found'}</p>
                          <p><strong>Transliteration:</strong> {wordResult.distractors[0]?.transliteration || 'N/A'}</p>
                          <p><strong>Root:</strong> {wordResult.distractors[0]?.root_arabic || 'N/A'} ({wordResult.distractors[0]?.root_latin || 'N/A'})</p>
                          <p><strong>Location:</strong> {wordResult.distractors[0]?.location || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Word Bank */}
                      <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                        <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">
                          Word Bank Options
                        </h4>
                        <div className="space-y-2">
                          {wordResult.wordBank.map((option, optionIndex) => (
                            <div 
                              key={optionIndex}
                              className={`p-2 rounded border ${
                                option.isCorrect 
                                  ? 'bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600' 
                                  : 'bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{option.translation}</span>
                                {option.isCorrect && (
                                  <Badge variant="default" className="text-xs">Correct</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {option.transliteration}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Test Summary</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Verse:</strong> Surah {testData.verse.surah_number}, Verse {testData.verse.verse}</p>
                  <p><strong>Strategy Used:</strong> {testData.strategy}</p>
                  <p><strong>Words Tested:</strong> {testData.selectedWords} out of {testData.totalWords}</p>
                  <p><strong>Distractors Generated:</strong> {testData.wordResults.filter(r => r.distractors.length > 0).length}</p>
                  <p><strong>Success Rate:</strong> {((testData.wordResults.filter(r => r.distractors.length > 0).length / testData.selectedWords) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 