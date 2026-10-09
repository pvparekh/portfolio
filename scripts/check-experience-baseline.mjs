import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');
const baseline = readFileSync(
  resolve(root, 'docs/portfolio-renaissance/08-protected-experience-baseline.md'),
  'utf8'
);

function extractCurrent(source) {
  const start = source.indexOf('const EXPERIENCE = [');
  const end = source.indexOf('\nconst SKILLS = [', start);
  if (start < 0 || end < 0) throw new Error('EXPERIENCE block markers are missing');
  return source.slice(start, end).trimEnd();
}

function extractBaseline(source) {
  const start = source.indexOf('const EXPERIENCE = [');
  const end = source.indexOf('\n```', start);
  if (start < 0 || end < 0) throw new Error('Protected baseline markers are missing');
  return source.slice(start, end).trimEnd();
}

const current = extractCurrent(app);
const expected = extractBaseline(baseline);
if (current !== expected) {
  console.error('FAIL: Protected professional experience content differs from baseline.');
  process.exitCode = 1;
} else {
  console.log('PASS: Protected professional experience source block matches baseline exactly.');
}
