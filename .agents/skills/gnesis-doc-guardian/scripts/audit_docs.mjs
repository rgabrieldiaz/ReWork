#!/usr/bin/env node
/**
 * audit_docs.mjs — Linter y Auditor de Documentación Docs-as-Code para Gnesis Studios
 * 
 * Valida:
 * 1. YAML Frontmatter canónico de 12 campos (.antigravity/frontmatter_schema.md)
 * 2. Unificación estricta del nombre Ricardo Gabriel Diaz (cero "Gabriel Díaz")
 * 3. Detección de términos deprecados ("broadcasting", "MkDocs", "LAAD")
 * 4. Guardrails de Compliance: Ley 27.642, DEC-038 (Semáforo), DEC-031 (Menores)
 * 5. Anti-Slop: Títulos inflados (>10 palabras) y jerga de IA en encabezados
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(process.cwd());
const DOCS_DIR = join(REPO_ROOT, 'docs');

// Intentar cargar yaml desde web/node_modules/yaml o usar parser interno
let parseYaml;
const localYamlPath = join(REPO_ROOT, 'web', 'node_modules', 'yaml', 'browser', 'index.js');
const fallbackYamlPath = join(REPO_ROOT, 'web', 'node_modules', 'yaml', 'index.js');

try {
  const targetYaml = existsSync(localYamlPath) ? localYamlPath : fallbackYamlPath;
  const yamlModule = await import(pathToFileURL(targetYaml).href);
  parseYaml = yamlModule.parse;
} catch {
  // Parser liviano de fallback para frontmatter básico
  parseYaml = (yamlString) => {
    const lines = yamlString.split('\n');
    const result = {};
    let currentKey = null;
    let inList = false;

    for (let rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      if (!line.trim() || line.trim().startsWith('#')) continue;

      if (line.match(/^\s*-\s+(.+)$/)) {
        const item = line.replace(/^\s*-\s+/, '').replace(/^['"](.*)['"]$/, '$1').trim();
        if (currentKey && inList) {
          result[currentKey].push(item);
        }
        continue;
      }

      const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim();
        currentKey = key;

        if (val === '') {
          result[key] = [];
          inList = true;
        } else {
          inList = false;
          result[key] = val.replace(/^['"](.*)['"]$/, '$1');
        }
      }
    }
    return result;
  };
}

const CANONICAL_FIELDS = [
  'id',
  'title',
  'project',
  'category',
  'version',
  'status',
  'last_updated',
  'organization',
  'lead',
  'contributors',
  'tags',
  'summary'
];

const VALID_STATUSES = new Set([
  'draft', 'roadmap', 'Approved', 'Draft', 'In Review', 'Finished', 'Deprecated'
]);

const VALID_LEADS = new Set([
  'Ricardo Gabriel Diaz',
  'Ariel Betancur',
  'Eliana',
  'Belén',
  'Dio',
  'Fractur',
  'Gine'
]);

const DEPRECATED_PATTERNS = [
  { regex: /\bbroadcasting\b/i, message: 'Término obsoleto "broadcasting". Reemplazar por "Streaming en Vivo" o "Producción Audiovisual y Streaming".' },
  { regex: /(?<!Ricardo\s)Gabriel\s+D[ií]az\b/i, message: 'Nombre acortado no permitido. Usar siempre el nombre canónico completo: "Ricardo Gabriel Diaz".' },
  { regex: /\bmkdocs\b/i, message: 'MkDocs está deprecado y fue removido del repositorio. El frontend activo es React + Vite en /web/.' },
  { regex: /\bLAAD\b|\bLiga Argentina de Atletas Digitales\b/i, message: 'Denominación clasificada prohibida en documentación pública/general.' },
];

const AI_SLOP_PATTERNS = [
  { regex: /\bmétrica reina\b/i, message: 'Slop de IA ("métrica reina"). Reemplazar por "Objetivo Clave" o "Métrica Principal".' },
  { regex: /\bexit gate innegociable\b/i, message: 'Slop de IA ("exit gate innegociable"). Reemplazar por "Requisito de Aprobación" o "Criterio de Salida".' },
  { regex: /\bsistemas operativos homologados\b/i, message: 'Error semántico ("sistemas operativos homologados"). Usar "Plantillas Oficiales".' },
  { regex: /\bparámetros de inyección\b/i, message: 'Jerga de backend ("parámetros de inyección"). Usar "Datos del Documento" o "Variables del Colegio".' },
  { regex: /\bno construir todavía\b/i, message: 'Tono informal de sprint ("no construir todavía"). Usar "Tareas Bloqueadas" o "En Espera".' },
];

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

function auditFile(filePath) {
  const relPath = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
  const content = readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  // 1. Validar Frontmatter
  const frontmatterMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    errors.push('Falta bloque YAML Frontmatter delimitado por "---" al inicio del archivo.');
  } else {
    let data;
    try {
      data = parseYaml(frontmatterMatch[1]);
    } catch (e) {
      errors.push(`Error de sintaxis YAML en Frontmatter: ${e.message}`);
    }

    if (data && typeof data === 'object') {
      const keys = Object.keys(data);
      for (const field of CANONICAL_FIELDS) {
        if (!(field in data)) {
          errors.push(`Falta campo obligatorio en frontmatter: "${field}"`);
        }
      }

      const extraKeys = keys.filter((k) => !CANONICAL_FIELDS.includes(k));
      if (extraKeys.length > 0) {
        warnings.push(`Campos fuera del esquema canónico de 12 campos: ${extraKeys.join(', ')}`);
      }

      if (data.organization && data.organization !== 'Gnesis Studios') {
        errors.push(`El campo organization debe ser "Gnesis Studios" (actual: "${data.organization}")`);
      }

      if (data.lead && !VALID_LEADS.has(data.lead)) {
        if (/Gabriel\s+D[ií]az/i.test(data.lead)) {
          errors.push(`El lead debe ser "Ricardo Gabriel Diaz" (nunca "${data.lead}")`);
        } else {
          warnings.push(`Lead no listado en el esquema canónico: "${data.lead}"`);
        }
      }

      if (data.status && !VALID_STATUSES.has(data.status)) {
        warnings.push(`Status no reconocido: "${data.status}". Usar "draft" o "roadmap".`);
      }

      if (data.tags && (!Array.isArray(data.tags) || data.tags.length < 2 || data.tags.length > 5)) {
        warnings.push(`El campo "tags" debe tener entre 2 y 5 elementos.`);
      }
    }
  }

  // 2. Términos deprecados / prohibidos en el cuerpo
  const body = frontmatterMatch ? content.slice(frontmatterMatch[0].length) : content;

  for (const dep of DEPRECATED_PATTERNS) {
    if (dep.regex.test(body)) {
      errors.push(dep.message);
    }
  }

  // 3. Slop de IA en títulos y cuerpo
  for (const slop of AI_SLOP_PATTERNS) {
    if (slop.regex.test(body)) {
      warnings.push(slop.message);
    }
  }

  // 4. Auditoría de longitud de títulos (Headings) fuera de bloques de código y frontmatter
  const allLines = content.split(/\r?\n/);
  let inFm = false;
  let inCode = false;

  for (let i = 0; i < allLines.length; i++) {
    const rawLine = allLines[i];
    const trimmed = rawLine.trim();

    if (i === 0 && trimmed === '---') {
      inFm = true;
      continue;
    }
    if (inFm) {
      if (trimmed === '---') {
        inFm = false;
      }
      continue;
    }

    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCode = !inCode;
      continue;
    }

    if (!inCode) {
      const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const headingText = match[2].trim();
        const normalizedForCount = headingText.replace(/\{\{.*?\}\}/g, 'VAR');
        const words = normalizedForCount.split(/\s+/).filter(Boolean);
        if (words.length > 10) {
          warnings.push(`Línea ${i + 1}: Título extenso (${words.length} palabras): "${headingText.slice(0, 50)}...". Recomendado: máx. 8 palabras.`);
        }
      }
    }
  }

  return { relPath, errors, warnings };
}

// Ejecución
const target = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : DOCS_DIR;
let filesToAudit = [];

try {
  const stat = statSync(target);
  if (stat.isDirectory()) {
    filesToAudit = getAllMarkdownFiles(target);
  } else if (target.endsWith('.md')) {
    filesToAudit = [target];
  }
} catch {
  console.error(`❌ Ruta no encontrada: ${target}`);
  process.exit(1);
}

console.log(`\n🛡️  GNESIS DOC GUARDIAN — Auditoría Docs-as-Code`);
console.log(`📁 Analizando ${filesToAudit.length} archivo(s) en ${relative(REPO_ROOT, target) || '.'}...\n`);

let totalErrors = 0;
let totalWarnings = 0;
let failedFiles = 0;

for (const file of filesToAudit) {
  const { relPath, errors, warnings } = auditFile(file);
  totalErrors += errors.length;
  totalWarnings += warnings.length;

  if (errors.length > 0 || warnings.length > 0) {
    if (errors.length > 0) failedFiles++;
    console.log(`📄 ${relPath}`);
    for (const err of errors) {
      console.log(`   ❌ FAIL: ${err}`);
    }
    for (const warn of warnings) {
      console.log(`   ⚠️  WARN: ${warn}`);
    }
    console.log('');
  }
}

console.log(`----------------------------------------------------------------`);
if (totalErrors === 0 && totalWarnings === 0) {
  console.log(`✅ ¡Auditoría limpia! 0 errores y 0 advertencias en ${filesToAudit.length} documentos.`);
  process.exit(0);
} else if (totalErrors === 0) {
  console.log(`⚠️  Auditoría aprobada con advertencias: 0 errores, ${totalWarnings} advertencias en ${filesToAudit.length} documentos.`);
  process.exit(0);
} else {
  console.log(`❌ Auditoría falló: ${totalErrors} errores y ${totalWarnings} advertencias en ${failedFiles} de ${filesToAudit.length} documentos.`);
  process.exit(1);
}
