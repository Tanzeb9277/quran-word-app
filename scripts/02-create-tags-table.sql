-- Create the tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  tag_code VARCHAR(10) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for tag lookups
CREATE INDEX IF NOT EXISTS idx_tags_code ON tags(tag_code);

-- Insert the simplified tags
INSERT INTO tags (tag_code, description) VALUES
  ('ACC', 'accusative particle'),
  ('ADJ', 'adjective'),
  ('AMD', 'amendment particle'),
  ('ANS', 'answer particle'),
  ('AVR', 'averting particle'),
  ('CAUS', 'causative particle'),
  ('CERT', 'certainty particle'),
  ('CIRC', 'circumstantial particle'),
  ('COM', 'comitative particle'),
  ('COND', 'conditional'),
  ('CONJ', 'conjunction'),
  ('DEM', 'demonstrative'),
  ('EMPH', 'emphatic particle'),
  ('EQ', 'equalization particle'),
  ('EXH', 'exhortation particle'),
  ('EXL', 'explanation particle'),
  ('EXP', 'exceptive particle'),
  ('FUT', 'future particle'),
  ('IMPN', 'imperative particle'),
  ('IMPV', 'imperative particle'),
  ('INC', 'inceptive particle'),
  ('INL', 'Quranic initials'),
  ('INT', 'interpretation particle'),
  ('INTG', 'interrogative'),
  ('LOC', 'location adverb'),
  ('N', 'noun'),
  ('NEG', 'negative particle'),
  ('P', 'preposition'),
  ('PN', 'proper noun'),
  ('PREV', 'preventive particle'),
  ('PRO', 'prohibition particle'),
  ('PRON', 'pronoun'),
  ('PRP', 'purpose particle'),
  ('REL', 'relative pronoun'),
  ('REM', 'resumption particle'),
  ('RES', 'restriction particle'),
  ('RET', 'retraction particle'),
  ('RSLT', 'result particle'),
  ('SUB', 'subordinating conjunction'),
  ('SUP', 'supplemental particle'),
  ('SUR', 'surprise particle'),
  ('T', 'time adverb'),
  ('V', 'verb'),
  ('VOC', 'vocative particle')
ON CONFLICT (tag_code) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;
