"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, BookmarkIcon, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getBookmarks, addBookmark, removeBookmark } from "@/lib/bookmarks"

interface Word {
  id: number
  verse: string
  location: string
  transliteration: string
  translation: string
  arabic_text: string
  is_last_word_of_verse: boolean
}

interface Line {
  line_number: number
  line_type: string
  words: Word[]
  verses_in_line: string[]
}

interface PageData {
  page_number: number
  info: {
    name: string
    number_of_pages: number
    lines_per_page: number
    font_name: string
  }
  total_lines: number
  lines: Line[]
}

interface MushafViewProps {
  currentPage: number
  onPageChange: (page: number) => void
}

export function MushafView({ currentPage, onPageChange }: MushafViewProps) {
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set())
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)

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

  const pageData: PageData = {
    page_number: 567,
    info: {
      name: "Quran Complex V1 ( 1405 print )",
      number_of_pages: 604,
      lines_per_page: 15,
      font_name: "v1",
    },
    total_lines: 15,
    lines: [
      {
        line_number: 1,
        line_type: "ayah",
        verses_in_line: ["69:9", "69:10"],
        words: [
          {
            id: 73135,
            verse: "69:9",
            location: "69:9:1",
            transliteration: "wajāa",
            translation: "And came",
            arabic_text: "وَجَاءَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73136,
            verse: "69:9",
            location: "69:9:2",
            transliteration: "",
            translation: "Firaun,",
            arabic_text: "فِرْعَوْنُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73137,
            verse: "69:9",
            location: "69:9:3",
            transliteration: "",
            translation: "and (those)",
            arabic_text: "وَمَن",
            is_last_word_of_verse: false,
          },
          {
            id: 73138,
            verse: "69:9",
            location: "69:9:4",
            transliteration: "qablahu",
            translation: "before him,",
            arabic_text: "قَبْلَهُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73139,
            verse: "69:9",
            location: "69:9:5",
            transliteration: "wal-mu'tafikātu",
            translation: "and the overturned cities",
            arabic_text: "وَالْمُؤْتَفِكَاتُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73140,
            verse: "69:9",
            location: "69:9:6",
            transliteration: "bil-khāṭi-ati",
            translation: "with sin.",
            arabic_text: "بِالْخَاطِئَةِ",
            is_last_word_of_verse: true,
          },
          {
            id: 73141,
            verse: "69:10",
            location: "69:10:1",
            transliteration: "faʿaṣaw",
            translation: "And they disobeyed",
            arabic_text: "فَعَصَوْا",
            is_last_word_of_verse: false,
          },
          {
            id: 73142,
            verse: "69:10",
            location: "69:10:2",
            transliteration: "rasūla",
            translation: "(the) Messenger",
            arabic_text: "رَسُولَ",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 2,
        line_type: "ayah",
        verses_in_line: ["69:10", "69:11"],
        words: [
          {
            id: 73143,
            verse: "69:10",
            location: "69:10:3",
            transliteration: "rabbihim",
            translation: "(of) their Lord,",
            arabic_text: "رَبِّهِمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73144,
            verse: "69:10",
            location: "69:10:4",
            transliteration: "fa-akhadhahum",
            translation: "so He seized them",
            arabic_text: "فَأَخَذَهُمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73145,
            verse: "69:10",
            location: "69:10:5",
            transliteration: "akhdhatan",
            translation: "(with) a seizure",
            arabic_text: "أَخْذَةً",
            is_last_word_of_verse: false,
          },
          {
            id: 73146,
            verse: "69:10",
            location: "69:10:6",
            transliteration: "rābiyatan",
            translation: "exceeding.",
            arabic_text: "رَّابِيَةً",
            is_last_word_of_verse: true,
          },
          {
            id: 73147,
            verse: "69:11",
            location: "69:11:1",
            transliteration: "",
            translation: "Indeed, We",
            arabic_text: "إِنَّا",
            is_last_word_of_verse: false,
          },
          {
            id: 73148,
            verse: "69:11",
            location: "69:11:2",
            transliteration: "",
            translation: "when",
            arabic_text: "لَمَّا",
            is_last_word_of_verse: false,
          },
          {
            id: 73149,
            verse: "69:11",
            location: "69:11:3",
            transliteration: "ṭaghā",
            translation: "overflowed",
            arabic_text: "طَغَى",
            is_last_word_of_verse: false,
          },
          {
            id: 73150,
            verse: "69:11",
            location: "69:11:4",
            transliteration: "l-māu",
            translation: "the water,",
            arabic_text: "الْمَاءُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73151,
            verse: "69:11",
            location: "69:11:5",
            transliteration: "ḥamalnākum",
            translation: "We carried you",
            arabic_text: "حَمَلْنَاكُمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73152,
            verse: "69:11",
            location: "69:11:6",
            transliteration: "",
            translation: "in",
            arabic_text: "فِي",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 3,
        line_type: "ayah",
        verses_in_line: ["69:11", "69:12", "69:13"],
        words: [
          {
            id: 73153,
            verse: "69:11",
            location: "69:11:7",
            transliteration: "l-jāriyati",
            translation: "the sailing (ship).",
            arabic_text: "الْجَارِيَةِ",
            is_last_word_of_verse: true,
          },
          {
            id: 73154,
            verse: "69:12",
            location: "69:12:1",
            transliteration: "linajʿalahā",
            translation: "That We might make it",
            arabic_text: "لِنَجْعَلَهَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73155,
            verse: "69:12",
            location: "69:12:2",
            transliteration: "",
            translation: "for you",
            arabic_text: "لَكُمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73156,
            verse: "69:12",
            location: "69:12:3",
            transliteration: "tadhkiratan",
            translation: "a reminder",
            arabic_text: "تَذْكِرَةً",
            is_last_word_of_verse: false,
          },
          {
            id: 73157,
            verse: "69:12",
            location: "69:12:4",
            transliteration: "wataʿiyahā",
            translation: "and would be conscious of it",
            arabic_text: "وَتَعِيَهَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73158,
            verse: "69:12",
            location: "69:12:5",
            transliteration: "udhunun",
            translation: "an ear",
            arabic_text: "أُذُنٌ",
            is_last_word_of_verse: false,
          },
          {
            id: 73159,
            verse: "69:12",
            location: "69:12:6",
            transliteration: "wāʿiyatun",
            translation: "conscious.",
            arabic_text: "وَاعِيَةٌ",
            is_last_word_of_verse: true,
          },
          {
            id: 73160,
            verse: "69:13",
            location: "69:13:1",
            transliteration: "fa-idhā",
            translation: "Then when",
            arabic_text: "فَإِذَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73161,
            verse: "69:13",
            location: "69:13:2",
            transliteration: "nufikha",
            translation: "is blown",
            arabic_text: "نُفِخَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73162,
            verse: "69:13",
            location: "69:13:3",
            transliteration: "",
            translation: "in",
            arabic_text: "فِي",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 4,
        line_type: "ayah",
        verses_in_line: ["69:13", "69:14"],
        words: [
          {
            id: 73163,
            verse: "69:13",
            location: "69:13:4",
            transliteration: "l-ṣūri",
            translation: "the trumpet -",
            arabic_text: "الصُّورِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73164,
            verse: "69:13",
            location: "69:13:5",
            transliteration: "nafkhatun",
            translation: "a blast",
            arabic_text: "نَفْخَةٌ",
            is_last_word_of_verse: false,
          },
          {
            id: 73165,
            verse: "69:13",
            location: "69:13:6",
            transliteration: "wāḥidatun",
            translation: "single,",
            arabic_text: "وَاحِدَةٌ",
            is_last_word_of_verse: true,
          },
          {
            id: 73166,
            verse: "69:14",
            location: "69:14:1",
            transliteration: "waḥumilati",
            translation: "And are lifted",
            arabic_text: "وَحُمِلَتِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73167,
            verse: "69:14",
            location: "69:14:2",
            transliteration: "l-arḍu",
            translation: "the earth",
            arabic_text: "الْأَرْضُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73168,
            verse: "69:14",
            location: "69:14:3",
            transliteration: "wal-jibālu",
            translation: "and the mountains",
            arabic_text: "وَالْجِبَالُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73169,
            verse: "69:14",
            location: "69:14:4",
            transliteration: "fadukkatā",
            translation: "and crushed",
            arabic_text: "فَدُكَّتَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73170,
            verse: "69:14",
            location: "69:14:5",
            transliteration: "dakkatan",
            translation: "(with) a crushing",
            arabic_text: "دَكَّةً",
            is_last_word_of_verse: false,
          },
          {
            id: 73171,
            verse: "69:14",
            location: "69:14:6",
            transliteration: "wāḥidatan",
            translation: "single.",
            arabic_text: "وَاحِدَةً",
            is_last_word_of_verse: true,
          },
        ],
      },
      {
        line_number: 5,
        line_type: "ayah",
        verses_in_line: ["69:15", "69:16"],
        words: [
          {
            id: 73172,
            verse: "69:15",
            location: "69:15:1",
            transliteration: "",
            translation: "Then (on) that Day",
            arabic_text: "فَيَوْمَئِذٍ",
            is_last_word_of_verse: false,
          },
          {
            id: 73173,
            verse: "69:15",
            location: "69:15:2",
            transliteration: "waqaʿati",
            translation: "will occur",
            arabic_text: "وَقَعَتِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73174,
            verse: "69:15",
            location: "69:15:3",
            transliteration: "l-wāqiʿatu",
            translation: "the Occurrence,",
            arabic_text: "الْوَاقِعَةُ",
            is_last_word_of_verse: true,
          },
          {
            id: 73175,
            verse: "69:16",
            location: "69:16:1",
            transliteration: "wa-inshaqqati",
            translation: "And will split",
            arabic_text: "وَانشَقَّتِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73176,
            verse: "69:16",
            location: "69:16:2",
            transliteration: "l-samāu",
            translation: "the heaven,",
            arabic_text: "السَّمَاءُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73177,
            verse: "69:16",
            location: "69:16:3",
            transliteration: "",
            translation: "so it",
            arabic_text: "فَهِيَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73178,
            verse: "69:16",
            location: "69:16:4",
            transliteration: "",
            translation: "(is on) that Day",
            arabic_text: "يَوْمَئِذٍ",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 6,
        line_type: "ayah",
        verses_in_line: ["69:16", "69:17"],
        words: [
          {
            id: 73179,
            verse: "69:16",
            location: "69:16:5",
            transliteration: "wāhiyatun",
            translation: "frail.",
            arabic_text: "وَاهِيَةٌ",
            is_last_word_of_verse: true,
          },
          {
            id: 73180,
            verse: "69:17",
            location: "69:17:1",
            transliteration: "wal-malaku",
            translation: "And the Angels",
            arabic_text: "وَالْمَلَكُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73181,
            verse: "69:17",
            location: "69:17:2",
            transliteration: "",
            translation: "(will be) on",
            arabic_text: "عَلَىٰ",
            is_last_word_of_verse: false,
          },
          {
            id: 73182,
            verse: "69:17",
            location: "69:17:3",
            transliteration: "arjāihā",
            translation: "its edges,",
            arabic_text: "أَرْجَائِهَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73183,
            verse: "69:17",
            location: "69:17:4",
            transliteration: "wayaḥmilu",
            translation: "and will bear",
            arabic_text: "وَيَحْمِلُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73184,
            verse: "69:17",
            location: "69:17:5",
            transliteration: "ʿarsha",
            translation: "(the) Throne",
            arabic_text: "عَرْشَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73185,
            verse: "69:17",
            location: "69:17:6",
            transliteration: "rabbika",
            translation: "(of) your Lord",
            arabic_text: "رَبِّكَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73186,
            verse: "69:17",
            location: "69:17:7",
            transliteration: "fawqahum",
            translation: "above them,",
            arabic_text: "فَوْقَهُمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73187,
            verse: "69:17",
            location: "69:17:8",
            transliteration: "",
            translation: "that Day,",
            arabic_text: "يَوْمَئِذٍ",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 7,
        line_type: "ayah",
        verses_in_line: ["69:17", "69:18", "69:19"],
        words: [
          {
            id: 73188,
            verse: "69:17",
            location: "69:17:9",
            transliteration: "thamāniyatun",
            translation: "eight.",
            arabic_text: "ثَمَانِيَةٌ",
            is_last_word_of_verse: true,
          },
          {
            id: 73189,
            verse: "69:18",
            location: "69:18:1",
            transliteration: "",
            translation: "That Day,",
            arabic_text: "يَوْمَئِذٍ",
            is_last_word_of_verse: false,
          },
          {
            id: 73190,
            verse: "69:18",
            location: "69:18:2",
            transliteration: "tuʿ'raḍūna",
            translation: "you will be exhibited,",
            arabic_text: "تُعْرَضُونَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73191,
            verse: "69:18",
            location: "69:18:3",
            transliteration: "",
            translation: "not",
            arabic_text: "لَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73192,
            verse: "69:18",
            location: "69:18:4",
            transliteration: "takhfā",
            translation: "will be hidden",
            arabic_text: "تَخْفَىٰ",
            is_last_word_of_verse: false,
          },
          {
            id: 73193,
            verse: "69:18",
            location: "69:18:5",
            transliteration: "",
            translation: "among you",
            arabic_text: "مِنكُمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73194,
            verse: "69:18",
            location: "69:18:6",
            transliteration: "",
            translation: "any secret.",
            arabic_text: "خَافِيَةٌ",
            is_last_word_of_verse: true,
          },
          {
            id: 73195,
            verse: "69:19",
            location: "69:19:1",
            transliteration: "fa-ammā",
            translation: "Then as for",
            arabic_text: "فَأَمَّا",
            is_last_word_of_verse: false,
          },
          {
            id: 73196,
            verse: "69:19",
            location: "69:19:2",
            transliteration: "",
            translation: "(he) who",
            arabic_text: "مَنْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73197,
            verse: "69:19",
            location: "69:19:3",
            transliteration: "ūtiya",
            translation: "is given",
            arabic_text: "أُوتِيَ",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 8,
        line_type: "ayah",
        verses_in_line: ["69:19", "69:20"],
        words: [
          {
            id: 73198,
            verse: "69:19",
            location: "69:19:4",
            transliteration: "kitābahu",
            translation: "his record",
            arabic_text: "كِتَابَهُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73199,
            verse: "69:19",
            location: "69:19:5",
            transliteration: "biyamīnihi",
            translation: "in his right hand",
            arabic_text: "بِيَمِينِهِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73200,
            verse: "69:19",
            location: "69:19:6",
            transliteration: "fayaqūlu",
            translation: "will say,",
            arabic_text: "فَيَقُولُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73201,
            verse: "69:19",
            location: "69:19:7",
            transliteration: "",
            translation: '"Here,',
            arabic_text: "هَاؤُمُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73202,
            verse: "69:19",
            location: "69:19:8",
            transliteration: "iq'raū",
            translation: "read",
            arabic_text: "اقْرَءُوا",
            is_last_word_of_verse: false,
          },
          {
            id: 73203,
            verse: "69:19",
            location: "69:19:9",
            transliteration: "kitābiyah",
            translation: "my record!",
            arabic_text: "كِتَابِيَهْ",
            is_last_word_of_verse: true,
          },
          {
            id: 73204,
            verse: "69:20",
            location: "69:20:1",
            transliteration: "",
            translation: "Indeed, I",
            arabic_text: "إِنِّي",
            is_last_word_of_verse: false,
          },
          {
            id: 73205,
            verse: "69:20",
            location: "69:20:2",
            transliteration: "ẓanantu",
            translation: "was certain",
            arabic_text: "ظَنَنتُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73206,
            verse: "69:20",
            location: "69:20:3",
            transliteration: "",
            translation: "that I",
            arabic_text: "أَنِّي",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 9,
        line_type: "ayah",
        verses_in_line: ["69:20", "69:21", "69:22"],
        words: [
          {
            id: 73207,
            verse: "69:20",
            location: "69:20:4",
            transliteration: "mulāqin",
            translation: "(will) meet",
            arabic_text: "مُلَاقٍ",
            is_last_word_of_verse: false,
          },
          {
            id: 73208,
            verse: "69:20",
            location: "69:20:5",
            transliteration: "ḥisābiyah",
            translation: 'my account."',
            arabic_text: "حِسَابِيَهْ",
            is_last_word_of_verse: true,
          },
          {
            id: 73209,
            verse: "69:21",
            location: "69:21:1",
            transliteration: "",
            translation: "So he",
            arabic_text: "فَهُوَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73210,
            verse: "69:21",
            location: "69:21:2",
            transliteration: "",
            translation: "(will be) in",
            arabic_text: "فِي",
            is_last_word_of_verse: false,
          },
          {
            id: 73211,
            verse: "69:21",
            location: "69:21:3",
            transliteration: "ʿīshatin",
            translation: "a life",
            arabic_text: "عِيشَةٍ",
            is_last_word_of_verse: false,
          },
          {
            id: 73212,
            verse: "69:21",
            location: "69:21:4",
            transliteration: "rāḍiyatin",
            translation: "pleasant,",
            arabic_text: "رَّاضِيَةٍ",
            is_last_word_of_verse: true,
          },
          {
            id: 73213,
            verse: "69:22",
            location: "69:22:1",
            transliteration: "",
            translation: "In",
            arabic_text: "فِي",
            is_last_word_of_verse: false,
          },
          {
            id: 73214,
            verse: "69:22",
            location: "69:22:2",
            transliteration: "jannatin",
            translation: "a Garden",
            arabic_text: "جَنَّةٍ",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 10,
        line_type: "ayah",
        verses_in_line: ["69:22", "69:23", "69:24"],
        words: [
          {
            id: 73215,
            verse: "69:22",
            location: "69:22:3",
            transliteration: "ʿāliyatin",
            translation: "elevated,",
            arabic_text: "عَالِيَةٍ",
            is_last_word_of_verse: true,
          },
          {
            id: 73216,
            verse: "69:23",
            location: "69:23:1",
            transliteration: "quṭūfuhā",
            translation: "Its clusters of fruits",
            arabic_text: "قُطُوفُهَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73217,
            verse: "69:23",
            location: "69:23:2",
            transliteration: "dāniyatun",
            translation: "hanging near.",
            arabic_text: "دَانِيَةٌ",
            is_last_word_of_verse: true,
          },
          {
            id: 73218,
            verse: "69:24",
            location: "69:24:1",
            transliteration: "kulū",
            translation: '"Eat',
            arabic_text: "كُلُوا",
            is_last_word_of_verse: false,
          },
          {
            id: 73219,
            verse: "69:24",
            location: "69:24:2",
            transliteration: "wa-ish'rabū",
            translation: "and drink",
            arabic_text: "وَاشْرَبُوا",
            is_last_word_of_verse: false,
          },
          {
            id: 73220,
            verse: "69:24",
            location: "69:24:3",
            transliteration: "hanīan",
            translation: "(in) satisfaction",
            arabic_text: "هَنِيئًا",
            is_last_word_of_verse: false,
          },
          {
            id: 73221,
            verse: "69:24",
            location: "69:24:4",
            transliteration: "",
            translation: "for what",
            arabic_text: "بِمَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73222,
            verse: "69:24",
            location: "69:24:5",
            transliteration: "aslaftum",
            translation: "you sent before you",
            arabic_text: "أَسْلَفْتُمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73223,
            verse: "69:24",
            location: "69:24:6",
            transliteration: "",
            translation: "in",
            arabic_text: "فِي",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 11,
        line_type: "ayah",
        verses_in_line: ["69:24", "69:25"],
        words: [
          {
            id: 73224,
            verse: "69:24",
            location: "69:24:7",
            transliteration: "l-ayāmi",
            translation: "the days",
            arabic_text: "الْأَيَّامِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73225,
            verse: "69:24",
            location: "69:24:8",
            transliteration: "l-khāliyati",
            translation: 'past."',
            arabic_text: "الْخَالِيَةِ",
            is_last_word_of_verse: true,
          },
          {
            id: 73226,
            verse: "69:25",
            location: "69:25:1",
            transliteration: "wa-ammā",
            translation: "But as for",
            arabic_text: "وَأَمَّا",
            is_last_word_of_verse: false,
          },
          {
            id: 73227,
            verse: "69:25",
            location: "69:25:2",
            transliteration: "",
            translation: "(him) who",
            arabic_text: "مَنْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73228,
            verse: "69:25",
            location: "69:25:3",
            transliteration: "ūtiya",
            translation: "is given",
            arabic_text: "أُوتِيَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73229,
            verse: "69:25",
            location: "69:25:4",
            transliteration: "kitābahu",
            translation: "his record",
            arabic_text: "كِتَابَهُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73230,
            verse: "69:25",
            location: "69:25:5",
            transliteration: "bishimālihi",
            translation: "in his left hand",
            arabic_text: "بِشِمَالِهِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73231,
            verse: "69:25",
            location: "69:25:6",
            transliteration: "fayaqūlu",
            translation: "will say,",
            arabic_text: "فَيَقُولُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73232,
            verse: "69:25",
            location: "69:25:7",
            transliteration: "",
            translation: '"O! I wish',
            arabic_text: "يَا لَيْتَنِي",
            is_last_word_of_verse: false,
          },
          {
            id: 73233,
            verse: "69:25",
            location: "69:25:8",
            transliteration: "",
            translation: "not",
            arabic_text: "لَمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73234,
            verse: "69:25",
            location: "69:25:9",
            transliteration: "ūta",
            translation: "I had been given",
            arabic_text: "أُوتَ",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 12,
        line_type: "ayah",
        verses_in_line: ["69:25", "69:26", "69:27", "69:28"],
        words: [
          {
            id: 73235,
            verse: "69:25",
            location: "69:25:10",
            transliteration: "kitābiyah",
            translation: "my record",
            arabic_text: "كِتَابِيَهْ",
            is_last_word_of_verse: true,
          },
          {
            id: 73236,
            verse: "69:26",
            location: "69:26:1",
            transliteration: "",
            translation: "And not",
            arabic_text: "وَلَمْ",
            is_last_word_of_verse: false,
          },
          {
            id: 73237,
            verse: "69:26",
            location: "69:26:2",
            transliteration: "adri",
            translation: "I had known",
            arabic_text: "أَدْرِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73238,
            verse: "69:26",
            location: "69:26:3",
            transliteration: "",
            translation: "what",
            arabic_text: "مَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73239,
            verse: "69:26",
            location: "69:26:4",
            transliteration: "ḥisābiyah",
            translation: "(is) my account.",
            arabic_text: "حِسَابِيَهْ",
            is_last_word_of_verse: true,
          },
          {
            id: 73240,
            verse: "69:27",
            location: "69:27:1",
            transliteration: "",
            translation: "O! I wish it",
            arabic_text: "يَا لَيْتَهَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73241,
            verse: "69:27",
            location: "69:27:2",
            transliteration: "kānati",
            translation: "had been",
            arabic_text: "كَانَتِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73242,
            verse: "69:27",
            location: "69:27:3",
            transliteration: "l-qāḍiyata",
            translation: "the end",
            arabic_text: "الْقَاضِيَةَ",
            is_last_word_of_verse: true,
          },
          {
            id: 73243,
            verse: "69:28",
            location: "69:28:1",
            transliteration: "",
            translation: "Not",
            arabic_text: "مَا",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 13,
        line_type: "ayah",
        verses_in_line: ["69:28", "69:29", "69:30", "69:31"],
        words: [
          {
            id: 73244,
            verse: "69:28",
            location: "69:28:2",
            transliteration: "aghnā",
            translation: "has availed",
            arabic_text: "أَغْنَىٰ",
            is_last_word_of_verse: false,
          },
          {
            id: 73245,
            verse: "69:28",
            location: "69:28:3",
            transliteration: "",
            translation: "me",
            arabic_text: "عَنِّي",
            is_last_word_of_verse: false,
          },
          {
            id: 73246,
            verse: "69:28",
            location: "69:28:4",
            transliteration: "māliyah",
            translation: "my wealth,",
            arabic_text: "مَالِيَهْ",
            is_last_word_of_verse: true,
          },
          {
            id: 73247,
            verse: "69:29",
            location: "69:29:1",
            transliteration: "halaka",
            translation: "Is gone",
            arabic_text: "هَلَكَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73248,
            verse: "69:29",
            location: "69:29:2",
            transliteration: "",
            translation: "from me",
            arabic_text: "عَنِّي",
            is_last_word_of_verse: false,
          },
          {
            id: 73249,
            verse: "69:29",
            location: "69:29:3",
            transliteration: "sul'ṭāniyah",
            translation: 'my authority."',
            arabic_text: "سُلْطَانِيَهْ",
            is_last_word_of_verse: true,
          },
          {
            id: 73250,
            verse: "69:30",
            location: "69:30:1",
            transliteration: "khudhūhu",
            translation: '"Seize him',
            arabic_text: "خُذُوهُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73251,
            verse: "69:30",
            location: "69:30:2",
            transliteration: "faghullūhu",
            translation: "and shackle him,",
            arabic_text: "فَغُلُّوهُ",
            is_last_word_of_verse: true,
          },
          {
            id: 73252,
            verse: "69:31",
            location: "69:31:1",
            transliteration: "",
            translation: "Then",
            arabic_text: "ثُمَّ",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 14,
        line_type: "ayah",
        verses_in_line: ["69:31", "69:32", "69:33"],
        words: [
          {
            id: 73253,
            verse: "69:31",
            location: "69:31:2",
            transliteration: "l-jaḥīma",
            translation: "(into) the Hellfire",
            arabic_text: "الْجَحِيمَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73254,
            verse: "69:31",
            location: "69:31:3",
            transliteration: "ṣallūhu",
            translation: "burn him.",
            arabic_text: "صَلُّوهُ",
            is_last_word_of_verse: true,
          },
          {
            id: 73255,
            verse: "69:32",
            location: "69:32:1",
            transliteration: "",
            translation: "Then",
            arabic_text: "ثُمَّ",
            is_last_word_of_verse: false,
          },
          {
            id: 73256,
            verse: "69:32",
            location: "69:32:2",
            transliteration: "",
            translation: "into",
            arabic_text: "فِي",
            is_last_word_of_verse: false,
          },
          {
            id: 73257,
            verse: "69:32",
            location: "69:32:3",
            transliteration: "sil'silatin",
            translation: "a chain,",
            arabic_text: "سِلْسِلَةٍ",
            is_last_word_of_verse: false,
          },
          {
            id: 73258,
            verse: "69:32",
            location: "69:32:4",
            transliteration: "dharʿuhā",
            translation: "its length",
            arabic_text: "ذَرْعُهَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73259,
            verse: "69:32",
            location: "69:32:5",
            transliteration: "sabʿūna",
            translation: "(is) seventy",
            arabic_text: "سَبْعُونَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73260,
            verse: "69:32",
            location: "69:32:6",
            transliteration: "dhirāʿan",
            translation: "cubits,",
            arabic_text: "ذِرَاعًا",
            is_last_word_of_verse: false,
          },
          {
            id: 73261,
            verse: "69:32",
            location: "69:32:7",
            transliteration: "fa-us'lukūhu",
            translation: 'insert him."',
            arabic_text: "فَاسْلُكُوهُ",
            is_last_word_of_verse: true,
          },
          {
            id: 73262,
            verse: "69:33",
            location: "69:33:1",
            transliteration: "",
            translation: "Indeed, he",
            arabic_text: "إِنَّهُ",
            is_last_word_of_verse: false,
          },
        ],
      },
      {
        line_number: 15,
        line_type: "ayah",
        verses_in_line: ["69:33", "69:34"],
        words: [
          {
            id: 73263,
            verse: "69:33",
            location: "69:33:2",
            transliteration: "kāna",
            translation: "was",
            arabic_text: "كَانَ",
            is_last_word_of_verse: false,
          },
          {
            id: 73264,
            verse: "69:33",
            location: "69:33:3",
            transliteration: "",
            translation: "not",
            arabic_text: "لَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73265,
            verse: "69:33",
            location: "69:33:4",
            transliteration: "yu'minu",
            translation: "believing",
            arabic_text: "يُؤْمِنُ",
            is_last_word_of_verse: false,
          },
          {
            id: 73266,
            verse: "69:33",
            location: "69:33:5",
            transliteration: "bil-lahi",
            translation: "in Allah",
            arabic_text: "بِاللَّهِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73267,
            verse: "69:33",
            location: "69:33:6",
            transliteration: "l-ʿaẓīmi",
            translation: "the Most Great,",
            arabic_text: "الْعَظِيمِ",
            is_last_word_of_verse: true,
          },
          {
            id: 73268,
            verse: "69:34",
            location: "69:34:1",
            transliteration: "",
            translation: "And (did) not",
            arabic_text: "وَلَا",
            is_last_word_of_verse: false,
          },
          {
            id: 73269,
            verse: "69:34",
            location: "69:34:2",
            transliteration: "yaḥuḍḍu",
            translation: "feel the urge",
            arabic_text: "يَحُضُّ",
            is_last_word_of_verse: false,
          },
          {
            id: 73270,
            verse: "69:34",
            location: "69:34:3",
            transliteration: "",
            translation: "on",
            arabic_text: "عَلَىٰ",
            is_last_word_of_verse: false,
          },
          {
            id: 73271,
            verse: "69:34",
            location: "69:34:4",
            transliteration: "ṭaʿāmi",
            translation: "(the) feeding",
            arabic_text: "طَعَامِ",
            is_last_word_of_verse: false,
          },
          {
            id: 73272,
            verse: "69:34",
            location: "69:34:5",
            transliteration: "l-mis'kīni",
            translation: "(of) the poor.",
            arabic_text: "الْمِسْكِينِ",
            is_last_word_of_verse: true,
          },
        ],
      },
    ],
  }

  // Updated verse number helper function to correctly extract verse number
  const getVerseNumber = (verse: string) => {
    const parts = verse.split(":")
    return parts[1]
  }

  return (
    <TooltipProvider>
      <div className="min-h-dvh flex flex-col bg-background">
        {/* Header */}
        <header className="shrink-0 h-12 border-b border-border/50 flex items-center justify-between px-3">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <h1 className="text-sm font-semibold text-foreground">سورة الحاقة</h1>
            <p className="text-xs text-muted-foreground">Page {pageData.page_number}</p>
          </div>

          <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Mushaf Page Container */}
          <div className="w-full max-w-3xl mx-auto px-4 py-6">
            {/* Lines Grid - now flows naturally without fixed height */}
            <div className="flex flex-col gap-4">
              {pageData.lines.map((line) => (
                <div key={line.line_number} className="w-full flex justify-between items-center" dir="rtl">
                  {line.words.map((word) => (
                    <Tooltip
                      key={word.id} // Added key to TooltipTrigger as it's a direct child of the mapped array
                      delayDuration={200} // Moved delayDuration here
                    >
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedWord(word)}
                          className={`font-arabic text-xl md:text-2xl lg:text-3xl transition-colors hover:text-primary ${
                            selectedWord?.id === word.id ? "text-primary" : ""
                          }`}
                        >
                          {word.arabic_text}
                          {word.is_last_word_of_verse && (
                            <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] md:h-6 md:w-6 md:text-xs">
                              {word.verse.split(":")[1]}
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs font-medium">{word.translation}</p>
                        {word.transliteration && (
                          <p className="text-xs text-muted-foreground italic">{word.transliteration}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Word Panel */}
        {selectedWord && (
          <div className="shrink-0 border-t border-border/50 bg-muted/30 p-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="font-arabic text-lg text-primary shrink-0">{selectedWord.arabic_text}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{selectedWord.translation}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedWord.transliteration} • {selectedWord.verse}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBookmark(selectedWord.verse, selectedWord.arabic_text)}
              className="h-8 w-8 p-0 shrink-0"
            >
              {bookmarkedVerses.has(selectedWord.verse) ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <BookmarkIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
