"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getBookmarks, removeBookmark, type Bookmark } from "@/lib/bookmarks"

interface BookmarksPanelProps {
  onBookmarkSelect: (page: number) => void
}

export function BookmarksPanel({ onBookmarkSelect }: BookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    setBookmarks(getBookmarks())
  }, [])

  const handleRemove = (verse: string) => {
    removeBookmark(verse)
    setBookmarks(getBookmarks())
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Your Bookmarks</h2>
        <p className="text-muted-foreground">Verses you've saved for later reading</p>
      </Card>

      {bookmarks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No bookmarks yet. Start bookmarking verses while reading!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.verse} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{bookmark.verse}</Badge>
                  <Badge variant="secondary">Page {bookmark.page}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(bookmark.verse)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div
                className="text-base leading-relaxed cursor-pointer hover:text-primary transition-colors"
                onClick={() => onBookmarkSelect(bookmark.page)}
              >
                {bookmark.text}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
