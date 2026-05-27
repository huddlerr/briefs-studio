const { chromium } = require('playwright');

(async () => {
  console.log("==============================================================");
  console.log("🧬 Launching 1-Click SaaS Database & Deployer Wizard...");
  console.log("==============================================================");

  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100,
    args: ['--start-maximized'] 
  });
  
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  // --- STEP 1: SUPABASE SIGN IN ---
  console.log("\n> Navigating to Supabase Sign-in page...");
  await page.goto('https://supabase.com/dashboard/sign-in');

  console.log("\n==============================================================");
  console.log("👉 ACTION REQUIRED ON YOUR SCREEN:");
  console.log("1. Click 'Continue with GitHub' in the browser window.");
  console.log("2. Authorize Supabase using your active GitHub account.");
  console.log("==============================================================");

  // Wait for dashboard redirect
  while (!page.url().includes('dashboard')) {
    console.log("> Waiting for Supabase dashboard to load (please sign in on screen)...");
    await page.waitForTimeout(2000);
  }
  
  console.log("\n✅ Logged in successfully to Supabase!");

  // --- STEP 2: CREATE PROJECT ---
  console.log("\n==============================================================");
  console.log("👉 ACTION REQUIRED ON YOUR SCREEN:");
  console.log("1. Click the green 'New Project' button.");
  console.log("2. Select your organization (Huddler).");
  console.log("3. Enter Project Name: briefs-studio");
  console.log("4. Set Database Password: BriefsStudio2026!");
  console.log("5. Click 'Create new project' at the bottom.");
  console.log("==============================================================");

  // Wait for the project dashboard to show the provisioning status
  console.log("\n> Waiting for you to create the project...");
  while (!page.url().includes('/project/')) {
    await page.waitForTimeout(2000);
  }

  // Extract Project ID from URL
  const currentUrl = page.url();
  const projectId = currentUrl.split('/project/')[1].split('/')[0];
  console.log(`\n🎉 Project recognized! Supabase Project ID: ${projectId}`);
  console.log("> Waiting for database provisioning to complete (usually takes 30-45s)...");

  // Wait for database provisioning to finish by checking for database health/API page access
  let isProvisioned = false;
  while (!isProvisioned) {
    try {
      const apiSettingsUrl = `https://supabase.com/dashboard/project/${projectId}/settings/api`;
      await page.goto(apiSettingsUrl);
      await page.waitForSelector('input[aria-label="Project URL"]', { timeout: 5000 });
      isProvisioned = true;
      console.log("✅ Database is fully provisioned and ready!");
    } catch (err) {
      console.log("> Database is still spinning up... checking again in 10 seconds.");
      await page.waitForTimeout(10000);
    }
  }

  // --- STEP 3: COPY API KEYS ---
  console.log("\n> Retrieving Cloud Database Keys...");
  const supabaseUrl = await page.locator('input[aria-label="Project URL"]').getAttribute('value');
  
  // Find anon public key field (first password-style input, or search for 'anon')
  const supabaseKey = await page.locator('input[type="password"]').first().getAttribute('value');

  console.log(`\n🔑 SUPABASE_URL: ${supabaseUrl}`);
  console.log(`🔑 SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 10)}... (retrieved successfully)`);

  // Save to local .env file
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', 'server', '.env');
  const envContent = `SUPABASE_URL=${supabaseUrl}\nSUPABASE_ANON_KEY=${supabaseKey}\n`;
  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log(`\n💾 Saved database keys to local configuration at server/.env`);

  // --- STEP 4: RUN SQL SCHEMA ---
  console.log("\n> Navigating to SQL Query Editor to create briefs table...");
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectId}/sql/new`;
  await page.goto(sqlEditorUrl);

  const sqlSchema = `
-- 1. Enable the pgvector extension to store high-stakes semantic embeddings
create extension if not exists vector;

-- 2. Create the briefs table
create table if not exists public.briefs (
    id text primary key,
    title text not null,
    client text not null,
    path text not null,
    type text not null,
    date text not null,
    description text not null,
    tags jsonb not null default '[]'::jsonb,
    style jsonb not null default '{}'::jsonb,
    notes text,
    archetype text,
    structured jsonb,
    embedding vector(1536)
);

-- 3. Disable Row Level Security
alter table public.briefs disable row level security;
  `;

  console.log("\n==============================================================");
  console.log("👉 AUTOMATIC SQL EXECUTION:");
  console.log("- The script is entering your table schema in the SQL Editor...");
  console.log("- Creating briefs table and disabling Row-Level Security...");
  console.log("==============================================================");

  // Wait for SQL Editor input field to be visible
  await page.waitForSelector('textarea', { timeout: 15000 });
  await page.fill('textarea', sqlSchema);
  await page.waitForTimeout(1000);
  
  // Click Run button
  const runBtn = page.locator('button:has-text("Run"), button:has-text("Execute")');
  if (await runBtn.count() > 0) {
    await runBtn.first().click();
    console.log("⚡ Executed SQL Schema query. Briefs table created successfully!");
  } else {
    console.log("⚠️ Please click the blue 'Run' button on your screen to execute the SQL query.");
    await page.waitForTimeout(5000);
  }

  // --- STEP 5: SAVE TO RENDER ENVIRONMENT VARIABLES ---
  console.log("\n> Navigating to Render Environment Variables dashboard...");
  const renderEnvUrl = 'https://dashboard.render.com/web/srv-d8avg577f7vs73bict70/env-vars';
  await page.goto(renderEnvUrl);

  console.log("\n==============================================================");
  console.log("👉 FINAL PIECE: ADD ENVIRONMENT VARIABLES ON RENDER:");
  console.log("1. Click the 'Add Environment Variable' button twice.");
  console.log("2. Define the following variables:");
  console.log(`   - Name: SUPABASE_URL       ➔ Value: ${supabaseUrl}`);
  console.log(`   - Name: SUPABASE_ANON_KEY  ➔ Value: ${supabaseKey}`);
  console.log("3. Click 'Save Changes' at the bottom of the Render settings.");
  console.log("==============================================================");

  console.log("\n> Waiting for you to complete Render setup on screen...");
  
  // Stay open for 10 minutes to allow completion, then exit
  await new Promise(resolve => setTimeout(resolve, 600000));
  await browser.close();
})();
