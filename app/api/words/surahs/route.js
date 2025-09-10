import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get surah statistics with proper names and metadata
    const result = await sql`
      SELECT 
        surah_number,
        COUNT(*) AS words_count,
        COUNT(DISTINCT verse) AS verses_count,
        CASE 
          WHEN surah_number <= 114 THEN 
            CASE 
              WHEN surah_number IN (1, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 56, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114) THEN 'Meccan'
              ELSE 'Medinan'
            END
          ELSE 'Unknown'
        END AS revelation_type
      FROM words
      GROUP BY surah_number
      ORDER BY surah_number
    `

    // Handle Vercel Postgres client structure
    const rows = Array.isArray(result) ? result : result.rows || []

    // Surah names mapping
    const surahNames = {
      1: { english: 'Al-Fatihah', arabic: 'الفاتحة' },
      2: { english: 'Al-Baqarah', arabic: 'البقرة' },
      3: { english: 'Ali Imran', arabic: 'آل عمران' },
      4: { english: 'An-Nisa', arabic: 'النساء' },
      5: { english: 'Al-Maidah', arabic: 'المائدة' },
      6: { english: 'Al-Anam', arabic: 'الأنعام' },
      7: { english: 'Al-Araf', arabic: 'الأعراف' },
      8: { english: 'Al-Anfal', arabic: 'الأنفال' },
      9: { english: 'At-Tawbah', arabic: 'التوبة' },
      10: { english: 'Yunus', arabic: 'يونس' },
      11: { english: 'Hud', arabic: 'هود' },
      12: { english: 'Yusuf', arabic: 'يوسف' },
      13: { english: 'Ar-Rad', arabic: 'الرعد' },
      14: { english: 'Ibrahim', arabic: 'إبراهيم' },
      15: { english: 'Al-Hijr', arabic: 'الحجر' },
      16: { english: 'An-Nahl', arabic: 'النحل' },
      17: { english: 'Al-Isra', arabic: 'الإسراء' },
      18: { english: 'Al-Kahf', arabic: 'الكهف' },
      19: { english: 'Maryam', arabic: 'مريم' },
      20: { english: 'Taha', arabic: 'طه' },
      21: { english: 'Al-Anbiya', arabic: 'الأنبياء' },
      22: { english: 'Al-Hajj', arabic: 'الحج' },
      23: { english: 'Al-Muminun', arabic: 'المؤمنون' },
      24: { english: 'An-Nur', arabic: 'النور' },
      25: { english: 'Al-Furqan', arabic: 'الفرقان' },
      26: { english: 'Ash-Shuara', arabic: 'الشعراء' },
      27: { english: 'An-Naml', arabic: 'النمل' },
      28: { english: 'Al-Qasas', arabic: 'القصص' },
      29: { english: 'Al-Ankabut', arabic: 'العنكبوت' },
      30: { english: 'Ar-Rum', arabic: 'الروم' },
      31: { english: 'Luqman', arabic: 'لقمان' },
      32: { english: 'As-Sajdah', arabic: 'السجدة' },
      33: { english: 'Al-Ahzab', arabic: 'الأحزاب' },
      34: { english: 'Saba', arabic: 'سبأ' },
      35: { english: 'Fatir', arabic: 'فاطر' },
      36: { english: 'Ya-Sin', arabic: 'يس' },
      37: { english: 'As-Saffat', arabic: 'الصافات' },
      38: { english: 'Sad', arabic: 'ص' },
      39: { english: 'Az-Zumar', arabic: 'الزمر' },
      40: { english: 'Ghafir', arabic: 'غافر' },
      41: { english: 'Fussilat', arabic: 'فصلت' },
      42: { english: 'Ash-Shura', arabic: 'الشورى' },
      43: { english: 'Az-Zukhruf', arabic: 'الزخرف' },
      44: { english: 'Ad-Dukhan', arabic: 'الدخان' },
      45: { english: 'Al-Jathiyah', arabic: 'الجاثية' },
      46: { english: 'Al-Ahqaf', arabic: 'الأحقاف' },
      47: { english: 'Muhammad', arabic: 'محمد' },
      48: { english: 'Al-Fath', arabic: 'الفتح' },
      49: { english: 'Al-Hujurat', arabic: 'الحجرات' },
      50: { english: 'Qaf', arabic: 'ق' },
      51: { english: 'Adh-Dhariyat', arabic: 'الذاريات' },
      52: { english: 'At-Tur', arabic: 'الطور' },
      53: { english: 'An-Najm', arabic: 'النجم' },
      54: { english: 'Al-Qamar', arabic: 'القمر' },
      55: { english: 'Ar-Rahman', arabic: 'الرحمن' },
      56: { english: 'Al-Waqiah', arabic: 'الواقعة' },
      57: { english: 'Al-Hadid', arabic: 'الحديد' },
      58: { english: 'Al-Mujadila', arabic: 'المجادلة' },
      59: { english: 'Al-Hashr', arabic: 'الحشر' },
      60: { english: 'Al-Mumtahanah', arabic: 'الممتحنة' },
      61: { english: 'As-Saff', arabic: 'الصف' },
      62: { english: 'Al-Jumuah', arabic: 'الجمعة' },
      63: { english: 'Al-Munafiqun', arabic: 'المنافقون' },
      64: { english: 'At-Taghabun', arabic: 'التغابن' },
      65: { english: 'At-Talaq', arabic: 'الطلاق' },
      66: { english: 'At-Tahrim', arabic: 'التحريم' },
      67: { english: 'Al-Mulk', arabic: 'الملك' },
      68: { english: 'Al-Qalam', arabic: 'القلم' },
      69: { english: 'Al-Haqqah', arabic: 'الحاقة' },
      70: { english: 'Al-Maarij', arabic: 'المعارج' },
      71: { english: 'Nuh', arabic: 'نوح' },
      72: { english: 'Al-Jinn', arabic: 'الجن' },
      73: { english: 'Al-Muzzammil', arabic: 'المزمل' },
      74: { english: 'Al-Muddaththir', arabic: 'المدثر' },
      75: { english: 'Al-Qiyamah', arabic: 'القيامة' },
      76: { english: 'Al-Insan', arabic: 'الإنسان' },
      77: { english: 'Al-Mursalat', arabic: 'المرسلات' },
      78: { english: 'An-Naba', arabic: 'النبأ' },
      79: { english: 'An-Naziat', arabic: 'النازعات' },
      80: { english: 'Abasa', arabic: 'عبس' },
      81: { english: 'At-Takwir', arabic: 'التكوير' },
      82: { english: 'Al-Infitar', arabic: 'الانفطار' },
      83: { english: 'Al-Mutaffifin', arabic: 'المطففين' },
      84: { english: 'Al-Inshiqaq', arabic: 'الانشقاق' },
      85: { english: 'Al-Buruj', arabic: 'البروج' },
      86: { english: 'At-Tariq', arabic: 'الطارق' },
      87: { english: 'Al-Ala', arabic: 'الأعلى' },
      88: { english: 'Al-Ghashiyah', arabic: 'الغاشية' },
      89: { english: 'Al-Fajr', arabic: 'الفجر' },
      90: { english: 'Al-Balad', arabic: 'البلد' },
      91: { english: 'Ash-Shams', arabic: 'الشمس' },
      92: { english: 'Al-Layl', arabic: 'الليل' },
      93: { english: 'Ad-Duha', arabic: 'الضحى' },
      94: { english: 'Ash-Sharh', arabic: 'الشرح' },
      95: { english: 'At-Tin', arabic: 'التين' },
      96: { english: 'Al-Alaq', arabic: 'العلق' },
      97: { english: 'Al-Qadr', arabic: 'القدر' },
      98: { english: 'Al-Bayyinah', arabic: 'البينة' },
      99: { english: 'Az-Zalzalah', arabic: 'الزلزلة' },
      100: { english: 'Al-Adiyat', arabic: 'العاديات' },
      101: { english: 'Al-Qariah', arabic: 'القارعة' },
      102: { english: 'At-Takathur', arabic: 'التكاثر' },
      103: { english: 'Al-Asr', arabic: 'العصر' },
      104: { english: 'Al-Humazah', arabic: 'الهمزة' },
      105: { english: 'Al-Fil', arabic: 'الفيل' },
      106: { english: 'Quraysh', arabic: 'قريش' },
      107: { english: 'Al-Maun', arabic: 'الماعون' },
      108: { english: 'Al-Kawthar', arabic: 'الكوثر' },
      109: { english: 'Al-Kafirun', arabic: 'الكافرون' },
      110: { english: 'An-Nasr', arabic: 'النصر' },
      111: { english: 'Al-Masad', arabic: 'المسد' },
      112: { english: 'Al-Ikhlas', arabic: 'الإخلاص' },
      113: { english: 'Al-Falaq', arabic: 'الفلق' },
      114: { english: 'An-Nas', arabic: 'الناس' }
    }

    const surahs = rows.map((row) => {
      const surahNumber = Number(row.surah_number)
      const surahName = surahNames[surahNumber] || { english: 'Unknown', arabic: 'غير معروف' }
      
      return {
        surah_number: surahNumber,
        name_english: surahName.english,
        name_arabic: surahName.arabic,
        verses_count: Number(row.verses_count),
        words_count: Number(row.words_count),
        revelation_type: row.revelation_type
      }
    })

    return NextResponse.json({ success: true, data: surahs, count: surahs.length })
  } catch (error) {
    console.error("Error fetching surahs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch surahs" }, { status: 500 })
  }
}


