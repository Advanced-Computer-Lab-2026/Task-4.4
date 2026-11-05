// WCAG 2.x contrast ratios for the colour pairs used by the interface.
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = h => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const after = [
  ['Body text on page', '#14233a', '#f4f6f9'],
  ['Muted text on card', '#4d5b72', '#ffffff'],
  ['Muted text on page', '#4d5b72', '#f4f6f9'],
  ['Input placeholder', '#5f6c80', '#ffffff'],
  ['Lost pill', '#b42318', '#fef1ef'],
  ['Found pill / received strip', '#0a6b5c', '#e4f5f1'],
  ['Claimed pill / collected strip', '#4a4a9c', '#eeeefa'],
  ['Not-confirmed strip', '#7c4f00', '#fff5dc'],
  ['White on Lost tab', '#ffffff', '#b42318'],
  ['White on Found tab', '#ffffff', '#0a6b5c'],
  ['White on Claimed tab', '#ffffff', '#4a4a9c'],
  ['White on primary button', '#ffffff', '#15305b'],
  ['Button text on gold', '#0e2243', '#f2c14e'],
  ['Soft button', '#15305b', '#e9eff8'],
  ['Error text on card', '#b42318', '#ffffff'],
  ['Success notice', '#07493f', '#e4f5f1'],
];
const before = [
  ['Card category label', '#b9a57b', '#fff9df'],
  ['Card description', '#81796e', '#fff9df'],
  ['Card location', '#96866b', '#fff9df'],
  ['Column subtitle', '#a5a098', '#f5f3ec'],
  ['Intro text', '#827d74', '#f5f3ec'],
  ['Handover note', '#746e61', '#fff9df'],
];
const print = (title, rows) => {
  console.log(title);
  for (const [name, a, b] of rows) { const r = ratio(a, b); console.log(`  ${r >= 4.5 ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  ${name}`); }
};
print('Redesign (AA for normal text needs 4.5:1)', after);
print('Original, for comparison', before);
process.exit(after.every(([, a, b]) => ratio(a, b) >= 4.5) ? 0 : 1);
