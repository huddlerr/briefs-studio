import { loadBriefs } from '../server/db-adapter.js';

export default async function handler(req, res) {
  // CORS Headers for Vercel Serverless
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const briefs = await loadBriefs();
    // Return standard representation: a JSON object with briefs array or directly standard briefs array
    // To match index.html's expected data format, it can return { briefs } or a list. Let's return { briefs } to match index.html structure!
    // Wait, let's verify what index.html expects or if returning the array directly is cleaner.
    // If we return { briefs: [...] }, it perfectly matches both briefs.json and what index.html's hardcoded data is.
    // Let's return { briefs: briefs } so that it aligns 100% with briefs.json schema!
    return res.status(200).json({ briefs });
  } catch (error) {
    console.error('[api-briefs] Failed to load briefs:', error);
    return res.status(500).json({ error: error.message });
  }
}
