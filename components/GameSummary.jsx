"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  BarChart3, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock, 
  Download,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import knowledgeTestStatsStore from "@/lib/game-stats"

export default function GameSummary({ onClearStats }) {
  const [stats, setStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [showDetails, setShowDetails] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Load stats when component mounts or dialog opens
  useEffect(() => {
    if (isOpen) {
      loadStats()
    }
  }, [isOpen])

  const loadStats = () => {
    const currentStats = knowledgeTestStatsStore.getStats()
    const recent = knowledgeTestStatsStore.getRecentSessions(10)
    setStats(currentStats)
    setRecentSessions(recent)
  }

  const handleClearStats = () => {
    if (window.confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
      knowledgeTestStatsStore.clearStats()
      loadStats()
      if (onClearStats) {
        onClearStats()
      }
    }
  }

  const handleExportStats = () => {
    const rawStats = knowledgeTestStatsStore.exportStats()
    const parsedStats = JSON.parse(rawStats)
    
    // Enhanced export data with additional metadata and formatting
    const enhancedExportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        type: "knowledge_test_statistics",
        version: "2.0",
        appVersion: "1.0.0",
        description: "Comprehensive Quran Word Knowledge Test Statistics"
      },
      summary: {
        totalVerses: parsedStats.totalVerses,
        totalWords: parsedStats.totalWords,
        totalUniqueWords: parsedStats.totalUniqueWords,
        averageAccuracy: stats.averageAccuracy,
        perfectVerseRate: stats.perfectVerseRate,
        totalInaccurateGuesses: parsedStats.totalInaccurateGuesses,
        totalRevealedWords: parsedStats.totalRevealedWords,
        lastUpdated: parsedStats.lastUpdated
      },
      performance: {
        perfectVerses: parsedStats.perfectVerses,
        totalAccuracy: parsedStats.totalAccuracy,
        averageAccuracy: stats.averageAccuracy,
        perfectVerseRate: stats.perfectVerseRate
      },
      recentSessions: recentSessions,
      allSessions: parsedStats.sessions,
      rawStats: parsedStats
    }

    const blob = new Blob([JSON.stringify(enhancedExportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quran-knowledge-test-stats-enhanced-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600 bg-green-100 border-green-200'
    if (accuracy >= 70) return 'text-blue-600 bg-blue-100 border-blue-200'
    if (accuracy >= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    return 'text-red-600 bg-red-100 border-red-200'
  }

  if (!stats) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Summary
          </Button>
        </DialogTrigger>
                 <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Knowledge Test Statistics</DialogTitle>
             <DialogDescription>
               No statistics available yet. Take some knowledge tests to see your progress!
             </DialogDescription>
           </DialogHeader>
         </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Knowledge Test Statistics
          </DialogTitle>
                     <DialogDescription>
             Track your progress and performance in the Quran Word Knowledge Test
           </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalVerses}</div>
                <div className="text-sm text-gray-600">Total Verses</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.totalWords}</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </CardContent>
            </Card>
            
                         <Card>
               <CardContent className="p-4 text-center">
                 <Award className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                 <div className="text-2xl font-bold text-purple-600">{stats.totalUniqueWords}</div>
                 <div className="text-sm text-gray-600">Unique Arabic Words</div>
               </CardContent>
             </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">
                  {stats.averageAccuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Avg Accuracy</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Perfect Verses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.perfectVerses}</div>
                <div className="text-sm text-gray-600">
                  {stats.perfectVerseRate.toFixed(1)}% of all verses
                </div>
              </CardContent>
            </Card>
            
                         <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">Inaccurate Guesses</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-red-600">{stats.totalInaccurateGuesses}</div>
                 <div className="text-sm text-gray-600">
                   {stats.totalWords > 0 ? ((stats.totalInaccurateGuesses / stats.totalWords) * 100).toFixed(1) : 0}% of words
                 </div>
                 <div className="text-xs text-gray-500 mt-1">
                   Includes wrong answers and revealed words
                 </div>
               </CardContent>
             </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revealed Words</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalRevealedWords}</div>
                <div className="text-sm text-gray-600">
                  {stats.totalWords > 0 ? ((stats.totalRevealedWords / stats.totalWords) * 100).toFixed(1) : 0}% of words
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Sessions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1"
                >
                  {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sessions recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            Surah {session.surahNumber}, Verse {session.verse}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={getAccuracyColor(session.accuracy)}
                          >
                            {session.accuracy.toFixed(1)}%
                          </Badge>
                          {session.isPerfect && (
                            <Badge variant="outline" className="text-green-600 bg-green-100 border-green-200">
                              Perfect
                            </Badge>
                          )}
                        </div>
                                                 <div className="text-sm text-gray-600">
                           {session.correctWords}/{session.totalWords} words guessed correctly
                           {session.revealedWords > 0 && (
                             <span className="ml-2 text-orange-600">• {session.revealedWords} revealed</span>
                           )}
                         </div>
                        {showDetails && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(session.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleExportStats}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Stats
            </Button>
            <Button
              onClick={handleClearStats}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Stats
            </Button>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-gray-500 text-center">
            Last updated: {formatDate(stats.lastUpdated)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
