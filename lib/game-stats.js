// Local Knowledge Test Statistics Store
// Tracks knowledge test statistics locally before eventual user profile integration

class KnowledgeTestStatsStore {
  constructor() {
    this.stats = this.loadStats()
  }

  // Load stats from localStorage or initialize default
  loadStats() {
    if (typeof window === 'undefined') {
      return this.getDefaultStats()
    }

    try {
      const saved = localStorage.getItem('quran-knowledge-test-stats')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Convert totalUniqueWords array back to Set if it exists
        if (Array.isArray(parsed.totalUniqueWords)) {
          parsed.totalUniqueWords = new Set(parsed.totalUniqueWords)
        } else if (!parsed.totalUniqueWords) {
          parsed.totalUniqueWords = new Set()
        }
        return parsed
      }
      return this.getDefaultStats()
    } catch (error) {
      console.error('Error loading game stats:', error)
      return this.getDefaultStats()
    }
  }

  // Save stats to localStorage
  saveStats() {
    if (typeof window === 'undefined') return

    try {
      // Convert Set to Array for JSON serialization
      const statsToSave = {
        ...this.stats,
        totalUniqueWords: Array.from(this.stats.totalUniqueWords)
      }
      localStorage.setItem('quran-knowledge-test-stats', JSON.stringify(statsToSave))
    } catch (error) {
      console.error('Error saving game stats:', error)
    }
  }

  // Get default stats structure
  getDefaultStats() {
    return {
      totalWords: 0,
      totalUniqueWords: new Set(),
      totalInaccurateGuesses: 0,
      totalRevealedWords: 0,
      totalVerses: 0,
      perfectVerses: 0,
      totalAccuracy: 0,
      sessions: [],
      lastUpdated: new Date().toISOString()
    }
  }

  // Record a game session
  recordSession(sessionData) {
    const {
      verseData,
      submissionResults,
      revealedWords = new Set(),
      selectedWords = []
    } = sessionData

    if (!verseData || !submissionResults) {
      console.error('Invalid session data provided')
      return
    }

    // Calculate session statistics
    // correctCount already excludes revealed words, so use it directly
    const actualCorrectWords = submissionResults.correctCount
    const actualInaccurateGuesses = submissionResults.totalWords - actualCorrectWords - revealedWords.size
    
    const sessionStats = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      surahNumber: verseData.surah_number,
      verse: verseData.verse,
      totalWords: verseData.words.length,
      correctWords: actualCorrectWords,
      accuracy: (actualCorrectWords / submissionResults.totalWords) * 100,
      isPerfect: actualCorrectWords === submissionResults.totalWords && revealedWords.size === 0,
      revealedWords: revealedWords.size,
      inaccurateGuesses: actualInaccurateGuesses,
      wordResults: submissionResults.wordResults
    }

    // Update global statistics
    this.stats.totalWords += sessionStats.totalWords
    this.stats.totalVerses += 1
    this.stats.totalInaccurateGuesses += sessionStats.inaccurateGuesses
    this.stats.totalRevealedWords += sessionStats.revealedWords

    if (sessionStats.isPerfect) {
      this.stats.perfectVerses += 1
    }

    // Track unique Arabic words
    verseData.words.forEach(word => {
      // Use Arabic text if available, fallback to transliteration, then translation
      const uniqueIdentifier = word.arabic_text || word.transliteration || word.translation
      if (uniqueIdentifier) {
        this.stats.totalUniqueWords.add(uniqueIdentifier)
      }
    })
    
    console.log('Added Arabic words to unique set:', verseData.words.map(w => w.arabic_text || w.transliteration || w.translation))
    console.log('Total unique Arabic words now:', this.stats.totalUniqueWords.size)

    // Calculate overall accuracy based on actual correct guesses (excluding revealed words)
    const totalCorrect = this.stats.totalWords - this.stats.totalInaccurateGuesses
    this.stats.totalAccuracy = this.stats.totalWords > 0 ? (totalCorrect / this.stats.totalWords) * 100 : 0

    // Add session to history (keep last 50 sessions)
    this.stats.sessions.unshift(sessionStats)
    if (this.stats.sessions.length > 50) {
      this.stats.sessions = this.stats.sessions.slice(0, 50)
    }

    this.stats.lastUpdated = new Date().toISOString()
    this.saveStats()

    return sessionStats
  }

  // Get current statistics
  getStats() {
    return {
      ...this.stats,
      totalUniqueWords: this.stats.totalUniqueWords.size,
      averageAccuracy: this.stats.totalVerses > 0 ? this.stats.totalAccuracy : 0,
      perfectVerseRate: this.stats.totalVerses > 0 ? (this.stats.perfectVerses / this.stats.totalVerses) * 100 : 0
    }
  }

  // Get recent sessions
  getRecentSessions(limit = 10) {
    return this.stats.sessions.slice(0, limit)
  }

  // Clear all statistics
  clearStats() {
    this.stats = this.getDefaultStats()
    this.saveStats()
  }

  // Export statistics for backup
  exportStats() {
    const statsToExport = {
      ...this.stats,
      totalUniqueWords: Array.from(this.stats.totalUniqueWords)
    }
    return JSON.stringify(statsToExport, null, 2)
  }

  // Import statistics from backup
  importStats(statsJson) {
    try {
      const importedStats = JSON.parse(statsJson)
      // Convert totalUniqueWords back to Set if it's an array
      if (Array.isArray(importedStats.totalUniqueWords)) {
        importedStats.totalUniqueWords = new Set(importedStats.totalUniqueWords)
      }
      this.stats = importedStats
      this.saveStats()
      return true
    } catch (error) {
      console.error('Error importing stats:', error)
      return false
    }
  }
}

// Create singleton instance
const knowledgeTestStatsStore = new KnowledgeTestStatsStore()

export default knowledgeTestStatsStore
