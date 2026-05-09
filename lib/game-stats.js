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
        // Migration: old versions stored unique *strings* in totalUniqueWords; can't map to word IDs.
        // Keep the same localStorage key and all other stats, but reset the unique-word set.
        if (parsed && (Array.isArray(parsed.totalUniqueWords) || parsed.totalUniqueWords)) {
          delete parsed.totalUniqueWords
          parsed.seenWordIds = []
        }

        // Convert seenWordIds array back to Set if it exists
        if (Array.isArray(parsed.seenWordIds)) {
          parsed.seenWordIds = new Set(parsed.seenWordIds)
        } else if (!parsed.seenWordIds) {
          parsed.seenWordIds = new Set()
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
        seenWordIds: Array.from(this.stats.seenWordIds)
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
      seenWordIds: new Set(),
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
      wordResults: (submissionResults.wordResults || []).map((entry, i) => ({
        ...entry,
        root_arabic: verseData.words[i]?.root_arabic ?? null
      }))
    }

    // Update global statistics
    this.stats.totalWords += sessionStats.totalWords
    this.stats.totalVerses += 1
    this.stats.totalInaccurateGuesses += sessionStats.inaccurateGuesses
    this.stats.totalRevealedWords += sessionStats.revealedWords

    if (sessionStats.isPerfect) {
      this.stats.perfectVerses += 1
    }

    // Track unique word IDs (database primary keys)
    verseData.words.forEach(word => {
      const id = word?.id
      if (Number.isInteger(id)) {
        this.stats.seenWordIds.add(id)
      }
    })
    
    console.log('Added word IDs to unique set:', verseData.words.map(w => w?.id).filter(Number.isInteger))
    console.log('Total unique word IDs now:', this.stats.seenWordIds.size)

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
    const raw = localStorage.getItem('quran-knowledge-test-stats')
    const check = JSON.parse(raw)
    console.log('Saved seenWordIds:', check.seenWordIds)
    console.log('Has totalUniqueWords:', 'totalUniqueWords' in check)

    return sessionStats
  }

  // Get current statistics
  getStats() {
    return {
      ...this.stats,
      seenWordIds: Array.from(this.stats.seenWordIds),
      averageAccuracy: this.stats.totalVerses > 0 ? this.stats.totalAccuracy : 0,
      perfectVerseRate: this.stats.totalVerses > 0 ? (this.stats.perfectVerses / this.stats.totalVerses) * 100 : 0
    }
  }

  // Get seen word IDs as comma-separated string for URL query params
  getSeenWordIds() {
    return Array.from(this.stats.seenWordIds).sort((a, b) => a - b).join(',')
  }

  // Check if a word ID has been seen
  hasSeenWord(id) {
    const parsed = typeof id === 'string' ? parseInt(id, 10) : id
    return Number.isInteger(parsed) ? this.stats.seenWordIds.has(parsed) : false
  }

  // Get recent sessions
  getRecentSessions(limit = 10) {
    return this.stats.sessions.slice(0, limit)
  }

  // Map each root_arabic to total appearances across all recorded sessions
  getRootExposure() {
    const exposure = {}
    for (const session of this.stats.sessions) {
      for (const entry of (session.wordResults || [])) {
        const root = entry.root_arabic
        if (typeof root === 'string' && root.length > 0) {
          exposure[root] = (exposure[root] || 0) + 1
        }
      }
    }
    return exposure
  }

  // Return the last `limit` verse references to avoid repeating recently seen verses
  getExcludedVerses(limit = 20) {
    return this.stats.sessions
      .slice(0, limit)
      .map(s => s.verse)  // verse is already "15:3", not surahNumber:verse
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
      seenWordIds: Array.from(this.stats.seenWordIds)
    }
    return JSON.stringify(statsToExport, null, 2)
  }

  // Import statistics from backup
  importStats(statsJson) {
    try {
      const importedStats = JSON.parse(statsJson)
      // Convert seenWordIds back to Set if it's an array
      if (Array.isArray(importedStats.seenWordIds)) {
        importedStats.seenWordIds = new Set(importedStats.seenWordIds)
      } else if (importedStats && !importedStats.seenWordIds) {
        importedStats.seenWordIds = new Set()
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
