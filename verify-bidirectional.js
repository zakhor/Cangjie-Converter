const data = require('./data/simplified-traditional.json');
const cangjie = require('./data/cangjie5.json');

let missingT2S = 0;
let missingS2T = 0;

for (const [simp, trad] of Object.entries(data.s2t)) {
  if (cangjie[simp] && cangjie[trad]) {
    if (!data.t2s[trad] || data.t2s[trad] !== simp) {
      missingT2S++;
    }
  }
}

for (const [trad, simp] of Object.entries(data.t2s)) {
  if (cangjie[simp] && cangjie[trad]) {
    if (!data.s2t[simp] || data.s2t[simp] !== trad) {
      missingS2T++;
    }
  }
}

console.log('Bidirectional check results:');
console.log('S→T mappings:', Object.keys(data.s2t).length);
console.log('T→S mappings:', Object.keys(data.t2s).length);
console.log('Missing reverse mappings in t2s:', missingT2S);
console.log('Missing reverse mappings in s2t:', missingS2T);
console.log('Total missing:', missingT2S + missingS2T);

if (missingT2S === 0 && missingS2T === 0) {
  console.log('\n✓ All mappings are bidirectional!');
} else {
  console.log('\n✗ Some mappings are still unidirectional');
}
