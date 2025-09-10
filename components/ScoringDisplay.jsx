"use client"

import { useState, useEffect } from "react"
import { Trophy, Star, Target, TrendingUp, Zap, Volume2, VolumeX, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { soundEffects } from "@/lib/sound-effects"

export default function ScoringDisplay({ 
  scoringSystem, 
  currentPoints = 0, 
  currentStreak = 0, 
  showAnimation = false,
  lastAction = null 
}) {
  const [displayPoints, setDisplayPoints] = useState(0)
  const [displayStreak, setDisplayStreak] = useState(0)
  const [showPointAnimation, setShowPointAnimation] = useState(false)
  const [animationPoints, setAnimationPoints] = useState(0)
  const [animationType, setAnimationType] = useState('positive')
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.enabled)
  
  // Mobile state management
  const [expandedSection, setExpandedSection] = useState(null)
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

  // Animate points when they change
  useEffect(() => {
    if (showAnimation && lastAction) {
      setAnimationPoints(lastAction.points || 0)
      setAnimationType(lastAction.points > 0 ? 'positive' : 'negative')
      setShowPointAnimation(true)
      
      setTimeout(() => setShowPointAnimation(false), 2000)
    }
  }, [showAnimation, lastAction])

  // Smoothly animate display values
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPoints(currentPoints)
      setDisplayStreak(currentStreak)
    }, 100)
    return () => clearTimeout(timer)
  }, [currentPoints, currentStreak])

  const sessionSummary = scoringSystem?.getSessionSummary()

  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Close expanded section
  const closeSection = () => {
    setExpandedSection(null)
  }

  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        {/* Sound Toggle - Always visible floating button */}
        <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-3 border border-gray-200">
          <button
            onClick={() => {
              const enabled = soundEffects.toggleSound()
              setSoundEnabled(enabled)
            }}
            className="flex items-center justify-center w-12 h-12"
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-green-600" />
            ) : (
              <VolumeX className="w-6 h-6 text-red-600" />
            )}
          </button>
        </div>

        {/* Points Display - Floating icon */}
        <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-3 border border-gray-200">
          <button
            onClick={() => toggleSection('points')}
            className="flex items-center justify-center w-12 h-12 relative"
            title="View Points"
          >
            <Trophy className="w-6 h-6 text-yellow-500" />
            {displayPoints > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {displayPoints > 999 ? '999+' : displayPoints}
              </span>
            )}
          </button>
        </div>

        {/* Streak Display - Floating icon (only when streak > 0) */}
        {currentStreak > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-3 border border-gray-200">
            <button
              onClick={() => toggleSection('streak')}
              className="flex items-center justify-center w-12 h-12 relative"
              title="View Streak"
            >
              <Zap className="w-6 h-6 text-orange-500" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {currentStreak}
              </span>
            </button>
          </div>
        )}

        {/* Session Stats - Floating icon */}
        <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-3 border border-gray-200">
          <button
            onClick={() => toggleSection('session')}
            className="flex items-center justify-center w-12 h-12"
            title="View Session Stats"
          >
            <Target className="w-6 h-6 text-blue-500" />
          </button>
        </div>

        {/* Level Progress - Floating icon */}
        <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-3 border border-gray-200">
          <button
            onClick={() => toggleSection('level')}
            className="flex items-center justify-center w-12 h-12"
            title="View Level Progress"
          >
            <Star className="w-6 h-6 text-purple-500" />
          </button>
        </div>

        {/* Expanded Section Overlay */}
        {expandedSection && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full max-h-[80vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={closeSection}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Points Section */}
              {expandedSection === 'points' && (
                <div className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Current Points</h3>
                  <div className="text-4xl font-bold text-gray-800 mb-4">
                    {displayPoints.toLocaleString()}
                  </div>
                  {showPointAnimation && (
                    <div className={`text-lg font-bold ${
                      animationType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {animationType === 'positive' ? '+' : ''}{animationPoints}
                    </div>
                  )}
                </div>
              )}

              {/* Streak Section */}
              {expandedSection === 'streak' && (
                <div className="p-6 text-center">
                  <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Current Streak</h3>
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {displayStreak}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentStreak >= 5 ? '🔥 MAX MULTIPLIER!' : `${getStreakMultiplier(currentStreak)}x points`}
                  </div>
                </div>
              )}

              {/* Session Section */}
              {expandedSection === 'session' && sessionSummary && (
                <div className="p-6">
                  <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Session Progress</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-600">Total Points:</span>
                      <span className="font-bold text-blue-600">{sessionSummary.totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-600">Verses:</span>
                      <span className="font-bold text-green-600">{sessionSummary.totalVerses}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-600">Perfect:</span>
                      <span className="font-bold text-purple-600">{sessionSummary.perfectVerses}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Level Section */}
              {expandedSection === 'level' && sessionSummary && (
                <div className="p-6">
                  <Star className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Level {sessionSummary.level}</h3>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {sessionSummary.xp} / {sessionSummary.xpToNextLevel}
                      </div>
                      <Progress 
                        value={(sessionSummary.xp / sessionSummary.xpToNextLevel) * 100} 
                        className="h-3"
                      />
                      <div className="text-sm text-gray-600 mt-2">
                        {sessionSummary.xpToNextLevel - sessionSummary.xp} XP to next level
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop version (original)
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {/* Sound Toggle */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
        <button
          onClick={() => {
            const enabled = soundEffects.toggleSound()
            setSoundEnabled(enabled)
          }}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-green-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-red-600" />
          )}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </div>

      {/* Points Display */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-lg">Points</span>
        </div>
        <div className="text-2xl font-bold text-gray-800">
          {displayPoints.toLocaleString()}
        </div>
        
        {/* Point Animation */}
        {showPointAnimation && (
          <div className={`absolute -top-2 -right-2 text-lg font-bold transition-all duration-1000 ${
            animationType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {animationType === 'positive' ? '+' : ''}{animationPoints}
          </div>
        )}
      </div>

      {/* Streak Display */}
      {currentStreak > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-sm">Streak</span>
          </div>
          <div className="text-xl font-bold text-orange-600">
            {displayStreak}
          </div>
          <div className="text-xs text-gray-500">
            {currentStreak >= 5 ? '🔥 MAX MULTIPLIER!' : `${getStreakMultiplier(currentStreak)}x points`}
          </div>
        </div>
      )}

      {/* Session Stats */}
      {sessionSummary && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-sm">Session</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Points:</span>
              <span className="font-medium">{sessionSummary.totalPoints.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Verses:</span>
              <span className="font-medium">{sessionSummary.totalVerses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Perfect:</span>
              <span className="font-medium text-green-600">{sessionSummary.perfectVerses}</span>
            </div>
          </div>
        </div>
      )}

      {/* Level Progress */}
      {sessionSummary && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-sm">Level {sessionSummary.level}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>XP: {sessionSummary.xp}</span>
              <span>{sessionSummary.xpToNextLevel - sessionSummary.xp} to next</span>
            </div>
            <Progress 
              value={(sessionSummary.xp / sessionSummary.xpToNextLevel) * 100} 
              className="h-2"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get streak multiplier display
function getStreakMultiplier(streak) {
  if (streak >= 5) return '2.0'
  if (streak === 4) return '1.8'
  if (streak === 3) return '1.5'
  if (streak === 2) return '1.2'
  return '1.0'
}
