CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  target_audience TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'TESTING',
  video_url TEXT,
  doc_content TEXT,
  doc_file JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  avatar_url TEXT,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partner_links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  visible_to TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_categories (
  value TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS feature_audiences (
  value TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS link_categories (
  value TEXT PRIMARY KEY
);
