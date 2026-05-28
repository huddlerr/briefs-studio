const fs = require('fs');
const path = require('path');

(async () => {
  console.log("==============================================================");
  console.log("📂 Backing up agent documentation and platform memory...");
  console.log("==============================================================");

  const brainDir = 'C:\\Users\\Aidan\\.gemini\\antigravity\\brain\\c2a7cf7b-4e84-4455-b4a8-22eec483d276';
  const destDir = 'c:\\Users\\Aidan\\Downloads\\briefs-studio\\.agent\\docs';

  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`📁 Created backup directory: ${destDir}`);
  }

  const docsToBackup = [
    'walkthrough.md',
    'task.md',
    'implementation_plan.md',
    'product_blueprint.md',
    'briefs_directory_mockup.md'
  ];

  for (const doc of docsToBackup) {
    const srcPath = path.join(brainDir, doc);
    const destPath = path.join(destDir, doc);

    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Backed up: ${doc}`);
      } catch (err) {
        console.error(`❌ Failed to copy ${doc}:`, err.message);
      }
    } else {
      console.warn(`⚠️ Warning: Source document not found: ${srcPath}`);
    }
  }

  console.log("----------------------------------");
  console.log("🎉 Backup complete! Memory is fully persistent in the workspace.");
  console.log("==============================================================");
})();
