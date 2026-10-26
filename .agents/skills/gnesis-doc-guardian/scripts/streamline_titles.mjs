import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const REPO_ROOT = resolve(process.cwd());
const DOCS_DIR = join(REPO_ROOT, 'docs');
const isApply = process.argv.includes('--apply');

function getAllMarkdownFiles(dir, fileList = []) {
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== '.build') {
        getAllMarkdownFiles(fullPath, fileList);
      }
    } else if (item.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function cleanTitle(title) {
  if (!title) return title;
  return title
    .replace(/\s*[—–-]\s*Gnesis Studios\s*$/i, '')
    .replace(/\s*[—–-]\s*Copa Vanguard\s*\d*\s*$/i, '')
    .replace(/\s*[—–-]\s*\{\{\s*evento\.nombre.*?\}\}\s*$/i, '')
    .replace(/\s*[—–-]\s*\{\{\s*empresa\.nombre.*?\}\}\s*$/i, '')
    .trim();
}

const files = getAllMarkdownFiles(DOCS_DIR);
let count = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  let newContent = content;

  // 1. Limpiar frontmatter title
  newContent = newContent.replace(/^title:\s*(["']?)(.*?)\1\s*$/m, (match, quote, currentTitle) => {
    const cleaned = cleanTitle(currentTitle);
    if (cleaned !== currentTitle) {
      count++;
      return `title: "${cleaned}"`;
    }
    return match;
  });

  // 2. Limpiar main # heading
  newContent = newContent.replace(/^(#\s+[^\r\n]+)$/m, (match, headingLine) => {
    const cleaned = cleanTitle(headingLine);
    return cleaned;
  });

  if (newContent !== content) {
    const rel = relative(REPO_ROOT, file).replace(/\\/g, '/');
    if (isApply) {
      writeFileSync(file, newContent, 'utf8');
      console.log(`✓ Saneado: ${rel}`);
    } else {
      console.log(`[DRY-RUN] Modificaría: ${rel}`);
    }
  }
}

console.log(`\n${isApply ? 'Aplicado en' : 'Detectados'} ${count} títulos para optimizar.`);
