#!/usr/bin/env node

/**
 * Briefs Studio - Production-Grade Agent CLI Tool
 * Allows humans and AI agents to query the strategy briefs directory, 
 * run semantic/keyword searches, and trigger Strategy Incubation natively from the terminal.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadBriefs } from '../server/db-adapter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

// Route commands
switch (command.toLowerCase()) {
  case 'list':
    await handleList();
    break;
  case 'search':
    await handleSearch(args.slice(1).join(' '));
    break;
  case 'incubate':
    await handleIncubate(args[1], args[2]);
    break;
  default:
    console.error(`❌ Unknown command: "${command}"`);
    printHelp();
    process.exit(1);
}

function printHelp() {
  console.log(`
======================================================================
💼 Briefs Studio - Agent Terminal Command Line Interface (CLI)
======================================================================
Usage:
  npm run briefs -- <command> [arguments]

Commands:
  list                           Pretty-prints the entire strategy directory
  search "<query>"               Filters strategy briefs by keyword matches
  incubate "<notes>" [archetype]  Triggers the AI ingestion pipeline on notes

Examples:
  npm run briefs -- list
  npm run briefs -- search "Elizabeth"
  npm run briefs -- incubate "Faizan Ahmed's strategic printmaking notes" "Systems Integrator"
======================================================================
  `);
}

async function handleList() {
  console.log('🔍 Fetching strategy briefs from database...');
  try {
    const briefs = await loadBriefs();
    if (briefs.length === 0) {
      console.log('⚠️ Strategy directory is currently empty.');
      return;
    }

    console.log(`\n📂 Strategy briefs Directory (${briefs.length} briefs found):\n`);
    printTable(briefs);
  } catch (err) {
    console.error('❌ Failed to list briefs:', err.message);
  }
}

async function handleSearch(query) {
  if (!query) {
    console.error('❌ Error: Search query is strictly required. Example: npm run briefs -- search "Elizabeth"');
    process.exit(1);
  }

  console.log(`🔍 Searching strategy briefs for: "${query}"...`);
  try {
    const briefs = await loadBriefs();
    const tokens = query.toLowerCase().split(/\s+/);
    
    const results = briefs.filter(b => {
      const searchTarget = `
        ${b.title} 
        ${b.client} 
        ${b.description} 
        ${b.type} 
        ${(b.tags || []).join(' ')} 
        ${b.notes || ''} 
        ${b.structured?.throughline || ''}
      `.toLowerCase();
      return tokens.every(token => searchTarget.includes(token));
    });

    if (results.length === 0) {
      console.log(`\n❌ No briefs found matching query: "${query}"`);
      return;
    }

    console.log(`\n🎉 Found ${results.length} matching briefs:\n`);
    printTable(results);
  } catch (err) {
    console.error('❌ Search operation failed:', err.message);
  }
}

async function handleIncubate(notes, archetype = 'Systems Integrator') {
  if (!notes) {
    console.error('❌ Error: Raw stated notes are required. Example: npm run briefs -- incubate "Faizan notes" "Systems Integrator"');
    process.exit(1);
  }

  console.log(`⚡ Dispatching Strategy Incubation Session...`);
  console.log(`📂 Archetype: "${archetype}"`);
  console.log(`📝 Stated Notes: "${notes.substring(0, 80)}..."`);
  console.log('⏳ Processing AI Strategy Pipeline (may take a few seconds)...');

  try {
    // Dispatch request directly to local running server to guarantee clean orchestration, 
    // or trigger it programmatically if no local server is listening.
    const res = await fetch('http://localhost:4000/api/incubate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notes, archetype })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    console.log('\n======================================================================');
    console.log('🎉 SUCCESS! AI STRATEGY DOSSIER INCUBATED SUCCESSFULLY');
    console.log('======================================================================');
    console.log(`💼 Client Name:   ${data.client}`);
    console.log(`📁 Project Title: ${data.title}`);
    console.log(`🔗 Digital Map:   ${data.path}`);
    console.log(`📅 Date:          ${data.date}`);
    console.log(`\n🔮 THE THROUGHLINE:\n"${data.description}"`);
    console.log('======================================================================\n');
  } catch (err) {
    console.error('\n❌ Ingestion Incomplete:', err.message);
    console.log('👉 Please ensure the Briefs Studio server is running locally on port 4000 (`npm start`).');
  }
}

function printTable(briefs) {
  // Simple clean console-friendly table formatter
  const colWidths = { id: 18, client: 16, title: 32, type: 16 };
  
  // Print Header
  const pad = (str, width) => (str || '').substring(0, width).padEnd(width);
  console.log(
    `│ ${pad('CLIENTSlug / ID', colWidths.id)} │ ${pad('CLIENT', colWidths.client)} │ ${pad('PROJECT TITLE', colWidths.title)} │ ${pad('TYPE', colWidths.type)} │`
  );
  console.log(
    `├─${'─'.repeat(colWidths.id)}─┼─${'─'.repeat(colWidths.client)}─┼─${'─'.repeat(colWidths.title)}─┼─${'─'.repeat(colWidths.type)}─┤`
  );
  
  // Print Rows
  for (const b of briefs) {
    console.log(
      `│ ${pad(b.id, colWidths.id)} │ ${pad(b.client, colWidths.client)} │ ${pad(b.title, colWidths.title)} │ ${pad(b.type, colWidths.type)} │`
    );
  }
  console.log('');
}
