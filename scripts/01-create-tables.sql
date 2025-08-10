-- Create the words table
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  surah_number INTEGER NOT NULL,
  verse TEXT NOT NULL,
  location TEXT UNIQUE NOT NULL,
  transliteration TEXT,
  translation TEXT,
  grammar TEXT,
  image_url TEXT,
  root_latin TEXT,
  root_arabic TEXT,
  tags JSONB
);

-- Create the active_quizzes table
CREATE TABLE IF NOT EXISTS active_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  surah_number INTEGER NOT NULL,
  current_index INTEGER DEFAULT 0,
  lives_remaining INTEGER NOT NULL,
  answered_correctly TEXT[] DEFAULT '{}',
  answered_incorrectly TEXT[] DEFAULT '{}',
  word_order TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_words_surah ON words(surah_number);
CREATE INDEX IF NOT EXISTS idx_words_location ON words(location);
CREATE INDEX IF NOT EXISTS idx_words_root_arabic ON words(root_arabic);
CREATE INDEX IF NOT EXISTS idx_words_tags ON words USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_active_quizzes_user ON active_quizzes(user_id);
