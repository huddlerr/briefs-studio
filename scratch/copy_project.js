import fs from 'fs/promises';
import path from 'path';

const src = "c:\\Users\\Aidan\\Downloads\\signalform-briefs-main (2)";
const dest = "c:\\Users\\Aidan\\Downloads\\briefs-studio";

const exclude = new Set(["node_modules", ".git", ".system_generated", "brain"]);

async function copyDir(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      if (exclude.has(entry.name)) continue;
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function run() {
  console.log(`Copying project from:\n  ${src}\nto:\n  ${dest}...`);
  try {
    await copyDir(src, dest);
    console.log("\nCopy completed successfully!");
  } catch (err) {
    console.error("Copy failed:", err.message);
  }
}

run();
