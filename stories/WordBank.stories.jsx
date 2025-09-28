import WordBankKeyboard from '../components/WordBankKeyboard'

// Mock data for testing
const mockWords = [
  { translation: "Allah", transliteration: "Allahu", isCorrect: true },
  { translation: "Lord", transliteration: "Rabb", isCorrect: false },
  { translation: "Creator", transliteration: "Khaliq", isCorrect: false },
  { translation: "Merciful", transliteration: "Rahman", isCorrect: false },
  { translation: "Compassionate", transliteration: "Rahim", isCorrect: false },
  { translation: "King", transliteration: "Malik", isCorrect: false },
  { translation: "Master", transliteration: "Maula", isCorrect: false },
  { translation: "Protector", transliteration: "Wali", isCorrect: false }
]

const mockUsedWords = ["Allah", "Lord", "Creator"]

// Storybook actions for testing interactions
const actions = {
  onWordSelect: (word) => {
    console.log('Word selected:', word)
  },
  onRevealNext: () => {
    console.log('Reveal next word clicked')
  },
  onClearAll: () => {
    console.log('Clear all clicked')
  },
  onShowUsedWords: () => {
    console.log('Show used words clicked')
  }
}

export default {
  title: 'Components/WordBank',
  component: WordBankKeyboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A word bank keyboard component for Quran word learning games. Features word selection, used word tracking, and game controls.'
      }
    }
  },
  argTypes: {
    words: {
      control: 'object',
      description: 'Array of word objects with translation and other properties'
    },
    usedWords: {
      control: 'object',
      description: 'Array of used word strings'
    },
    canRevealNext: {
      control: 'boolean',
      description: 'Whether the reveal next button should be enabled'
    },
    hasSelectedWords: {
      control: 'boolean',
      description: 'Whether there are selected words (affects clear all button)'
    },
    isSubmitted: {
      control: 'boolean',
      description: 'Whether the game has been submitted (disables all interactions)'
    }
  }
}

// Default story
export const Default = {
  args: {
    words: mockWords,
    usedWords: [],
    canRevealNext: true,
    hasSelectedWords: false,
    isSubmitted: false,
    ...actions
  }
}

// With some used words
export const WithUsedWords = {
  args: {
    words: mockWords,
    usedWords: mockUsedWords,
    canRevealNext: true,
    hasSelectedWords: true,
    isSubmitted: false,
    ...actions
  }
}

// With selected words
export const WithSelectedWords = {
  args: {
    words: mockWords,
    usedWords: [],
    canRevealNext: true,
    hasSelectedWords: true,
    isSubmitted: false,
    ...actions
  }
}

// Submitted state (disabled)
export const Submitted = {
  args: {
    words: mockWords,
    usedWords: mockUsedWords,
    canRevealNext: true,
    hasSelectedWords: true,
    isSubmitted: true,
    ...actions
  }
}

// Long words test
export const LongWords = {
  args: {
    words: [
      { translation: "The Most Merciful", transliteration: "Ar-Rahman", isCorrect: true },
      { translation: "The Most Compassionate", transliteration: "Ar-Rahim", isCorrect: false },
      { translation: "The All-Knowing", transliteration: "Al-Alim", isCorrect: false },
      { translation: "The All-Powerful", transliteration: "Al-Qadir", isCorrect: false },
      { translation: "The All-Hearing", transliteration: "As-Sami", isCorrect: false },
      { translation: "The All-Seeing", transliteration: "Al-Basir", isCorrect: false }
    ],
    usedWords: ["The Most Merciful"],
    canRevealNext: true,
    hasSelectedWords: true,
    isSubmitted: false,
    ...actions
  }
}

// Minimal words
export const MinimalWords = {
  args: {
    words: [
      { translation: "Allah", transliteration: "Allahu", isCorrect: true },
      { translation: "Lord", transliteration: "Rabb", isCorrect: false }
    ],
    usedWords: [],
    canRevealNext: false,
    hasSelectedWords: false,
    isSubmitted: false,
    ...actions
  }
}

// Many words (stress test)
export const ManyWords = {
  args: {
    words: Array.from({ length: 20 }, (_, i) => ({
      translation: `Word ${i + 1}`,
      transliteration: `Kalima ${i + 1}`,
      isCorrect: i === 0
    })),
    usedWords: ["Word 1", "Word 2", "Word 3"],
    canRevealNext: true,
    hasSelectedWords: true,
    isSubmitted: false,
    ...actions
  }
}

// Arabic text test
export const ArabicText = {
  args: {
    words: [
      { translation: "Allah", transliteration: "الله", isCorrect: true },
      { translation: "Lord", transliteration: "رب", isCorrect: false },
      { translation: "Creator", transliteration: "خالق", isCorrect: false },
      { translation: "Merciful", transliteration: "رحمن", isCorrect: false },
      { translation: "Compassionate", transliteration: "رحيم", isCorrect: false }
    ],
    usedWords: ["Allah"],
    canRevealNext: true,
    hasSelectedWords: true,
    isSubmitted: false,
    ...actions
  }
}

// Interactive playground
export const InteractivePlayground = {
  args: {
    words: mockWords,
    usedWords: [],
    canRevealNext: true,
    hasSelectedWords: false,
    isSubmitted: false,
    ...actions
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground for testing all WordBank functionality. Use the controls panel to modify props and see real-time changes.'
      }
    }
  }
}


