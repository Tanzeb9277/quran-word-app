'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Tag, Edit, Trash2, Loader2, Search, Filter } from 'lucide-react'

export default function TafsirTopicsManagementPage() {
  const [assignments, setAssignments] = useState([])
  const [topics, setTopics] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(null)
  const [error, setError] = useState(null)
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAssignments()
  }, [assignments, selectedTopicFilter, searchTerm])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all assignments
      const assignmentsResponse = await fetch('/api/tafsir-topics')
      const assignmentsData = await assignmentsResponse.json()

      // Fetch all topics for filter dropdown
      const topicsResponse = await fetch('/api/topics')
      const topicsData = await topicsResponse.json()

      if (assignmentsData.success) {
        setAssignments(assignmentsData.data || [])
      } else {
        setError(assignmentsData.error || 'Failed to fetch assignments')
      }

      if (topicsData.success) {
        setTopics(topicsData.data || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAssignments = () => {
    let filtered = [...assignments]

    // Filter by topic
    if (selectedTopicFilter !== 'all') {
      filtered = filtered.filter(a => a.topic_id === parseInt(selectedTopicFilter))
    }

    // Filter by search term (verse range or topic name)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(a => 
        a.verse_range.toLowerCase().includes(search) ||
        a.topic_name.toLowerCase().includes(search) ||
        (a.topic_description && a.topic_description.toLowerCase().includes(search))
      )
    }

    setFilteredAssignments(filtered)
  }

  const handleDelete = async (assignmentId, verseRange, topicName) => {
    if (!confirm(`Are you sure you want to delete the assignment of "${topicName}" for verse range "${verseRange}"?`)) {
      return
    }

    try {
      setIsDeleting(assignmentId)
      setError(null)

      const response = await fetch(`/api/tafsir-topics/${assignmentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Remove the deleted assignment from state
        setAssignments(prev => prev.filter(a => a.id !== assignmentId))
      } else {
        setError(data.error || 'Failed to delete assignment')
      }
    } catch (err) {
      console.error('Error deleting assignment:', err)
      setError('Failed to delete assignment. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  }

  const getVerseLink = (verseRange) => {
    // Parse verse range (e.g., "2:255" or "2:255, 2:256")
    const firstVerse = verseRange.split(',')[0].trim()
    const [surah, verse] = firstVerse.split(':')
    return `/tafsir/${surah}/${verse}/topics`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Group assignments by verse range
  const groupedAssignments = filteredAssignments.reduce((acc, assignment) => {
    const key = assignment.verse_range
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(assignment)
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="theme-container">
        <div className="w-full max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="theme-container">
      <div className="w-full max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/game"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tafsir Topic Assignments
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage topic assignments for tafsir verses
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by verse range or topic..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Topic
                </label>
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic.topic_id} value={topic.topic_id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-6 flex gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredAssignments.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Assignment{filteredAssignments.length !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Object.keys(groupedAssignments).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Verse Range{Object.keys(groupedAssignments).length !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {assignments.length === 0 
                  ? 'No topic assignments found. Start assigning topics to tafsir verses.'
                  : 'No assignments match your filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedAssignments).map(([verseRange, verseAssignments]) => (
              <Card key={verseRange}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Verse Range: {verseRange}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {verseAssignments.length} topic{verseAssignments.length !== 1 ? 's' : ''} assigned
                        {verseAssignments[0]?.assigned_by && (
                          <span className="ml-2">• Assigned by: {verseAssignments[0].assigned_by}</span>
                        )}
                      </CardDescription>
                    </div>
                    <Link href={getVerseLink(verseRange)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {verseAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="px-2 py-1">
                              {assignment.topic_name}
                            </Badge>
                            {assignment.topic_description && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {assignment.topic_description}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Assigned: {formatDate(assignment.created_at)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(assignment.id, assignment.verse_range, assignment.topic_name)}
                          disabled={isDeleting === assignment.id}
                          className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {isDeleting === assignment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

