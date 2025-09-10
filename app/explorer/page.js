'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  TreePine, 
  Search, 
  TrendingUp, 
  Star,
  ArrowRight,
  Brain,
  Target
} from 'lucide-react'

export default function ExplorerHome() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for popular roots - in real app, this would come from API
  const popularRoots = [
    { arabic: 'س ل م', latin: 'slm', meaning: 'peace, safety', frequency: 140, mastered: false },
    { arabic: 'ك ت ب', latin: 'ktb', meaning: 'write, book', frequency: 319, mastered: true },
    { arabic: 'ع ل م', latin: 'elm', meaning: 'knowledge, science', frequency: 854, mastered: false },
    { arabic: 'ر ب ع', latin: 'rb3', meaning: 'four, quarter', frequency: 168, mastered: false },
    { arabic: 'ق ر أ', latin: 'qr2', meaning: 'read, recite', frequency: 88, mastered: true },
  ]

  const recentSurahs = [
    { number: 1, name: 'Al-Fatihah', verses: 7, lastStudied: '2 days ago' },
    { number: 2, name: 'Al-Baqarah', verses: 286, lastStudied: '1 week ago' },
    { number: 112, name: 'Al-Ikhlas', verses: 4, lastStudied: '3 days ago' },
  ]

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quran Word Explorer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the beauty of Quranic Arabic through two powerful exploration methods
          </p>
        </div>

        {/* Main Entry Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* By Surah Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">By Surah</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Verse-first exploration through the Quran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-center">
                Start with a surah and explore its verses word by word. Perfect for contextual learning and understanding how words are used in specific verses.
              </p>
              <div className="flex justify-center">
                <Link href="/explorer/surah">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    Explore by Surah
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* By Root Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <TreePine className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">By Root</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Morphology-first exploration through word families
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-center">
                Start with a root and explore all its derived forms. Perfect for understanding word families and morphological patterns.
              </p>
              <div className="flex justify-center">
                <Link href="/explorer/root">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    Explore by Root
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Popular Roots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Popular Roots
              </CardTitle>
              <CardDescription>
                Most frequently occurring roots in the Quran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularRoots.map((root, index) => (
                <Link key={index} href={`/explorer/root/${encodeURIComponent(root.arabic)}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-arabic text-gray-800" dir="rtl">
                        {root.arabic}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{root.latin}</div>
                        <div className="text-sm text-gray-600">{root.meaning}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {root.frequency} words
                      </Badge>
                      {root.mastered && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Surahs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Recent Surahs
              </CardTitle>
              <CardDescription>
                Continue your exploration from where you left off
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSurahs.map((surah) => (
                <Link key={surah.number} href={`/explorer/surah/${surah.number}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div>
                      <div className="font-medium text-gray-900">
                        {surah.number}. {surah.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {surah.verses} verses • {surah.lastStudied}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Integration Preview */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Smart Learning Integration
            </CardTitle>
            <CardDescription>
              Your dashboard will guide you to areas that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-purple-100">
              <Target className="w-8 h-8 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Review Nouns from root ك ت ب
                </div>
                <div className="text-sm text-gray-600">
                  You've struggled with noun forms in recent tests
                </div>
              </div>
              <Link href="/explorer/root/ك ت ب?grammar=Noun">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Review Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}