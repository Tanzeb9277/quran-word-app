"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function WordBankKeyboard({ words, usedWords, onWordSelect }) {
  const handleWordClick = (word) => {
    // Pass the translation text to the parent component
    const wordText = typeof word === 'string' ? word : word.translation
    onWordSelect(wordText)
  }

  const handleBackspace = () => {
    // Pass a special signal to clear the last selected word
    onWordSelect('BACKSPACE')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-3 pb-6 max-h-[33vh] sm:max-h-[60vh] overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Keyboard Keys - Centered with even spacing */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
          {words.map((word, index) => {
            const wordText = typeof word === 'string' ? word : word.translation
            
            return (
              <Button
                key={index}
                onClick={() => handleWordClick(word)}
                variant="default"
                size="sm"
                className={`
                  min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200
                  flex items-center justify-center text-center
                  hover:bg-blue-600 hover:scale-105 active:scale-95
                  ${wordText.length > 12 ? "text-[10px] leading-tight" : "text-xs"}
                  ${wordText.length > 8 ? "min-h-[48px]" : "min-h-[40px]"}
                `}
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
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Backspace
          </Button>
          <Button
            onClick={() => onWordSelect(null, true)}
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3"
          >
            Clear
          </Button>
          <Button
            onClick={() => onWordSelect(null, false, true)}
            variant="default"
            size="sm"
            className="text-xs h-8 px-3 bg-green-600 hover:bg-green-700"
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