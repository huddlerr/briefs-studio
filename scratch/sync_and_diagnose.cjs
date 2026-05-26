const { chromium } = require('playwright');

(async () => {
  console.log("==============================================================");
  console.log("🔍 Launching Headful Sync & Diagnosis Tool...");
  console.log("==============================================================");

  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100,
    args: ['--start-maximized'] 
  });
  
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  console.log("\n> Navigating directly to your Render Blueprint Dashboard...");
  const blueprintUrl = 'https://dashboard.render.com/blueprints/exs-d8ava7mgvqtc73a3j5mg';
  await page.goto(blueprintUrl);

  console.log("\n==============================================================");
  console.log("👉 HELPING SECURE AUTHENTICATION:");
  console.log("Since you are signed in, the blueprint dashboard should load.");
  console.log("If Render prompts you to sign in first, please click 'GitHub' on screen.");
  console.log("==============================================================");

  // Wait a few seconds for the page to load or let the user login
  await page.waitForTimeout(5000);

  // Check if we are on the login page, wait for user to authenticate
  while (page.url().includes('login') || page.url().includes('auth')) {
    console.log("> Waiting for you to click Sign In / Authenticate on screen...");
    await page.waitForTimeout(2000);
  }

  console.log("\n> Successfully authenticated. Accessing Blueprint Dashboard...");
  
  // Wait for the manual sync button or layout
  try {
    await page.waitForSelector('button:has-text("Manual sync")', { timeout: 15000 });
    console.log("✅ Blueprint Dashboard loaded successfully.");
    
    // Check if the latest commit e5dc228 is listed or if we need to sync
    console.log("> Triggering Manual Sync to load our 100% free cardless configuration (Commit e5dc228)...");
    await page.click('button:has-text("Manual sync")');
    await page.waitForTimeout(1000);
    
    // Click 'Sync latest changes' in dropdown if present
    const syncOption = page.locator('span:has-text("Sync latest changes"), button:has-text("Sync latest changes"), a:has-text("Sync latest changes")');
    if (await syncOption.count() > 0) {
      await syncOption.first().click();
      console.log("⚡ Sent manual sync trigger to Render cloud builder!");
    } else {
      // Fallback if dropdown opened differently
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      console.log("⚡ Triggered sync option dropdown.");
    }

    // Wait for the sync to register
    await page.waitForTimeout(5000);
    
    // Look for the "briefs-studio" service link to go to its build log
    console.log("> Navigating to briefs-studio Web Service log...");
    const serviceLink = page.locator('a:has-text("briefs-studio")');
    if (await serviceLink.count() > 0) {
      await serviceLink.first().click();
      console.log("✅ Opened web service build stream. Monitoring logs...");
    } else {
      console.log("⚠️ Could not find service link automatically. Please click 'briefs-studio' on your screen.");
    }

  } catch (err) {
    console.log("⚠️ Blueprint dashboard took longer to load. Please click 'Manual sync' ➔ 'Sync latest changes' and then click 'briefs-studio' on your screen!");
  }

  // Keep browser open to allow user to see active logs and let the build run
  console.log("\n==============================================================");
  console.log("ℹ️ MONITORING MODE ACTIVE:");
  console.log("- The browser window will remain open on your screen.");
  console.log("- You can watch Render pull the latest code and deploy it for free.");
  console.log("- The script will close automatically in 5 minutes once complete.");
  console.log("==============================================================");

  await new Promise(resolve => setTimeout(resolve, 300000));
  await browser.close();
})();
