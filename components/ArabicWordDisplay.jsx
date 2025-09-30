"use client"

import { useState } from "react"

/**
 * ArabicWordDisplay Component
 * Displays Arabic text for a word with hover effects and selection states
 */
export default function ArabicWordDisplay({ 
  word, 
  index, 
  isSelected = false, 
  isRevealed = false, 
  isCorrect = null, // null, true, or false
  isCurrentWord = false,
  isSameTranslationAsCurrent = false,
  onClick = null,
  isClickable = true,
  showTransliteration = false
}) {
  const [isHovered, setIsHovered] = useState(false)

  const getDisplayStyles = () => {
    if (isRevealed) {
      return 'bg-blue-100 text-blue-800 border-blue-300'
    }
    
    if (isCorrect === true) {
      return 'bg-green-100 text-green-800 border-green-300'
    }
    
    if (isCorrect === false) {
      return 'bg-red-100 text-red-800 border-red-300'
    }
    
    if (isSelected) {
      return 'bg-green-100 text-green-800 border-green-300'
    }
    
    // Highlight current word and words with same translation
    if (isCurrentWord || isSameTranslationAsCurrent) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
    
    return 'bg-gray-50 text-gray-600 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
  }

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(index, isSelected)
    }
  }

  return (
    <span 
      className={`
        inline-block mx-1 my-1 px-2 py-1 transition-all duration-200 cursor-pointer
        ${getDisplayStyles()}
        ${!isClickable ? 'cursor-not-allowed' : ''}
        ${isHovered && isClickable ? 'ring-2 ring-blue-400' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={!isClickable ? "Game completed" : isSelected ? "Remove this word" : "Select this word"}
    >
      <span 
        className="text-2xl sm:text-3xl font-arabic leading-tight"
        dir="rtl"
        style={{ fontFamily: 'Amiri, "Arabic Typesetting", "Traditional Arabic", "Arial Unicode MS", sans-serif' }}
      >
        {word.arabic_text || word.text || 'ع' /* fallback Arabic character */}
      </span>
    </span>
  )
}
