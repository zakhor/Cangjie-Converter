const fs = require('fs');
const https = require('https');

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
function parseOpenCCDict(content) {
  const map = {};
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    const parts = line.split('\t');
    if (parts.length !== 2) continue;

    const from = parts[0].split(' ')[0];
    const to = parts[1].split(' ')[0];

    if (from && to && from !== to) {
      // Check if this creates a 1-to-many mapping
      if (map[from] && map[from] !== to) {
        // Already has a different mapping
        if (!map[from + '_conflicts']) {
          map[from + '_conflicts'] = [map[from]];
        }
        map[from + '_conflicts'].push(to);
      } else {
        map[from] = to;
      }
    }
  }

  return map;
}

async function main() {
  console.log('Analyzing OpenCC mapping structure...\n');

  // Download OpenCC data
  const ST_URL = 'https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary/STCharacters.txt';
  const TS_URL = 'https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary/TSCharacters.txt';

  console.log('Downloading OpenCC data...');
  const stContent = await downloadFile(ST_URL);
  const tsContent = await downloadFile(TS_URL);

  console.log('Parsing dictionaries...');
  const s2tMap = parseOpenCCDict(stContent);
  const t2sMap = parseOpenCCDict(tsContent);

  // Count conflicts
  const s2tConflicts = Object.keys(s2tMap).filter(k => k.endsWith('_conflicts')).length;
  const t2sConflicts = Object.keys(t2sMap).filter(k => k.endsWith('_conflicts')).length;

  console.log('\n=== OpenCC Structure Analysis ===');
  console.log('S→T total entries:', Object.keys(s2tMap).filter(k => !k.endsWith('_conflicts')).length);
  console.log('S→T 1-to-many mappings:', s2tConflicts);
  console.log('T→S total entries:', Object.keys(t2sMap).filter(k => !k.endsWith('_conflicts')).length);
  console.log('T→S 1-to-many mappings:', t2sConflicts);

  // Show examples of 1-to-many mappings
  if (s2tConflicts > 0) {
    console.log('\nExamples of S→T 1-to-many mappings:');
    let count = 0;
    for (const key in s2tMap) {
      if (key.endsWith('_conflicts') && count < 5) {
        const char = key.replace('_conflicts', '');
        console.log(`  ${char} → ${s2tMap[char + '_conflicts'].join(', ')}`);
        count++;
      }
    }
  }

  if (t2sConflicts > 0) {
    console.log('\nExamples of T→S 1-to-many mappings:');
    let count = 0;
    for (const key in t2sMap) {
      if (key.endsWith('_conflicts') && count < 5) {
        const char = key.replace('_conflicts', '');
        console.log(`  ${char} → ${t2sMap[char + '_conflicts'].join(', ')}`);
        count++;
      }
    }
  }

  // Load Cangjie data
  console.log('\n=== Cangjie vs OpenCC Coverage ===');
  const cangjieData = JSON.parse(fs.readFileSync('./data/cangjie5.json', 'utf8'));
  const cangjieChars = Object.keys(cangjieData);

  console.log('Total Cangjie characters:', cangjieChars.length);

  // Count how many Cangjie chars are in OpenCC
  let inS2T = 0;
  let inT2S = 0;
  let inBoth = 0;
  let inNeither = 0;

  for (const char of cangjieChars) {
    const hasS2T = s2tMap[char] && !s2tMap[char].endsWith('_conflicts');
    const hasT2S = t2sMap[char] && !t2sMap[char].endsWith('_conflicts');

    if (hasS2T) inS2T++;
    if (hasT2S) inT2S++;
    if (hasS2T && hasT2S) inBoth++;
    if (!hasS2T && !hasT2S) inNeither++;
  }

  console.log('Cangjie chars in S→T:', inS2T);
  console.log('Cangjie chars in T→S:', inT2S);
  console.log('Cangjie chars in both:', inBoth);
  console.log('Cangjie chars in neither:', inNeither);
  console.log('Coverage:', ((cangjieChars.length - inNeither) / cangjieChars.length * 100).toFixed(2) + '%');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
