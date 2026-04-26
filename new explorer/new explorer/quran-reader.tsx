"use client"

import { useState } from "react"
import { Book, BookmarkIcon, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MushafView } from "@/components/mushaf-view"
import { NavigationPanel } from "@/components/navigation-panel"
import { SearchPanel } from "@/components/search-panel"
import { BookmarksPanel } from "@/components/bookmarks-panel"
import { ThemeToggle } from "@/components/theme-toggle"

type View = "read" | "navigate" | "search" | "bookmarks"

export function QuranReader() {
  const [currentView, setCurrentView] = useState<View>("read")
  const [currentPage, setCurrentPage] = useState(300)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="mushaf-container bg-background">
      {/* Header */}
      <header className="shrink-0 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="px-4">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold tracking-tight">Quran Reader</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={currentView === "read" ? "default" : "ghost"}
                onClick={() => setCurrentView("read")}
                size="sm"
                className="h-8"
              >
                <Book className="mr-1.5 h-3.5 w-3.5" />
                Read
              </Button>
              <Button
                variant={currentView === "navigate" ? "default" : "ghost"}
                onClick={() => setCurrentView("navigate")}
                size="sm"
                className="h-8"
              >
                <Menu className="mr-1.5 h-3.5 w-3.5" />
                Navigate
              </Button>
              <Button
                variant={currentView === "search" ? "default" : "ghost"}
                onClick={() => setCurrentView("search")}
                size="sm"
                className="h-8"
              >
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Search
              </Button>
              <Button
                variant={currentView === "bookmarks" ? "default" : "ghost"}
                onClick={() => setCurrentView("bookmarks")}
                size="sm"
                className="h-8"
              >
                <BookmarkIcon className="mr-1.5 h-3.5 w-3.5" />
                Bookmarks
              </Button>
              <ThemeToggle />
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="flex flex-col gap-1 pb-3 md:hidden">
              <Button
                variant={currentView === "read" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentView("read")
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start h-9"
              >
                <Book className="mr-2 h-4 w-4" />
                Read
              </Button>
              <Button
                variant={currentView === "navigate" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentView("navigate")
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start h-9"
              >
                <Menu className="mr-2 h-4 w-4" />
                Navigate
              </Button>
              <Button
                variant={currentView === "search" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentView("search")
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start h-9"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button
                variant={currentView === "bookmarks" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentView("bookmarks")
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start h-9"
              >
                <BookmarkIcon className="mr-2 h-4 w-4" />
                Bookmarks
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content - flex-1 and overflow handling for full viewport fit */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {currentView === "read" && <MushafView currentPage={currentPage} onPageChange={setCurrentPage} />}
        {currentView === "navigate" && (
          <div className="h-full overflow-auto p-4">
            <NavigationPanel
              onPageSelect={(page) => {
                setCurrentPage(page)
                setCurrentView("read")
              }}
            />
          </div>
        )}
        {currentView === "search" && (
          <div className="h-full overflow-auto p-4">
            <SearchPanel
              onVerseSelect={(page) => {
                setCurrentPage(page)
                setCurrentView("read")
              }}
            />
          </div>
        )}
        {currentView === "bookmarks" && (
          <div className="h-full overflow-auto p-4">
            <BookmarksPanel
              onBookmarkSelect={(page) => {
                setCurrentPage(page)
                setCurrentView("read")
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
