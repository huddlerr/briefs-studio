import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
 * Seeds a newly provisioned Supabase table with existing local briefs.
 */
async function seedSupabase(briefs, supabaseUrl, supabaseAnonKey) {
  try {
    console.log(`[db-adapter] Seeding Supabase with ${briefs.length} briefs...`);
    const res = await fetch(`${supabaseUrl}/rest/v1/briefs`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(briefs)
    });

    if (!res.ok) {
      const errMsg = await res.text();
      throw new Error(`Seeding failed: ${res.statusText} - ${errMsg}`);
    }
    console.log('[db-adapter] Successfully seeded Supabase.');
  } catch (err) {
    console.error('[db-adapter] Error seeding Supabase:', err.message);
  }
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
 * Loads all briefs from either Supabase or local files.
 * If Supabase is configured and empty, it seeds it automatically with merged local briefs.
 */
export async function loadBriefs() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    console.log('[db-adapter] Supabase environment detected. Fetching briefs from cloud...');
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/briefs?select=*`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Supabase query failed: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`[db-adapter] Fetched ${data.length} briefs from Supabase.`);

      if (data.length === 0) {
        console.log('[db-adapter] Supabase table is empty. Auto-seeding with local brief library...');
        const localBriefs = await loadLocalBriefsMerged();
        if (localBriefs.length > 0) {
          await seedSupabase(localBriefs, supabaseUrl, supabaseAnonKey);
          return localBriefs;
        }
      }
      return data;
    } catch (err) {
      console.error('[db-adapter] Failed to load briefs from Supabase, falling back to local JSON filesystem:', err.message);
      return await loadLocalBriefsMerged();
    }
  } else {
    console.log('[db-adapter] Supabase credentials not found. Utilizing local JSON filesystem...');
    return await loadLocalBriefsMerged();
  }
}

/**
 * Saves a brief to Supabase cloud database if available, falling back to local filesystem.
 */
export async function saveBriefBrief(newBrief) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    console.log('[db-adapter] Saving brief to Supabase cloud...');
    try {
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
        throw new Error(`Save failed: ${res.statusText} - ${errMsg}`);
      }
      console.log('[db-adapter] Successfully saved brief to Supabase.');
      
      // Still write to local files if we are running in local server mode (not serverless)
      // to keep local files synchronized for Git commits or offline backups.
      if (!process.env.VERCEL) {
        try {
          await saveLocalBrief(newBrief);
        } catch (localErr) {
          console.warn('[db-adapter] Local backup sync failed (expected in read-only clouds):', localErr.message);
        }
      }
      return true;
    } catch (err) {
      console.error('[db-adapter] Failed to save brief to Supabase, falling back to local files...', err.message);
      return await saveLocalBrief(newBrief);
    }
  } else {
    console.log('[db-adapter] Supabase credentials not found. Saving to local files...');
    return await saveLocalBrief(newBrief);
  }
}

export const saveBrief = saveBriefBrief;
