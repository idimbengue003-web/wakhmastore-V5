// Test du nouveau parseAmount
function parseAmount(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  const str = String(value).trim();
  if (!str) return 0;

  const cleaned = str
    .replace(/CFA/gi, '')
    .replace(/FCFA/gi, '')
    .replace(/XOF/gi, '')
    .replace(/F\b/g, '')
    .replace(/\s+/g, '')
    .replace(/[.,](?=\d{3}\b)/g, '')
    .replace(/[.,](?=\d{3}(?!\d))/g, '');

  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

const testCases = [
  { input: 'CFA 2500', expected: 2500 },
  { input: 'CFA 1300', expected: 1300 },
  { input: 'CFA 1.300', expected: 1300 },
  { input: '2.500F', expected: 2500 },
  { input: 'CFA 2500 F', expected: 2500 },
  { input: 'CFA 10000', expected: 10000 },
  { input: 'CFA 49.000', expected: 49000 },
  { input: 'CFA -1300', expected: -1300 },
  { input: '-CFA 5000', expected: -5000 },
  { input: '2500', expected: 2500 },
  { input: 2500, expected: 2500 },
  { input: '2,500 FCFA', expected: 2500 },
  { input: null, expected: 0 },
  { input: 'CFA 0', expected: 0 },
];

console.log('=== Test parseAmount ===\n');
let passed = 0;
let failed = 0;
for (const { input, expected } of testCases) {
  const result = parseAmount(input);
  const ok = result === expected;
  console.log(`  ${ok ? 'OK' : 'FAIL'}  input=${JSON.stringify(input).padEnd(20)} expected=${String(expected).padEnd(8)} got=${result}`);
  if (ok) passed++;
  else failed++;
}
console.log(`\n${passed}/${testCases.length} passes, ${failed} echecs`);
