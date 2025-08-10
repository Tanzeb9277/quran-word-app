import DistractorTester from "@/components/DistractorTester"

export default function TestDistractorsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Distractor Generator Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test different strategies for generating distractor words for your Quran word bank.
          </p>
        </div>
        
        <DistractorTester />
      </div>
    </div>
  )
} 