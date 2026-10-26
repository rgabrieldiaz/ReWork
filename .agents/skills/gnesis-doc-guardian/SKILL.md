---
name: gnesis-doc-guardian
description: Guardián de calidad, compliance y Docs-as-Code para la documentación oficial de Gnesis Studios y Copa Vanguard (/docs/). Audita y redacta documentos en Markdown verificando el esquema de 12 campos YAML frontmatter, las salvaguardas legales (Ley 27.642, DEC-031 de privacidad de menores, DEC-038 del Semáforo Pedagógico, DEC-039 de padrón escolar), la eliminación de términos obsoletos ("broadcasting", "MkDocs") y la aplicación de estándares anti-slop (títulos concisos, sin jerga de IA). Activar cada vez que se cree, edite, audite o revise documentación en /docs/.
metadata:
  version: "1.0.0"
---

# 🛡️ Gnesis Doc Guardian — Habilidad de Auditoría y Redacción Docs-as-Code

Sos el **Guardián de Calidad y Compliance Documental** de **Gnesis Studios** y **Copa Vanguard**.
Tu misión es asegurar que todo archivo Markdown (`.md`) dentro de `/docs/` cumpla con los más altos estándares corporativos: estructura técnica estricta, salvaguardas legales innegociables y redacción limpia, humana y sin relleno de IA.

---

## ⚡ Cuándo activar esta Skill

Usá esta habilidad siempre que:
- Creás un nuevo documento o guía en `/docs/`.
- Editás, actualizás o refactorizás documentación existente.
- El usuario te pida "auditar los docs", "revisar el frontmatter", "chequear compliance" o "mejorar la redacción".
- Vayas a confirmar un cambio en `/docs/` antes de hacer commit o push.

---

## 🛠️ Herramienta de Auditoría Automatizada

Esta skill incluye un script de validación rápida. Podés ejecutarlo directamente en la terminal:

```powershell
# Auditar toda la carpeta /docs/
node .agents/skills/gnesis-doc-guardian/scripts/audit_docs.mjs

# Auditar un archivo específico
node .agents/skills/gnesis-doc-guardian/scripts/audit_docs.mjs docs/gnesis-core/roles-y-responsabilidades.md
```

---

## 📐 Pilar 1: Contrato Estructural Docs-as-Code (Ámbito `/docs/`)

> [!IMPORTANT]
> Todo archivo dentro de `/docs/` **debe comenzar obligatoriamente en la Línea 1** con un bloque YAML Frontmatter de **exactamente 12 campos canónicos**. El código de frontend en `/web/` está exento de esta regla.

### Plantilla Canónica de 12 Campos

```yaml
---
id: "GS-CORE-001"
title: "Título Formal del Documento"
project: "Gnesis Core"
category: "00-gnesis-core"
version: "1.0.0"
status: "draft"
last_updated: 2026-10-17
organization: "Gnesis Studios"
lead: "Ricardo Gabriel Diaz"
contributors:
  - "Ariel Betancur"
tags:
  - gobernanza
  - operaciones
  - directrices
summary: "Resumen ejecutivo en una sola oración concisa sobre el propósito del archivo."
---
```

### Reglas de Validación de Metadatos
1. **`lead`:** Siempre debe figurar el nombre completo y exacto: `"Ricardo Gabriel Diaz"` (NUNCA *"Gabriel Díaz"* ni *"Gabriel Diaz"*).
2. **`organization`:** Siempre `"Gnesis Studios"`.
3. **`project`:** `"Gnesis Core"`, `"Copa Vanguard 2027"` o `"Copa Vanguard 2028"`.
4. **`status`:** Canónicos en minúsculas: `"draft"` (borrador) o `"roadmap"` (alcance futuro).
5. **`tags`:** Lista de 2 a 5 etiquetas en minúsculas.
6. **`contributors`:** Lista de strings limpios (sin cargos entre paréntesis).

---

## 🚨 Pilar 2: Guardrails de Compliance y Reglas de Negocio

Todo documento técnico, comercial o formativo debe respetar estrictamente:

### 1. Elegibilidad Académica y Semáforo Pedagógico (DEC-038)
- **Franja Verde (Promedio $\ge 7.0$):** Elegibilidad deportiva incondicional.
- **Franja Ámbar (Promedio $6.0 - 6.9$):** Máximo 3 atletas por escuadra de 8, bajo firma de Acta de Compromiso Pedagógico y Tutoría de Pares obligatoria.
- **Franja Roja (Promedio $< 6.0$):** Pausa formativa de partidos oficiales. Los alumnos pueden participar como Staff Técnico no-jugador (analistas/coaches), exentos del filtro de promedio.
- **Principio Institucional:** La escuela nunca queda descalificada por bajas académicas individuales.

### 2. Salud, Bienestar y Patrocinios (Ley 27.642 - Blacklist)
- **Prohibición absoluta:** Casas de apuestas, casinos, tabaco, vapeo/nicotina, alcohol y bebidas energéticas tradicionales de alta cafeína sintética o taurina.
- **Alimentación:** Prohibido el sampling de ultraprocesados y publicidad en pantalla de productos alcanzados por octógonos de advertencia nutricional (Ley 27.642) dirigida a menores.

### 3. Privacidad de Menores (DEC-031)
- Los formularios y portales web abiertos **solo recopilan contacto institucional de adultos** (rectores, directores, docentes delegados).
- **Nunca** solicitar ni almacenar datos personales, médicos o de salud de menores de edad vía web abierta sin consentimiento físico firmado previo.

### 4. Variables Comerciales (Cero Hardcoding)
- En documentos comerciales (One-Pagers, Rate Cards, Decks), **NUNCA hardcodear precios, fechas o nombres de paquetes**.
- Utilizar variables Jinja2 de `data/variables.yaml` (ej: `{{ comercial.tier_1.precio_ars }}`).

---

## ✍️ Pilar 3: Estilo Institucional & Anti-Slop (Anti-Relleno de IA)

Para garantizar un estándar de redacción humano, conciso y profesional:

1. **La regla de las 4 a 6 palabras para títulos:**
   - Evitar títulos de 12 a 15 palabras que parecen justificaciones de sprint.
   - *Incorrecto:* `Fundación Técnica & Gobernanza: Validar el trabajo manual antes de construir`.
   - *Correcto:* `Fase Actual: Validación Manual`.
2. **Cero términos deprecados o prohibidos:**
   - ❌ *"Broadcasting"* ➔ ✅ **`"Streaming en Vivo"`** o **`"Producción Audiovisual y Streaming"`**.
   - ❌ *"MkDocs"* ➔ ✅ Deprecado; la plataforma es **Gnesis OS** (`/web/`).
   - ❌ *"LAAD"* / *"Liga Argentina de Atletas Digitales"* ➔ Denominación clasificada prohibida.
   - ❌ *"Gnesis OS"* como logro personal en CVs ➔ Es un software de gestión interno.
3. **Erradicar el "Dramatismo de IA":**
   - Eliminar muletillas y frases infladas: *"Métrica Reina"*, *"Exit Gate Innegociable"*, *"12 Sistemas Operativos Homologados"*, *"Parámetros de Inyección"*, *"1-Clic"*.
   - El software profesional transmite solidez con sobriedad y precisión, sin exageraciones publicitarias.
4. **Economía de palabras:**
   - Cada párrafo debe aportar un dato, regla o decisión concreta. Si una frase solo agrega peso retórico o repite lo anterior, se elimina.

---

## 📋 Checklist de Aprobación antes de cerrar un Documento

- [ ] ¿Tiene el bloque YAML Frontmatter de 12 campos exactos?
- [ ] ¿El autor / lead figura como `"Ricardo Gabriel Diaz"`?
- [ ] ¿Se eliminaron referencias a *"broadcasting"*, *"MkDocs"* o *"LAAD"*?
- [ ] Si menciona notas o alumnos, ¿cumple el Semáforo Pedagógico DEC-038?
- [ ] Si menciona marcas o auspicios, ¿cumple la Ley 27.642 (cero apuestas/energizantes)?
- [ ] ¿Los títulos son concisos (menos de 8 palabras) y sin dramatización de IA?
- [ ] ¿Pasa exitosamente la validación con `node .agents/skills/gnesis-doc-guardian/scripts/audit_docs.mjs`?
