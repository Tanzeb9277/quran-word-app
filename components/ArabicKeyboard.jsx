"use client"

import { useState } from 'react'

const ARABIC_LETTERS = [
  ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ'],
  ['د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص'],
  ['ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق'],
  ['ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
  ['ة', 'ء', 'ؤ', 'ئ', 'ى', 'ٱ', 'ٱ']
]

const ARABIC_NAMES = {
  'ا': 'Alif',
  'ب': 'Baa',
  'ت': 'Taa',
  'ث': 'Thaa',
  'ج': 'Jeem',
  'ح': 'Haa',
  'خ': 'Khaa',
  'د': 'Dal',
  'ذ': 'Thal',
  'ر': 'Raa',
  'ز': 'Zay',
  'س': 'Seen',
  'ش': 'Sheen',
  'ص': 'Saad',
  'ض': 'Daad',
  'ط': 'Taa',
  'ظ': 'Thaa',
  'ع': 'Ayn',
  'غ': 'Ghayn',
  'ف': 'Faa',
  'ق': 'Qaaf',
  'ك': 'Kaaf',
  'ل': 'Laam',
  'م': 'Meem',
  'ن': 'Noon',
  'ه': 'Haa',
  'و': 'Waw',
  'ي': 'Yaa',
  'ة': 'Taa Marbouta',
  'ء': 'Hamza',
  'ؤ': 'Hamza on Waw',
  'ئ': 'Hamza on Yaa',
  'ى': 'Alif Maqsura',
  'ٱ': 'Alif Wasla'
}

export default function ArabicKeyboard({ rootLetters, onLetterInput }) {
  const [selectedPosition, setSelectedPosition] = useState(0)
  const [hoveredLetter, setHoveredLetter] = useState(null)

  const handleLetterClick = (letter) => {
    if (selectedPosition < 3) {
      onLetterInput(selectedPosition, letter)
      // Move to next position if available
      if (selectedPosition < 2) {
        setSelectedPosition(selectedPosition + 1)
      }
    }
  }

  const handlePositionClick = (index) => {
    setSelectedPosition(index)
  }

  const handleBackspace = () => {
    if (selectedPosition > 0) {
      onLetterInput(selectedPosition - 1, '')
      setSelectedPosition(selectedPosition - 1)
    } else if (rootLetters[0] !== '') {
      onLetterInput(0, '')
    }
  }

  const handleClear = () => {
    onLetterInput(0, '')
    onLetterInput(1, '')
    onLetterInput(2, '')
    setSelectedPosition(0)
  }

  return (
    <div className="space-y-6">
      {/* Position Indicators */}
      <div className="flex justify-center space-x-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => handlePositionClick(index)}
            className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all duration-200 ${
              selectedPosition === index
                ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Arabic Keyboard */}
      <div className="bg-gray-50 rounded-2xl p-6">
        {ARABIC_LETTERS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-2 mb-2">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                onMouseEnter={() => setHoveredLetter(letter)}
                onMouseLeave={() => setHoveredLetter(null)}
                className="w-14 h-14 rounded-xl border-2 border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 text-2xl font-bold text-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Letter Name Tooltip */}
      {hoveredLetter && (
        <div className="text-center">
          <div className="inline-block bg-gray-800 text-white px-3 py-1 rounded-lg text-sm">
            {ARABIC_NAMES[hoveredLetter]}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleBackspace}
          className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10L9 3z" />
          </svg>
          <span>Backspace</span>
        </button>
        
        <button
          onClick={handleClear}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Clear All</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-600 text-sm">
        <p>Click on a position (1, 2, or 3) then select Arabic letters from the keyboard</p>
        <p>Or click directly on letters to fill positions automatically</p>
      </div>
    </div>
  )
}

