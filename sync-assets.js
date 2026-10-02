const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'android-app', 'app', 'src', 'main', 'assets');

// Helper to recursively copy directories
function copyDirSync(src, dest, filterFn) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!filterFn || filterFn(srcPath, true)) {
        copyDirSync(srcPath, destPath, filterFn);
      }
    } else {
      if (!filterFn || filterFn(srcPath, false)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Clean and recreate assets folder
function cleanAssetsDir() {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
}

function processAndCopyHtml(srcPath, destPath) {
  let content = fs.readFileSync(srcPath, 'utf8').replace(/\r\n/g, '\n');
  
  // 1. Replace href="/" with href="index.html"
  let modifiedContent = content.replace(/href="\/"/g, 'href="index.html"');
  
  // 2. Apply viewport and preloader fixes specifically for index.html
  if (path.basename(srcPath) === 'index.html') {
    // Make html and body take 100% height in CSS
    modifiedContent = modifiedContent.replace(
      'html { scroll-behavior: smooth; font-size: 16px; overflow-x: hidden; }',
      'html { scroll-behavior: smooth; font-size: 16px; overflow-x: hidden; height: 100%; }'
    );
    
    modifiedContent = modifiedContent.replace(
      'body {\n      font-family: var(--font-sans);\n      background: var(--navy-deep);\n      color: var(--text-body);\n      line-height: 1.7;\n      overflow-x: hidden;\n      -webkit-font-smoothing: antialiased;\n    }',
      'body {\n      font-family: var(--font-sans);\n      background: var(--navy-deep);\n      color: var(--text-body);\n      line-height: 1.7;\n      overflow-x: hidden;\n      -webkit-font-smoothing: antialiased;\n      height: 100%;\n    }'
    );

    // Make logo-preloader width and height 100% instead of 100vw/100vh
    modifiedContent = modifiedContent.replace(
      'width: 100vw;\n      height: 100vh;',
      'width: 100%;\n      height: 100%;'
    );

    // Make preloader always play on load (bypass sessionStorage check)
    const oldPreloaderScript = `  <script>
    (function () {
      let visited = false;
      try {
        visited = sessionStorage.getItem('arkinfra_preloader_shown') === 'true';
      } catch (e) {
        console.warn("sessionStorage not available:", e);
      }
      if (visited) {
        document.documentElement.classList.add('preloader-skipped');
      } else {
        document.documentElement.classList.add('preloader-active-lock');
      }
    })();
  </script>`;

    const newPreloaderScript = `  <script>
    (function () {
      // Always play preloader animation on load in the app
      document.documentElement.classList.add('preloader-active-lock');
    })();
  </script>`;

    modifiedContent = modifiedContent.replace(oldPreloaderScript, newPreloaderScript);

    // Bypass sessionStorage in initPreloaderTransition script
    const oldPreloaderTransition = `      function initPreloaderTransition() {
        const preloader = document.getElementById('logoPreloader');
        if (!preloader) return;
        
        let isVisited = false;
        try {
          isVisited = sessionStorage.getItem('arkinfra_preloader_shown') === 'true';
        } catch (e) {
          console.warn("sessionStorage not available:", e);
        }

        if (isVisited) {
          preloader.style.display = 'none';
          document.documentElement.classList.remove('preloader-active-lock');
          return;
        }

        // Wait 3.0 seconds (giving time for the logo swing, progress bar, and sweep animation) then trigger slide gates
        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.documentElement.classList.remove('preloader-active-lock');
          try {
            sessionStorage.setItem('arkinfra_preloader_shown', 'true');
          } catch (e) {
            console.warn("sessionStorage setItem failed:", e);
          }
          
          // Remove preloader from DOM after split gate slide transitions complete (1.8 seconds duration)
          setTimeout(() => {
            preloader.remove();
          }, 1800);
        }, 3000);
      }`;

    const newPreloaderTransition = `      function initPreloaderTransition() {
        const preloader = document.getElementById('logoPreloader');
        if (!preloader) return;

        // Wait 3.0 seconds (giving time for the logo swing, progress bar, and sweep animation) then trigger slide gates
        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.documentElement.classList.remove('preloader-active-lock');
          
          // Remove preloader from DOM after split gate slide transitions complete (1.8 seconds duration)
          setTimeout(() => {
            preloader.remove();
          }, 1800);
        }, 3000);
      }`;

    modifiedContent = modifiedContent.replace(oldPreloaderTransition, newPreloaderTransition);
  }
  
  fs.writeFileSync(destPath, modifiedContent, 'utf8');
  console.log(`Copied & Synced HTML: ${path.basename(srcPath)}`);
}

function run() {
  console.log('Cleaning assets directory...');
  cleanAssetsDir();

  // 1. Copy and process HTML files
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const fullPath = path.join(srcDir, file);
    if (fs.statSync(fullPath).isFile() && file.endsWith('.html')) {
      const destPath = path.join(destDir, file);
      processAndCopyHtml(fullPath, destPath);
    }
  }

  // 2. Copy chatbot.js, chatbot.css, etc.
  const coreFiles = ['chatbot.js', 'chatbot.css', 'server.js'];
  for (const file of coreFiles) {
    const fullPath = path.join(srcDir, file);
    if (fs.existsSync(fullPath)) {
      fs.copyFileSync(fullPath, path.join(destDir, file));
      console.log(`Copied core file: ${file}`);
    }
  }

  // 3. Copy images folder
  const srcImages = path.join(srcDir, 'images');
  const destImages = path.join(destDir, 'images');
  if (fs.existsSync(srcImages)) {
    copyDirSync(srcImages, destImages);
    console.log('Copied images directory');
  }

  // 4. Copy data folder
  const srcData = path.join(srcDir, 'data');
  const destData = path.join(destDir, 'data');
  if (fs.existsSync(srcData)) {
    copyDirSync(srcData, destData);
    console.log('Copied data directory');
  }

  // 5. Copy js folder
  const srcJs = path.join(srcDir, 'js');
  const destJs = path.join(destDir, 'js');
  if (fs.existsSync(srcJs)) {
    copyDirSync(srcJs, destJs);
    console.log('Copied js directory');
  }

  console.log('Sync completed successfully!');
}

run();
