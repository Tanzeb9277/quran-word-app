"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import knowledgeTestStatsStore from "@/lib/game-stats"
import ThemeToggle from "./ThemeToggle"
import { 
  Brain,
  Search,
  BookOpen,
  BarChart3,
  Target,
  ClipboardList,
  Clock,
  Trophy,
  TrendingUp,
  Award,
  Star,
  Tag
} from "lucide-react"

// Type definitions
interface SessionData {
  id: string
  timestamp: string
  surahNumber: number
  verse: number
  totalWords: number
  correctWords: number
  accuracy: number
  isPerfect: boolean
  revealedWords: number
  inaccurateGuesses: number
  wordResults: Array<{
    index: number
    selectedWord: string
    correctWord: string
    isCorrect: boolean
  }>
}

interface DashboardData {
  stats: {
    totalWords: number
    accuracy: number
    streak: number
    perfectVerses: number
  }
  performance: {
    accuracy: number
    perfectRate: number
    wordsLearned: number
  }
  recentSessions: Array<{
    id: number
    date: string
    verses: number
    words: number
    accuracy: number
    surahNumber: number
    verse: number
    isPerfect: boolean
    revealedWords: number
    originalSession: SessionData
  }>
  areasToWorkOn: Array<{
    category: string
    items: string[]
    accuracy: number
    priority: string
  }>
}

// Helper function to calculate streak
const calculateStreak = (sessions: SessionData[]) => {
  if (sessions.length === 0) return 0
  
  // Sort sessions by date (most recent first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  
  let streak = 0
  let currentDate = new Date()
  
  for (const session of sortedSessions) {
    const sessionDate = new Date(session.timestamp)
    const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streak) {
      streak++
      currentDate = sessionDate
    } else if (daysDiff > streak) {
      break
    }
  }
  
  return streak
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to analyze areas to work on
const analyzeAreasToWorkOn = (sessions: SessionData[]) => {
  const missedWords = new Map()
  const grammarMistakes = new Map()
  const rootMistakes = new Map()
  
  sessions.forEach(session => {
    if (session.wordResults) {
      session.wordResults.forEach((result: any) => {
        if (!result.isCorrect) {
          // Track missed words
          const word = result.correctWord
          missedWords.set(word, (missedWords.get(word) || 0) + 1)
          
          // You could add more sophisticated analysis here
          // based on the word's grammar, root, etc.
        }
      })
    }
  })
  
  // Get top missed words
  const topMissedWords = Array.from(missedWords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word)
  
  return [
    {
      category: "Missed Words",
      items: topMissedWords.length > 0 ? topMissedWords : ["No data yet"],
      accuracy: topMissedWords.length > 0 ? Math.max(0, 100 - (topMissedWords.length * 10)) : 100,
      priority: topMissedWords.length > 2 ? "high" : topMissedWords.length > 0 ? "medium" : "low",
    },
    {
      category: "Grammar Rules",
      items: ["Definite Articles", "Plural Forms", "Verb Conjugation"],
      accuracy: 85, // Placeholder - could be calculated from actual grammar mistakes
      priority: "medium",
    },
    {
      category: "Root Words",
      items: ["ر-ح-م", "س-م-و", "أ-ر-ض"],
      accuracy: 90, // Placeholder - could be calculated from actual root mistakes
      priority: "low",
    },
  ]
}

export default function QuranDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalWords: 0,
      accuracy: 0,
      streak: 0,
      perfectVerses: 0,
    },
    performance: {
      accuracy: 0,
      perfectRate: 0,
      wordsLearned: 0,
    },
    recentSessions: [],
    areasToWorkOn: [],
  })
  const [expandedCards, setExpandedCards] = useState<{
    stats: boolean
    performance: boolean
    activity: boolean
    areasToWorkOn: boolean
  }>({
    stats: false,
    performance: false,
    activity: false,
    areasToWorkOn: false,
  })

  const [expandedSessions, setExpandedSessions] = useState<{ [key: number]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Load session data on component mount
  useEffect(() => {
    const loadSessionData = () => {
      try {
        const stats = knowledgeTestStatsStore.getStats()
        const recentSessions = knowledgeTestStatsStore.getRecentSessions(10)
        
        const streak = calculateStreak(recentSessions)
        const areasToWorkOn = analyzeAreasToWorkOn(recentSessions)
        
        // Format recent sessions for display
        const formattedSessions = recentSessions.map((session: SessionData, index: number) => ({
          id: index + 1,
          date: formatDate(session.timestamp),
          verses: 1, // Each session is one verse
          words: session.totalWords,
          accuracy: Math.round(session.accuracy * 10) / 10,
          surahNumber: session.surahNumber,
          verse: session.verse,
          isPerfect: session.isPerfect,
          revealedWords: session.revealedWords,
          originalSession: session
        }))

        setData({
          stats: {
            totalWords: stats.totalWords,
            accuracy: Math.round(stats.averageAccuracy * 10) / 10,
            streak: streak,
            perfectVerses: stats.perfectVerses,
          },
          performance: {
            accuracy: Math.round(stats.averageAccuracy * 10) / 10,
            perfectRate: Math.round(stats.perfectVerseRate * 10) / 10,
            wordsLearned: stats.totalUniqueWords,
          },
          recentSessions: formattedSessions,
          areasToWorkOn: areasToWorkOn,
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading session data:', error)
        setIsLoading(false)
      }
    }

    loadSessionData()
  }, [])

  const toggleCard = (cardName: keyof typeof expandedCards) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardName]: !prev[cardName],
    }))
  }

  const toggleSession = (sessionId: number) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }))
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Navigation Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1 className="dashboard-main-title">Quran Word App</h1>
          <p className="dashboard-subtitle">Track your learning progress and continue your journey</p>
        </div>
        <div className="dashboard-nav">
          <Link href="/game" className="nav-link">
            <Brain className="nav-icon" />
            <span className="nav-text">Knowledge Test</span>
          </Link>
          <Link href="/explorer" className="nav-link">
            <Search className="nav-icon" />
            <span className="nav-text">Explorer</span>
          </Link>
          <Link href="/admin/tafsir-topics" className="nav-link">
            <Tag className="nav-icon" />
            <span className="nav-text">Tafsir Topics</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Stats Overview Card */}
      <div className="stats-card">
        <div className="stats-card-header" onClick={() => toggleCard("stats")}>
          <h2 className="stats-card-title">Overview</h2>
          <div className="stats-card-controls">
            <BarChart3 className="stats-card-icon" />
            <div className={`expand-icon ${expandedCards.stats ? "expanded" : ""}`}>▼</div>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{data.stats.totalWords}</div>
            <div className="stat-label">Words</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.stats.accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.stats.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.stats.perfectVerses}</div>
            <div className="stat-label">Perfect</div>
          </div>
        </div>

        {expandedCards.stats && (
          <div className="expanded-content">
            <div className="detailed-stats">
              <div className="detailed-stat-row">
                <span>Total Verses Studied:</span>
                <span>{data.stats.perfectVerses + Math.max(0, data.recentSessions.length - data.stats.perfectVerses)}</span>
              </div>
              <div className="detailed-stat-row">
                <span>Unique Words Learned:</span>
                <span>{data.performance.wordsLearned}</span>
              </div>
              <div className="detailed-stat-row">
                <span>Current Streak:</span>
                <span>{data.stats.streak} days</span>
              </div>
              <div className="detailed-stat-row">
                <span>Total Words Attempted:</span>
                <span>{data.stats.totalWords}</span>
              </div>
              <div className="detailed-stat-row">
                <span>Perfect Verses:</span>
                <span>{data.stats.perfectVerses}</span>
              </div>
              <div className="detailed-stat-row">
                <span>Revealed Words:</span>
                <span>{data.recentSessions.reduce((sum, session) => sum + (session.revealedWords || 0), 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Card */}
      <div className="performance-card">
        <div className="performance-header" onClick={() => toggleCard("performance")}>
          <div className="performance-left">
            <Target className="performance-icon" />
            <h2 className="performance-title">Performance</h2>
          </div>
          <div className={`expand-icon ${expandedCards.performance ? "expanded" : ""}`}>▼</div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-label">
            <span className="progress-text">Overall Accuracy</span>
            <span className="progress-percentage">{data.performance.accuracy}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${data.performance.accuracy}%` }}></div>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-label">
            <span className="progress-text">Perfect Verses</span>
            <span className="progress-percentage">{data.performance.perfectRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${data.performance.perfectRate}%` }}></div>
          </div>
        </div>

        {expandedCards.performance && (
          <div className="expanded-content">
            <div className="performance-breakdown">
              <h4>Performance by Category</h4>
              <div className="category-performance">
                <div className="category-item">
                  <span>Nouns</span>
                  <div className="mini-progress">
                    <div className="mini-progress-fill" style={{ width: "92%" }}></div>
                  </div>
                  <span>92%</span>
                </div>
                <div className="category-item">
                  <span>Verbs</span>
                  <div className="mini-progress">
                    <div className="mini-progress-fill" style={{ width: "88%" }}></div>
                  </div>
                  <span>88%</span>
                </div>
                <div className="category-item">
                  <span>Particles</span>
                  <div className="mini-progress">
                    <div className="mini-progress-fill" style={{ width: "96%" }}></div>
                  </div>
                  <span>96%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Areas to Work On Card */}
      <div className="areas-card">
        <div className="areas-header" onClick={() => toggleCard("areasToWorkOn")}>
          <div className="areas-left">
            <ClipboardList className="areas-icon" />
            <h2 className="areas-title">Areas to Work On</h2>
          </div>
          <div className={`expand-icon ${expandedCards.areasToWorkOn ? "expanded" : ""}`}>▼</div>
        </div>

        <div className="areas-list">
          {data.areasToWorkOn.map((area, index) => (
            <div key={index} className={`area-item priority-${area.priority}`}>
              <div className="area-info">
                <div className="area-category">{area.category}</div>
                <div className="area-accuracy">{area.accuracy}% accuracy</div>
              </div>
              <div className={`priority-badge priority-${area.priority}`}>{area.priority}</div>
            </div>
          ))}
        </div>

        {expandedCards.areasToWorkOn && (
          <div className="expanded-content">
            <div className="areas-breakdown">
              {data.areasToWorkOn.map((area, index) => (
                <div key={index} className="area-detail">
                  <h4>{area.category}</h4>
                  <div className="area-items">
                    {area.items.map((item: string, itemIndex: number) => (
                      <span key={itemIndex} className="area-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Card */}
      <div className="activity-card">
        <div className="activity-header-static">
          <div className="activity-left">
            <Clock className="activity-icon" />
            <h2 className="activity-title">Recent Sessions</h2>
          </div>
        </div>

        <div className="activity-list">
          {data.recentSessions.map((session) => (
            <div key={session.id} className="activity-item-expandable">
              <div className="activity-item-header" onClick={() => toggleSession(session.id)}>
                <div className="activity-info">
                  <div className="activity-date">{session.date}</div>
                  <div className="activity-details">
                    {session.verses} verses • {session.words} words
                  </div>
                </div>
                <div className="activity-right">
                  <div className="activity-score">{session.accuracy}%</div>
                  <div className={`expand-icon-small ${expandedSessions[session.id] ? "expanded" : ""}`}>▼</div>
                </div>
              </div>

              {expandedSessions[session.id] && (
                <div className="session-expanded-content">
                  <div className="session-stats-grid">
                    <div className="session-stat">
                      <span className="stat-label">Surah</span>
                      <span className="stat-value">{session.surahNumber}</span>
                    </div>
                    <div className="session-stat">
                      <span className="stat-label">Verse</span>
                      <span className="stat-value">{session.verse}</span>
                    </div>
                    <div className="session-stat">
                      <span className="stat-label">Mistakes</span>
                      <span className="stat-value">{session.originalSession.inaccurateGuesses}</span>
                    </div>
                    <div className="session-stat">
                      <span className="stat-label">Revealed</span>
                      <span className="stat-value">{session.revealedWords || 0}</span>
                    </div>
                    <div className="session-stat">
                      <span className="stat-label">Perfect</span>
                      <span className="stat-value">{session.isPerfect ? "Yes" : "No"}</span>
                    </div>
                    <div className="session-stat">
                      <span className="stat-label">Correct Words</span>
                      <span className="stat-value">{session.originalSession.correctWords}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile More Stats Button */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
      >
        <BarChart3 className="nav-icon" />
        <span className="nav-text">{showMobileSidebar ? 'Hide Stats' : 'More Stats'}</span>
      </button>

      {/* Mobile Sidebar */}
      {showMobileSidebar && (
        <div className="mobile-sidebar">
          {/* Quick Stats Card */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">
              <TrendingUp className="achievement-icon" />
              Quick Stats
            </h3>
            <div className="quick-stats">
              <div className="quick-stat-item">
                <span className="quick-stat-label">Today's Sessions</span>
                <span className="quick-stat-value">{data.recentSessions.filter(s => {
                  const today = new Date().toDateString()
                  const sessionDate = new Date(s.originalSession.timestamp).toDateString()
                  return today === sessionDate
                }).length}</span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-label">This Week</span>
                <span className="quick-stat-value">{data.recentSessions.filter(s => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(s.originalSession.timestamp) >= weekAgo
                }).length}</span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-label">Best Accuracy</span>
                <span className="quick-stat-value">{Math.max(...data.recentSessions.map(s => s.accuracy), 0)}%</span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-label">Avg. Words/Session</span>
                <span className="quick-stat-value">{data.recentSessions.length > 0 ? Math.round(data.recentSessions.reduce((sum, s) => sum + s.words, 0) / data.recentSessions.length) : 0}</span>
              </div>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">
              <Trophy className="achievement-icon" />
              Achievements
            </h3>
            <div className="achievement-list">
              {data.stats.streak >= 7 && (
                <div className="achievement-item">
                  <Star className="achievement-icon" />
                  <span className="achievement-text">7-Day Streak</span>
                </div>
              )}
              {data.stats.perfectVerses >= 10 && (
                <div className="achievement-item">
                  <Award className="achievement-icon" />
                  <span className="achievement-text">10 Perfect Verses</span>
                </div>
              )}
              {data.stats.totalWords >= 100 && (
                <div className="achievement-item">
                  <Brain className="achievement-icon" />
                  <span className="achievement-text">100 Words Learned</span>
                </div>
              )}
              {data.stats.accuracy >= 90 && (
                <div className="achievement-item">
                  <Target className="achievement-icon" />
                  <span className="achievement-text">90% Accuracy</span>
                </div>
              )}
              {data.stats.streak < 7 && data.stats.perfectVerses < 10 && data.stats.totalWords < 100 && data.stats.accuracy < 90 && (
                <div className="achievement-item">
                  <Star className="achievement-icon" />
                  <span className="achievement-text">Keep learning to unlock achievements!</span>
                </div>
              )}
            </div>
          </div>

          {/* Learning Tips Card */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">
              <BookOpen className="achievement-icon" />
              Learning Tips
            </h3>
            <div className="achievement-list">
              <div className="achievement-item">
                <span className="achievement-text">Practice daily for better retention</span>
              </div>
              <div className="achievement-item">
                <span className="achievement-text">Focus on root words to understand patterns</span>
              </div>
              <div className="achievement-item">
                <span className="achievement-text">Use the explorer to dive deeper</span>
              </div>
              <div className="achievement-item">
                <span className="achievement-text">Review missed words regularly</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="dashboard-sidebar">
        {/* Quick Stats Card */}
        <div className="sidebar-card">
          <h3 className="sidebar-title">
            <TrendingUp className="achievement-icon" />
            Quick Stats
          </h3>
          <div className="quick-stats">
            <div className="quick-stat-item">
              <span className="quick-stat-label">Today's Sessions</span>
              <span className="quick-stat-value">{data.recentSessions.filter(s => {
                const today = new Date().toDateString()
                const sessionDate = new Date(s.originalSession.timestamp).toDateString()
                return today === sessionDate
              }).length}</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">This Week</span>
              <span className="quick-stat-value">{data.recentSessions.filter(s => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(s.originalSession.timestamp) >= weekAgo
              }).length}</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">Best Accuracy</span>
              <span className="quick-stat-value">{Math.max(...data.recentSessions.map(s => s.accuracy), 0)}%</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">Avg. Words/Session</span>
              <span className="quick-stat-value">{data.recentSessions.length > 0 ? Math.round(data.recentSessions.reduce((sum, s) => sum + s.words, 0) / data.recentSessions.length) : 0}</span>
            </div>
          </div>
        </div>

        {/* Achievements Card */}
        <div className="sidebar-card">
          <h3 className="sidebar-title">
            <Trophy className="achievement-icon" />
            Achievements
          </h3>
          <div className="achievement-list">
            {data.stats.streak >= 7 && (
              <div className="achievement-item">
                <Star className="achievement-icon" />
                <span className="achievement-text">7-Day Streak</span>
              </div>
            )}
            {data.stats.perfectVerses >= 10 && (
              <div className="achievement-item">
                <Award className="achievement-icon" />
                <span className="achievement-text">10 Perfect Verses</span>
              </div>
            )}
            {data.stats.totalWords >= 100 && (
              <div className="achievement-item">
                <Brain className="achievement-icon" />
                <span className="achievement-text">100 Words Learned</span>
              </div>
            )}
            {data.stats.accuracy >= 90 && (
              <div className="achievement-item">
                <Target className="achievement-icon" />
                <span className="achievement-text">90% Accuracy</span>
              </div>
            )}
            {data.stats.streak < 7 && data.stats.perfectVerses < 10 && data.stats.totalWords < 100 && data.stats.accuracy < 90 && (
              <div className="achievement-item">
                <Star className="achievement-icon" />
                <span className="achievement-text">Keep learning to unlock achievements!</span>
              </div>
            )}
          </div>
        </div>

        {/* Learning Tips Card */}
        <div className="sidebar-card">
          <h3 className="sidebar-title">
            <BookOpen className="achievement-icon" />
            Learning Tips
          </h3>
          <div className="achievement-list">
            <div className="achievement-item">
              <span className="achievement-text">Practice daily for better retention</span>
            </div>
            <div className="achievement-item">
              <span className="achievement-text">Focus on root words to understand patterns</span>
            </div>
            <div className="achievement-item">
              <span className="achievement-text">Use the explorer to dive deeper</span>
            </div>
            <div className="achievement-item">
              <span className="achievement-text">Review missed words regularly</span>
            </div>
          </div>
      </div>
      </div>

    </div>
  )
}

