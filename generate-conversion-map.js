// Generate simplified-traditional conversion map from OpenCC data
// This script should be run once to generate data/simplified-traditional.json

const fs = require('fs');
const https = require('https');
const path = require('path');

// OpenCC data URLs
const OPENCC_BASE = 'https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary/';
const ST_URL = OPENCC_BASE + 'STCharacters.txt';  // Simplified to Traditional
const TS_URL = OPENCC_BASE + 'TSCharacters.txt';  // Traditional to Simplified

// Output path
const OUTPUT_PATH = path.join(__dirname, 'data', 'simplified-traditional.json');
const CANGJIE_PATH = path.join(__dirname, 'data', 'cangjie5.json');

// Download file from URL
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parse OpenCC dictionary format
// Format: "char1 char2 char3\tchar4 char5\n"
// We only take the first variant (char1 -> char4)
function parseOpenCCDict(content) {
  const map = {};
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    const parts = line.split('\t');
    if (parts.length !== 2) continue;

    const from = parts[0].split(' ')[0];  // Take first char from source
    const to = parts[1].split(' ')[0];    // Take first char from target

    if (from && to && from !== to) {
      map[from] = to;
    }
  }

  return map;
}

async function main() {
  console.log('Downloading OpenCC data...');

  // Download OpenCC dictionaries
  const stContent = await downloadFile(ST_URL);
  const tsContent = await downloadFile(TS_URL);

  console.log('Parsing dictionaries...');

  // Parse dictionaries
  const s2tFull = parseOpenCCDict(stContent);
  const t2sFull = parseOpenCCDict(tsContent);

  console.log(`Parsed ${Object.keys(s2tFull).length} simplified->traditional mappings`);
  console.log(`Parsed ${Object.keys(t2sFull).length} traditional->simplified mappings`);

  // Load Cangjie dictionary
  console.log('Loading Cangjie dictionary...');
  const cangjieData = JSON.parse(fs.readFileSync(CANGJIE_PATH, 'utf8'));
  const cangjieChars = new Set(Object.keys(cangjieData));

  console.log(`Loaded ${cangjieChars.size} Cangjie characters`);

  // Filter: only keep mappings where both chars exist in Cangjie dictionary
  const s2t = {};
  const t2s = {};

  for (const [simp, trad] of Object.entries(s2tFull)) {
    if (cangjieChars.has(simp) && cangjieChars.has(trad)) {
      s2t[simp] = trad;
    }
  }

  for (const [trad, simp] of Object.entries(t2sFull)) {
    if (cangjieChars.has(trad) && cangjieChars.has(simp)) {
      t2s[trad] = simp;
    }
  }

  console.log(`Filtered to ${Object.keys(s2t).length} simplified->traditional mappings`);
  console.log(`Filtered to ${Object.keys(t2s).length} traditional->simplified mappings`);

  // Ensure all mappings are bidirectional
  // If s2t has A→B, then t2s should have B→A (and vice versa)
  // Note: This may create 1-to-many mappings, which is intentional for our use case
  // (we want to show both variants regardless of which one the user inputs)
  let addedCount = 0;
  let overwriteCount = 0;

  // Take snapshot of original mappings before modification
  const originalS2T = { ...s2t };
  const originalT2S = { ...t2s };

  // Add/overwrite t2s mappings
  for (const [simp, trad] of Object.entries(originalS2T)) {
    if (cangjieChars.has(simp) && cangjieChars.has(trad)) {
      if (!t2s[trad]) {
        t2s[trad] = simp;
        addedCount++;
      } else if (t2s[trad] !== simp) {
        // Conflict: prefer the original OpenCC mapping, but log it
        // We keep the original t2s mapping
        overwriteCount++;
      }
    }
  }

  // Add/overwrite s2t mappings
  for (const [trad, simp] of Object.entries(originalT2S)) {
    if (cangjieChars.has(simp) && cangjieChars.has(trad)) {
      if (!s2t[simp]) {
        s2t[simp] = trad;
        addedCount++;
      } else if (s2t[simp] !== trad) {
        // Conflict: prefer the original OpenCC mapping
        overwriteCount++;
      }
    }
  }

  console.log(`Added ${addedCount} reverse mappings`);
  console.log(`Skipped ${overwriteCount} conflicts (kept original OpenCC mappings)`);
  console.log(`Final counts: ${Object.keys(s2t).length} S→T, ${Object.keys(t2s).length} T→S mappings`);

  // Create output
  const output = { s2t, t2s };

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\nSuccessfully generated: ${OUTPUT_PATH}`);
  console.log(`File size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2)} KB`);
  console.log('\nNext steps:');
  console.log('1. git add data/simplified-traditional.json');
  console.log('2. git commit -m "Add simplified-traditional conversion map"');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
