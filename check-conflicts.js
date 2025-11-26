const data = require('./data/simplified-traditional.json');
const cangjie = require('./data/cangjie5.json');

console.log('Checking for mapping conflicts...\n');

// Check s2t mappings where reverse t2s doesn't exist or conflicts
const s2tIssues = [];
for (const [simp, trad] of Object.entries(data.s2t)) {
  if (cangjie[simp] && cangjie[trad]) {
    if (!data.t2s[trad]) {
      s2tIssues.push({ simp, trad, issue: 'missing reverse' });
    } else if (data.t2s[trad] !== simp) {
      s2tIssues.push({ simp, trad, issue: `conflict: t2s[${trad}]=${data.t2s[trad]}` });
    }
  }
}

// Check t2s mappings where reverse s2t doesn't exist or conflicts
const t2sIssues = [];
for (const [trad, simp] of Object.entries(data.t2s)) {
  if (cangjie[simp] && cangjie[trad]) {
    if (!data.s2t[simp]) {
      t2sIssues.push({ trad, simp, issue: 'missing reverse' });
    } else if (data.s2t[simp] !== trad) {
      t2sIssues.push({ trad, simp, issue: `conflict: s2t[${simp}]=${data.s2t[simp]}` });
    }
  }
}

console.log('S→T mappings with issues:', s2tIssues.length);
if (s2tIssues.length > 0) {
  console.log('First 10 examples:');
  s2tIssues.slice(0, 10).forEach(m => {
    console.log(`  ${m.simp} → ${m.trad}: ${m.issue}`);
  });
}

console.log('\nT→S mappings with issues:', t2sIssues.length);
if (t2sIssues.length > 0) {
  console.log('First 10 examples:');
  t2sIssues.slice(0, 10).forEach(m => {
    console.log(`  ${m.trad} → ${m.simp}: ${m.issue}`);
  });
}
