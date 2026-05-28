import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadBriefs, saveBriefBrief } from './db-adapter.js';
import { validateIncubationPayload } from './validation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static files from the project root (dashboard index.html, active/, archive/, etc.)
app.use(express.static(rootDir));

// Database paths
const DB_PATH = path.join(__dirname, 'db-vectors.json');
const MANIFEST_PATH = path.join(rootDir, 'briefs.json');
const LANDING_PAGE_PATH = path.join(rootDir, 'index.html');

// Helper to load/save database
async function loadDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If not found, return empty base structure
    return { briefs: [] };
  }
}

async function saveDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// Simple Cosine Similarity
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

// Fallback Keyword Similarity (TF-IDF/Term Overlap)
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

// Retrieve OpenAI Embedding
async function getEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY;
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
    
    if (!res.ok) throw new Error(`Embedding API error: ${res.statusText}`);
    const data = await res.json();
    return data.data[0].embedding;
  } catch (err) {
    console.error('Failed to retrieve vector embedding:', err);
    return null;
  }
}

// Dynamic briefs API endpoint
app.get('/api/briefs', async (req, res) => {
  try {
    const briefs = await loadBriefs();
    res.json({ briefs });
  } catch (err) {
    console.error('Failed to load briefs:', err);
    res.status(500).json({ error: err.message });
  }
});

// OpenAPI 3.0 Specification Endpoint
app.get('/api/openapi.json', (req, res) => {
  res.json({
    openapi: "3.0.3",
    info: {
      title: "Briefs Studio Bespoke Strategy API",
      description: "Production-grade, agent-friendly AI-ingestion and directory catalog API for managing high-stakes client briefs.",
      version: "1.0.0"
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local Development Server"
      },
      {
        url: "https://briefs-studio-bxkq.onrender.com",
        description: "Production Cloud Server"
      }
    ],
    paths: {
      "/api/briefs": {
        "get": {
          "summary": "Retrieve Strategy Briefs Directory",
          "description": "Fetch the entire catalog of high-stakes corporate strategy briefs from the database.",
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "briefs": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Brief"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/incubate": {
        "post": {
          "summary": "Incubate Stated Client Notes",
          "description": "Translates raw customer workshops/meeting transcripts into fully articulated strategy dossiers using AI and few-shot vector context.",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "notes": {
                      "type": "string",
                      "description": "Raw, stated client workshop notes or meeting transcript."
                    },
                    "archetype": {
                      "type": "string",
                      "description": "Strategic framework archetype.",
                      "enum": ["Systems Integrator", "Creative Strategist", "Operations Orchestrator", "Narrative Architect"]
                    }
                  },
                  "required": ["notes"]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Successfully incubated strategic brief",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Brief"
                  }
                }
              }
            },
            "400": {
              "description": "Validation error (malformed payload)"
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "Brief": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "title": { "type": "string" },
            "client": { "type": "string" },
            "path": { "type": "string" },
            "type": { "type": "string" },
            "date": { "type": "string" },
            "description": { "type": "string" },
            "tags": { "type": "array", "items": { "type": "string" } },
            "style": { "type": "object" },
            "notes": { "type": "string" },
            "archetype": { "type": "string" },
            "structured": { "type": "object" }
          }
        }
      }
    }
  });
});

// Interactive Swagger UI Dashboard Route (100% Zero-Dependency)
app.get('/api/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Briefs Studio API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
        <style>
          body {
            margin: 0;
            background: #0b0b10;
          }
          /* Custom Dark Mode Styling for Swagger UI */
          .swagger-ui {
            filter: invert(88%) hue-rotate(180deg);
          }
          .swagger-ui .topbar {
            display: none;
          }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
        <script>
            window.onload = () => {
                window.ui = SwaggerUIBundle({
                    url: '/api/openapi.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis
                    ],
                    layout: "BaseLayout"
                });
            };
        </script>
    </body>
    </html>
  `);
});

// Main AI Ingestion Pipeline
app.post('/api/incubate', validateIncubationPayload, async (req, res) => {
  const { notes, archetype } = req.body;

  console.log(`[incubator] Starting incubation session for Archetype: ${archetype}`);

  try {
    const briefs = await loadBriefs();
    
    // --- STEP 1: SEMANTIC MATCHING (NEURAL MEMORY) ---
    let fewShotExamples = [];
    const newEmbedding = await getEmbedding(notes);
    
    if (newEmbedding && briefs.length > 0) {
      console.log('[incubator] Running neural semantic matching across vector library...');
      const scored = briefs
        .map(b => ({
          brief: b,
          score: b.embedding ? cosineSimilarity(newEmbedding, b.embedding) : 0
        }))
        .sort((a, b) => b.score - a.score);
        
      fewShotExamples = scored.slice(0, 2).map(s => s.brief);
      console.log(`[incubator] Top semantic match: "${fewShotExamples[0]?.title}" (Score: ${scored[0]?.score.toFixed(3)})`);
    } else {
      console.log('[incubator] Running keyword overlap matching fallback...');
      const scored = briefs
        .map(b => ({
          brief: b,
          score: computeKeywordSimilarity(notes, b.notes || '')
        }))
        .sort((a, b) => b.score - a.score);
        
      fewShotExamples = scored.slice(0, 2).map(s => s.brief);
      console.log(`[incubator] Top keyword match: "${fewShotExamples[0]?.title}"`);
    }

    // Prepare context prompt matching target client and goals
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

    // --- STEP 2: CALL LLM ENGINE (Gemini, Anthropic, or OpenAI) ---
    let structuredResult = null;
    const systemPrompt = `You are the Briefs Studio AI Engine. Your task is to apply "Story Forensics" and "Narrative Architecture" skills to translate raw client meeting notes into a premium, high-stakes digital strategy map.

Archetype context: ${archetype}

Core Rules:
1. Reframe commodity terms into strategic infrastructure language (e.g., instead of "makes websites" -> "engineers digital communication command portals").
2. Enforce the structured Briefs Studio modules:
   - The Throughline: A single, sharp, authoritative sentence reframing the client's identity.
   - The Problem Layer: Must show three tiers of friction (Surface Level -> Deeper Operational Level -> Structural System Constraint).
   - The Path: The absolute operational "How" of the solution.
   - The Purpose: The legacy "50-year test" and the immediate "Why".
   - The Roadmap: An 18-month tactical roadmap divided into 3 milestones.
3. Respond ONLY in valid JSON matching this schema:
{
  "clientName": "Clean Name of client",
  "projectTitle": "Dynamic high-end title (e.g., Narrative Systems Map)",
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
      console.log('[incubator] Invoking Anthropic Claude engine...');
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
      console.log('[incubator] Invoking OpenAI GPT-4o engine...');
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
      console.log('[incubator] Invoking Google Gemini engine...');
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
      // Mock Fallback if no keys are provided to ensure the product ALWAYS runs
      console.log('[incubator] No API keys active. Operating in simulated offline mode...');
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

    console.log('[incubator] Narrative structured successfully:', structuredResult);

    // --- STEP 3: RENDER THE Bespoke BRIEF HTML FILE ---
    const clientSlug = structuredResult.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const briefDir = path.join(rootDir, 'active', clientSlug);
    await fs.mkdir(briefDir, { recursive: true });

    // Gorgeous Premium Dark template
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
                <span class="font-mono text-[9px] uppercase tracking-[0.3em] text-brandAccent block mb-1">Briefs Studio bespoke map // active</span>
                <h1 class="font-serif text-4xl md:text-5xl font-bold text-bright">${structuredResult.projectTitle}</h1>
            </div>
            <a href="../../index.html" class="font-mono text-[9px] text-muted hover:text-brandAccent uppercase tracking-widest">Directory ➔</a>
        </header>

        <main class="flex flex-col gap-12">
            <!-- Throughline -->
            <section class="border-l-2 border-brandAccent/60 pl-6 py-2">
                <span class="font-mono text-[9px] uppercase tracking-wider text-muted">// THE THROUGHLINE</span>
                <p class="font-serif text-2xl md:text-3xl text-bright leading-snug italic mt-2">
                    "${structuredResult.throughline}"
                </p>
            </section>

            <!-- Problem Layer -->
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

            <!-- Path & Purpose -->
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

            <!-- Roadmap -->
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
            &copy; 2026 Briefs Studio // Central Ingestion Platform
        </footer>
    </div>
</body>
</html>`;

    const briefFilePath = path.join(briefDir, 'index.html');
    await fs.writeFile(briefFilePath, briefHtml, 'utf-8');
    console.log(`[incubator] Created bespoke digital brief: ${briefFilePath}`);

    // --- STEP 4 & 5: PERSIST BRIEF VIA UNIFIED DATABASE ADAPTER ---
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
      embedding: newEmbedding
    };
    
    await saveBriefBrief(newBriefEntry);

    res.json(newBriefEntry);

  } catch (error) {
    console.error('[incubator] Fatal error during incubation process:', error);
    res.status(500).json({ error: error.message });
  }
});

// Centralized Express Global Error Handler
app.use((err, req, res, next) => {
  console.error('[server-error] Unhandled error encountered:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    status: err.status || 500,
    timestamp: new Date().toISOString(),
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Briefs Studio Bespoke Brief Server Running Successfully`);
  console.log(`📂 Serving static workspace files from root`);
  console.log(`🌐 Live Dashboard: http://localhost:${PORT}`);
  console.log(`📖 Interactive API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`🧪 Incubation Endpoint: http://localhost:${PORT}/api/incubate`);
  console.log(`======================================================\n`);
});
