import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Cangjie data
const cangjieDataPath = path.join(__dirname, 'data/cangjie5.json');
const cangjieMap = JSON.parse(fs.readFileSync(cangjieDataPath, 'utf8'));

console.log('Testing Cangjie Converter...\n');

// Test cases
const testCases = [
    '你好世界',
    '倉頡輸入法',
    '中文打字',
    '香港繁體',
    '日月星辰'
];

testCases.forEach(text => {
    console.log(`Input: ${text}`);
    const results = [];

    for (const char of text) {
        const code = cangjieMap[char];
        results.push({
            char: char,
            code: code || 'Not found',
            found: !!code
        });
    }

    results.forEach(r => {
        const status = r.found ? '✓' : '✗';
        console.log(`  ${status} ${r.char} → ${r.code}`);
    });

    const foundCount = results.filter(r => r.found).length;
    console.log(`  Found: ${foundCount}/${results.length}\n`);
});

console.log('Test completed!');
