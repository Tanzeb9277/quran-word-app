"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Zap, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react"

export default function GameResults({ 
  results, 
  scoringSummary, 
  onNewVerse, 
  onShowDetails 
}) {
  const [showWordBreakdown, setShowWordBreakdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!results || !scoringSummary) return null

  const { grade, accuracy } = scoringSummary.grade || {}
  const { levelUp } = scoringSummary

  const handleExportResults = () => {
    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        type: "game_results",
        version: "1.0"
      },
      results: {
        correctCount: results.correctCount,
        totalWords: results.totalWords,
        wordResults: results.wordResults
      },
      scoringSummary: {
        grade: scoringSummary.grade,
        versePoints: scoringSummary.versePoints,
        xpGained: scoringSummary.xpGained,
        streak: scoringSummary.streak,
        hintsUsed: scoringSummary.hintsUsed,
        stats: scoringSummary.stats,
        levelUp: scoringSummary.levelUp
      },
      performance: {
        accuracy: accuracy,
        grade: grade,
        isPerfect: results.correctCount === results.totalWords,
        wordsCorrect: results.correctCount,
        wordsIncorrect: results.totalWords - results.correctCount
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quran-game-results-${grade}-${accuracy}%-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getGradeIcon = (grade) => {
    switch (grade) {
      case 'S': return <Trophy className="w-8 h-8 text-purple-600" />
      case 'A': return <Star className="w-8 h-8 text-green-600" />
      case 'B': return <Target className="w-8 h-8 text-blue-600" />
      case 'C': return <AlertCircle className="w-8 h-8 text-orange-600" />
      default: return <Star className="w-8 h-8 text-gray-600" />
    }
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'S': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'A': return 'text-green-600 bg-green-100 border-green-200'
      case 'B': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'C': return 'text-orange-600 bg-orange-100 border-orange-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
        isMobile ? 'mx-2' : ''
      }`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getGradeIcon(grade)}
          </div>
          <CardTitle className={`mb-2 ${
            isMobile ? 'text-2xl' : 'text-3xl'
          }`}>
            {grade} Grade - {accuracy}% Accuracy
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {grade === 'S' && "Perfect! You're a Quran master! 🎉"}
            {grade === 'A' && "Excellent work! Keep it up! 🌟"}
            {grade === 'B' && "Good job! You're improving! 📈"}
            {grade === 'C' && "Keep practicing! You'll get better! 💪"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {/* Level Up Celebration */}
          {levelUp && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-3 sm:p-4 text-center">
              <Star className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 animate-bounce" />
              <h3 className="text-lg sm:text-xl font-bold mb-1">🎉 LEVEL UP! 🎉</h3>
              <p className="text-base sm:text-lg">You reached Level {levelUp.newLevel}!</p>
              <p className="text-xs sm:text-sm opacity-90">
                {levelUp.xpRemaining} XP remaining • {levelUp.xpToNext} XP to next level
              </p>
            </div>
          )}

          {/* Scoring Breakdown */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                +{scoringSummary.versePoints}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Verse Points</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                +{scoringSummary.xpGained}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">XP Gained</div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Session Progress
            </h4>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <div className="text-base sm:text-lg font-bold text-blue-600">
                  {scoringSummary.stats.totalVerses}
                </div>
                <div className="text-xs text-blue-600">Total Verses</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-green-600">
                  {scoringSummary.stats.perfectVerses}
                </div>
                <div className="text-xs text-green-600">Perfect</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-purple-600">
                  {scoringSummary.stats.averagePointsPerVerse}
                </div>
                <div className="text-xs text-purple-600">Avg Points</div>
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Performance Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Words Correct:</span>
                <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                  {results.correctCount}/{results.totalWords}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Current Streak:</span>
                <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                  {scoringSummary.streak} words
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Hints Used:</span>
                <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                  {scoringSummary.hintsUsed}
                </Badge>
              </div>
            </div>
          </div>

          {/* Word-by-Word Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Word Results</h4>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setShowWordBreakdown(!showWordBreakdown)}
                className="text-xs"
              >
                {showWordBreakdown ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            
            {showWordBreakdown && (
              <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {results.wordResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg text-xs sm:text-sm ${
                      result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.isCorrect ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="font-medium flex-shrink-0">
                      Word {index + 1}:
                    </span>
                    <span className={`${
                      result.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.selectedWord}
                    </span>
                    {!result.isCorrect && (
                      <>
                        <span className="text-gray-500 flex-shrink-0">→</span>
                        <span className="text-green-700 font-medium flex-shrink-0">
                          {result.correctWord}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onNewVerse}
              className="flex-1 bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3"
            >
              Next Verse
            </Button>
            <Button
              onClick={onShowDetails}
              variant="outline"
              className="flex-1 text-sm sm:text-base py-2 sm:py-3"
            >
              View Details
            </Button>
            <Button
              onClick={handleExportResults}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-2 text-sm sm:text-base py-2 sm:py-3"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
