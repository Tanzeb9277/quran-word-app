"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, BookmarkIcon, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getBookmarks, addBookmark, removeBookmark } from "@/lib/bookmarks"

interface QuranViewProps {
  currentPage: number
  onPageChange: (page: number) => void
}

export function QuranView({ currentPage, onPageChange }: QuranViewProps) {
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set())

  useEffect(() => {
    setBookmarkedVerses(new Set(getBookmarks().map((b) => b.verse)))
  }, [])

  const toggleBookmark = (verse: string, text: string) => {
    if (bookmarkedVerses.has(verse)) {
      removeBookmark(verse)
      setBookmarkedVerses((prev) => {
        const next = new Set(prev)
        next.delete(verse)
        return next
      })
    } else {
      addBookmark({ verse, page: currentPage, text })
      setBookmarkedVerses((prev) => new Set(prev).add(verse))
    }
  }

  // Sample data structure based on the JSON provided
  const pageData = {
    page_number: 300,
    verses: [
      {
        verse: "20:65",
        arabic: "قَالُوا يَٰمُوسَىٰٓ إِمَّآ أَن تُلْقِىَ وَإِمَّآ أَن نَّكُونَ أَوَّلَ مَنْ أَلْقَىٰ",
        translation: 'They said, "O Moses, either you throw or we will be the first to throw."',
        transliteration: "Qālū yā-mūsā immā an tulqiya wa-immā an nakūna awwala man alqā",
      },
      {
        verse: "20:66",
        arabic: "قَالَ بَلْ أَلْقُوا۟ ۖ فَإِذَا حِبَالُهُمْ وَعِصِيُّهُمْ يُخَيَّلُ إِلَيْهِ مِن سِحْرِهِمْ أَنَّهَا تَسْعَىٰ",
        translation:
          'He said, "Rather, you throw." And suddenly their ropes and staffs seemed to him from their magic that they were moving.',
        transliteration: "Qāla bal alqū fa-idhā ḥibāluhum wa-ʿiṣiyyuhum yukhayyalu ilayhi min siḥrihim annahā tasʿā",
      },
      {
        verse: "20:67",
        arabic: "فَأَوْجَسَ فِى نَفْسِهِۦ خِيفَةً مُّوسَىٰ",
        translation: "So Moses sensed within himself a fear.",
        transliteration: "Fa-awjasa fī nafsihi khīfatan Mūsā",
      },
      {
        verse: "20:68",
        arabic: "قُلْنَا لَا تَخَفْ إِنَّكَ أَنتَ ٱلْأَعْلَىٰ",
        translation: 'We said, "Fear not. Indeed, it is you who are superior."',
        transliteration: "Qulnā lā takhaf innaka anta l-aʿlā",
      },
      {
        verse: "20:69",
        arabic: "وَأَلْقِ مَا فِى يَمِينِكَ تَلْقَفْ مَا صَنَعُوٓا۟ ۖ إِنَّمَا صَنَعُوا۟ كَيْدُ سَٰحِرٍۢ ۖ وَلَا يُفْلِحُ ٱلسَّٰحِرُ حَيْثُ أَتَىٰ",
        translation:
          "And throw what is in your right hand; it will swallow up what they have crafted. What they have crafted is but the trick of a magician, and the magician will not succeed wherever he is.",
        transliteration:
          "Wa-alqi mā fī yamīnika talqaf mā ṣanaʿū innamā ṣanaʿū kaydu sāḥirin wa-lā yufliḥu s-sāḥiru ḥaythu atā",
      },
    ],
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="text-center">
          <Badge variant="secondary" className="text-base px-4 py-2">
            Page {currentPage}
          </Badge>
        </div>

        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(604, currentPage + 1))}
          disabled={currentPage === 604}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Verses */}
      <div className="space-y-6">
        {pageData.verses.map((verseData) => (
          <Card key={verseData.verse} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <Badge variant="outline" className="shrink-0">
                {verseData.verse}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => toggleBookmark(verseData.verse, verseData.translation)}
              >
                {bookmarkedVerses.has(verseData.verse) ? (
                  <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Arabic Text */}
            <div className="arabic-text text-right py-4">{verseData.arabic}</div>

            {/* Transliteration */}
            <div className="text-sm text-muted-foreground italic border-l-2 border-muted pl-4">
              {verseData.transliteration}
            </div>

            {/* Translation */}
            <div className="text-base leading-relaxed">{verseData.translation}</div>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(604, currentPage + 1))}
          disabled={currentPage === 604}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
