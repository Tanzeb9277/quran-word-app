"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Book, Brain, Search, Target, ChevronUp, ChevronDown, Maximize2, X, Menu, ArrowUpRight, Tag, Sparkles, Home } from "lucide-react"
import VerseViewer from "@/components/VerseViewer"
import WordBankKeyboard from "@/components/WordBankKeyboard"
import ThemeToggle from "@/components/ThemeToggle"
import knowledgeTestStatsStore from "@/lib/game-stats"

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/game", label: "Knowledge Test", icon: Brain },
  { href: "/learn", label: "Learn", icon: Book },
]

export default function GamePage() {
  const [verseData, setVerseData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [wordBank, setWordBank] = useState([])
  const [selectedWords, setSelectedWords] = useState([])
  const [verseLengthFilter, setVerseLengthFilter] = useState('all')
  const [difficulty, setDifficulty] = useState('medium')
  const [submissionResults, setSubmissionResults] = useState(null)
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)
  const [revealedWords, setRevealedWords] = useState(new Set())
  const [usedWords, setUsedWords] = useState([])
  const [isWordBankMinimized, setIsWordBankMinimized] = useState(false)
  
  // New state for individual word banks
  const [individualWordBanks, setIndividualWordBanks] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  // Progressive hint system state
  const [wordHints, setWordHints] = useState({})
  const [activeHint, setActiveHint] = useState(null)
  
  // Surah selection and progression state
  const [gameMode, setGameMode] = useState('random') // 'random' or 'surah'
  const [surahs, setSurahs] = useState([])
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [currentVerse, setCurrentVerse] = useState(1)
  const [surahVerses, setSurahVerses] = useState([])
  const [surahLoading, setSurahLoading] = useState(false)

  // Fetch surahs on component mount
  useEffect(() => {
    fetchSurahs()
  }, [])

  const fetchSurahs = async () => {
    try {
      const response = await fetch('/api/words/surahs')
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        setSurahs(data.data)
      } else {
        console.error('Error fetching surahs:', data.error)
      }
    } catch (error) {
      console.error('Error fetching surahs:', error)
    }
  }

  const cleanWord = (word) => {
    return word
      .toLowerCase() // Convert to lowercase for case-insensitive comparison
      .replace(/[^\w\s()]/g, '') // Keep letters, numbers, spaces, and parentheses
      .replace(/\s+/g, ' ')
      .trim()
  }

  const getVerseLength = (words) => {
    if (!words || words.length === 0) return 'short'
    if (words.length <= 7) return 'short'
    if (words.length <= 15) return 'medium'
    return 'long'
  }

  const generateDistractor = async (correctWord, avoidTranslations = []) => {
    try {
      const response = await fetch('/api/words/word-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctWord,
          distractorCount: 1,
          options: {
            difficulty: 'medium',
            includeSemantic: true,
            includeSurah: true,
            includeRandom: true,
            avoidTranslations
          }
        })
      })

      const result = await response.json()
      if (result.success && result.data.length > 1) {
        return result.data.find(word => !word.isCorrect)
      } else {
        console.error('Error generating distractor:', result.error)
        return null
      }
    } catch (error) {
      console.error('Error calling word bank API:', error)
      return null
    }
  }

  const generateIndividualWordBank = async (correctWord, allVerseWords) => {
    try {
      // console.log('🎯 generateIndividualWordBank called for word:', {
      //   translation: correctWord.translation,
      //   location: correctWord.location,
      //   wordIndex: allVerseWords.findIndex(w => w.location === correctWord.location)
      // })
      
      const requestBody = {
        correctWord,
        distractorCount: 6,
        options: {
          difficulty: 'medium',
          includeSemantic: true,
          includeSurah: true,
          includeRandom: true,
          avoidTranslations: allVerseWords.map(word => cleanWord(word.translation))
        }
      }
      
      // console.log('📤 Request body:', {
      //   correctWord: requestBody.correctWord.translation,
      //   avoidTranslations: requestBody.options.avoidTranslations
      // })
      
      const response = await fetch('/api/words/word-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      
      // console.log('📥 Word bank API response:', {
      //   success: result.success,
      //   dataLength: result.data?.length,
      //   wordBank: result.data?.map(wb => ({
      //     translation: wb.translation,
      //     location: wb.location,
      //     isCorrect: wb.isCorrect
      //   }))
      // })
      
      if (result.success && result.data.length >= 4) {
        // Return the word bank (correct word + distractors)
        // Minimum 4 words: 1 correct + 3 distractors
        // console.log(`✅ Word bank generated with ${result.data.length} words`)
        return result.data
      } else {
        // console.log('❌ Word bank generation failed or insufficient data:', {
        //   success: result.success,
        //   dataLength: result.data?.length,
        //   expected: 'at least 4'
        // })
      }
      return null
    } catch (error) {
      console.error('🚨 Error calling word bank API for individual bank:', error)
      return null
    }
  }

  const getRandomWords = (words, count) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const fetchRandomVerse = async () => {
    setLoading(true)
    setError(null)
    setWordBank([])
    setSelectedWords([])
    setSubmissionResults(null)
    setShowDetailedInfo(false)
    setRevealedWords(new Set())
    setWordHints({})
    setActiveHint(null)

    try {
      const response = await fetch('/api/words/random-verse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verseLength: verseLengthFilter })
      })
      const result = await response.json()

      if (result.success) {
        setVerseData(result.data)
        if (result.data.words && result.data.words.length > 0) {
          const verseLength = getVerseLength(result.data.words)
          
          if (verseLength === 'short') {
            // Original logic for short verses
            const verseTranslations = result.data.words.map(word => ({
              translation: word.translation, // Keep original capitalization for display
              cleanTranslation: cleanWord(word.translation), // Clean version for comparison
              transliteration: word.transliteration,
              originalWord: word
            }))

            const RandomSelectedWords = getRandomWords(result.data.words, 3)
            const distractors = []
            const existingTranslations = verseTranslations.map(vt => vt.cleanTranslation)

            for (const selectedWord of RandomSelectedWords) {
              const distractor = await generateDistractor(selectedWord, existingTranslations)
              if (distractor) {
                distractors.push({
                  translation: distractor.translation, // Keep original capitalization for display
                  cleanTranslation: cleanWord(distractor.translation), // Clean version for comparison
                  transliteration: distractor.transliteration,
                  originalWord: distractor
                })
              }
            }

            // Create a set of cleaned verse translations for case-insensitive comparison
            const verseTranslationSet = new Set(verseTranslations.map(vt => vt.cleanTranslation))
            const uniqueDistractors = distractors.filter(distractor => {
              return !verseTranslationSet.has(distractor.cleanTranslation)
            })

            const combinedWordBank = [...verseTranslations, ...uniqueDistractors]
            const finalWordBank = shuffleArray(combinedWordBank)
            setWordBank(finalWordBank)
            setSelectedWords(new Array(verseTranslations.length).fill(null))
            setUsedWords([])
            
            // Clear individual word banks for short verses (use original behavior)
            setIndividualWordBanks([])
            setCurrentWordIndex(0)
          } else {
            // New logic for medium and long verses - individual word banks
            const individualWordBanks = []
            
            // console.log('🔄 Creating individual word banks for', result.data.words.length, 'words')
            
            for (let i = 0; i < result.data.words.length; i++) {
              const word = result.data.words[i]
              
              // console.log(`📝 Processing word ${i + 1}/${result.data.words.length}:`, {
              //   translation: word.translation,
              //   location: word.location
              // })
              
              const wordBank = await generateIndividualWordBank(word, result.data.words)
              if (wordBank) {
                // console.log(`✅ Word bank ${i + 1} generated successfully:`, wordBank.map(wb => ({
                //   translation: wb.translation,
                //   isCorrect: wb.isCorrect
                // })))
                
                const formattedWordBank = wordBank.map(wb => ({
                  translation: wb.translation,
                  cleanTranslation: cleanWord(wb.translation),
                  transliteration: wb.transliteration,
                  originalWord: wb,
                  isCorrect: wb.isCorrect,
                  wordIndex: i
                }))
                individualWordBanks.push(formattedWordBank)
              } else {
                // console.log(`❌ Word bank ${i + 1} generation failed`)
              }
            }
            
            // console.log('🎯 Final individual word banks:', individualWordBanks.map((wb, index) => ({
            //   wordIndex: index,
            //   wordCount: wb.length,
            //   words: wb.map(w => ({ translation: w.translation, isCorrect: w.isCorrect }))
            // })))
            
            // Store individual word banks for the game logic
            setIndividualWordBanks(individualWordBanks)
            setCurrentWordIndex(0)
            setWordBank(individualWordBanks[0] || [])
            setSelectedWords(new Array(result.data.words.length).fill(null))
            setUsedWords([])
          }
        }
      } else {
        setError(result.error || 'Failed to fetch verse')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Network error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSmartVerse = async () => {
    setLoading(true)
    setError(null)
    setWordBank([])
    setSelectedWords([])
    setSubmissionResults(null)
    setShowDetailedInfo(false)
    setRevealedWords(new Set())
    setWordHints({})
    setActiveHint(null)

    try {
      const rootExposure = knowledgeTestStatsStore.getRootExposure()
      const excludeVerses = knowledgeTestStatsStore.getExcludedVerses(20)
      const response = await fetch('/api/words/smart-verse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty,
          rootExposure,
          lengthFilter: verseLengthFilter,
          excludeVerses
        })
      })
      const result = await response.json()

      if (result.success) {
        setVerseData(result.data)
        if (result.data.words && result.data.words.length > 0) {
          const verseLength = getVerseLength(result.data.words)

          if (verseLength === 'short') {
            const verseTranslations = result.data.words.map(word => ({
              translation: word.translation,
              cleanTranslation: cleanWord(word.translation),
              transliteration: word.transliteration,
              originalWord: word
            }))

            const RandomSelectedWords = getRandomWords(result.data.words, 3)
            const distractors = []
            const existingTranslations = verseTranslations.map(vt => vt.cleanTranslation)

            for (const selectedWord of RandomSelectedWords) {
              const distractor = await generateDistractor(selectedWord, existingTranslations)
              if (distractor) {
                distractors.push({
                  translation: distractor.translation,
                  cleanTranslation: cleanWord(distractor.translation),
                  transliteration: distractor.transliteration,
                  originalWord: distractor
                })
              }
            }

            const verseTranslationSet = new Set(verseTranslations.map(vt => vt.cleanTranslation))
            const uniqueDistractors = distractors.filter(d => !verseTranslationSet.has(d.cleanTranslation))

            const finalWordBank = shuffleArray([...verseTranslations, ...uniqueDistractors])
            setWordBank(finalWordBank)
            setSelectedWords(new Array(verseTranslations.length).fill(null))
            setUsedWords([])
            setIndividualWordBanks([])
            setCurrentWordIndex(0)
          } else {
            const individualWordBanks = []

            for (let i = 0; i < result.data.words.length; i++) {
              const word = result.data.words[i]
              const wordBank = await generateIndividualWordBank(word, result.data.words)
              if (wordBank) {
                const formattedWordBank = wordBank.map(wb => ({
                  translation: wb.translation,
                  cleanTranslation: cleanWord(wb.translation),
                  transliteration: wb.transliteration,
                  originalWord: wb,
                  isCorrect: wb.isCorrect,
                  wordIndex: i
                }))
                individualWordBanks.push(formattedWordBank)
              }
            }

            setIndividualWordBanks(individualWordBanks)
            setCurrentWordIndex(0)
            setWordBank(individualWordBanks[0] || [])
            setSelectedWords(new Array(result.data.words.length).fill(null))
            setUsedWords([])
          }
        }
      } else {
        setError(result.error || 'Failed to fetch verse')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Network error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSmartVerse()
  }, [])

  useEffect(() => {
    if (verseData) {
      fetchSmartVerse()
    }
  }, [verseLengthFilter])

  // Surah mode functions
  const fetchSurahVerses = async (surahNumber) => {
    setSurahLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/words/surah/${surahNumber}`)
      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        setSurahVerses(result.data)
        setCurrentVerse(1) // Start from first verse
        await fetchSpecificVerse(surahNumber, 1, result.data)
      } else {
        setError(result.error || 'Failed to fetch surah verses')
      }
    } catch (err) {
      console.error('Error fetching surah verses:', err)
      setError('Network error occurred while fetching surah verses')
    } finally {
      setSurahLoading(false)
    }
  }

  const fetchSpecificVerse = async (surahNumber, verseNumber, versesData = null) => {
    setLoading(true)
    setError(null)
    setSubmissionResults(null)
    setShowDetailedInfo(false)
    setSelectedWords([])
    setRevealedWords(new Set())
    setUsedWords([])
    setWordBank([])
    setWordHints({})
    setActiveHint(null)

    try {
      // Find the specific verse in the surah data
      // The API returns verse as string like '1:1', so we need to match against the verse number part
      const targetVerse = versesData ? versesData.find(v => {
        // Extract verse number from string format like '1:1' -> 1
        const verseNum = typeof v.verse === 'string' ? parseInt(v.verse.split(':')[1]) : v.verse
        return verseNum === verseNumber
      }) : null
      
      if (targetVerse && targetVerse.words) {
        // Create verse data in the expected format
        const verseData = {
          surah_number: surahNumber,
          verse: verseNumber,
          words: targetVerse.words.map((word, index) => ({
            ...word,
            position_in_verse: index + 1
          }))
        }
        
        setVerseData(verseData)
        
        // Initialize selectedWords array with correct length
        setSelectedWords(new Array(verseData.words.length).fill(null))
        
        // Generate word bank for this verse
        if (verseData.words && verseData.words.length > 0) {
          const verseLength = getVerseLength(verseData.words)
          
          if (verseLength === 'short') {
            // Original logic for short verses
            const verseTranslations = verseData.words.map(word => ({
              translation: word.translation,
              cleanTranslation: cleanWord(word.translation),
              transliteration: word.transliteration,
              originalWord: word
            }))

            const RandomSelectedWords = getRandomWords(verseData.words, 3)
            const distractors = []
            const existingTranslations = verseTranslations.map(vt => vt.cleanTranslation)

            for (const selectedWord of RandomSelectedWords) {
              const distractor = await generateDistractor(selectedWord, existingTranslations)
              if (distractor) {
                distractors.push({
                  translation: distractor.translation,
                  cleanTranslation: cleanWord(distractor.translation),
                  transliteration: distractor.transliteration,
                  originalWord: distractor
                })
              }
            }

            const allWords = [...verseTranslations, ...distractors]
            setWordBank(shuffleArray(allWords))
            
            // Clear individual word banks for short verses (use original behavior)
            setIndividualWordBanks([])
            setCurrentWordIndex(0)
          } else {
            // New logic for medium and long verses - individual word banks
            const individualWordBanks = []
            
            for (const word of verseData.words) {
              const wordBank = await generateIndividualWordBank(word, verseData.words)
              if (wordBank) {
                const formattedWordBank = wordBank.map(wb => ({
                  translation: wb.translation,
                  cleanTranslation: cleanWord(wb.translation),
                  transliteration: wb.transliteration,
                  originalWord: wb,
                  isCorrect: wb.isCorrect,
                  wordIndex: verseData.words.indexOf(word)
                }))
                individualWordBanks.push(formattedWordBank)
              }
            }
            
            // Store individual word banks for the game logic
            setIndividualWordBanks(individualWordBanks)
            setCurrentWordIndex(0)
            setWordBank(individualWordBanks[0] || [])
          }
        }
      } else {
        setError(`Verse ${verseNumber} not found in Surah ${surahNumber}`)
      }
    } catch (err) {
      console.error('Error fetching specific verse:', err)
      setError('Network error occurred while fetching verse')
    } finally {
      setLoading(false)
    }
  }

  const handleSurahSelect = async (surah) => {
    setSelectedSurah(surah)
    setGameMode('surah')
    await fetchSurahVerses(surah.surah_number)
  }

  const handleNextVerse = async () => {
    if (!selectedSurah || !surahVerses.length) return
    
    const nextVerse = currentVerse + 1
    if (nextVerse <= selectedSurah.verses_count) {
      setCurrentVerse(nextVerse)
      await fetchSpecificVerse(selectedSurah.surah_number, nextVerse, surahVerses)
    }
  }

  const handlePreviousVerse = async () => {
    if (!selectedSurah || currentVerse <= 1) return
    
    const prevVerse = currentVerse - 1
    setCurrentVerse(prevVerse)
    await fetchSpecificVerse(selectedSurah.surah_number, prevVerse, surahVerses)
  }

  const handleVerseSelect = async (verseNumber) => {
    if (!selectedSurah || !surahVerses.length) return
    
    if (verseNumber >= 1 && verseNumber <= selectedSurah.verses_count) {
      setCurrentVerse(verseNumber)
      await fetchSpecificVerse(selectedSurah.surah_number, verseNumber, surahVerses)
    }
  }


  const handleRandomMode = () => {
    setGameMode('random')
    setSelectedSurah(null)
    setCurrentVerse(1)
    setSurahVerses([])
    setIndividualWordBanks([])
    setCurrentWordIndex(0)
    fetchSmartVerse()
  }

  const handleNewVerse = () => {
    // Reset all game state
    setSubmissionResults(null)
    setShowDetailedInfo(false)
    setRevealedWords(new Set())
    setUsedWords([])
    setIndividualWordBanks([])
    setCurrentWordIndex(0)
    setWordHints({})
    setActiveHint(null)

    fetchSmartVerse()
  }

  const handleSlotClick = (index, word) => {
    const newSelectedWords = [...selectedWords]
    newSelectedWords[index] = word
    setSelectedWords(newSelectedWords)
  }


  const handleWordSelect = (word, clearAll = false, submit = false) => {
    setActiveHint(null)
    if (submit) {
      // Check if all words are filled (either selected by user or revealed)
      const isComplete = selectedWords.every((word, index) => word !== null || revealedWords.has(index))
      if (isComplete) {
        checkAccuracy()
      } else {
        alert("Please complete all words before submitting.")
      }
      return
    }

    if (clearAll) {
      // Only clear user-selected words, keep revealed words
      const newSelectedWords = [...selectedWords]
      selectedWords.forEach((word, index) => {
        // Only clear if the word wasn't revealed
        if (!revealedWords.has(index)) {
          newSelectedWords[index] = null
        }
      })
      setSelectedWords(newSelectedWords)
      setUsedWords([])
      
      // Reset to first word bank for individual word banks
      if (individualWordBanks.length > 0) {
        setCurrentWordIndex(0)
        setWordBank(individualWordBanks[0] || [])
      }
      return
    }

    if (word === 'BACKSPACE') {
      // console.log('⌫ Backspace pressed, current state:', {
      //   selectedWords,
      //   currentWordIndex,
      //   individualWordBanksLength: individualWordBanks.length
      // })
      
      // Find the last user-selected word (not revealed)
      const lastFilledIndex = selectedWords.map((word, index) => ({ word, index }))
        .filter(item => item.word !== null && !revealedWords.has(item.index))
        .pop()?.index

      if (lastFilledIndex !== undefined) {
        const newSelectedWords = [...selectedWords]
        const wordToRemove = newSelectedWords[lastFilledIndex]
        newSelectedWords[lastFilledIndex] = null
        
        // console.log(`🗑️ Removing word at index ${lastFilledIndex}:`, { wordToRemove })
        
        // Also clear any other words with the same translation that were auto-filled
        if (verseData && verseData.words && wordToRemove) {
          verseData.words.forEach((verseWord, idx) => {
            if (idx !== lastFilledIndex &&
                verseWord.translation &&
                verseWord.translation === wordToRemove &&
                newSelectedWords[idx] === wordToRemove) {
              newSelectedWords[idx] = null
              // console.log(`🔄 Also cleared auto-filled word at index ${idx}`)
            }
          })
        }
        
        setSelectedWords(newSelectedWords)
        
        // Only change word bank for medium/long verses (individual word banks)
        // Short verses keep the same word bank throughout
        if (individualWordBanks.length > 0) {
          const prevUnfilledIndex = newSelectedWords.findIndex((w, index) => w === null && !revealedWords.has(index))
          // console.log('🔄 Finding previous unfilled index:', prevUnfilledIndex)
          
          if (prevUnfilledIndex !== -1) {
            // console.log(`📝 Switching to word bank for index ${prevUnfilledIndex}`)
            setCurrentWordIndex(prevUnfilledIndex)
            setWordBank(individualWordBanks[prevUnfilledIndex] || [])
          } else {
            // All words are filled or revealed, show the first word bank
            // console.log('🎯 All words filled or revealed, showing first word bank')
            setCurrentWordIndex(0)
            setWordBank(individualWordBanks[0] || [])
          }
        }
        // For short verses, word bank remains unchanged (original behavior)
      } else {
        // console.log('⚠️ No words to remove with backspace')
      }
      return
    }

    const emptyIndex = selectedWords.findIndex((w, index) => w === null && !revealedWords.has(index))
    // console.log('🎯 Word selection - empty index:', emptyIndex, 'for word:', word)
    
    if (emptyIndex !== -1) {
      const newSelectedWords = [...selectedWords]
      newSelectedWords[emptyIndex] = word

      // console.log(`✅ Selected word "${word}" for position ${emptyIndex}`)

      // Track used word (cleaned version for comparison)
      const cleanedWord = cleanWord(word)
      if (!usedWords.includes(cleanedWord)) {
        setUsedWords([...usedWords, cleanedWord])
        // console.log('📝 Added to used words:', cleanedWord)
      }

      // Auto-fill words with same translation when one is selected
      if (verseData && verseData.words) {
        const currentWord = verseData.words[emptyIndex]
        
        // Fill words with same translation
        if (currentWord.translation) {
          verseData.words.forEach((verseWord, idx) => {
            if (idx !== emptyIndex &&
                verseWord.translation &&
                verseWord.translation === currentWord.translation &&
                newSelectedWords[idx] === null) {
              newSelectedWords[idx] = word
              // console.log(`🔄 Auto-filled same translation at index ${idx}`)
            }
          })
        }
      }

      setSelectedWords(newSelectedWords)
      
      // Only advance word bank for medium/long verses (individual word banks)
      // Short verses keep the same word bank throughout
      if (individualWordBanks.length > 0) {
        const nextUnfilledIndex = newSelectedWords.findIndex((w, index) => w === null && !revealedWords.has(index))
        // console.log('🔄 Next unfilled index:', nextUnfilledIndex)
        
        if (nextUnfilledIndex !== -1) {
          // Make sure we have a word bank for this position
          if (nextUnfilledIndex < individualWordBanks.length) {
            // console.log(`📝 Switching to word bank for index ${nextUnfilledIndex}`)
            setCurrentWordIndex(nextUnfilledIndex)
            setWordBank(individualWordBanks[nextUnfilledIndex] || [])
          } else {
            // If we don't have a word bank for this position, use the last available one
            const lastIndex = individualWordBanks.length - 1
            // console.log(`⚠️ Using last available word bank (index ${lastIndex})`)
            setCurrentWordIndex(lastIndex)
            setWordBank(individualWordBanks[lastIndex] || [])
          }
        } else {
          // All words are filled, show the last word bank
          const lastIndex = individualWordBanks.length - 1
          // console.log(`🎯 All words filled, showing last word bank (index ${lastIndex})`)
          setCurrentWordIndex(lastIndex)
          setWordBank(individualWordBanks[lastIndex] || [])
        }
      }
      // For short verses, word bank remains unchanged (original behavior)
    }
  }

  const checkAccuracy = () => {
    if (!verseData || !verseData.words) {
      alert("No verse data available to check accuracy.")
      return
    }

    let correctCount = 0
    let revealedCount = 0
    const totalWords = verseData.words.length
    const wordResults = []

    selectedWords.forEach((selectedWord, index) => {
      const correctWord = cleanWord(verseData.words[index].translation)
      const wasRevealed = revealedWords.has(index)
      
      // For revealed words, don't count as correct guesses
      let isCorrect = false
      if (wasRevealed) {
        revealedCount++
        isCorrect = false // Revealed words are not considered correct guesses
      } else {
        // Compare with clean version of the selected word
        const cleanSelectedWord = cleanWord(selectedWord || '')
        isCorrect = cleanSelectedWord === correctWord
        if (isCorrect) {
          correctCount++
        }
      }
      
      wordResults.push({ 
        index, 
        selectedWord: wasRevealed ? correctWord : selectedWord, 
        correctWord, 
        isCorrect,
        wasRevealed
      })
    })

    // Calculate accuracy based only on non-revealed words
    const guessedWords = totalWords - revealedCount
    const accuracy = guessedWords > 0 ? (correctCount / guessedWords) * 100 : 0
    const isAccurate = correctCount === guessedWords && revealedCount === 0 // Perfect only if no reveals and all guesses correct

    const submissionResults = {
      correctCount,
      revealedCount,
      totalWords,
      guessedWords,
      accuracy,
      isAccurate,
      wordResults
    }

    setSubmissionResults(submissionResults)

    // Record session statistics
    try {
      knowledgeTestStatsStore.recordSession({
        verseData,
        submissionResults,
        revealedWords,
        selectedWords
      })
    } catch (error) {
      console.error('Error recording session stats:', error)
    }
  }

  // Toolbar handlers
  const handleRevealNext = () => {
    const nextIndex = selectedWords.findIndex((word, index) => !word && !revealedWords.has(index))
    if (nextIndex !== -1) {
      const newRevealedWords = new Set([...revealedWords, nextIndex])
      setRevealedWords(newRevealedWords)
      // Auto-fill the revealed word (original version for display)
      const newSelectedWords = [...selectedWords]
      const revealedWord = verseData.words[nextIndex].translation
      newSelectedWords[nextIndex] = revealedWord
      
      // Track used word (cleaned version for comparison)
      const cleanedRevealedWord = cleanWord(revealedWord)
      if (!usedWords.includes(cleanedRevealedWord)) {
        setUsedWords([...usedWords, cleanedRevealedWord])
      }
      
      setSelectedWords(newSelectedWords)
      
      // Only update word bank position for medium/long verses (individual word banks)
      // Short verses keep the same word bank throughout
      if (individualWordBanks.length > 0) {
        // Find the next unfilled word position after the revealed one
        const nextUnfilledIndex = newSelectedWords.findIndex((word, index) => !word && !newRevealedWords.has(index))
        
        if (nextUnfilledIndex !== -1) {
          setCurrentWordIndex(nextUnfilledIndex)
          setWordBank(individualWordBanks[nextUnfilledIndex] || [])
        } else {
          // All words are filled, show the last word bank
          const lastIndex = individualWordBanks.length - 1
          setCurrentWordIndex(lastIndex)
          setWordBank(individualWordBanks[lastIndex] || [])
        }
      }
      // For short verses, word bank remains unchanged (original behavior)
    }
  }


  const handleHintNext = () => {
    // Find the current word index (first unfilled, unrevealed slot)
    const currentIndex = selectedWords.findIndex(
      (word, i) => !word && !revealedWords.has(i)
    )
    if (currentIndex === -1) return

    const currentWord = verseData?.words?.[currentIndex]
    if (!currentWord) return

    const hints = generateHintsForWord(currentWord)
    const hintsUsed = wordHints[currentIndex] || 0

    if (hintsUsed >= hints.length - 1) {
      // All hints exhausted — do full reveal (existing behavior)
      setActiveHint(null)
      setWordHints(prev => ({ ...prev, [currentIndex]: hints.length }))
      handleRevealNext()
    } else {
      // Show next hint
      const hint = hints[hintsUsed]
      if (hint.text === null) {
        // This hint IS the reveal
        setActiveHint(null)
        setWordHints(prev => ({ ...prev, [currentIndex]: hints.length }))
        handleRevealNext()
      } else {
        setActiveHint({ wordIndex: currentIndex, ...hint })
        setWordHints(prev => ({ ...prev, [currentIndex]: hintsUsed + 1 }))
      }
    }
  }


  const handleClearAll = () => {
    // Only clear user-selected words, keep revealed words
    const newSelectedWords = [...selectedWords]
    selectedWords.forEach((word, index) => {
      // Only clear if the word wasn't revealed
      if (!revealedWords.has(index)) {
        newSelectedWords[index] = null
      }
    })
    setSelectedWords(newSelectedWords)
    setUsedWords([])
    
    // Only reset word bank position for medium/long verses (individual word banks)
    // Short verses keep the same word bank throughout
    if (individualWordBanks.length > 0) {
      const firstUnfilledIndex = newSelectedWords.findIndex((word, index) => !word && !revealedWords.has(index))
      if (firstUnfilledIndex !== -1) {
        setCurrentWordIndex(firstUnfilledIndex)
        setWordBank(individualWordBanks[firstUnfilledIndex] || [])
      } else {
        // All words are filled or revealed, show the first word bank
        setCurrentWordIndex(0)
        setWordBank(individualWordBanks[0] || [])
      }
    }
    // For short verses, word bank remains unchanged (original behavior)
  }


  const GRAMMAR_EXPLANATIONS = {
    'حرف عطف': 'It connects two words or phrases — like "and" or "then" in English.',
    'فعل ماض': 'A past tense verb — describes a completed action.',
    'فعل مضارع': 'A present or future tense verb — describes ongoing or upcoming action.',
    'فعل أمر': 'A command form — it tells someone to do something.',
    'اسم مرفوع': 'A noun in subject position — it is the one performing the action.',
    'اسم منصوب': 'A noun in object position — it receives the action.',
    'اسم مجرور': 'A noun in genitive case — usually follows a preposition.',
    'جار ومجرور': 'A prepositional phrase — a preposition paired with its noun.',
    'اسم موصول': 'A relative pronoun — like "who", "which", or "that" in English.',
    'اسم اشارة': 'A demonstrative pronoun — like "this" or "that" in English.',
    'ضمير منفصل': 'An independent pronoun — like "he", "she", "they", "you".',
    'حرف نفي': 'A negation particle — it makes the following verb or sentence negative.',
    'حرف شرط': 'A conditional particle — introduces "if" or "when" clauses.',
    'حرف جر': 'A preposition — governs the following noun and puts it in genitive case.',
    'صفة مرفوعة': 'An adjective agreeing with a nominative noun.',
    'صفة منصوبة': 'An adjective agreeing with an accusative noun.',
    'صفة مجرورة': 'An adjective agreeing with a genitive noun.',
  }

  const GRAMMAR_TO_CONSTRUCTION = {
    'حرف عطف': 'حرف عطف',
    'فعل ماض': 'فعل ماض',
    'فعل مضارع': 'فعل مضارع',
    'فعل أمر': 'فعل أمر',
    'اسم مرفوع': 'اسم مرفوع',
    'اسم منصوب': 'اسم منصوب',
    'اسم مجرور': 'اسم مجرور',
    'جار ومجرور': 'جار ومجرور',
    'اسم موصول': 'اسم موصول',
    'اسم اشارة': 'اسم اشارة',
    'ضمير منفصل': 'ضمير منفصل',
    'حرف نفي': 'حرف نفي',
    'حرف شرط': 'حرف شرط',
  }

  function matchGrammarKey(grammarStr, lookup) {
    if (!grammarStr) return null
    return Object.keys(lookup)
      .filter(key => grammarStr.startsWith(key))
      .sort((a, b) => b.length - a.length)[0] || null
  }

  function generateHintsForWord(word) {
    const hints = []
    // Normalize tags — may arrive as a JSON string, array, or null depending on route
    let tags = word.tags || []
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags) } catch { tags = [] }
    }
    if (!Array.isArray(tags)) tags = []
    const grammar = word.grammar || ''
    const grammarParts = grammar.split('\n').map(g => g.trim()).filter(Boolean)
    const posLabels = { V: 'verb (فعل)', N: 'noun (اسم)', P: 'preposition (حرف جر)',
                        ADJ: 'adjective (صفة)', PRON: 'pronoun (ضمير)',
                        CONJ: 'conjunction (حرف عطف)', REL: 'relative pronoun (اسم موصول)',
                        NEG: 'negation particle (حرف نفي)', REM: 'resumption particle' }

    // Hint 1 — part of speech
    const primaryTag = tags.find(t => posLabels[t.tag])
    const matchedGrammar = grammarParts
      .map(g => matchGrammarKey(g, GRAMMAR_EXPLANATIONS))
      .find(Boolean)
    const matchedConstruction = grammarParts
      .map(g => matchGrammarKey(g, GRAMMAR_TO_CONSTRUCTION))
      .find(Boolean)
    if (primaryTag) hints.push({
      icon: '📖',
      title: 'Part of speech',
      text: `This word is a ${posLabels[primaryTag.tag]}.`,
      explanation: matchedGrammar ? GRAMMAR_EXPLANATIONS[matchedGrammar] : null,
      learnConstruction: matchedConstruction ? GRAMMAR_TO_CONSTRUCTION[matchedConstruction] : null,
    })

    // Hint 2 — morphological detail
    const detailTag = tags.find(t => t.description && t.description.length > 10)
    if (detailTag) hints.push({
      icon: '🔍', title: 'Word form',
      text: detailTag.description.charAt(0).toUpperCase() + detailTag.description.slice(1) + '.'
    })

    // Hint 3 — prefix clue
    const prefixPart = grammarParts.find(g =>
      g.includes('عاطفة') || g.includes('استئنافية') || g.includes('الفاء') ||
      g.includes('الواو') || g.includes('جار') || g.includes('حرف جر')
    )
    if (prefixPart) hints.push({
      icon: '🔗', title: 'Has a prefix',
      text: `This word carries a prefix (${prefixPart}). The core word begins after it.`
    })

    // Hint 4 — root clue
    if (word.root_arabic) hints.push({
      icon: '🌱', title: 'Root letters',
      text: `The root is ${word.root_arabic}${word.root_latin ? ' (' + word.root_latin + ')' : ''}. Think of words you know from this root family.`
    })

    // Final — full reveal signal
    hints.push({ icon: '👁', title: 'Reveal word', text: null })

    return hints
  }


  return (
    <div className="theme-container min-h-screen">
      <header className="border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur -mx-4 -mt-4 sm:-mx-4">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-3 px-3 py-4 sm:max-w-7xl sm:px-4">
          <div className="flex items-center gap-2">
            <Sheet modal={false}>
              <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="flex h-full w-screen max-w-[100vw] flex-col overflow-y-auto sm:w-80 sm:max-w-sm">
                <SheetHeader className="pb-4">
                  <SheetTitle>Navigate</SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-3">
                  {navLinks.map((link) => (
                    <Button key={link.href} asChild variant="outline" className="justify-start">
                      <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <ThemeToggle />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold leading-tight">Knowledge Test</p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Button key={link.href} asChild variant="ghost" className="text-sm">
                <Link href={link.href} className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:h-10">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto pt-8">

        {/* Controls Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col gap-6">
            {/* Test Mode Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Mode:</span>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={handleRandomMode}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    gameMode === 'random'
                      ? 'bg-blue-200 dark:bg-blue-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-sm">❓</span>
                  <span>Random Verse</span>
                </button>
                <button
                  onClick={() => setGameMode('surah')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    gameMode === 'surah'
                      ? 'bg-purple-200 dark:bg-purple-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-sm">📖</span>
                  <span>Study Surah</span>
                </button>
              </div>
            </div>

            {/* Surah Selection (only show in surah mode) */}
            {gameMode === 'surah' && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Surah:</span>
                </div>
                <div className="flex-1 max-w-md">
                  <select
                    value={selectedSurah?.surah_number || ''}
                    onChange={(e) => {
                      const surahNumber = parseInt(e.target.value)
                      const surah = surahs.find(s => s.surah_number === surahNumber)
                      if (surah) handleSurahSelect(surah)
                    }}
                    disabled={surahLoading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a Surah...</option>
                    {surahs.map((surah) => (
                      <option key={surah.surah_number} value={surah.surah_number}>
                        {surah.surah_number}. {surah.name_english} ({surah.name_arabic}) - {surah.verses_count} verses
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Verse Length Filter (only show in random mode) */}
            {gameMode === 'random' && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verse Length:</span>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {[
                    { value: 'all', label: 'All', color: 'bg-gray-200 dark:bg-gray-700', icon: '📚' },
                    { value: 'short', label: 'Short (≤7)', color: 'bg-green-200 dark:bg-green-700', icon: '🌱' },
                    { value: 'medium', label: 'Medium (8-15)', color: 'bg-yellow-200 dark:bg-yellow-700', icon: '🌿' },
                    { value: 'long', label: 'Long (15+)', color: 'bg-red-200 dark:bg-red-700', icon: '🌳' }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setVerseLengthFilter(filter.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                        verseLengthFilter === filter.value
                          ? `${filter.color} text-gray-900 dark:text-gray-100 shadow-sm`
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-xs">{filter.icon}</span>
                      <span className="hidden sm:inline">{filter.label}</span>
                      <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty Selector (only show in random mode) */}
            {gameMode === 'random' && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty:</span>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {[
                    { value: 'easy',   label: 'Easy',   color: 'bg-green-200 dark:bg-green-700',  desc: 'Familiar words' },
                    { value: 'medium', label: 'Medium', color: 'bg-yellow-200 dark:bg-yellow-700', desc: 'Mixed' },
                    { value: 'hard',   label: 'Hard',   color: 'bg-red-200 dark:bg-red-700',       desc: 'New vocabulary' }
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      title={d.desc}
                      className={`flex flex-col items-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                        difficulty === d.value
                          ? `${d.color} text-gray-900 dark:text-gray-100 shadow-sm`
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{d.label}</span>
                      <span className="hidden sm:block text-xs opacity-70 font-normal">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* New Verse Button (only show in random mode) */}
            {gameMode === 'random' && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Get New Verse:</span>
                </div>
                <Button
                  onClick={handleNewVerse}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                >
                  <span>New Verse</span>
                </Button>
              </div>
            )}

            {/* Surah Progress (only show in surah mode with selected surah) */}
            {gameMode === 'surah' && selectedSurah && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress: Verse {currentVerse} of {selectedSurah.verses_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handlePreviousVerse}
                      disabled={currentVerse <= 1 || loading}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      ← Previous
                    </Button>
                    <Button
                      onClick={handleNextVerse}
                      disabled={currentVerse >= selectedSurah.verses_count || loading}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
                
                {/* Verse Selector */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jump to Verse:</span>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <select
                      value={currentVerse}
                      onChange={(e) => handleVerseSelect(parseInt(e.target.value))}
                      disabled={loading || !surahVerses.length}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: selectedSurah.verses_count }, (_, i) => i + 1).map((verseNum) => (
                        <option key={verseNum} value={verseNum}>
                          Verse {verseNum}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading Verse</h3>
            <p className="text-gray-600 dark:text-gray-300">Finding the perfect verse for your test...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <Button onClick={fetchSmartVerse} className="bg-red-600 hover:bg-red-700 text-white" variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {verseData && (
        <VerseViewer
          verseData={verseData}
          onRefresh={
            gameMode === 'surah'
              ? () => fetchSpecificVerse(selectedSurah?.surah_number, currentVerse, surahVerses)
              : fetchSmartVerse
          }
          selectedWords={selectedWords}
          onWordSelect={handleSlotClick}
          currentFilter={verseLengthFilter}
          submissionResults={submissionResults}
          showDetailedInfo={showDetailedInfo}
          setShowDetailedInfo={setShowDetailedInfo}
          onRevealedWordsChange={setRevealedWords}
          revealedWords={revealedWords}
          isWordBankMinimized={isWordBankMinimized}
        />
      )}

      {wordBank.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-[60]">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-[61] relative">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Word Bank</h3>
            <button
              onClick={() => setIsWordBankMinimized(!isWordBankMinimized)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors z-[62] relative"
              aria-label={isWordBankMinimized ? "Expand word bank" : "Minimize word bank"}
            >
              {isWordBankMinimized ? (
                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>

          {!isWordBankMinimized && (
            <div className="max-h-[300px] sm:max-h-[350px] overflow-y-auto relative z-[60]">
              <WordBankKeyboard
                words={wordBank}
                usedWords={usedWords}
                onWordSelect={handleWordSelect}
                onRevealNext={handleHintNext}
                onClearAll={handleClearAll}
                onShowUsedWords={() => {}}
                canRevealNext={
                  !submissionResults && selectedWords.some((word, index) => !word && !revealedWords.has(index))
                }
                hasSelectedWords={!submissionResults && selectedWords.some((word) => word !== null)}
                isSubmitted={!!submissionResults}
                selectedWords={selectedWords}
                revealedWords={revealedWords}
                verseData={verseData}
                submissionResults={submissionResults}
                activeHint={activeHint}
                onDismissHint={() => setActiveHint(null)}
                currentWordHintCount={wordHints[selectedWords.findIndex((w, i) => !w && !revealedWords.has(i))] || 0}
                currentWordTotalHints={(() => {
                  const i = selectedWords.findIndex((w, idx) => !w && !revealedWords.has(idx))
                  return i === -1 ? 0 : generateHintsForWord(verseData?.words?.[i] || {}).length
                })()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}


