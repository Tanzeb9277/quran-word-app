"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SearchPanelProps {
  onVerseSelect: (page: number) => void
}

export function SearchPanel({ onVerseSelect }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<
    Array<{
      verse: string
      page: number
      arabic: string
      translation: string
    }>
  >([])

  const handleSearch = () => {
    // Mock search results - in a real app, this would query your database
    if (searchQuery.toLowerCase().includes("moses") || searchQuery.toLowerCase().includes("musa")) {
      setSearchResults([
        {
          verse: "20:65",
          page: 300,
          arabic: "قَالُوا يَٰمُوسَىٰٓ إِمَّآ أَن تُلْقِىَ",
          translation: 'They said, "O Moses, either you throw or we will be the first to throw."',
        },
        {
          verse: "20:67",
          page: 300,
          arabic: "فَأَوْجَسَ فِى نَفْسِهِۦ خِيفَةً مُّوسَىٰ",
          translation: "So Moses sensed within himself a fear.",
        },
      ])
    } else if (searchQuery.toLowerCase().includes("fear")) {
      setSearchResults([
        {
          verse: "20:67",
          page: 300,
          arabic: "فَأَوْجَسَ فِى نَفْسِهِۦ خِيفَةً مُّوسَىٰ",
          translation: "So Moses sensed within himself a fear.",
        },
        {
          verse: "20:68",
          page: 300,
          arabic: "قُلْنَا لَا تَخَفْ إِنَّكَ أَنتَ ٱلْأَعْلَىٰ",
          translation: 'We said, "Fear not. Indeed, it is you who are superior."',
        },
      ])
    } else {
      setSearchResults([])
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Search the Quran</h2>
          <p className="text-muted-foreground">Search for verses by keywords in translation or transliteration</p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search for verses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>

          {searchResults.map((result, index) => (
            <Card
              key={index}
              className="p-6 space-y-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onVerseSelect(result.page)}
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline">{result.verse}</Badge>
                <Badge variant="secondary">Page {result.page}</Badge>
              </div>

              <div className="arabic-text text-right">{result.arabic}</div>

              <div className="text-base leading-relaxed">{result.translation}</div>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No results found. Try different keywords.</p>
        </Card>
      )}
    </div>
  )
}
