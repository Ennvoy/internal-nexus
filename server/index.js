import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import crypto from 'crypto';

dotenv.config();

const PORT = process.env.PORT || 4000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Add it to your .env file.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Support optional public base path (e.g. when the app is served under
// `/internal-nexus/`). If requests arrive prefixed with that path,
// strip it so existing route definitions (which use `/api/...`) still match.
const BASE_PATH = process.env.BASE_PATH || '/internal-nexus';
app.use((req, res, next) => {
  if (BASE_PATH && req.url.startsWith(BASE_PATH)) {
    req.url = req.url.slice(BASE_PATH.length) || '/';
  }
  next();
});

// Helpers
const mapFeature = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  tags: row.tags || [],
  targetAudience: row.target_audience || [],
  status: row.status,
  videoUrl: row.video_url || '',
  docContent: row.doc_content || '',
  docFile: row.doc_file || undefined,
  position: row.position || 0,
  updatedAt: row.updated_at ? row.updated_at.toISOString().split('T')[0] : '',
});

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at ? row.created_at.toISOString().split('T')[0] : '',
  avatarUrl: row.avatar_url || '',
});

const mapLink = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  url: row.url,
  category: row.category,
  visibleTo: row.visible_to || [],
  isActive: row.is_active,
  position: row.position || 0,
  createdAt: row.created_at ? row.created_at.toISOString() : undefined,
});

// DB bootstrapping
async function ensureTables() {
  await pool.query(`
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
      position INT NOT NULL DEFAULT 0,
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
      position INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS feature_categories (
      value TEXT PRIMARY KEY,
      position INT NOT NULL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS feature_audiences (
      value TEXT PRIMARY KEY,
      position INT NOT NULL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS link_categories (
      value TEXT PRIMARY KEY,
      position INT NOT NULL DEFAULT 0
    );
  `);
  // Ensure position column exists for existing tables
  await pool.query(`ALTER TABLE feature_categories ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE feature_audiences ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE link_categories ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE features ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE partner_links ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0`);
}

// Routes
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Features
app.get('/api/features', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM features ORDER BY position DESC, updated_at DESC');
  res.json(rows.map(mapFeature));
});

const normalizeFeaturePayload = (body) => {
  const tags = Array.isArray(body.tags) ? body.tags : [];
  const targetAudience = Array.isArray(body.targetAudience) ? body.targetAudience : [];
  const docFile = body.docFile && typeof body.docFile === 'object' ? body.docFile : null;
  return {
    title: body.title,
    description: body.description,
    category: body.category,
    tags,
    targetAudience,
    status: body.status || 'TESTING',
    videoUrl: body.videoUrl || '',
    docContent: body.docContent || '',
    docFile,
    updatedAt: body.updatedAt || new Date(),
  };
};

app.post('/api/features', async (req, res) => {
  try {
    const id = req.body.id || crypto.randomUUID();
    const payload = normalizeFeaturePayload(req.body);
    const { rows: posRows } = await pool.query('SELECT COALESCE(MAX(position),0)+1 AS next_pos FROM features');
    const position = posRows[0].next_pos || 1;
    const { rows } = await pool.query(
      `INSERT INTO features (id, title, description, category, tags, target_audience, status, video_url, doc_content, doc_file, position, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        id,
        payload.title,
        payload.description,
        payload.category,
        payload.tags,
        payload.targetAudience,
        payload.status,
        payload.videoUrl,
        payload.docContent,
        payload.docFile,
        position,
        payload.updatedAt,
      ]
    );
    res.status(201).json(mapFeature(rows[0]));
  } catch (err) {
    console.error('Failed to create feature', err);
    res.status(400).json({ error: 'Failed to create feature' });
  }
});

app.put('/api/features/:id', async (req, res) => {
  try {
    const payload = normalizeFeaturePayload(req.body);
    const { rows } = await pool.query(
      `UPDATE features
       SET title=$1, description=$2, category=$3, tags=$4, target_audience=$5, status=$6, video_url=$7, doc_content=$8, doc_file=$9, updated_at=$10
       WHERE id=$11 RETURNING *`,
      [
        payload.title,
        payload.description,
        payload.category,
        payload.tags,
        payload.targetAudience,
        payload.status,
        payload.videoUrl,
        payload.docContent,
        payload.docFile,
        payload.updatedAt,
        req.params.id,
      ]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Feature not found' });
    res.json(mapFeature(rows[0]));
  } catch (err) {
    console.error('Failed to update feature', err);
    res.status(400).json({ error: 'Failed to update feature' });
  }
});

app.post('/api/features/reorder', async (req, res) => {
  const ids = req.body.ids || [];
  if (!Array.isArray(ids) || ids.length === 0) return res.json({ ok: true });
  const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS c FROM features');
  const total = countRows[0].c || ids.length;
  await pool.query(
    `WITH ord AS (
       SELECT * FROM unnest($1::text[]) WITH ORDINALITY t(id, ord)
     )
     UPDATE features f
     SET position = (SELECT (SELECT COUNT(*) FROM ord) - ord + 1 FROM ord WHERE ord.id = f.id)
     WHERE f.id IN (SELECT id FROM ord)`,
    [ids]
  );
  res.json({ ok: true });
});

app.delete('/api/features/:id', async (req, res) => {
  await pool.query('DELETE FROM features WHERE id=$1', [req.params.id]);
  res.status(204).end();
});

// Users
app.get('/api/users', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  res.json(rows.map(mapUser));
});

app.post('/api/users', async (req, res) => {
  try {
    const {
      name,
      email,
      role = 'STAFF',
      isActive = true,
      avatarUrl = '',
      password = '123456',
    } = req.body;
    const id = req.body.id || crypto.randomUUID();
    const createdAt = req.body.createdAt || new Date();

    const { rows } = await pool.query(
      `INSERT INTO users (id, name, email, role, is_active, created_at, avatar_url, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, name, email, role, isActive, createdAt, avatarUrl, password]
    );
    res.status(201).json(mapUser(rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      // Unique constraint violation (e.g., email already exists)
      return res.status(409).json({ error: 'Email 已存在，請使用其他帳號' });
    }
    console.error('Failed to create user', err);
    res.status(400).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { name, email, role, isActive, avatarUrl, password } = req.body;
  const { rows } = await pool.query(
    `UPDATE users
     SET name=$1, email=$2, role=$3, is_active=$4, avatar_url=$5, password=COALESCE($6, password)
     WHERE id=$7 RETURNING *`,
    [name, email, role, isActive, avatarUrl, password, req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  res.json(mapUser(rows[0]));
});

app.delete('/api/users/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.status(204).end();
});

app.post('/api/users/:id/reset-password', async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE users SET password='123456' WHERE id=$1 RETURNING *`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ ok: true });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const userRow = rows[0];
  if (!userRow || !userRow.is_active) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (userRow.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json(mapUser(userRow));
});

// Partner Links
app.get('/api/links', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM partner_links ORDER BY position DESC, created_at DESC');
  res.json(rows.map(mapLink));
});

app.post('/api/links', async (req, res) => {
  const {
    title,
    description,
    url,
    category,
    visibleTo = ['ADMIN', 'STAFF'],
    isActive = true,
  } = req.body;
  const id = req.body.id || crypto.randomUUID();
  const { rows: posRows } = await pool.query('SELECT COALESCE(MAX(position),0)+1 AS next_pos FROM partner_links');
  const position = posRows[0].next_pos || 1;

  const { rows } = await pool.query(
    `INSERT INTO partner_links (id, title, description, url, category, visible_to, is_active, position)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, title, description, url, category, visibleTo, isActive, position]
  );
  res.status(201).json(mapLink(rows[0]));
});

app.put('/api/links/:id', async (req, res) => {
  const { title, description, url, category, visibleTo = [], isActive = true } = req.body;
  const { rows } = await pool.query(
    `UPDATE partner_links
     SET title=$1, description=$2, url=$3, category=$4, visible_to=$5, is_active=$6
     WHERE id=$7 RETURNING *`,
    [title, description, url, category, visibleTo, isActive, req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Link not found' });
  res.json(mapLink(rows[0]));
});

app.delete('/api/links/:id', async (req, res) => {
  await pool.query('DELETE FROM partner_links WHERE id=$1', [req.params.id]);
  res.status(204).end();
});

app.post('/api/links/reorder', async (req, res) => {
  const ids = req.body.ids || [];
  if (!Array.isArray(ids) || ids.length === 0) return res.json({ ok: true });
  await pool.query(
    `WITH ord AS (
       SELECT * FROM unnest($1::text[]) WITH ORDINALITY t(id, ord)
     )
     UPDATE partner_links l
     SET position = (SELECT (SELECT COUNT(*) FROM ord) - ord + 1 FROM ord WHERE ord.id = l.id)
     WHERE l.id IN (SELECT id FROM ord)`,
    [ids]
  );
  res.json({ ok: true });
});

// Config (categories / audiences)
app.get('/api/config/feature-categories', async (req, res) => {
  const { rows } = await pool.query('SELECT value FROM feature_categories ORDER BY position, value');
  res.json(rows.map((r) => r.value));
});

app.put('/api/config/feature-categories', async (req, res) => {
  const items = req.body.items || [];
  await pool.query('DELETE FROM feature_categories');
  if (items.length) {
    await pool.query(
      `WITH ord AS (
         SELECT * FROM unnest($1::text[]) WITH ORDINALITY t(value, position)
       )
       INSERT INTO feature_categories (value, position)
       SELECT value, position-1 FROM ord`,
      [items]
    );
  }
  res.json({ ok: true });
});

app.get('/api/config/feature-audiences', async (req, res) => {
  const { rows } = await pool.query('SELECT value FROM feature_audiences ORDER BY position, value');
  res.json(rows.map((r) => r.value));
});

app.put('/api/config/feature-audiences', async (req, res) => {
  const items = req.body.items || [];
  await pool.query('DELETE FROM feature_audiences');
  if (items.length) {
    await pool.query(
      `WITH ord AS (
         SELECT * FROM unnest($1::text[]) WITH ORDINALITY t(value, position)
       )
       INSERT INTO feature_audiences (value, position)
       SELECT value, position-1 FROM ord`,
      [items]
    );
  }
  res.json({ ok: true });
});

app.get('/api/config/link-categories', async (req, res) => {
  const { rows } = await pool.query('SELECT value FROM link_categories ORDER BY position, value');
  res.json(rows.map((r) => r.value));
});

app.put('/api/config/link-categories', async (req, res) => {
  const items = req.body.items || [];
  await pool.query('DELETE FROM link_categories');
  if (items.length) {
    await pool.query(
      `WITH ord AS (
         SELECT * FROM unnest($1::text[]) WITH ORDINALITY t(value, position)
       )
       INSERT INTO link_categories (value, position)
       SELECT value, position-1 FROM ord`,
      [items]
    );
  }
  res.json({ ok: true });
});

async function start() {
  await ensureTables();
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
