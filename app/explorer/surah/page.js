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
  BookOpen, 
  TrendingUp,
  Star,
  ExternalLink,
  Filter,
  Grid
} from 'lucide-react'

export default function SurahExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [surahs, setSurahs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState('all') // 'all', 'meccan', 'medinan'
  const router = useRouter()

  useEffect(() => {
    fetchSurahs()
  }, [])

  const fetchSurahs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/words/surahs')
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        setSurahs(data.data)
      } else {
        console.error('Error fetching surahs:', data.error)
        setSurahs([]) // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching surahs:', error)
      setSurahs([]) // Set empty array as fallback
    } finally {
      setIsLoading(false)
    }
  }

  const handleSurahClick = (surah) => {
    router.push(`/explorer/surah/${surah.surah_number}`)
  }

  const filteredSurahs = surahs.filter(surah => {
    const matchesSearch = 
      (surah.name_arabic?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (surah.name_english?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      surah.surah_number?.toString().includes(searchQuery)
    
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'meccan' && surah.revelation_type === 'Meccan') ||
      (filterType === 'medinan' && surah.revelation_type === 'Medinan')
    
    return matchesSearch && matchesFilter
  })

  const getRevelationColor = (type) => {
    return type === 'Meccan' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              Explore by Surah
            </h1>
            <p className="text-gray-600">
              Discover the Quran through its chapters and verses
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by surah name, number, or Arabic name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-lg py-3"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by revelation:</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterType === 'meccan' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType('meccan')}
                    className={filterType === 'meccan' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    Meccan
                  </Button>
                  <Button
                    variant={filterType === 'medinan' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType('medinan')}
                    className={filterType === 'medinan' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Medinan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {surahs.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Surahs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {surahs.filter(s => s?.revelation_type === 'Meccan').length}
                  </div>
                  <div className="text-sm text-gray-600">Meccan</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Grid className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {surahs.filter(s => s?.revelation_type === 'Medinan').length}
                  </div>
                  <div className="text-sm text-gray-600">Medinan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surahs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {searchQuery ? 'Search Results' : 'All Surahs'}
            </CardTitle>
            <CardDescription>
              {searchQuery 
                ? `Found ${filteredSurahs.length} surahs matching "${searchQuery}"`
                : 'Click on any surah to explore its verses and words'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSurahs.map((surah, index) => (
                  <div 
                    key={surah.surah_number || `surah-${index}`}
                    onClick={() => handleSurahClick(surah)}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {surah.surah_number || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-lg">
                          {surah.name_english || 'Unknown Surah'}
                        </div>
                        <div className="text-gray-600 font-arabic text-lg" dir="rtl">
                          {surah.name_arabic || 'غير معروف'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {surah.verses_count || 0} verses • {surah.words_count || 0} words
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRevelationColor(surah.revelation_type)}>
                        {surah.revelation_type || 'Unknown'}
                      </Badge>
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
              <Star className="w-5 h-5 text-blue-600" />
              Learning Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Start with shorter surahs:</strong> Begin with shorter chapters like Al-Ikhlas (4 verses) to build confidence.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Understand context:</strong> Each surah has its own theme and context that helps understand word usage.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Click on words:</strong> Explore individual words to see their roots and related forms across the Quran.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
