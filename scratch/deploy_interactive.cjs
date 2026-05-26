const { chromium } = require('playwright');

(async () => {
  console.log("==============================================================");
  console.log("🚀 Launching Headful Cloud Deployer...");
  console.log("==============================================================");
  
  // Launch a headful Chromium browser so it displays on the user's screen
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 50,
    args: ['--start-maximized'] 
  });
  
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  console.log("\n> Navigating to Render 1-Click Deploy URL...");
  const deployUrl = 'https://render.com/deploy?repo=https://github.com/huddlerr/briefs-studio';
  await page.goto(deployUrl);

  console.log("\n==============================================================");
  console.log("👉 ACTION REQUIRED ON YOUR SCREEN:");
  console.log("1. A real browser window has been opened on your desktop.");
  console.log("2. If prompted, sign in to Render (using your GitHub/Google account).");
  console.log("3. Paste your OPENAI_API_KEY in the Environment Variables fields.");
  console.log("4. Click the 'Apply' or 'Create Web Service' button at the bottom.");
  console.log("==============================================================");
  console.log("\n> Waiting for you to complete authentication and trigger the build...");

  // Monitor URL changes to detect when Render redirects to the dashboard
  let serviceCreated = false;
  let serviceUrl = "";

  while (!serviceCreated) {
    try {
      const currentUrl = page.url();
      
      // If we are redirected to Render's service dashboard, it means deployment has started!
      if (currentUrl.includes('dashboard.render.com/web/srv-') || currentUrl.includes('dashboard.render.com/static/srv-')) {
        console.log(`\n🎉 Success! Web service successfully created on Render.`);
        console.log(`> Service Dashboard: ${currentUrl}`);
        
        serviceCreated = true;
        
        // Wait a few seconds for the dashboard to render and grab the public live URL if visible
        await page.waitForTimeout(5000);
        
        try {
          // Look for the live link elements on Render dashboard
          const linkSelector = 'a[href*=".onrender.com"]';
          if (await page.locator(linkSelector).count() > 0) {
            serviceUrl = await page.locator(linkSelector).first().getAttribute('href');
            console.log(`🌐 Your Live Public Production URL will be: ${serviceUrl}`);
          }
        } catch (linkErr) {
          // Fallback if UI selector is slightly different
        }
        
        break;
      }
      
      // Check if browser was closed by the user
      if (page.isClosed()) {
        console.log("\n❌ Deployment window was closed.");
        break;
      }
    } catch (err) {
      // Browser might have been closed
      console.log("\n❌ Connection to the deployment window lost.");
      break;
    }
    
    // Poll every second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (serviceCreated) {
    console.log("\n==============================================================");
    console.log("✅ DEPLOYMENT SUCCESSFULLY INITIALIZED!");
    console.log("Render is now building your container and attaching your persistent volume.");
    console.log("You can close the browser window, or keep it open to watch the build log.");
    console.log("==============================================================");
  }

  // Keep browser alive for 3 more minutes to let user review dashboard, then exit
  await new Promise(resolve => setTimeout(resolve, 180000));
  await browser.close();
})();
