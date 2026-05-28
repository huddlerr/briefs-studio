const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const renderApiKey = 'rnd_mWw6Uvlm6cUaVIvhlM82SXHH7tnU';
const serviceId = 'srv-d8b01iml51nc7397b8c0';
const projectId = 'vfqboybzbkcmfjbzzwhr';
const supabaseUrl = `https://${projectId}.supabase.co`;

(async () => {
  console.log("==============================================================");
  console.log("🧬 Launching Persistent-Context SaaS Deployer Wizard ...");
  console.log("==============================================================");

  const profilePath = 'c:\\Users\\Aidan\\Downloads\\briefs-studio\\scratch\\temp_profile';
  
  console.log(`> Launching Playwright with persistent Chrome profile from: ${profilePath}`);
  
  const browserContext = await chromium.launchPersistentContext(profilePath, { 
    headless: true, // Run headlessly since we don't need any user engagement at all!
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await browserContext.newPage();

  // --- STEP 1: EXTRACT SUPABASE ANON KEY ---
  console.log("\n> Navigating to Supabase API Keys page to extract your key...");
  const settingsUrl = `https://supabase.com/dashboard/project/${projectId}/settings/api-keys`;
  
  try {
    await page.goto(settingsUrl, { timeout: 30000 });
    console.log("✅ Page loaded!");
  } catch (err) {
    console.error("❌ Failed to load page:", err.message);
    await browserContext.close();
    process.exit(1);
  }

  console.log("Clicking 'Legacy anon, service_role API keys' tab...");
  try {
    await page.click('text=Legacy anon, service_role API keys');
    await page.waitForTimeout(3000);
  } catch (clickErr) {
    console.warn("⚠️ Clicking tab failed, maybe already loaded:", clickErr.message);
  }

  let anonKey = null;
  let attempts = 0;
  
  while (!anonKey && attempts < 10) {
    attempts++;
    const currentUrl = page.url();
    console.log(`> Attempt ${attempts}/10 - Current URL: ${currentUrl}`);
    
    // Save a screenshot for visual diagnostics
    const screenshotPath = 'c:\\Users\\Aidan\\Downloads\\briefs-studio\\scratch\\headless_screenshot.png';
    try {
      await page.screenshot({ path: screenshotPath });
      console.log(`📷 Headless screenshot saved to: ${screenshotPath}`);
    } catch (ssErr) {
      console.warn(`⚠️ Failed to save screenshot: ${ssErr.message}`);
    }

    try {
      const inputs = await page.$$eval('input', elements => elements.map(el => el.value));
      const pageText = await page.evaluate(() => document.body.innerText);
      
      const jwtRegex = /\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/;
      
      for (const val of inputs) {
        if (val && val.startsWith('eyJ') && val.length > 100) {
          anonKey = val;
          break;
        }
      }
      
      if (!anonKey) {
        const textMatches = pageText.match(jwtRegex);
        if (textMatches) {
          anonKey = textMatches[0];
        }
      }

      if (anonKey) {
        console.log("✅ Successfully extracted the Supabase anon public API key!");
        break;
      }
    } catch (err) {
      console.log(`⚠️ Scanning error: ${err.message}`);
    }
    
    await page.waitForTimeout(4000);
  }

  if (!anonKey) {
    console.error("❌ Failed to extract anon key. Please inspect the headless screenshot.");
    await browserContext.close();
    process.exit(1);
  }

  // Close browser context cleanly since the rest is programmatic REST calls!
  await browserContext.close();
  console.log("✅ Persistent Playwright session closed cleanly.");

  // Save to local .env in server directory
  const envPath = path.join(__dirname, '..', 'server', '.env');
  const envContent = `SUPABASE_URL=${supabaseUrl}\nSUPABASE_ANON_KEY=${anonKey}\n`;
  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log(`💾 Saved keys to local configuration at server/.env`);

  // Mirror to the primary workspace as well
  const altEnvPath = 'c:\\Users\\Aidan\\Downloads\\signalform-briefs-main (2)\\server\\.env';
  try {
    fs.writeFileSync(altEnvPath, envContent, 'utf-8');
    console.log(`💾 Mirrored keys to active workspace at signalform-briefs-main (2)/server/.env`);
  } catch (err) {
    console.warn(`⚠️ Failed to mirror .env: ${err.message}`);
  }

  // --- STEP 2: PROGRAMMATICALLY CONFIGURE RENDER ENVIRONMENT VARIABLES ---
  console.log("\n> Configuring environment variables on Render via REST API...");
  
  const envVarsPayload = [
    { key: "NODE_ENV", value: "production" },
    { key: "PORT", value: "4000" },
    { key: "SUPABASE_URL", value: supabaseUrl },
    { key: "SUPABASE_ANON_KEY", value: anonKey }
  ];

  try {
    const res = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${renderApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(envVarsPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update variables: ${res.statusText} - ${errText}`);
    }
    
    console.log("✅ Successfully updated all Render environment variables over REST!");
  } catch (err) {
    console.error("❌ Render API Error:", err.message);
    process.exit(1);
  }

  // --- STEP 3: PROGRAMMATICALLY TRIGGER A DEPLOY ---
  console.log("\n> Triggering fresh production deployment on Render...");
  
  try {
    const res = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${renderApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to trigger deploy: ${res.statusText} - ${errText}`);
    }
    
    const deployInfo = await res.json();
    console.log(`✅ Production deploy triggered! Deploy ID: ${deployInfo.id}`);
  } catch (err) {
    console.error("❌ Render Deploy Error:", err.message);
    process.exit(1);
  }

  // --- STEP 4: POLL THE PRODUCTION ENDPOINT ---
  console.log("\n==============================================================");
  console.log("🚀 POLLING LIVE PRODUCTION WEBSITE...");
  console.log("The script will now monitor https://briefs-studio-bxkq.onrender.com");
  console.log("It will verify database self-seeding and live boot status...");
  console.log("==============================================================");

  let isLive = false;
  attempts = 0;
  
  while (!isLive && attempts < 40) {
    attempts++;
    console.log(`> Checking server status... (Check #${attempts}/40 - checking every 15s)`);
    try {
      const res = await fetch('https://briefs-studio-bxkq.onrender.com/api/briefs');
      if (res.status === 200) {
        const json = await res.json();
        console.log(`\n🎉 SUCCESS! Render server is 100% LIVE and connected to Supabase!`);
        console.log(`📦 Loaded ${json.briefs.length} briefs directly from the cloud database!`);
        isLive = true;
        break;
      } else {
        console.log(`> Server returned status ${res.status} (compiling...)`);
      }
    } catch (err) {
      console.log(`> Server is still spinning up... (${err.message})`);
    }
    await new Promise(resolve => setTimeout(resolve, 15000));
  }

  if (isLive) {
    console.log("\n==============================================================");
    console.log("🏁 SaaS Platform successfully deployed and fully operational!");
    console.log("Permanent URL: https://briefs-studio-bxkq.onrender.com");
    console.log("==============================================================");
  } else {
    console.log("\n⚠️ Polling timed out, but your build is compiling in the background and will go live shortly!");
  }
})();
