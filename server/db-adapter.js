import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless environment, files are in process.cwd().
// In local Node server environment, files are relative to rootDir.
const rootDir = process.env.VERCEL
  ? process.cwd()
  : path.resolve(__dirname, '..');

const DB_PATH = path.join(rootDir, 'server', 'db-vectors.json');
const MANIFEST_PATH = path.join(rootDir, 'briefs.json');
const LANDING_PAGE_PATH = path.join(rootDir, 'index.html');

// Lazy-loaded TCP Pool
let pool = null;

function getPool() {
  if (pool) return pool;

  // Read DATABASE_URL or build it dynamically from SUPABASE_URL & known project password
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString && process.env.SUPABASE_URL) {
    try {
      const match = process.env.SUPABASE_URL.match(/https:\/\/([a-z0-9]+)\.supabase\.(co|net)/);
      if (match) {
        const projectId = match[1];
        connectionString = `postgresql://postgres:BriefsStudio2026!@db.${projectId}.supabase.co:5432/postgres`;
      }
    } catch (e) {
      console.warn('[db-adapter] Failed to parse SUPABASE_URL for dynamic pg connection string.');
    }
  }

  if (connectionString) {
    console.log('[db-adapter] Initializing native PostgreSQL connection pool...');
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('[db-adapter] Idle client pool error:', err.message);
    });
  }
  return pool;
}

/**
 * Loads the local JSON files and merges briefs from the manifest and vectors databases.
 */
async function loadLocalBriefsMerged() {
  try {
    const manifestData = await fs.readFile(MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(manifestData);
    
    let dbVectors = { briefs: [] };
    try {
      const dbVectorsData = await fs.readFile(DB_PATH, 'utf-8');
      dbVectors = JSON.parse(dbVectorsData);
    } catch (err) {
      console.warn('[db-adapter] Local db-vectors.json not found or invalid, using empty vectors fallback.');
    }

    const merged = manifest.briefs.map(mb => {
      const vb = dbVectors.briefs.find(v => v.id === mb.id);
      return {
        ...mb,
        ...(vb || {})
      };
    });
    
    return merged;
  } catch (err) {
    console.error('[db-adapter] Failed to load local briefs:', err.message);
    return [];
  }
}

/**
 * Seeds a newly provisioned Supabase table with existing local briefs directly over TCP.
 */
async function seedSupabaseDirect(briefs, activePool) {
  try {
    console.log(`[db-adapter] Seeding Supabase database with ${briefs.length} briefs via pg client...`);
    
    for (const b of briefs) {
      const queryText = `
        INSERT INTO public.briefs (id, title, client, path, type, date, description, tags, style, notes, archetype, structured, embedding)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING;
      `;
      const values = [
        b.id,
        b.title,
        b.client,
        b.path,
        b.type,
        b.date,
        b.description,
        JSON.stringify(b.tags || []),
        JSON.stringify(b.style || {}),
        b.notes || null,
        b.archetype || null,
        JSON.stringify(b.structured || {}),
        b.embedding ? `[${b.embedding.join(',')}]` : null
      ];
      await activePool.query(queryText, values);
    }
    console.log('[db-adapter] Successfully seeded Supabase over native pg pool.');
  } catch (err) {
    console.error('[db-adapter] Direct seeding failed:', err.message);
  }
}

/**
 * REST Public API query fallback if direct TCP connection fails (e.g. corporate firewall blocks port 5432).
 */
async function loadBriefsFallbackREST() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      console.log('[db-adapter] Performing stateless REST API query fallback...');
      const res = await fetch(`${supabaseUrl}/rest/v1/briefs?select=*`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`REST fallback failed: ${res.statusText}`);
      const data = await res.json();
      console.log(`[db-adapter] REST Fallback successfully fetched ${data.length} briefs.`);
      return data;
    } catch (err) {
      console.error('[db-adapter] REST API query fallback failed. Falling back to local filesystem:', err.message);
      return await loadLocalBriefsMerged();
    }
  }
  return await loadLocalBriefsMerged();
}

/**
 * REST Public API save fallback if direct SQL insert fails.
 */
async function saveBriefRESTFallback(newBrief) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      console.log('[db-adapter] Performing stateless REST API insert fallback...');
      const res = await fetch(`${supabaseUrl}/rest/v1/briefs`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(newBrief)
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`REST save failed: ${res.statusText} - ${errMsg}`);
      }
      console.log('[db-adapter] REST Fallback successfully saved brief.');
      
      if (!process.env.VERCEL) {
        await saveLocalBrief(newBrief);
      }
      return true;
    } catch (err) {
      console.error('[db-adapter] REST save fallback failed. Writing locally:', err.message);
      return await saveLocalBrief(newBrief);
    }
  }
  return await saveLocalBrief(newBrief);
}

/**
 * Saves a brief locally (manifest, vectors database, and index.html).
 */
async function saveLocalBrief(newBrief) {
  try {
    // 1. Load existing db-vectors.json
    let dbVectors = { briefs: [] };
    try {
      const dbVectorsData = await fs.readFile(DB_PATH, 'utf-8');
      dbVectors = JSON.parse(dbVectorsData);
    } catch (err) {
      // ignore, start new
    }

    // Upsert in db-vectors.json
    const existingVecIndex = dbVectors.briefs.findIndex(b => b.id === newBrief.id);
    if (existingVecIndex !== -1) {
      dbVectors.briefs[existingVecIndex] = newBrief;
    } else {
      dbVectors.briefs.push(newBrief);
    }
    await fs.writeFile(DB_PATH, JSON.stringify(dbVectors, null, 2), 'utf-8');
    console.log('[db-adapter] Saved to local db-vectors.json');

    // 2. Load and update briefs.json manifest
    let manifest = { briefs: [] };
    try {
      const manifestData = await fs.readFile(MANIFEST_PATH, 'utf-8');
      manifest = JSON.parse(manifestData);
    } catch (err) {
      // ignore
    }

    const manifestEntry = {
      id: newBrief.id,
      title: newBrief.title,
      client: newBrief.client,
      path: newBrief.path,
      type: newBrief.type,
      date: newBrief.date,
      description: newBrief.description,
      tags: newBrief.tags,
      style: newBrief.style
    };

    const existingManifestIndex = manifest.briefs.findIndex(b => b.id === newBrief.id);
    if (existingManifestIndex !== -1) {
      manifest.briefs[existingManifestIndex] = manifestEntry;
    } else {
      manifest.briefs.unshift(manifestEntry);
    }
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 4), 'utf-8');
    console.log('[db-adapter] Registered in briefs.json manifest');

    // 3. Update index.html hardcoded briefs array to preserve absolute offline resilience
    try {
      let indexHtml = await fs.readFile(LANDING_PAGE_PATH, 'utf-8');
      const startTag = '"briefs": [';
      const startIndex = indexHtml.indexOf(startTag);
      if (startIndex !== -1) {
        const insertionPoint = startIndex + startTag.length;
        
        // Format the new card object beautifully
        const newCardText = `\n                    {
                        "id": "${manifestEntry.id}",
                        "title": "${manifestEntry.title}",
                        "client": "${manifestEntry.client}",
                        "path": "${manifestEntry.path}",
                        "type": "${manifestEntry.type}",
                        "date": "${manifestEntry.date}",
                        "description": "${manifestEntry.description.replace(/"/g, '\\"')}",
                        "tags": ${JSON.stringify(manifestEntry.tags)},
                        "style": ${JSON.stringify(manifestEntry.style)}
                    },`;
                    
        indexHtml = indexHtml.slice(0, insertionPoint) + newCardText + indexHtml.slice(insertionPoint);
        await fs.writeFile(LANDING_PAGE_PATH, indexHtml, 'utf-8');
        console.log('[db-adapter] Synced landing page index.html with new brief');
      }
    } catch (err) {
      console.error('[db-adapter] Failed to update index.html:', err.message);
    }

    return true;
  } catch (err) {
    console.error('[db-adapter] Failed to save local brief:', err.message);
    throw err;
  }
}

/**
 * Loads all briefs from either pg Pool, Supabase REST, or local files.
 */
export async function loadBriefs() {
  const activePool = getPool();
  if (activePool) {
    try {
      console.log('[db-adapter] Fetching briefs via native PostgreSQL pool...');
      const res = await activePool.query('SELECT * FROM public.briefs ORDER BY date DESC, id DESC');
      
      if (res.rows.length === 0) {
        console.log('[db-adapter] Supabase table is empty. Auto-seeding local library...');
        const localBriefs = await loadLocalBriefsMerged();
        if (localBriefs.length > 0) {
          await seedSupabaseDirect(localBriefs, activePool);
          return localBriefs;
        }
      }
      
      // Parse JSON fields properly for consistency
      return res.rows.map(row => ({
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
        style: typeof row.style === 'string' ? JSON.parse(row.style) : row.style,
        structured: typeof row.structured === 'string' ? JSON.parse(row.structured) : row.structured,
        // Convert pg vector representation string e.g. "[1.2, 3.4]" to float array
        embedding: typeof row.embedding === 'string' 
          ? row.embedding.replace(/[\[\]]/g, '').split(',').map(Number) 
          : row.embedding
      }));
    } catch (err) {
      console.warn('[db-adapter] Pool query failed, rolling back to stateless REST:', err.message);
      return await loadBriefsFallbackREST();
    }
  }
  return await loadLocalBriefsMerged();
}

/**
 * Saves a brief to Supabase cloud database over direct SQL, falling back to REST/JSON.
 */
export async function saveBriefBrief(newBrief) {
  const activePool = getPool();
  if (activePool) {
    try {
      console.log('[db-adapter] Saving brief to Supabase via native SQL pool...');
      const queryText = `
        INSERT INTO public.briefs (id, title, client, path, type, date, description, tags, style, notes, archetype, structured, embedding)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          client = EXCLUDED.client,
          path = EXCLUDED.path,
          type = EXCLUDED.type,
          date = EXCLUDED.date,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          style = EXCLUDED.style,
          notes = EXCLUDED.notes,
          archetype = EXCLUDED.archetype,
          structured = EXCLUDED.structured,
          embedding = EXCLUDED.embedding;
      `;
      const values = [
        newBrief.id,
        newBrief.title,
        newBrief.client,
        newBrief.path,
        newBrief.type,
        newBrief.date,
        newBrief.description,
        JSON.stringify(newBrief.tags || []),
        JSON.stringify(newBrief.style || {}),
        newBrief.notes || null,
        newBrief.archetype || null,
        JSON.stringify(newBrief.structured || {}),
        newBrief.embedding ? `[${newBrief.embedding.join(',')}]` : null
      ];

      await activePool.query(queryText, values);
      console.log('[db-adapter] Direct SQL insert successful.');

      if (!process.env.VERCEL) {
        try {
          await saveLocalBrief(newBrief);
        } catch (localErr) {
          console.warn('[db-adapter] Local backup sync failed:', localErr.message);
        }
      }
      return true;
    } catch (err) {
      console.error('[db-adapter] Direct SQL save failed. Rolling back to REST fallback:', err.message);
      return await saveBriefRESTFallback(newBrief);
    }
  }
  return await saveLocalBrief(newBrief);
}

export const saveBrief = saveBriefBrief;
