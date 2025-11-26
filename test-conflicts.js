const data = require('./data/simplified-traditional.json');

// Test conflict examples from earlier output
const testCases = [
  { char: '买', expected: '買 (from s2t)', actual_t2s: '𧹒' },
  { char: '買', expected: '𧹒 (from t2s)', actual_s2t: '买' },
  { char: '余', expected: '餘 (from s2t)', actual_t2s: '馀' },
  { char: '餘', expected: '馀 (from t2s)', actual_s2t: '余' },
];

console.log('Testing conflict behavior:\n');

testCases.forEach(test => {
  const s2tResult = data.s2t[test.char];
  const t2sResult = data.t2s[test.char];

  console.log(`Character: ${test.char}`);
  console.log(`  s2t[${test.char}] = ${s2tResult || 'undefined'}`);
  console.log(`  t2s[${test.char}] = ${t2sResult || 'undefined'}`);

  // Simulate what getVariantChar() would return
  if (s2tResult) {
    console.log(`  → getVariantChar would return: simplified="${test.char}", traditional="${s2tResult}"`);
  } else if (t2sResult) {
    console.log(`  → getVariantChar would return: simplified="${t2sResult}", traditional="${test.char}"`);
  } else {
    console.log(`  → getVariantChar would return: null (no variant)`);
  }

  console.log('');
});

// Count how many chars have both s2t and t2s mappings
let bothCount = 0;
let s2tOnlyCount = 0;
let t2sOnlyCount = 0;

const allChars = new Set([...Object.keys(data.s2t), ...Object.keys(data.t2s)]);

for (const char of allChars) {
  const hasS2T = !!data.s2t[char];
  const hasT2S = !!data.t2s[char];

  if (hasS2T && hasT2S) bothCount++;
  else if (hasS2T) s2tOnlyCount++;
  else if (hasT2S) t2sOnlyCount++;
}

console.log('=== Mapping Distribution ===');
console.log(`Characters with both s2t and t2s: ${bothCount}`);
console.log(`Characters with only s2t: ${s2tOnlyCount}`);
console.log(`Characters with only t2s: ${t2sOnlyCount}`);
console.log(`Total unique characters: ${allChars.size}`);
