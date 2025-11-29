import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../data/Cangjie5_TC.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/cangjie5.json');

console.log('Starting Cangjie5 data parsing...');

// Read the input file
const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
const lines = fileContent.split('\n');

const cangjieMap = {};
let lineCount = 0;
let skipCount = 0;

for (const line of lines) {
    lineCount++;

    // Skip empty lines and comments
    if (!line.trim() || line.startsWith('#')) {
        skipCount++;
        continue;
    }

    // Parse tab-separated values: character \t code \t [optional tag]
    const parts = line.split('\t');

    if (parts.length < 2) {
        skipCount++;
        continue;
    }

    const char = parts[0].trim();
    const code = parts[1].trim();

    // Store in map (support multiple codes per character)
    if (!cangjieMap[char]) {
        cangjieMap[char] = [code];
    } else {
        cangjieMap[char].push(code);
    }
}

// Write to JSON file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cangjieMap, null, 2), 'utf8');

console.log(`Parsing complete!`);
console.log(`- Total lines processed: ${lineCount}`);
console.log(`- Lines skipped (empty/comments): ${skipCount}`);
console.log(`- Unique characters mapped: ${Object.keys(cangjieMap).length}`);
console.log(`- Output file: ${OUTPUT_FILE}`);
