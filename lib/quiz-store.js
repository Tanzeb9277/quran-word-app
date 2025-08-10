// In-memory quiz store for testing
// Use global to persist across Next.js hot reloads
if (!global.quizStore) {
  global.quizStore = new Map()
}

const quizzes = global.quizStore

function generateId() {
  return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export function createQuiz(quizData) {
  const quizId = generateId()
  const quiz = {
    id: quizId,
    ...quizData,
    correct_answers: [],
    incorrect_answers: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  quizzes.set(quizId, quiz)
  console.log(`Created quiz ${quizId} with ${quiz.word_order?.length || 0} questions`)
  console.log('Current quizzes:', Array.from(quizzes.keys()))
  return quiz
}

export function getQuiz(quizId) {
  const quiz = quizzes.get(quizId)
  console.log(`Looking for quiz ${quizId}, found:`, quiz ? 'yes' : 'no')
  console.log('Available quiz IDs:', Array.from(quizzes.keys()))
  return quiz
}

export function updateQuiz(quizId, updates) {
  const quiz = quizzes.get(quizId)
  if (!quiz) return null
  
  const updatedQuiz = {
    ...quiz,
    ...updates,
    updated_at: new Date().toISOString()
  }
  
  quizzes.set(quizId, updatedQuiz)
  return updatedQuiz
}

export function addAnswer(quizId, wordLocation, isCorrect) {
  const quiz = quizzes.get(quizId)
  if (!quiz) return null
  
  const updatedQuiz = {
    ...quiz,
    correct_answers: isCorrect 
      ? [...quiz.correct_answers, wordLocation]
      : quiz.correct_answers,
    incorrect_answers: !isCorrect 
      ? [...quiz.incorrect_answers, wordLocation]
      : quiz.incorrect_answers,
    updated_at: new Date().toISOString()
  }
  
  quizzes.set(quizId, updatedQuiz)
  return updatedQuiz
}

export function deleteQuiz(quizId) {
  return quizzes.delete(quizId)
}

export function getAllQuizzes() {
  return Array.from(quizzes.values())
}

export function clearAllQuizzes() {
  quizzes.clear()
  console.log('All in-memory quizzes cleared')
} 