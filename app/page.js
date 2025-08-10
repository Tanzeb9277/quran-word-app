import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Search } from "lucide-react"

export default function HomePage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Quran Word App</h1>
        <p className="text-gray-600 dark:text-gray-300">Choose a mode to get started.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Game</CardTitle>
            </div>
            <CardDescription>Reconstruct verses using a word bank.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/game">
              <Button className="w-full">Play Game</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle>Explorer</CardTitle>
            </div>
            <CardDescription>Explore words, roots, and tags.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/explorer">
              <Button variant="outline" className="w-full">Open Explorer</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
