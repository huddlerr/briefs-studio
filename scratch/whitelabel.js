import fs from 'fs/promises';
import path from 'path';

const workspace = "c:\\Users\\Aidan\\Downloads\\Briefs Studio-briefs-main (2)";

const replacements = [
  { pattern: /Briefs Studio/gi, replacement: "Briefs Studio" },
  { pattern: /Briefs Studio/gi, replacement: "Briefs Studio" },
  { pattern: /Briefs Studio/gi, replacement: "Briefs Studio" }
];

const excludeDirs = new Set(["node_modules", ".git", ".agent", "brain", ".system_generated"]);
const includeExts = new Set([".html", ".json", ".js", ".toml", ".md", ".rtf", ".css"]);

let modifiedCount = 0;
let fileCount = 0;

async function walk(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const resPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      if (excludeDirs.has(file.name)) continue;
      await walk(resPath);
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (!includeExts.has(ext)) continue;
      
      try {
        let content = await fs.readFile(resPath, 'utf-8');
        let newContent = content;
        let madeChanges = false;
        
        for (const { pattern, replacement } of replacements) {
          if (pattern.test(newContent)) {
            newContent = newContent.replace(pattern, replacement);
            madeChanges = true;
          }
        }
        
        if (madeChanges) {
          await fs.writeFile(resPath, newContent, 'utf-8');
          console.log(`Whitelabeled: ${path.relative(workspace, resPath)}`);
          modifiedCount++;
        }
        fileCount++;
      } catch (err) {
        console.error(`Error reading ${resPath}:`, err.message);
      }
    }
  }
}

async function run() {
  console.log("Starting Node.js whitelabel search and replace...");
  await walk(workspace);
  console.log(`\nWhitelabel complete! Processed ${fileCount} files, updated ${modifiedCount} files.`);
}

run();
