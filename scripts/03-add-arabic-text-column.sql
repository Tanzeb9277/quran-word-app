-- Add arabic_text column to the words table
ALTER TABLE words ADD COLUMN IF NOT EXISTS arabic_text TEXT;

-- Create an index on arabic_text for better performance
CREATE INDEX IF NOT EXISTS idx_words_arabic_text ON words(arabic_text) WHERE arabic_text IS NOT NULL;

