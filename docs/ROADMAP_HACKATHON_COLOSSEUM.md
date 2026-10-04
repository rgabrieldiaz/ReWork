# Roadmap de Ejecución & Formulario de Preselección · Colosseum Solana Hackathon

> **Proyecto:** ReWork  
> **Track:** Superteam Argentina @ Crypto World's Fair (Colosseum Hackathon)  
> **Fecha de Inicio:** 2 de Octubre de 2026 | **Próximo Hito Crítico:** Domingo 4 de Octubre a las 16:00 ART (Cierre Preselección)

---

## 🎯 Cronograma General de Hitos

```mermaid
timeline
    title Hoja de Ruta de Entregas y Eventos ReWork
    section Build Station (Fin de Semana)
        Viernes 02/10 : Arranque y configuración de entorno
        Sábado 03/10 : Integración Solana + Grabación de videos
        Domingo 04/10 (16:00) : 🚨 CIERRE PRESELECCIÓN PITCH
        Domingo 04/10 (19:30) : Demo Day en vivo (Café Nómada / Streaming)
    section Mentorship Week
        Lunes 05/10 - Dom 11/10 : Mentorship Top Talent (10 seleccionados)
        Miércoles 07/10 : Testing con usuarios y feedback
    section Final Dual Submission
        Lunes 12/10 (23:59 ART) : 🚨 ENTREGA SUPERTEAM EARN (10.000 USDC)
        Martes 13/10 (03:59 ART) : 🚨 ENTREGA GLOBAL COLOSSEUM (Inglés)
```

---

## 📋 Fase 1: Hito Inmediato — Preselección para el Pitch (Hasta Domingo 04/10 16:00 ART)

El formulario oficial se completa en:  
👉 **[https://superteam.ar/colosseum/preseleccion](https://superteam.ar/colosseum/preseleccion)**

> ⚠️ **Importante:** Lo envía **una sola persona por equipo**. Se puede volver a mandar en cualquier momento antes de las 16:00 hs del domingo y la organización tomará la última versión.

### Checklist de Tareas Inmediatas (Paso a Paso)

- [ ] **1. Tareas de Registro y Plataforma (Hoy Viernes 02/10)**
  - [ ] Registrarse en el hub del Hackathon en Luma: [luma.com/3qmbyb6h](https://luma.com/3qmbyb6h).
  - [ ] Cada miembro del equipo debe registrar su cuenta en Colosseum con país **Argentina**: [arena.colosseum.org](https://arena.colosseum.org/).
  - [ ] Crear el proyecto ReWork en Colosseum con ubicación **Argentina**.
  - [ ] Completar el formulario inicial de seguimiento de Superteam: [forms.gle/Ej7sGChMBdW1p2WJ9](https://forms.gle/Ej7sGChMBdW1p2WJ9).

- [x] **2. Tareas Técnicas y de Producto en Solana (Viernes 02/10 — Sábado 03/10)**
  - [x] Configurar `@solana/kit` en el frontend de ReWork.
  - [x] Configurar endpoint de Devnet RPC (Triton) en `.env.local` / fallback.
  - [x] Habilitar autenticación y conexión con wallets de Solana (Privy embedded wallet + Phantom/Solflare con Wallet Standard).
  - [x] Crear flujo visual e interactivo de pago/escrow de prueba en USDC sobre Solana Devnet.
  - [x] Realizar deploy en Vercel y verificar que no haya errores de compilación (`npx tsc --noEmit`).

- [ ] **3. Producción de Videos (Sábado 03/10 — Domingo 04/10 mediodía)**
  - [ ] **Video de Pitch (Máximo 2:00 min):** Founders, el problema en LatAm (fricción de cobro y comisiones abusivas), la solución de ReWork y el rol de Solana. Formato YouTube / Loom público.
  - [ ] **Video de Demo (Máximo 3:00 min):** Grabación de pantalla con el flujo de usuario real (onboarding, creación de contrato o pago en Solana USDC, firma y confirmación en Devnet). Formato YouTube / Loom público.

- [ ] **4. Envío del Formulario (Domingo 04/10 antes de las 16:00 ART)**
  - [ ] Cargar todos los campos detallados a continuación en [superteam.ar/colosseum/preseleccion](https://superteam.ar/colosseum/preseleccion).
  - [ ] Verificar confirmación de envío.
  - [ ] Preparar pitch para el **Demo Day del domingo 19:30 ART** en caso de quedar preseleccionados.

---

## 📝 Borrador Listo para el Formulario de Preselección

*(Nota: Superteam recomienda redactar el contenido en inglés para que sirva directamente tanto para la preselección local como para la entrega global de Colosseum)*.

### 1. Datos Personales & Ubicación
- **Tu nombre:** Ricardo Gabriel Diaz
- **Mail:** gabrieldiaz81@gmail.com
- **Telegram:** `@tu_usuario_telegram` *(completar con tu @)*
- **Dónde está el equipo:** Buenos Aires, Argentina

### 2. El Proyecto
- **Nombre del proyecto:** `ReWork`
- **En una frase (Hasta 140 caracteres):**
  > *Autonomous freelance marketplace & programmable escrow on Solana, eliminating cross-border fees and payment delays for global builders.*
  *(134 caracteres)*
- **Descripción (Al menos 50 chars, máx 2000 chars):**
  > Latin American freelancers and remote workers lose up to 15-20% of their earnings to cross-border banking fees, intermediary hold-ups, and forced fiat exchange rates. Traditional platforms hold funds for weeks and lack verifiable, trustless protection for both parties.
  > 
  > ReWork is a decentralized freelance and collaborative work platform powered by Solana. By leveraging Solana's sub-second finality and near-zero transaction costs, ReWork enables trustless milestone-based escrow, instant peer-to-peer USDC settlements, and verifiable work history. 
  > 
  > We solve the Web3 adoption barrier through a hybrid onboarding experience: Web2 users sign in seamlessly via email/social login powered by Privy embedded Solana wallets with fee sponsorship, while Web3-native builders connect directly via Phantom or Solflare. ReWork empowers builders to find work, create verifiable agreements, and get paid instantly in stable currency without intermediaries.

### 3. Blockchains y Herramientas
- **Stack & Tooling:**
  > Solana Devnet, `@solana/kit` v8+, Triton RPC, Anchor Framework, SPL Token / Token-2022 (USDC), Privy (Embedded Solana Wallets & Social Login), Wallet Standard (Phantom, Solflare), Next.js 14 (App Router), TypeScript, TailwindCSS, Supabase.

### 4. Logo o Imagen del Producto (Opcional)
- URL de asset o logo en GitHub / almacenamiento público.

### 5. Videos y Repositorio
- **Video de pitch (2 minutos):** `https://youtu.be/...` *(Link de Loom o YouTube)*
- **Demo del producto (hasta 3 minutos):** `https://youtu.be/...` *(Link de Loom o YouTube)*
- **Repositorio de GitHub:** `https://github.com/rgabrieldiaz/ReWork`
- **El repositorio es:** Público (o Privado compartido con `hackathon@superteam.ar`)
- **Proyecto en Colosseum (Opcional):** Link al proyecto en `arena.colosseum.org`

### 6. Equipo y Mercado
- **El equipo (Máx 2000 caracteres):**
  > **Ricardo Gabriel Diaz — Full-stack Developer & Technical Lead**
  > Experienced software engineer specializing in modern web architecture, smart contract integration, and decentralized systems. Leading architecture, blockchain rails, and frontend development.
  > GitHub: https://github.com/rgabrieldiaz | LinkedIn: https://linkedin.com/in/...
  > 
  > *(Agregar aquí a los demás integrantes del equipo: Nombre, rol, experiencia previa y links a LinkedIn / GitHub / X).*

- **Go-to-market y validación (Máx 2000 caracteres):**
  > **Target Audience:** Independent software engineers, designers, content creators, and remote agencies in Latin America who earn in USD/stablecoins and work with international clients.
  > 
  > **Demand Validation:** 
  > We conducted interviews with over 15 active remote workers in Argentina and LatAm. 100% cited payment delays (3 to 14 days in platforms like Upwork/Deel) and excessive withdrawal commissions (Payoneer/SWIFT fees) as their top pain point. Beta testers appreciated instant USDC settlements and the ability to operate without prior crypto knowledge.
  > 
  > **Distribution Strategy:**
  > 1. **Community Seeding:** Direct onboarding via regional Web3 and tech hubs (Superteam Argentina, dev bootcamps, freelance communities).
  > 2. **B2B Agency Outreach:** Partnering with regional boutique software agencies to handle their subcontractor escrow and payroll on Solana.
  > 3. **Frictionless Referral Flywheel:** Freelancers invite their clients directly with zero friction—clients pay via simple card/email onboarding (Privy) or native wallet, settling automatically in USDC.

---

## 🎬 Guiones Técnicos Oficiales para los Videos

> 📄 **Documento Maestro Completo:** Ver [`docs/GUIONES_VIDEOS_COLOSSEUM_SOLANA.md`](./GUIONES_VIDEOS_COLOSSEUM_SOLANA.md) para el detalle segundo a segundo, cues de pantalla interactivos, clics en vivo y textos bilingües palabra por palabra (Español & English).

### 1. Video de Pitch (Máximo 2:00 min / 120 s)
- **0:00 - 0:28 (Hook & El Problema):** Dolor real en LatAm: 20% en comisiones, 14 días de espera, impagos. Slide 1 y 2 de `/deck`.
- **0:28 - 0:55 (La Solución - ReWork):** Marketplace descentralizado + Escrow programable en stablecoins sin intermediarios. Slide 3 y 4 de `/deck`.
- **0:55 - 1:25 (Por qué Solana & UX):** Sub-second finality (~400ms), comisiones de $0.0008, onboarding Web2 sin gas con Privy + Phantom/Solflare con Wallet Standard. Slide 6 y 7 de `/deck`.
- **1:25 - 1:45 (Modelo de Negocio & Mercado):** 1% fee vs 20% de Web2, SaaS de tesorería, mercado global de $1.5T. Slide 8 y 9 de `/deck`.
- **1:45 - 2:00 (Equipo & Visión):** Founders argentinos, listos para la mentoría Top Talent y ganar en Colosseum. Slide 12 de `/deck`.

### 2. Video de Demo del Producto (Máximo 3:00 min / 180 s)
- **0:00 - 0:35 (Onboarding & Acceso):** Login con Google (Privy) o Phantom; ingreso automático al Workspace `rework` con 500 AURA y banner de bienvenida.
- **0:35 - 1:20 (Bóveda de Escrow Solana):** Apertura de "⚡ Solana Escrow Vault", contrato de $150 USDC con milestones, firma en 400ms y verificación en Solana Explorer.
- **1:20 - 1:55 (Moneda SOL & Swap Devnet):** Toggle de 4 monedas `[ USDC | ARS | XLM | SOL ]` recalculando patrimonio; Swap `SOL ⇄ USDC` en Solana Devnet con fee de ~$0.0008.
- **1:55 - 2:30 (Bóvedas DeFi de Tesorería):** Agente de Pools con pestaña Solana: Marinade (7.4%), Kamino (18.2%), Meteora (15.6%), Raydium (16.9%).
- **2:30 - 2:55 (Simulador Financiero & Cierre Técnico):** `/app/goals` con proyección en 4 monedas, AURA CV on-chain y verificación de 0 mocks con `scripts/detect_fake_code.mjs`.

---

## 🚀 Fase 2: Mentorship Top Talent (05/10 — 11/10)
- Postulación a Mentorship en Luma: [luma.com/utpm0167](https://luma.com/utpm0167).
- Refinamiento de contratos Anchor y pruebas en Surfpool / LiteSVM.
- Integración de feedback de los mentores de Superteam Argentina.
- Recolección de 3 a 5 testimonios y métricas de uso reales para presentar en la entrega final.

---

## 🏆 Fase 3: Doble Entrega Final (12/10 y 13/10)
- **Lunes 12/10 23:59 ART:** Entrega en el listing de **Superteam Earn** ([superteam.fun/earn](https://superteam.fun/earn/listing/colosseum-crypto-worlds-fair-hackathon-superteam-argentina-track)).
- **Martes 13/10 03:59 ART:** Entrega final en **Colosseum** ([arena.colosseum.org](https://arena.colosseum.org/)).
