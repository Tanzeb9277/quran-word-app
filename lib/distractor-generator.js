import { sql } from "@/lib/db"

/**
 * Generates distractor words for quiz questions
 */
export class DistractorGenerator {
  
  /**
   * Check if distractor contains the correct word
   * @param {string} distractor - The distractor translation
   * @param {string} correctWord - The correct word translation
   * @returns {boolean} - True if distractor contains correct word
   */
  static containsWord(distractor, correctWord) {
    if (!distractor || !correctWord) return false
    
    const distractorLower = distractor.toLowerCase().trim()
    const correctLower = correctWord.toLowerCase().trim()
    
    // Check if distractor contains the correct word as a whole word
    // Using word boundaries to avoid partial matches
    const wordBoundaryRegex = new RegExp(`\\b${correctLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return wordBoundaryRegex.test(distractorLower)
  }

  /**
   * Calculate similarity percentage between two strings
   * Uses a simple character matching algorithm
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Similarity percentage (0-100)
   */
  static calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0
    if (str1 === str2) return 100
    
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()
    
    // Calculate longest common subsequence length
    const maxLen = Math.max(s1.length, s2.length)
    if (maxLen === 0) return 0
    
    // Use Levenshtein distance for more accurate similarity
    const distance = this.levenshteinDistance(s1, s2)
    const similarity = ((maxLen - distance) / maxLen) * 100
    
    return similarity
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Edit distance
   */
  static levenshteinDistance(str1, str2) {
    const m = str1.length
    const n = str2.length
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
    
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1]
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,      // deletion
            dp[i][j - 1] + 1,      // insertion
            dp[i - 1][j - 1] + 1   // substitution
          )
        }
      }
    }
    
    return dp[m][n]
  }

  /**
   * Check if a distractor is valid (doesn't contain correct word and similarity < 80%)
   * @param {object} distractor - Distractor word object
   * @param {object} correctWord - Correct word object
   * @returns {boolean} - True if distractor is valid
   */
  static isValidDistractor(distractor, correctWord) {
    if (!distractor || !distractor.translation) return false
    if (!correctWord || !correctWord.translation) return true
    
    // Check if distractor contains the correct word
    if (this.containsWord(distractor.translation, correctWord.translation)) {
      return false
    }
    
    // Check similarity threshold (must be less than 80%)
    const similarity = this.calculateSimilarity(
      distractor.translation,
      correctWord.translation
    )
    
    if (similarity >= 80) {
      return false
    }
    
    return true
  }
  
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
      // console.log('🔍 getRandomDistractors query:', {
      //   correctWordLocation: correctWord.location,
      //   correctWordTranslation: correctWord.translation,
      //   count
      // })
      
      const distractors = await sql`
        SELECT * FROM words 
        WHERE location != ${correctWord.location}
        AND translation != ${correctWord.translation}
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      
      // console.log('📊 getRandomDistractors result:', {
      //   requested: count,
      //   found: distractors.length,
      //   distractors: distractors.map(d => ({ translation: d.translation, location: d.location }))
      // })
      
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

    // console.log('🎯 getSmartDistractors called:', {
    //   correctWord: correctWord.translation,
    //   location: correctWord.location,
    //   count,
    //   avoidTranslations: avoidTranslations.length
    // })

    let allDistractors = []
    const usedTranslations = new Set([correctWord.translation, ...avoidTranslations])

    // Helper function to filter valid distractors
    const filterValidDistractors = (distractors) => {
      return distractors.filter(d => {
        // Check translation uniqueness
        if (usedTranslations.has(d.translation)) return false
        // Check containment and similarity
        return this.isValidDistractor(d, correctWord)
      })
    }

    // Try semantic distractors first
    if (includeSemantic) {
      const semanticDistractors = await this.getSemanticDistractors(correctWord, count * 4)
      const filteredSemantic = filterValidDistractors(semanticDistractors)
      allDistractors.push(...filteredSemantic)
      filteredSemantic.forEach(d => usedTranslations.add(d.translation))
      // console.log(`📝 Semantic distractors: ${semanticDistractors.length} found, ${filteredSemantic.length} after filtering`)
    }

    // Add surah distractors
    if (includeSurah && allDistractors.length < count) {
      const surahDistractors = await this.getSurahDistractors(correctWord, count * 4)
      const newDistractors = filterValidDistractors(surahDistractors)
      allDistractors.push(...newDistractors)
      newDistractors.forEach(d => usedTranslations.add(d.translation))
      // console.log(`📝 Surah distractors: ${surahDistractors.length} found, ${newDistractors.length} after filtering`)
    }

    // Add random distractors if needed
    if (includeRandom && allDistractors.length < count) {
      const randomDistractors = await this.getRandomDistractors(correctWord, count * 4)
      const newDistractors = filterValidDistractors(randomDistractors)
      allDistractors.push(...newDistractors)
      newDistractors.forEach(d => usedTranslations.add(d.translation))
      // console.log(`📝 Random distractors: ${randomDistractors.length} found, ${newDistractors.length} after filtering`)
    }

    // If still not enough, try with fewer restrictions but still validate
    if (allDistractors.length < count) {
      // console.log(`⚠️ Not enough distractors (${allDistractors.length}/${count}), trying with relaxed restrictions`)
      
      // Try with only the correct word in avoidTranslations (not all verse words)
      const relaxedUsedTranslations = new Set([correctWord.translation])
      
      const relaxedRandom = await this.getRandomDistractors(correctWord, count * 6)
      const relaxedDistractors = relaxedRandom.filter(d => {
        if (relaxedUsedTranslations.has(d.translation)) return false
        return this.isValidDistractor(d, correctWord)
      })
      allDistractors.push(...relaxedDistractors)
      // console.log(`📝 Relaxed random distractors: ${relaxedRandom.length} found, ${relaxedDistractors.length} after filtering`)
    }

    // Remove duplicates and limit
    const uniqueDistractors = allDistractors.filter((distractor, index, self) =>
      index === self.findIndex(d => d.translation === distractor.translation)
    )

    const finalDistractors = this.shuffleArray(uniqueDistractors).slice(0, count)
    
    // console.log('🎯 Final distractors:', {
    //   totalFound: allDistractors.length,
    //   uniqueCount: uniqueDistractors.length,
    //   finalCount: finalDistractors.length,
    //   requested: count,
    //   finalDistractors: finalDistractors.map(d => d.translation)
    // })
    
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
    // console.log('🔍 DistractorGenerator.generateWordBank called with:', {
    //   correctWord: correctWord.translation,
    //   location: correctWord.location,
    //   distractorCount,
    //   options
    // })
    
    const distractors = await this.getSmartDistractors(correctWord, distractorCount, options)
    
    // Ensure all distractors are valid (extra validation layer)
    const validDistractors = distractors.filter(d => this.isValidDistractor(d, correctWord))
    
    // If we lost some distractors due to validation, try to get more
    if (validDistractors.length < distractorCount && validDistractors.length < distractors.length) {
      // Try to fetch additional distractors to fill the gap
      const additionalNeeded = distractorCount - validDistractors.length
      const additionalDistractors = await this.getRandomDistractors(correctWord, additionalNeeded * 4)
      const validAdditional = additionalDistractors.filter(d => {
        const isUnique = !validDistractors.some(vd => vd.translation === d.translation)
        return isUnique && this.isValidDistractor(d, correctWord)
      })
      validDistractors.push(...validAdditional.slice(0, additionalNeeded))
    }
    
    // console.log('📝 Generated distractors:', validDistractors.map(d => ({
    //   translation: d.translation,
    //   location: d.location,
    //   isCorrect: false
    // })))
    
    // Create word bank array with correct answer and distractors
    const wordBank = [
      { ...correctWord, isCorrect: true },
      ...validDistractors.map(d => ({ ...d, isCorrect: false }))
    ]

    // console.log('🎯 Final word bank:', wordBank.map(wb => ({
    //   translation: wb.translation,
    //   location: wb.location,
    //   isCorrect: wb.isCorrect
    // })))

    // Shuffle the word bank
    return this.shuffleArray(wordBank)
  }
} 