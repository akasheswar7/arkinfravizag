const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '..', 'images', 'logo.webp');
const RES_DIR = path.join(__dirname, 'app', 'src', 'main', 'res');

async function main() {
  console.log('Loading logo from:', LOGO_PATH);
  
  // 1. Create a transparent version of the logo
  // We read the raw buffer, change white pixels (r, g, b > 240) to transparent
  const image = sharp(LOGO_PATH);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const outBuffer = Buffer.alloc(width * height * 4);
  
  for (let i = 0; i < width * height; i++) {
    const rIdx = i * channels;
    const wIdx = i * 4;
    const r = data[rIdx];
    const g = data[rIdx + 1];
    const b = data[rIdx + 2];
    const a = channels === 4 ? data[rIdx + 3] : 255;
    
    // If the pixel is close to white, make it transparent
    if (r > 240 && g > 240 && b > 240) {
      outBuffer[wIdx] = r;
      outBuffer[wIdx + 1] = g;
      outBuffer[wIdx + 2] = b;
      outBuffer[wIdx + 3] = 0; // transparent
    } else {
      outBuffer[wIdx] = r;
      outBuffer[wIdx + 1] = g;
      outBuffer[wIdx + 2] = b;
      outBuffer[wIdx + 3] = a;
    }
  }
  
  const transparentLogo = sharp(outBuffer, {
    raw: {
      width,
      height,
      channels: 4
    }
  });

  // Save transparent logo as png
  const foregroundPng = await transparentLogo.png().toBuffer();

  // Save original logo with white background as png (used for splash screen logo)
  const logoPngDir = path.join(RES_DIR, 'drawable');
  if (!fs.existsSync(logoPngDir)) {
    fs.mkdirSync(logoPngDir, { recursive: true });
  }
  await sharp(LOGO_PATH).png().toFile(path.join(logoPngDir, 'logo.png'));
  console.log('Saved logo.png to drawable');

  // Definitions of mipmap folders and sizes
  const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };

  for (const [folderName, size] of Object.entries(sizes)) {
    const folderPath = path.join(RES_DIR, folderName);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // A. Legacy Launcher Icon (square, white background)
    await sharp(LOGO_PATH)
      .resize(size, size)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher.png'));
    
    // B. Legacy Round Icon (circular crop)
    const radius = size / 2;
    const svgMask = Buffer.from(
      `<svg><circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/></svg>`
    );
    await sharp(LOGO_PATH)
      .resize(size, size)
      .composite([{
        input: svgMask,
        blend: 'dest-in'
      }])
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_round.png'));

    // C. Adaptive Foreground (transparent centered logo)
    const adaptiveSize = Math.round(size * (108 / 48)); // 108dp size in px
    const foregroundLogoSize = Math.round(adaptiveSize * 0.65); // 70dp logo in px
    
    await sharp(foregroundPng)
      .resize(foregroundLogoSize, foregroundLogoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.round((adaptiveSize - foregroundLogoSize) / 2),
        bottom: Math.ceil((adaptiveSize - foregroundLogoSize) / 2),
        left: Math.round((adaptiveSize - foregroundLogoSize) / 2),
        right: Math.ceil((adaptiveSize - foregroundLogoSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(adaptiveSize, adaptiveSize) // Ensure it is exactly adaptiveSize x adaptiveSize
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));
      
    console.log(`Generated icons for ${folderName} (size: ${size}px, adaptive: ${adaptiveSize}px)`);
  }
  
  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
