export interface Bookmark {
  verse: string
  page: number
  text: string
}

const BOOKMARKS_KEY = "quran_bookmarks"

export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(BOOKMARKS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function addBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks()
  const exists = bookmarks.find((b) => b.verse === bookmark.verse)
  if (!exists) {
    bookmarks.push(bookmark)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
  }
}

export function removeBookmark(verse: string): void {
  const bookmarks = getBookmarks().filter((b) => b.verse !== verse)
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
}
