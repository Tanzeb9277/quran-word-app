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
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Explore by Root
            </h1>
            <p className="text-gray-600">
              Discover word families and morphological patterns
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by Arabic root, transliteration, or meaning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg py-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {popularRoots.length}
                  </div>
                  <div className="text-sm text-gray-600">Popular Roots</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {popularRoots.filter(r => r?.mastered).length}
                  </div>
                  <div className="text-sm text-gray-600">Mastered</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {popularRoots.reduce((sum, root) => sum + (root?.frequency || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Words</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roots List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="w-5 h-5 text-green-600" />
              {searchQuery ? 'Search Results' : 'Popular Roots'}
            </CardTitle>
            <CardDescription>
              {searchQuery 
                ? `Found ${filteredRoots.length} roots matching "${searchQuery}"`
                : 'Most frequently occurring roots in the Quran'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRoots.map((root, index) => (
                  <div 
                    key={index}
                    onClick={() => handleRootClick(root)}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-green-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-arabic text-gray-800 min-w-[80px]" dir="rtl">
                        {root.arabic || 'غير معروف'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-lg">
                          {root.latin || 'unknown'}
                        </div>
                        <div className="text-gray-600">
                          {root.meaning || 'No meaning available'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-sm">
                        {root.frequency || 0} words
                      </Badge>
                      {root.mastered && (
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      )}
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Tips */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Learning Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Start with high-frequency roots:</strong> Focus on roots that appear most often in the Quran for maximum impact.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Study word families:</strong> Understanding how one root creates different word types (nouns, verbs, adjectives) builds strong foundations.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
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
