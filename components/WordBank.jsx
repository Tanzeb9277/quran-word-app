"use client"

/**
 * WordBankKeyboard Component - Keyboard-style word bank for mobile/tablet
 * @param {Object} props
 * @param {Array} props.words - Array of words to display
 * @param {Array} props.usedWords - Array of words already selected
 * @param {Function} props.onWordSelect - Callback when a word is selected
 */
export default function WordBankKeyboard({ words, usedWords, onWordSelect }) {
  // Split words into rows for keyboard layout
  const getKeyboardRows = (wordList) => {
    const rows = []
    const wordsPerRow = {
      mobile: 3, // 3 words per row on mobile
      tablet: 4, // 4 words per row on tablet
      desktop: 5, // 5 words per row on desktop
    }

    // For mobile/tablet, use fewer words per row
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024

    let itemsPerRow = wordsPerRow.desktop
    if (isMobile) itemsPerRow = wordsPerRow.mobile
    else if (isTablet) itemsPerRow = wordsPerRow.tablet

    for (let i = 0; i < wordList.length; i += itemsPerRow) {
      rows.push(wordList.slice(i, i + itemsPerRow))
    }

    return rows
  }

  const keyboardRows = getKeyboardRows(words)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Word Bank</h3>
          <p className="text-xs text-gray-600">Tap words to place them in the verse</p>
        </div>

        {/* Keyboard Layout */}
        <div className="space-y-2">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2">
              {row.map((word, wordIndex) => {
                const isUsed = usedWords.includes(word)
                return (
                  <button
                    key={`${rowIndex}-${wordIndex}`}
                    className={`
                      flex-1 min-h-[44px] max-w-[120px] px-2 py-2 rounded-lg text-xs sm:text-sm font-medium
                      transition-all duration-200 border-2
                      ${
                        isUsed
                          ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                          : "bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-800 border-blue-200 hover:border-blue-300 cursor-pointer"
                      }
                    `}
                    onClick={() => !isUsed && onWordSelect(word)}
                    disabled={isUsed}
                  >
                    <span className="leading-tight text-center block">{word}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex justify-center gap-3">
          <button
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            onClick={() => onWordSelect(null, true)} // Special flag for clear all
          >
            Clear All
          </button>
          <button
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
            onClick={() => onWordSelect(null, false, true)} // Special flag for submit
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}