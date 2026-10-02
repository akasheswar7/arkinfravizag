const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'ravid', 'OneDrive', 'Desktop', 'ARK INFRA', 'video_frames');
const destDir = path.join('C:', 'Users', 'ravid', '.gemini', 'antigravity', 'brain', '0dec278f-f0eb-46af-83ad-06ab6a0b7ca8', 'frames');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log('Copying files from:', srcDir, 'to:', destDir);
const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (file.endsWith('.png')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Copied ${file}`);
  }
}
console.log('Done copying!');
