"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NavigationPanelProps {
  onPageSelect: (page: number) => void
}

const surahs = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", startPage: 1, verses: 7 },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", startPage: 2, verses: 286 },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", startPage: 293, verses: 110 },
  { number: 19, name: "Maryam", arabicName: "مريم", startPage: 305, verses: 98 },
  { number: 20, name: "Ta-Ha", arabicName: "طه", startPage: 312, verses: 135 },
  // Add more surahs as needed
]

export function NavigationPanel({ onPageSelect }: NavigationPanelProps) {
  const [pageInput, setPageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSurahs = surahs.filter(
    (surah) => surah.name.toLowerCase().includes(searchQuery.toLowerCase()) || surah.arabicName.includes(searchQuery),
  )

  const handlePageJump = () => {
    const page = Number.parseInt(pageInput)
    if (page >= 1 && page <= 604) {
      onPageSelect(page)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="surahs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="surahs">Browse Surahs</TabsTrigger>
          <TabsTrigger value="pages">Jump to Page</TabsTrigger>
        </TabsList>

        <TabsContent value="surahs" className="space-y-4">
          <Input
            placeholder="Search surahs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredSurahs.map((surah) => (
                <Card
                  key={surah.number}
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onPageSelect(surah.startPage)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{surah.number}</Badge>
                        <h3 className="font-semibold">{surah.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {surah.verses} verses • Page {surah.startPage}
                      </p>
                    </div>
                    <div className="arabic-text text-2xl">{surah.arabicName}</div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Jump to Page</h3>
              <p className="text-sm text-muted-foreground mb-4">Enter a page number between 1 and 604</p>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Page number"
                min="1"
                max="604"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePageJump()}
              />
              <Button onClick={handlePageJump}>Go</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 50, 100, 200, 300, 400, 500, 600].map((page) => (
                <Button key={page} variant="outline" onClick={() => onPageSelect(page)}>
                  Page {page}
                </Button>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
