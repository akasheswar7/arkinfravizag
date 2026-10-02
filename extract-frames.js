const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Checking/Installing ffmpeg-static...');
  try {
    require.resolve('ffmpeg-static');
  } catch (e) {
    console.log('ffmpeg-static not found. Installing...');
    execSync('npm install ffmpeg-static --no-save', { stdio: 'inherit' });
  }

  const ffmpeg = require('ffmpeg-static');
  console.log('ffmpeg path:', ffmpeg);

  const videoPath = path.join(__dirname, 'video.mp4');
  const outputDir = path.join(__dirname, 'video_frames');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  } else {
    // Clear old frames
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      fs.unlinkSync(path.join(outputDir, file));
    }
  }

  console.log('Extracting frames (1 frame every 3 seconds)...');
  // -vf fps=1/3 extracts 1 frame every 3 seconds
  // -scale -1:480 scales height to 480px and keeps aspect ratio to reduce file size
  const cmd = `"${ffmpeg}" -i "${videoPath}" -vf "fps=1/3,scale=-1:480" "${path.join(outputDir, 'frame_%03d.png')}"`;
  console.log('Running command:', cmd);
  execSync(cmd, { stdio: 'inherit' });

  console.log('Frames extracted successfully! Files:');
  const files = fs.readdirSync(outputDir);
  files.forEach(f => console.log(f));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
