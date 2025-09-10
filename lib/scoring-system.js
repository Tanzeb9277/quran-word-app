// Scoring System for Quran Word App Game

export class ScoringSystem {
  constructor() {
    this.sessionPoints = 0
    this.currentVersePoints = 0
    this.currentStreak = 0
    this.verseCount = 0
    this.perfectVerses = 0
    this.hintsUsed = 0
    this.level = 1
    this.xp = 0
    this.xpToNextLevel = 100
  }

  // Core Points per Word
  static WORD_POINTS = {
    CORRECT: 10,
    INCORRECT: -5,
    COMPLETION_BONUS: 50,
    HINT_COMPLETION_BONUS: 20,
    HINT_PENALTY: -10,
    REVEAL_ANSWER_PENALTY: -100
  }

  // Difficulty Multipliers
  static DIFFICULTY_MULTIPLIERS = {
    short: 1.0,
    medium: 1.5,
    long: 2.0
  }

  // Streak Multipliers
  static STREAK_MULTIPLIERS = {
    1: 1.0,   // 1st correct word
    2: 1.2,   // 2nd in a row
    3: 1.5,   // 3rd in a row
    4: 1.8,   // 4th in a row
    5: 2.0    // 5+ in a row
  }

  // Performance Grades
  static PERFORMANCE_GRADES = {
    S: { min: 95, max: 100, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    A: { min: 85, max: 94, color: 'text-green-600', bgColor: 'bg-green-100' },
    B: { min: 70, max: 84, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    C: { min: 0, max: 69, color: 'text-orange-600', bgColor: 'bg-orange-100' }
  }

  // Calculate points for a correct word placement
  calculateWordPoints(isCorrect, difficulty = 'medium') {
    if (isCorrect) {
      this.currentStreak++
      const basePoints = ScoringSystem.WORD_POINTS.CORRECT
      const streakMultiplier = this.getStreakMultiplier()
      const difficultyMultiplier = ScoringSystem.DIFFICULTY_MULTIPLIERS[difficulty] || 1.0
      
      const finalPoints = Math.round(basePoints * streakMultiplier * difficultyMultiplier)
      this.currentVersePoints += finalPoints
      this.sessionPoints += finalPoints
      
      return {
        points: finalPoints,
        streak: this.currentStreak,
        multiplier: streakMultiplier,
        totalVersePoints: this.currentVersePoints
      }
    } else {
      // Reset streak on incorrect placement
      this.currentStreak = 0
      const penalty = ScoringSystem.WORD_POINTS.INCORRECT
      this.currentVersePoints += penalty
      this.sessionPoints += penalty
      
      return {
        points: penalty,
        streak: 0,
        multiplier: 1.0,
        totalVersePoints: this.currentVersePoints
      }
    }
  }

  // Get streak multiplier
  getStreakMultiplier() {
    if (this.currentStreak >= 5) return ScoringSystem.STREAK_MULTIPLIERS[5]
    return ScoringSystem.STREAK_MULTIPLIERS[this.currentStreak] || 1.0
  }

  // Calculate completion bonus
  calculateCompletionBonus(accuracy, hintsUsed, difficulty = 'medium') {
    let bonus = 0
    
    if (accuracy === 100) {
      if (hintsUsed === 0) {
        bonus = ScoringSystem.WORD_POINTS.COMPLETION_BONUS
      } else {
        bonus = ScoringSystem.WORD_POINTS.HINT_COMPLETION_BONUS
      }
    }

    // Apply difficulty multiplier
    const difficultyMultiplier = ScoringSystem.DIFFICULTY_MULTIPLIERS[difficulty] || 1.0
    bonus = Math.round(bonus * difficultyMultiplier)
    
    this.currentVersePoints += bonus
    this.sessionPoints += bonus
    
    return {
      bonus,
      totalVersePoints: this.currentVersePoints,
      totalSessionPoints: this.sessionPoints
    }
  }

  // Apply hint penalty
  applyHintPenalty(hintType, difficulty = 'medium') {
    let penalty = 0
    
    if (hintType === 'reveal_next') {
      penalty = ScoringSystem.WORD_POINTS.HINT_PENALTY
      this.hintsUsed++
    } else if (hintType === 'reveal_answer') {
      penalty = ScoringSystem.WORD_POINTS.REVEAL_ANSWER_PENALTY
      this.hintsUsed++
    }

    // Apply difficulty multiplier
    const difficultyMultiplier = ScoringSystem.DIFFICULTY_MULTIPLIERS[difficulty] || 1.0
    penalty = Math.round(penalty * difficultyMultiplier)
    
    this.currentVersePoints += penalty
    this.sessionPoints += penalty
    
    return {
      penalty,
      totalVersePoints: this.currentVersePoints,
      totalSessionPoints: this.sessionPoints
    }
  }

  // Calculate performance grade
  calculatePerformanceGrade(accuracy) {
    for (const [grade, range] of Object.entries(ScoringSystem.PERFORMANCE_GRADES)) {
      if (accuracy >= range.min && accuracy <= range.max) {
        return {
          grade,
          ...range,
          accuracy
        }
      }
    }
    return null
  }

  // Finalize verse and update stats
  finalizeVerse(accuracy, difficulty = 'medium') {
    this.verseCount++
    
    if (accuracy === 100) {
      this.perfectVerses++
    }

    // Calculate XP based on performance
    const baseXP = Math.round(this.currentVersePoints * 0.1) // 10% of points become XP
    this.xp += baseXP

    // Check for level up
    const levelUp = this.checkLevelUp()
    
    const verseSummary = {
      versePoints: this.currentVersePoints,
      sessionPoints: this.sessionPoints,
      accuracy,
      grade: this.calculatePerformanceGrade(accuracy),
      streak: this.currentStreak,
      hintsUsed: this.hintsUsed,
      xpGained: baseXP,
      currentXP: this.xp,
      level: this.level,
      levelUp,
      stats: {
        totalVerses: this.verseCount,
        perfectVerses: this.perfectVerses,
        averageAccuracy: this.calculateAverageAccuracy()
      }
    }

    // Reset verse-specific counters
    this.currentVersePoints = 0
    this.currentStreak = 0
    this.hintsUsed = 0

    return verseSummary
  }

  // Check if player leveled up
  checkLevelUp() {
    if (this.xp >= this.xpToNextLevel) {
      this.level++
      this.xp -= this.xpToNextLevel
      this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.2) // 20% increase per level
      return {
        newLevel: this.level,
        xpRemaining: this.xp,
        xpToNext: this.xpToNextLevel
      }
    }
    return null
  }

  // Calculate average accuracy across all verses
  calculateAverageAccuracy() {
    // This would need to be implemented with actual accuracy tracking
    // For now, return a placeholder
    return 0
  }

  // Get session summary
  getSessionSummary() {
    return {
      totalPoints: this.sessionPoints,
      totalVerses: this.verseCount,
      perfectVerses: this.perfectVerses,
      level: this.level,
      xp: this.xp,
      xpToNextLevel: this.xpToNextLevel,
      averagePointsPerVerse: this.verseCount > 0 ? Math.round(this.sessionPoints / this.verseCount) : 0
    }
  }

  // Reset session
  resetSession() {
    this.sessionPoints = 0
    this.currentVersePoints = 0
    this.currentStreak = 0
    this.verseCount = 0
    this.perfectVerses = 0
    this.hintsUsed = 0
    this.level = 1
    this.xp = 0
    this.xpToNextLevel = 100
  }

  // Save to localStorage
  saveToStorage() {
    const data = {
      sessionPoints: this.sessionPoints,
      level: this.level,
      xp: this.xp,
      xpToNextLevel: this.xpToNextLevel,
      totalVerses: this.verseCount,
      perfectVerses: this.perfectVerses
    }
    localStorage.setItem('quranGameScoring', JSON.stringify(data))
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const data = localStorage.getItem('quranGameScoring')
      if (data) {
        const parsed = JSON.parse(data)
        this.sessionPoints = parsed.sessionPoints || 0
        this.level = parsed.level || 1
        this.xp = parsed.xp || 0
        this.xpToNextLevel = parsed.xpToNextLevel || 100
        this.verseCount = parsed.totalVerses || 0
        this.perfectVerses = parsed.perfectVerses || 0
      }
    } catch (error) {
      console.error('Error loading scoring data:', error)
    }
  }
}
