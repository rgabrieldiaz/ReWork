import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../src');

const PATTERNS = [
  {
    name: 'Alerta Embarazosa / Mención de Simulación',
    regex: /alert\s*\(\s*["'`].*?(producción|simulad|mock|entorno de producción).*?["'`]\s*\)/gi,
    severity: 'ALTA'
  },
  {
    name: 'Alerta Nativa Browser (alert())',
    regex: /alert\s*\(/g,
    severity: 'MEDIA'
  },
  {
    name: 'Dirección Stellar Dummy Hardcodeada',
    regex: /GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H|dummyPlatform/g,
    severity: 'ALTA'
  },
  {
    name: 'ID Falso o Mock de Escrow',
    regex: /escrow-(mock|dev-mock)/g,
    severity: 'ALTA'
  },
  {
    name: 'Timeout Simulado de Red (Fake Promise Delay)',
    regex: /new\s+Promise\s*\(\s*(resolve|r)\s*=>\s*setTimeout\s*\(\s*(resolve|r)\s*,\s*\d+\s*\)\s*\)/g,
    severity: 'MEDIA'
  }
];

function scanDirectory(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDirectory(fullPath, results);
      }
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];

        for (const pattern of PATTERNS) {
          pattern.regex.lastIndex = 0;
          if (pattern.regex.test(line)) {
            const relPath = path.relative(path.resolve(__dirname, '..'), fullPath);
            results.push({
              file: relPath,
              line: lineIdx + 1,
              content: line.trim(),
              pattern: pattern.name,
              severity: pattern.severity
            });
          }
        }
      }
    }
  }

  return results;
}

console.log('=============================================================');
console.log('   🔍 AUDITORÍA DE REALIDAD: DETECCIÓN DE CÓDIGO FALSO / MOCKS');
console.log('=============================================================\n');

const findings = scanDirectory(rootDir);

const highSeverity = findings.filter(f => f.severity === 'ALTA');
const mediumSeverity = findings.filter(f => f.severity === 'MEDIA');

console.log(`📊 Total de incidencias encontradas: ${findings.length}`);
console.log(`   🚨 Severidad ALTA (Mocks críticos / Carteles vergonzosos): ${highSeverity.length}`);
console.log(`   ⚠️ Severidad MEDIA (Alerts nativos / Timeouts simulados): ${mediumSeverity.length}\n`);

if (highSeverity.length > 0) {
  console.log('🚨 INCIDENCIAS DE SEVERIDAD ALTA:');
  for (const item of highSeverity) {
    console.log(`  - [${item.pattern}] en ${item.file}:${item.line}`);
    console.log(`    Código: ${item.content.substring(0, 100)}...`);
  }
  console.log('');
}

if (mediumSeverity.length > 0) {
  console.log('⚠️ INCIDENCIAS DE SEVERIDAD MEDIA (Alerts / Delays):');
  for (const item of mediumSeverity.slice(0, 20)) {
    console.log(`  - [${item.pattern}] en ${item.file}:${item.line}`);
    console.log(`    Código: ${item.content.substring(0, 80)}...`);
  }
  if (mediumSeverity.length > 20) {
    console.log(`  ... y ${mediumSeverity.length - 20} incidencias más.`);
  }
  console.log('');
}

console.log('=============================================================');
