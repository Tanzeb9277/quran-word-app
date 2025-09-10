"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, RotateCcw, Shuffle, Trash2, CheckCircle, Hash } from "lucide-react"

export default function WordBankKeyboard({ 
  words, 
  usedWords, 
  onWordSelect, 
  onRevealNext,
  onClearAll,
  onShowUsedWords,
  canRevealNext = false,
  hasSelectedWords = false,
  isSubmitted = false
}) {
  const [flashingWords, setFlashingWords] = useState(new Set())

  const handleWordClick = (word) => {
    // Pass the translation text to the parent component
    const wordText = typeof word === 'string' ? word : word.translation
    onWordSelect(wordText)
  }

  const handleShowUsedWords = () => {
    // Flash the used words
    setFlashingWords(new Set(usedWords))
    
    // Clear the flash after 1.5 seconds
    setTimeout(() => {
      setFlashingWords(new Set())
    }, 1500)
  }

  const handleBackspace = () => {
    // Pass a special signal to clear the last selected word
    onWordSelect('BACKSPACE')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-3 pb-6 max-h-[33vh] sm:max-h-[60vh] overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Toolbar */}
        <div className="flex justify-center items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          {/* Reveal Next Word */}
          <Button
            onClick={onRevealNext}
            disabled={!canRevealNext || isSubmitted}
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2 flex items-center gap-1 bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400"
            title={isSubmitted ? "Game completed" : "Reveal next word"}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Reveal Next</span>
          </Button>

          {/* Clear All */}
          <Button
            onClick={onClearAll}
            disabled={!hasSelectedWords || isSubmitted}
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2 flex items-center gap-1 bg-red-100 text-red-700 border-red-300 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400"
            title={isSubmitted ? "Game completed" : "Clear all selected words"}
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>

          {/* Used Words Counter */}
          <Button
            onClick={handleShowUsedWords}
            disabled={isSubmitted}
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2 flex items-center gap-1 bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400"
            title={isSubmitted ? "Game completed" : `Show used words (${usedWords.length})`}
          >
            <Hash className="w-3 h-3" />
            <span className="hidden sm:inline">Used ({usedWords.length})</span>
            <span className="sm:hidden">{usedWords.length}</span>
          </Button>
        </div>

        {/* Keyboard Keys - Centered with even spacing */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
          {words.map((word, index) => {
            const wordText = typeof word === 'string' ? word : word.translation
            const cleanWordText = typeof word === 'string' ? word.toLowerCase().replace(/[^\w\s()]/g, '').trim() : word.cleanTranslation
            const isUsed = usedWords.includes(cleanWordText)
            const isFlashing = flashingWords.has(cleanWordText)
            
            return (
              <Button
                key={index}
                onClick={() => !isSubmitted && handleWordClick(word)}
                disabled={isSubmitted}
                variant="default"
                size="sm"
                className={`
                  min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200
                  flex items-center justify-center text-center
                  bg-blue-100 text-blue-800 border border-blue-200
                  hover:bg-blue-200 hover:border-blue-300 hover:scale-105 active:scale-95
                  disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
                  ${wordText.length > 12 ? "text-[10px] leading-tight" : "text-xs"}
                  ${wordText.length > 8 ? "min-h-[48px]" : "min-h-[40px]"}
                  ${isFlashing ? "animate-pulse bg-yellow-400 text-black scale-110 border-yellow-500" : ""}
                `}
                title={isSubmitted ? "Game completed" : `Select: ${wordText}`}
              >
                <span className="break-words hyphens-auto leading-tight" title={wordText}>
                  {wordText}
                </span>
              </Button>
            )
          })}
        </div>

        {/* Control Buttons - Bottom Center */}
        <div className="flex justify-center items-center gap-3">
          <Button
            onClick={handleBackspace}
            disabled={isSubmitted}
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            title={isSubmitted ? "Game completed" : "Remove last selected word"}
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Backspace
          </Button>
          <Button
            onClick={() => onWordSelect(null, false, true)}
            disabled={isSubmitted}
            variant="default"
            size="sm"
            className="text-xs h-8 px-3 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:text-gray-200"
            title={isSubmitted ? "Game completed" : "Submit your answers"}
          >
            Submit
          </Button>
        </div>

        {/* Bottom Spacer for mobile */}
        <div className="h-2"></div>
      </div>
    </div>
  )
} 