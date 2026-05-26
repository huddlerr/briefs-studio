const { chromium } = require('playwright');

(async () => {
  console.log("==============================================================");
  console.log("🔍 Launching Headful Service Diagnostics...");
  console.log("==============================================================");

  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100,
    args: ['--start-maximized'] 
  });
  
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  console.log("\n> Navigating directly to your Web Service Dashboard...");
  const serviceUrl = 'https://dashboard.render.com/web/srv-d8avg577f7vs73bict70';
  await page.goto(serviceUrl);

  console.log("\n==============================================================");
  console.log("👉 DIAGNOSING BUILD STATUS:");
  console.log("1. The browser window has opened to your briefs-studio dashboard.");
  console.log("2. If prompted, please authenticate via GitHub/Google.");
  console.log("3. Once the dashboard loads, we will review the build log together.");
  console.log("==============================================================");

  // Wait a few seconds for the page to load or let the user login
  await page.waitForTimeout(5000);

  // Check if we are on the login page, wait for user to authenticate
  while (page.url().includes('login') || page.url().includes('auth')) {
    console.log("> Waiting for you to authenticate on screen...");
    await page.waitForTimeout(2000);
  }

  console.log("\n> Successfully authenticated. Accessing Service Logs...");
  
  // Try to locate build logs and print status
  try {
    // Wait for the build status or logs to load
    await page.waitForSelector('span:has-text("Build"), div:has-text("Build")', { timeout: 15000 });
    console.log("✅ Service Dashboard loaded successfully.");
    
    // Check if there is an active/failed deploy block
    await page.waitForTimeout(3000);
    
    // Extract deploy status messages from the page
    const textContent = await page.innerText('body');
    if (textContent.includes("failed") || textContent.includes("Failed")) {
      console.log("\n⚠️ Detected a deployment failure message on the screen.");
    } else if (textContent.includes("building") || textContent.includes("Building")) {
      console.log("\n⚡ Build is currently in progress. Please watch the active logs in the browser window.");
    } else if (textContent.includes("Live") || textContent.includes("live")) {
      console.log("\n🎉 The service dashboard indicates that the server is LIVE!");
    } else {
      console.log("\n🔎 Reviewing active build parameters... Look at the browser window to see logs.");
    }
  } catch (err) {
    console.log("⚠️ Dashboard elements took longer to parse. Please read the deploy logs shown in the Chromium window on your screen.");
  }

  // Keep browser open to allow user to see active logs and let the build run
  console.log("\n==============================================================");
  console.log("ℹ️ DIAGNOSTICS ACTIVE:");
  console.log("- The browser window will remain open on your screen.");
  console.log("- You can see the exact build errors (if any) or watch the deploy finish.");
  console.log("- The script will close automatically in 5 minutes once complete.");
  console.log("==============================================================");

  await new Promise(resolve => setTimeout(resolve, 300000));
  await browser.close();
})();
