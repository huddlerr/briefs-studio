const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const artifactDir = "C:\\Users\\Aidan\\.gemini\\antigravity\\brain\\19a6f46a-49fd-4751-bed0-c69d00b1df36";
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  console.log("Launching headless Chromium...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Log browser console messages
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  
  console.log("Navigating to production URL...");
  await page.goto('https://briefs-studio.vercel.app', { waitUntil: 'networkidle' });
  
  await page.screenshot({ path: path.join(artifactDir, '01_landing_page.png') });
  console.log("1. Landing page loaded successfully.");

  console.log("Opening AI Sandbox Incubator drawer...");
  await page.click('text=AI Sandbox Incubator');
  await page.waitForTimeout(1000); // wait for drawer animation
  await page.screenshot({ path: path.join(artifactDir, '02_sandbox_drawer.png') });
  console.log("2. Drawer opened.");

  console.log("Entering raw transcript and selecting archetype...");
  const sampleTranscript = `Faizan Ahmed's Strategy Session:
- Faizan has a deep background in fine art printmaking and advanced web layout architecture.
- He is feeling frustrated that client engagements treat him as a commodity "WordPress web developer".
- He wants to operate as a high-stakes Narrative Systems Architect, building digital interactive installations that integrate strategic consulting and corporate governance for enterprise tech leaders.
- Key Quote: "The alignment of pixels is useless if the system itself is structurally misaligned."`;

  await page.fill('#sandbox-notes', sampleTranscript);
  await page.selectOption('#sandbox-archetype', 'Systems Integrator');
  await page.screenshot({ path: path.join(artifactDir, '03_form_filled.png') });
  console.log("3. Form filled with archetype 'Systems Integrator'.");

  console.log("Clicking 'Incubate Strategy Map'...");
  await page.click('#incubate-btn');

  console.log("Waiting for simulator terminal to process...");
  try {
    await page.waitForFunction(() => {
      const btn = document.getElementById('incubate-btn');
      return btn && !btn.disabled && btn.textContent.includes('Incubate Strategy Map');
    }, { timeout: 25000 });
    
    await page.screenshot({ path: path.join(artifactDir, '04_incubation_complete.png') });
    console.log("4. Incubation completed successfully.");
  } catch (err) {
    console.error("Incubation wait timed out! Capturing error screen state...");
    await page.screenshot({ path: path.join(artifactDir, '04_failed_state.png') });
    throw err;
  }

  console.log("Verifying the new brief card was compiled dynamically...");
  const firstCardText = await page.innerText('#briefs-grid > div:first-child');
  console.log("First card text extracted: ", firstCardText.replace(/\n/g, ' | '));

  if (firstCardText.includes("Faizan Ahmed")) {
    console.log("✅ Success: Brief card compiled dynamically!");
  } else {
    throw new Error("❌ Error: Dynamic brief card for Faizan Ahmed was not rendered in bento grid.");
  }

  console.log("Clicking the compiled brief card...");
  await page.click('#briefs-grid > div:first-child');
  await page.waitForSelector('#insight-modal:not(.hidden)', { timeout: 5000 });
  await page.screenshot({ path: path.join(artifactDir, '05_insight_modal_open.png') });
  console.log("5. Dossier modal opened successfully.");

  console.log("Verifying 'Open Digital Map →' action triggers new tab successfully...");
  const [popup] = await Promise.all([
    page.context().waitForEvent('page'),
    page.click('#modal-link')
  ]);

  await popup.waitForLoadState();
  console.log("✅ Success: New tab opened! Title:", await popup.title());
  await popup.screenshot({ path: path.join(artifactDir, '06_new_tab_content.png') });
  console.log("6. New tab verified and screenshot saved.");

  console.log("🎉 Verification Complete! All steps succeeded perfectly.");
  await browser.close();
})();
