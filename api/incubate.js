import fs from 'fs/promises';
import path from 'path';

// Helper to compute cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Fallback keyword similarity
function computeKeywordSimilarity(textA, textB) {
  const getTokens = (txt) => new Set(txt.toLowerCase().match(/\w+/g) || []);
  const tokensA = getTokens(textA);
  const tokensB = getTokens(textB);
  
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }
  
  return intersection / Math.sqrt(tokensA.size * tokensB.size);
}

// Fetch vector embeddings
async function getEmbedding(text, apiKey) {
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.data[0].embedding;
  } catch (err) {
    return null;
  }
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { notes, archetype } = req.body;

  if (!notes) {
    return res.status(400).json({ error: 'Raw notes are required for incubation.' });
  }

  try {
    // Read pre-populated vector database
    const dbPath = path.join(process.cwd(), 'server', 'db-vectors.json');
    let db = { briefs: [] };
    try {
      const dbData = await fs.readFile(dbPath, 'utf-8');
      db = JSON.parse(dbData);
    } catch (err) {
      console.error("Vercel DB Load failed, proceeding with empty fallback database:", err.message);
    }

    // --- STEP 1: SEMANTIC MATCHING (NEURAL MEMORY) ---
    let fewShotExamples = [];
    const openAiKey = process.env.OPENAI_API_KEY;
    const newEmbedding = await getEmbedding(notes, openAiKey);

    if (newEmbedding && db.briefs.length > 0) {
      const scored = db.briefs
        .map(b => ({
          brief: b,
          score: b.embedding ? cosineSimilarity(newEmbedding, b.embedding) : 0
        }))
        .sort((a, b) => b.score - a.score);
        
      fewShotExamples = scored.slice(0, 2).map(s => s.brief);
    } else if (db.briefs.length > 0) {
      const scored = db.briefs
        .map(b => ({
          brief: b,
          score: computeKeywordSimilarity(notes, b.notes || '')
        }))
        .sort((a, b) => b.score - a.score);
        
      fewShotExamples = scored.slice(0, 2).map(s => s.brief);
    }

    let contextPrompt = '';
    if (fewShotExamples.length > 0) {
      contextPrompt = `\nUse these successful past reframing examples for context and style alignment:\n` +
        fewShotExamples.map((ex, i) => `
Example ${i + 1}:
Stated Notes: ${ex.notes || 'Unknown'}
Reframed Throughline: ${ex.structured.throughline}
Problem Layer: Surface: ${ex.structured.problem_layer.surface} -> Deeper: ${ex.structured.problem_layer.deeper} -> Structural: ${ex.structured.problem_layer.structural}
Roadmap: ${ex.structured.roadmap.join(', ')}
`).join('\n');
    }

    // --- STEP 2: CALL LLM ENGINE (Claude, OpenAI, or Gemini) ---
    let structuredResult = null;
    const systemPrompt = `You are the Briefs Studio AI Engine. Your task is to apply "Story Forensics" and "Narrative Architecture" skills to translate raw client meeting notes into a premium, high-stakes digital strategy map.

Archetype context: ${archetype}

Core Rules:
1. Reframe commodity terms into strategic infrastructure language (e.g., instead of "makes websites" -> "engineers digital communication command portals").
2. Enforce the structured modules:
   - The Throughline: A single, sharp, authoritative sentence reframing the client's identity.
   - The Problem Layer: Must show three tiers of friction (Surface Level -> Deeper Operational Level -> Structural System Constraint).
   - The Path: The absolute operational "How" of the solution.
   - The Purpose: The legacy "50-year test" and the immediate "Why".
   - The Roadmap: An 18-month tactical roadmap divided into 3 milestones.
3. Respond ONLY in valid JSON matching this schema:
{
  "clientName": "Clean Name of client",
  "projectTitle": "Dynamic title (e.g., Narrative Systems Map)",
  "throughline": "Single sharp reframing sentence",
  "problem_layer": {
    "surface": "Surface tier description",
    "deeper": "Deeper operational tier description",
    "structural": "Structural system constraint description"
  },
  "path": "The path forward",
  "purpose": "The ultimate legacy check",
  "roadmap": [
    "Milestone 1 (Months 1-6): Tactical implementation details",
    "Milestone 2 (Months 6-12): Scale implementation details",
    "Milestone 3 (Months 12-18): Core operational handoff"
  ],
  "colors": {
    "bg": "#0A0A0F",
    "border": "#F59E0B",
    "text": "#D2D2E6",
    "badgeBg": "#F59E0B",
    "accent": "#F59E0B"
  }
}`;

    const promptText = `Analyze these raw meeting notes and structure them according to our narrative guidelines:\n${notes}\n${contextPrompt}`;

    if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: 'user', content: promptText }]
        })
      });
      if (!res.ok) throw new Error(`Anthropic API error: ${res.statusText}`);
      const data = await res.json();
      const content = data.content[0].text;
      structuredResult = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));
    } else if (process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: promptText }
          ]
        })
      });
      if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
      const data = await res.json();
      structuredResult = JSON.parse(data.choices[0].message.content);
    } else if (process.env.GEMINI_API_KEY) {
      const model = 'gemini-1.5-pro';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nNotes:\n${promptText}` }]
          }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });
      if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
      const data = await res.json();
      const rawText = data.candidates[0].content.parts[0].text;
      structuredResult = JSON.parse(rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1));
    } else {
      // Mock Fallback
      const cleanName = notes.match(/Faizan/i) ? "Faizan Ahmed" : "Incubated Client";
      structuredResult = {
        clientName: cleanName,
        projectTitle: `${cleanName} // Narrative Systems Map`,
        throughline: `Transitioning from commodity fine-art layout development into high-performance enterprise narrative systems.`,
        problem_layer: {
          surface: "Perceived in market as a commodity front-end designer.",
          deeper: "Client workshops treat digital layouts as simple design deliverables rather than core strategy.",
          structural: "Structural systems misalignment between fine-art layout architecture and corporate consulting frameworks."
        },
        path: "Construct interactive visual command modules that demonstrate operational frameworks dynamically.",
        purpose: "Ensuring brand strategy maps remain highly authoritative, surviving executive iterations across a 50-year horizon.",
        roadmap: [
          "Milestone 1 (Months 1-6): Map layout parameters and establish basic vector-similarity templates.",
          "Milestone 2 (Months 6-12): Deploy interactive Strategy Sandbox across production web directory.",
          "Milestone 3 (Months 12-18): Calibrate system weights and automate Git deployment loops."
        ],
        colors: {
          bg: "#0D0D15",
          border: "#EBFF00",
          text: "#F8FAF2",
          badgeBg: "#EBFF00",
          accent: "#EBFF00"
        }
      };
    }

    // --- STEP 3: RENDER Bespoke BRIEF HTML ---
    const briefHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${structuredResult.projectTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Newsreader:ital,wght@0,300;0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        void: '#050507',
                        midnight: '${structuredResult.colors.bg}',
                        ink: '#D2D2E6',
                        bright: '#FFFFFF',
                        border: '#242435',
                        brandAccent: '${structuredResult.colors.accent}'
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        serif: ['Newsreader', 'serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: ${structuredResult.colors.bg};
            color: #D2D2E6;
        }
        .noise {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            opacity: 0.035;
            pointer-events: none;
            z-index: 9999;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
    </style>
</head>
<body class="font-sans antialiased min-h-screen p-8 md:p-16 relative">
    <div class="noise"></div>
    <div class="max-w-4xl mx-auto py-12">
        <header class="mb-16 border-b border-border/40 pb-8 flex justify-between items-end">
            <div>
                <span class="font-mono text-[9px] uppercase tracking-[0.3em] text-brandAccent block mb-1">bespoke brief // serverless</span>
                <h1 class="font-serif text-4xl md:text-5xl font-bold text-bright">${structuredResult.projectTitle}</h1>
            </div>
            <a href="#" onclick="window.close(); return false;" class="font-mono text-[9px] text-muted hover:text-brandAccent uppercase tracking-widest">Close Brief ➔</a>
        </header>

        <main class="flex flex-col gap-12">
            <section class="border-l-2 border-brandAccent/60 pl-6 py-2">
                <span class="font-mono text-[9px] uppercase tracking-wider text-muted">// THE THROUGHLINE</span>
                <p class="font-serif text-2xl md:text-3xl text-bright leading-snug italic mt-2">
                    "${structuredResult.throughline}"
                </p>
            </section>

            <section class="bg-white/5 border border-border/30 rounded-xl p-6 flex flex-col gap-4">
                <span class="font-mono text-[9px] uppercase tracking-wider text-brandAccent">// THE PROBLEM LAYER</span>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] leading-relaxed">
                    <div>
                        <span class="font-bold text-bright block mb-1">SURFACE LAYER</span>
                        <span class="text-muted">${structuredResult.problem_layer.surface}</span>
                    </div>
                    <div>
                        <span class="font-bold text-bright block mb-1">DEEPER LAYER</span>
                        <span class="text-muted">${structuredResult.problem_layer.deeper}</span>
                    </div>
                    <div>
                        <span class="font-bold text-bright block mb-1">STRUCTURAL LAYER</span>
                        <span class="text-muted">${structuredResult.problem_layer.structural}</span>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section class="border border-border/40 rounded-xl p-6 flex flex-col gap-2">
                    <span class="font-mono text-[9px] uppercase tracking-wider text-muted">// THE PATH</span>
                    <p class="text-xs text-bright leading-relaxed">${structuredResult.path}</p>
                </section>
                <section class="border border-border/40 rounded-xl p-6 flex flex-col gap-2">
                    <span class="font-mono text-[9px] uppercase tracking-wider text-muted">// THE PURPOSE</span>
                    <p class="text-xs text-bright leading-relaxed">${structuredResult.purpose}</p>
                </section>
            </div>

            <section class="flex flex-col gap-4">
                <span class="font-mono text-[9px] uppercase tracking-wider text-brandAccent">// 18-MONTH ROADMAP</span>
                <div class="flex flex-col gap-4 font-mono text-[10px]">
                    ${structuredResult.roadmap.map((milestone, idx) => `
                        <div class="flex gap-4 items-start border-b border-border/20 pb-4">
                            <span class="text-brandAccent font-bold">0${idx+1}</span>
                            <span class="text-bright">${milestone}</span>
                        </div>
                    `).join('')}
                </div>
            </section>
        </main>
        
        <footer class="mt-20 pt-8 border-t border-border/30 text-center font-mono text-[8px] uppercase tracking-widest text-muted">
            &copy; 2026 Briefs Studio // Serverless Cloud Platform
        </footer>
    </div>
</body>
</html>`;

    const clientSlug = structuredResult.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newBriefEntry = {
      id: `incubated-${Date.now()}`,
      notes: notes,
      archetype: archetype,
      title: structuredResult.projectTitle,
      client: structuredResult.clientName,
      path: `active/${clientSlug}/index.html`,
      type: "Incubated Brief",
      date: new Date().toISOString().split('T')[0],
      description: structuredResult.throughline,
      tags: ["Systems", "Identity", "Incubated"],
      style: {
        bg: structuredResult.colors.bg,
        border: structuredResult.colors.border,
        text: structuredResult.colors.text,
        badgeBg: structuredResult.colors.badgeBg,
        badgeText: "#000000",
        accent: structuredResult.colors.accent
      },
      structured: structuredResult,
      renderedHtml: briefHtml // Return HTML in Vercel Cloud Serverless response!
    };

    return res.status(200).json(newBriefEntry);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
