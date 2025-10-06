import { sql } from "@/lib/db"

/**
 * Generates distractor words for quiz questions
 */
export class DistractorGenerator {
  
  /**
   * Get distractors based on semantic similarity (same root family)
   */
  static async getSemanticDistractors(correctWord, count = 3) {
    try {
      const distractors = await sql`
        SELECT * FROM words 
        WHERE root_arabic = ${correctWord.root_arabic}
        AND location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      return distractors
    } catch (error) {
      console.error('Error getting semantic distractors:', error)
      return []
    }
  }

  /**
   * Get distractors from the same surah (different verses)
   */
  static async getSurahDistractors(correctWord, count = 3) {
    try {
      const distractors = await sql`
        SELECT * FROM words 
        WHERE surah_number = ${correctWord.surah_number}
        AND location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      return distractors
    } catch (error) {
      console.error('Error getting surah distractors:', error)
      return []
    }
  }

  /**
   * Get distractors with similar transliteration patterns
   */
  static async getPhoneticDistractors(correctWord, count = 3) {
    try {
      // Get words with similar transliteration length and patterns
      const distractors = await sql`
        SELECT * FROM words 
        WHERE LENGTH(transliteration) BETWEEN 
          LENGTH(${correctWord.transliteration}) - 2 
          AND LENGTH(${correctWord.transliteration}) + 2
        AND location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      return distractors
    } catch (error) {
      console.error('Error getting phonetic distractors:', error)
      return []
    }
  }

  /**
   * Get completely random distractors
   */
  static async getRandomDistractors(correctWord, count = 3) {
    try {
      const distractors = await sql`
        SELECT * FROM words 
        WHERE location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      return distractors
    } catch (error) {
      console.error('Error getting random distractors:', error)
      return []
    }
  }

  /**
   * Get very easy distractors - completely different words
   */
  static async getEasyDistractors(correctWord, count = 3) {
    try {
      const distractors = await sql`
        SELECT * FROM words 
        WHERE location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        AND root_arabic != ${correctWord.root_arabic}
        AND surah_number != ${correctWord.surah_number}
        AND LENGTH(translation) > 3
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      return distractors
    } catch (error) {
      console.error('Error getting easy distractors:', error)
      return []
    }
  }

  /**
   * Get distractors with different word lengths
   */
  static async getLengthBasedDistractors(correctWord, count = 3) {
    try {
      const correctLength = correctWord.translation?.length || 0
      const distractors = await sql`
        SELECT * FROM words 
        WHERE location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        AND (
          LENGTH(translation) < ${Math.max(2, correctLength - 3)} 
          OR LENGTH(translation) > ${correctLength + 3}
        )
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      return distractors
    } catch (error) {
      console.error('Error getting length-based distractors:', error)
      return []
    }
  }

  /**
   * Get distractors from different surahs only
   */
  static async getDifferentSurahDistractors(correctWord, count = 3) {
    try {
      const distractors = await sql`
        SELECT * FROM words 
        WHERE location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        AND surah_number != ${correctWord.surah_number}
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      return distractors
    } catch (error) {
      console.error('Error getting different surah distractors:', error)
      return []
    }
  }

  /**
   * Get very simple distractors - common words that are obviously different
   */
  static async getSimpleDistractors(correctWord, count = 3) {
    try {
      const distractors = await sql`
        SELECT * FROM words 
        WHERE location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        AND translation IN ('the', 'and', 'of', 'to', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'time', 'has', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part')
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      return distractors
    } catch (error) {
      console.error('Error getting simple distractors:', error)
      return []
    }
  }

  /**
   * Get distractors based on difficulty level
   */
  static async getDifficultyBasedDistractors(correctWord, difficulty = 'medium', count = 3) {
    switch (difficulty) {
      case 'easy':
        return await this.getRandomDistractors(correctWord, count)
      case 'medium':
        return await this.getSurahDistractors(correctWord, count)
      case 'hard':
        return await this.getSemanticDistractors(correctWord, count)
      default:
        return await this.getSurahDistractors(correctWord, count)
    }
  }

  /**
   * Get mixed distractors using multiple strategies
   */
  static async getMixedDistractors(correctWord, count = 3) {
    const strategies = [
      () => this.getSemanticDistractors(correctWord, Math.ceil(count / 3)),
      () => this.getSurahDistractors(correctWord, Math.ceil(count / 3)),
      () => this.getRandomDistractors(correctWord, Math.ceil(count / 3))
    ]

    const allDistractors = []
    
    for (const strategy of strategies) {
      try {
        const distractors = await strategy()
        allDistractors.push(...distractors)
      } catch (error) {
        console.error('Strategy failed:', error)
      }
    }

    // Shuffle and limit to requested count
    return this.shuffleArray(allDistractors).slice(0, count)
  }

  /**
   * Get distractors ensuring no duplicates and proper variety
   */
  static async getSmartDistractors(correctWord, count = 3, options = {}) {
    const {
      difficulty = 'medium',
      includeSemantic = true,
      includeSurah = true,
      includeRandom = true,
      avoidTranslations = []
    } = options


    let allDistractors = []
    const usedTranslations = new Set([correctWord.translation, ...avoidTranslations])

    // Try semantic distractors first
    if (includeSemantic) {
      const semanticDistractors = await this.getSemanticDistractors(correctWord, count * 2)
      const filteredSemantic = semanticDistractors.filter(d => !usedTranslations.has(d.translation))
      allDistractors.push(...filteredSemantic)
    }

    // Add surah distractors
    if (includeSurah && allDistractors.length < count) {
      const surahDistractors = await this.getSurahDistractors(correctWord, count * 2)
      const newDistractors = surahDistractors.filter(d => !usedTranslations.has(d.translation))
      allDistractors.push(...newDistractors)
    }

    // Add random distractors if needed
    if (includeRandom && allDistractors.length < count) {
      const randomDistractors = await this.getRandomDistractors(correctWord, count * 2)
      const newDistractors = randomDistractors.filter(d => !usedTranslations.has(d.translation))
      allDistractors.push(...newDistractors)
    }

    // Remove duplicates and limit
    const uniqueDistractors = allDistractors.filter((distractor, index, self) =>
      index === self.findIndex(d => d.translation === distractor.translation)
    )

    const finalDistractors = this.shuffleArray(uniqueDistractors).slice(0, count)
    
    return finalDistractors
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  static shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Generate word bank options including correct answer and distractors
   */
  static async generateWordBank(correctWord, distractorCount = 3, options = {}) {
    const distractors = await this.getSmartDistractors(correctWord, distractorCount, options)
    
    // Create word bank array with correct answer and distractors
    const wordBank = [
      { ...correctWord, isCorrect: true },
      ...distractors.map(d => ({ ...d, isCorrect: false }))
    ]

    // Shuffle the word bank
    return this.shuffleArray(wordBank)
  }
} 