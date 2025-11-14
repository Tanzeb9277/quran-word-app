'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  ArrowLeft, 
  TrendingUp, 
  BookOpen,
  Eye,
  ExternalLink,
  Star,
  Target,
  TreePine
} from 'lucide-react'

export default function RootExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [popularRoots, setPopularRoots] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch popular roots from API
    fetchPopularRoots()
  }, [])

  const fetchPopularRoots = async () => {
    try {
      setIsLoading(true)
      // This would be a real API call
      // const response = await fetch('/api/words/roots/popular')
      // const data = await response.json()
      
      // Mock data for now
      const mockData = [
        { arabic: 'س ل م', latin: 'slm', meaning: 'peace, safety', frequency: 140, mastered: false },
        { arabic: 'ك ت ب', latin: 'ktb', meaning: 'write, book', frequency: 319, mastered: true },
        { arabic: 'ع ل م', latin: 'elm', meaning: 'knowledge, science', frequency: 854, mastered: false },
        { arabic: 'ر ب ع', latin: 'rb3', meaning: 'four, quarter', frequency: 168, mastered: false },
        { arabic: 'ق ر أ', latin: 'qr2', meaning: 'read, recite', frequency: 88, mastered: true },
        { arabic: 'د ع و', latin: 'd3w', meaning: 'call, invite', frequency: 212, mastered: false },
        { arabic: 'ص ل و', latin: 'slw', meaning: 'pray, connect', frequency: 99, mastered: false },
        { arabic: 'ز ك و', latin: 'zkw', meaning: 'purify, grow', frequency: 59, mastered: true },
      ]
      
      setPopularRoots(mockData)
    } catch (error) {
      console.error('Error fetching popular roots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRootClick = (root) => {
    router.push(`/explorer/root/${encodeURIComponent(root.arabic)}`)
  }

  const filteredRoots = popularRoots.filter(root => 
    (root.arabic || '').includes(searchQuery) ||
    (root.latin?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (root.meaning?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Explore by Root
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Discover word families and morphological patterns
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search by Arabic root, transliteration, or meaning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 text-base sm:text-lg py-2.5 sm:py-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {popularRoots.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">Popular Roots</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {popularRoots.filter(r => r?.mastered).length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">Mastered</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {popularRoots.reduce((sum, root) => sum + (root?.frequency || 0), 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">Total Words</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roots List */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TreePine className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              {searchQuery ? 'Search Results' : 'Popular Roots'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              {searchQuery 
                ? `Found ${filteredRoots.length} roots matching "${searchQuery}"`
                : 'Most frequently occurring roots in the Quran'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredRoots.map((root, index) => (
                  <div 
                    key={index}
                    onClick={() => handleRootClick(root)}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-green-200 gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl font-arabic text-gray-800 flex-shrink-0" dir="rtl">
                        {root.arabic || 'غير معروف'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-base sm:text-lg truncate">
                          {root.latin || 'unknown'}
                        </div>
                        <div className="text-sm sm:text-base text-gray-600 truncate">
                          {root.meaning || 'No meaning available'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                        {root.frequency || 0} words
                      </Badge>
                      {root.mastered && (
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Tips */}
        <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              Learning Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Start with high-frequency roots:</strong> Focus on roots that appear most often in the Quran for maximum impact.
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Study word families:</strong> Understanding how one root creates different word types (nouns, verbs, adjectives) builds strong foundations.
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Use context:</strong> Click on any word to see it in its Quranic context and understand its usage.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
