import dynamic from "next/dynamic"

const WordExplorer = dynamic(() => import("./word-explorer"), {
  loading: () => <div className="w-full mx-auto p-4 sm:p-6">Loading...</div>,
  ssr: true
})

export default function ExplorerPage() {
  return (
    <div className="w-full mx-auto p-4 sm:p-6">
      <WordExplorer title="Word Explorer" />
    </div>
  )
}


