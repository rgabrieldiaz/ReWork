# ReWork — Guidelines de Desarrollo & Reglas del Challenge

Este repositorio participa en:
1. **Superteam Argentina Track @ Crypto World's Fair (Colosseum Hackathon en Solana)** (28 de Septiembre al 12/13 de Octubre de 2026) — *Hackathon Activo*. Ver [`docs/superteam_colosseum_hackathon.md`](./docs/superteam_colosseum_hackathon.md) y [`SOLANA-RULES.md`](./SOLANA-RULES.md).
2. **Argentina Builder Challenge (BAF × Stellar)** (12 al 27 de Septiembre de 2026) — Ver [`docs/reglamento_argentina_builder_challenge.md`](./docs/reglamento_argentina_builder_challenge.md).

Todas las tareas, refactorizaciones y adiciones de código deben alinearse estrictamente con los requerimientos, estándares de evaluación y regulaciones oficiales de ambas competencias.

---

## 🚨 Reglas Mandatorias de Cumplimiento

### 1. Cadencia y Disciplina de Commits (Criterio de Descalificación Oficial)
- **Frecuencia Regular:** El reglamento prohíbe explícitamente concentrar commits al final del sprint. Cada feature, corrección o avance significativo debe ser commiteado de forma atómica y descriptiva.
- **Convención:** Utilizar *Conventional Commits* (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- **Higiene del Repositorio:** 
  - La raíz del proyecto debe mantenerse limpia.
  - Prohibido commitear archivos de log (`*.log`), salidas de terminal (`*.txt`), dumps de datos (`*_dump.json`), cachés de build (`*.tsbuildinfo`) o carpetas temporales (`.temp/`).
  - Nunca commitear credenciales o secrets en texto plano (utilizar siempre variables de entorno referenciadas en `.env.example`).

### 2. Estándares Técnicos de Solana (Superteam Argentina & Colosseum)
Ver especificaciones completas en [`SOLANA-RULES.md`](./SOLANA-RULES.md) y [`docs/solana_stack_guide.md`](./docs/solana_stack_guide.md).
- **SDK Cliente:** `@solana/kit` v8+ con plugins (`createClient().use(...)`). Prohibido `@solana/web3.js` v1 legacy en código nuevo.
- **Smart Contracts / Programas:** Anchor framework con validación estricta de cuentas, canonical bumps en PDAs y aritmética `checked_*`.
- **Wallets & Onboarding:** Privy (wallets embebidas de Solana vía email/social) + Wallet Standard (Phantom, Solflare). El usuario Web2 no debe requerir SOL previo.
- **Tokens & Red:** Operaciones centradas en **USDC** sobre **Solana Devnet** (SPL Token / Token-2022).
- **RPC:** Triton RPC configurado exclusivamente en `.env.local` (nunca en código ni commits).
- **Testing:** LiteSVM/Mollusk para unit tests, Surfpool para integración, y `anchor test` en devnet.

### 3. Estándares Técnicos y Stellar Building Blocks (Challenge Previo)
La **Ejecución Técnica** representa el 25% del puntaje y es el **primer criterio de desempate** del jurado.
- **Smart Contracts & Escrow:** Integración robusta de contratos de custodia en Soroban mediante **Trustless Work** (V1 en producción / V2 en testnet).
- **Stellar Wallets:** Conexión fluida con wallets del ecosistema (Freighter, Lobstr, xBull) usando `stellar-wallets-kit` y soporte de mobile deep linking.
- **Estándares SEP:** Pagos y cobros móviles basados en **SEP-0007** (QR con URI estándar de Stellar).
- **Tokens & Red:** Operaciones centradas en **USDC nativo** sobre Stellar Testnet y Mainnet.
- **Verificación Continua:**
  - Antes de cada commit, verificar que TypeScript compile sin errores: `npx tsc --noEmit`.
  - Ejecutar y mantener actualizados los tests de verificación en `scripts/` (`test_services_health.mjs`, `test_crud_rls.mjs`, `test_escrow_api.mjs`).

### 4. Foco en Producto y Usabilidad Real
- **Experiencia de Usuario (UX):** Diseñar interfaces pensadas para usuarios reales (freelancers, agencias, DAOs). El flujo debe ser intuitivo, con estados de carga claros, toasts de notificación (`sonner`) y manejo transparente de errores.
- **Onboarding Híbrido:** Respetar la autenticación dual (social login vía Privy para usuarios Web2 y wallets nativas para usuarios Web3).

---

## 📅 Hitos Críticos y Cronograma de Competencias

### Track Superteam Argentina · Crypto World's Fair (Solana Colosseum)
| Fecha | Instancia | Foco Requerido |
| :--- | :--- | :--- |
| **02/10 — 04/10** | **Build Station BsAs & Regionales** | Sprint de desarrollo de integración Solana. Demo Day preliminar (04/10 19:30). |
| **05/10 — 11/10** | **Mentorship Top Talent** | Mentorías 1-on-1 de producto, tech y pitch para preseleccionados. |
| **12/10 (23:59 ART)** | 🚨 **Deadline Superteam Earn** | Cierre de entrega oficial para el track de Argentina (Pozo: 10.000 USDC). |
| **13/10 (03:59 ART)** | 🚨 **Deadline Global Colosseum** | Cierre global de Crypto World's Fair (en inglés obligatorio). |
| **< 28/10** | **Resultados Oficiales** | Anuncio de proyectos ganadores. |

### Argentina Builder Challenge (BAF × Stellar) — Concluido
| Fecha | Instancia | Foco Requerido |
| :--- | :--- | :--- |
| **24/09** | **Checkpoint 2** | Entrega de avance real en features de escrow, pagos QR y persistencia multi-tenant. |
| **26/09** | **Checkpoint 3** | Congelamiento de código, optimización de UI/UX y verificación integral de flujos. |
| **27/09** | **Submission Final** | Deck + Video Demo + Repositorio + Deploy en Vercel. |

---

## 📂 Organización de Archivos
- `src/app/`: Rutas de Next.js App Router (páginas públicas y dashboard autenticado en `/app/`).
- `src/components/`: Componentes UI y modales interactivos (QR, transferencias, pools de Stellar).
- `src/hooks/`: Hooks de estado y lógica de negocio (`useWallet`, `useProfile`, `useWorkspace`, `useStaking`).
- `src/lib/`: Clientes y utilidades blockchain (`stellar.ts`, `supabase.ts`, `crypto.ts`, `currency.ts`).
- `scripts/`: Scripts automatizados de testing, inicialización y verificación técnica.
- `docs/`: Documentación del proyecto y reglamentos oficiales.
- `.agents/skills/`: Skills de agente para Stellar y Trustless Work.
