# ReWork — Guidelines de Desarrollo & Reglas del Challenge

Este repositorio participa en el **Argentina Builder Challenge (BAF × Stellar)** (12 al 27 de Septiembre de 2026).  
Todas las tareas, refactorizaciones y adiciones de código deben alinearse estrictamente con los requerimientos, estándares de evaluación y regulaciones oficiales del challenge ([`docs/reglamento_argentina_builder_challenge.md`](./docs/reglamento_argentina_builder_challenge.md)).

---

## 🚨 Reglas Mandatorias de Cumplimiento

### 1. Cadencia y Disciplina de Commits (Criterio de Descalificación Oficial)
- **Frecuencia Regular:** El reglamento prohíbe explícitamente concentrar commits al final del sprint. Cada feature, corrección o avance significativo debe ser commiteado de forma atómica y descriptiva.
- **Convención:** Utilizar *Conventional Commits* (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- **Higiene del Repositorio:** 
  - La raíz del proyecto debe mantenerse limpia.
  - Prohibido commitear archivos de log (`*.log`), salidas de terminal (`*.txt`), dumps de datos (`*_dump.json`), cachés de build (`*.tsbuildinfo`) o carpetas temporales (`.temp/`).
  - Nunca commitear credenciales o secrets en texto plano (utilizar siempre variables de entorno referenciadas en `.env.example`).

### 2. Estándares Técnicos y Stellar Building Blocks (Criterio de Desempate #1)
La **Ejecución Técnica** representa el 25% del puntaje y es el **primer criterio de desempate** del jurado.
- **Smart Contracts & Escrow:** Integración robusta de contratos de custodia en Soroban mediante **Trustless Work** (V1 en producción / V2 en testnet).
- **Stellar Wallets:** Conexión fluida con wallets del ecosistema (Freighter, Lobstr, xBull) usando `stellar-wallets-kit` y soporte de mobile deep linking.
- **Estándares SEP:** Pagos y cobros móviles basados en **SEP-0007** (QR con URI estándar de Stellar).
- **Tokens & Red:** Operaciones centradas en **USDC nativo** sobre Stellar Testnet y Mainnet.
- **Verificación Continua:**
  - Antes de cada commit, verificar que TypeScript compile sin errores: `npx tsc --noEmit`.
  - Ejecutar y mantener actualizados los tests de verificación en `scripts/` (`test_services_health.mjs`, `test_crud_rls.mjs`, `test_escrow_api.mjs`).

### 3. Foco en Producto y Usabilidad Real
- **Experiencia de Usuario (UX):** Diseñar interfaces pensadas para usuarios reales (freelancers, agencias, DAOs). El flujo debe ser intuitivo, con estados de carga claros, toasts de notificación (`sonner`) y manejo transparente de errores.
- **Onboarding Híbrido:** Respetar la autenticación dual (social login vía Privy para usuarios Web2 y wallets nativas para usuarios Web3).

---

## 📅 Hitos Críticos y Cronograma del Challenge

| Fecha | Instancia | Foco Requerido |
| :--- | :--- | :--- |
| **24/09** | **Checkpoint 2** | Entrega de avance real en features de escrow, pagos QR y persistencia multi-tenant. |
| **26/09** | **Checkpoint 3** | Congelamiento de código, optimización de UI/UX y verificación integral de flujos. |
| **27/09** | **Submission Final** | Entrega obligatoria: **Deck + Video Demo (Loom/YouTube) + Repositorio con historial de commits + Deploy funcional en Vercel**. |

---

## 📂 Organización de Archivos
- `src/app/`: Rutas de Next.js App Router (páginas públicas y dashboard autenticado en `/app/`).
- `src/components/`: Componentes UI y modales interactivos (QR, transferencias, pools de Stellar).
- `src/hooks/`: Hooks de estado y lógica de negocio (`useWallet`, `useProfile`, `useWorkspace`, `useStaking`).
- `src/lib/`: Clientes y utilidades blockchain (`stellar.ts`, `supabase.ts`, `crypto.ts`, `currency.ts`).
- `scripts/`: Scripts automatizados de testing, inicialización y verificación técnica.
- `docs/`: Documentación del proyecto y reglamentos oficiales.
- `.agents/skills/`: Skills de agente para Stellar y Trustless Work.
