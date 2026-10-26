import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const REPO_ROOT = resolve(process.cwd());
const DOCS_DIR = join(REPO_ROOT, 'docs');

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

const AI_TELLS = [
  { id: 'not-x-but-y', regex: /no\s+(?:se\s+trata\s+)?(?:solo|solamente|únicamente)\s+de[^.,;\n]+,\s*sino\s+(?:también\s+)?(?:de)?/i, label: 'Contraste no-X-sino-Y (§1)' },
  { id: 'heart-of', regex: /\ben\s+el\s+coraz[óo]n\s+de\b/i, label: 'Cliché "en el corazón de" (§3)' },
  { id: 'stands-as-testament', regex: /(?:se\s+erige|se\s+alza|se\s+presenta|funciona)\s+como\s+(?:un\s+)?testimonio\b/i, label: 'Fórmula "como testimonio" (§13)' },
  { id: 'plays-key-role', regex: /juega\s+un\s+papel\s+(?:crucial|fundamental|clave|determinante)\b/i, label: 'Inflación "juega un papel fundamental" (§13)' },
  { id: 'delve', regex: /\b(?:sumergirse|adentrarse|adentrarnos|sumergirnos)\s+en\b/i, label: 'Metáfora de inmersión "sumergirse en" (§12)' },
  { id: 'tapestry-landscape', regex: /\b(?:tapiz\s+de|paisaje\s+cambiante|en\s+este\s+paisaje)\b/i, label: 'Metáfora abstracta de paisaje/tapiz (§12)' },
  { id: 'meticulously', regex: /\bmeticulos(?:a|o|amente)\b/i, label: 'Adverbio inflado "meticuloso/a" (§12)' },
  { id: 'holistic', regex: /\b(?:enfoque\s+hol[íi]stico|de\s+manera\s+hol[íi]stica)\b/i, label: 'Modismo corporativo "holístico" (§12)' },
  { id: 'chatbot-residue', regex: /\b(?:espero\s+que\s+(?:esto\s+)?te\s+sirva|sin\s+m[áa]s\s+pre[áa]mbulos|h[áa]zmelo\s+saber|no\s+dudes\s+en\s+consultar)\b/i, label: 'Residuo de chatbot (§22)' },
];

const files = getAllMarkdownFiles(DOCS_DIR);

const stats = {
  totalFiles: files.length,
  longHeadings: [],
  emojiHeadings: [],
  aiTellsFound: [],
};

for (const file of files) {
  const rel = relative(REPO_ROOT, file).replace(/\\/g, '/');
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');

  // Evaluar encabezados
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) {
      const heading = line.replace(/^#+\s*/, '').trim();
      const words = heading.split(/\s+/).filter(Boolean);

      // Longitud
      if (words.length > 8) {
        stats.longHeadings.push({ file: rel, line: i + 1, words: words.length, heading });
      }

      // Emojis en títulos
      const emojiMatch = heading.match(/[\p{Extended_Pictographic}]/u);
      if (emojiMatch) {
        stats.emojiHeadings.push({ file: rel, line: i + 1, heading, emoji: emojiMatch[0] });
      }
    }
  }

  // Evaluar AI tells
  for (const tell of AI_TELLS) {
    const match = content.match(tell.regex);
    if (match) {
      stats.aiTellsFound.push({ file: rel, label: tell.label, match: match[0] });
    }
  }
}

console.log(`\n======================================================`);
console.log(`📊 INFORME DE AUDITORÍA UX & HUMANIZER EN /docs/`);
console.log(`======================================================`);
console.log(`📁 Total documentos analizados: ${stats.totalFiles}`);
console.log(`⚠️  Títulos extensos (>8 palabras): ${stats.longHeadings.length}`);
console.log(`🎨 Encabezados con emojis decorativos: ${stats.emojiHeadings.length}`);
console.log(`🤖 Patrones / Tells de IA detectados: ${stats.aiTellsFound.length}`);

if (stats.aiTellsFound.length > 0) {
  console.log(`\n--- 🔍 DETALLE DE PATRONES DE IA (HUMANIZER) ---`);
  for (const t of stats.aiTellsFound) {
    console.log(`• [${t.file}] ${t.label} -> "${t.match}"`);
  }
}

if (stats.emojiHeadings.length > 0) {
  console.log(`\n--- 🎨 MUESTRA DE ENCABEZADOS CON EMOJIS (Top 10) ---`);
  for (const e of stats.emojiHeadings.slice(0, 10)) {
    console.log(`• [${e.file}:${e.line}] ${e.heading}`);
  }
}

if (stats.longHeadings.length > 0) {
  console.log(`\n--- ⚠️  MUESTRA DE TÍTULOS EXTENSOS (Top 10) ---`);
  for (const h of stats.longHeadings.slice(0, 10)) {
    console.log(`• [${h.file}:${h.line}] (${h.words} palabras) "${h.heading}"`);
  }
}
