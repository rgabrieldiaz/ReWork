export type DeckLanguage = "en" | "es";

export interface SlideData {
  title: string;
  subtitle: string;
}

export const deckTranslations = {
  en: {
    nav: {
      scaleTrack: "Scale Track",
      sub: "Argentina Builder Challenge (BAF × Stellar)",
      prev: "Previous (←)",
      next: "Next (→)",
      downloadPdf: "Download PDF",
      downloadPdfShort: "PDF",
      downloadPdfTitle: "Export entire presentation to PDF",
      fullscreen: "Fullscreen (F)",
      viewApp: "View App",
      footerLeft: "ReWork Protocol · Stellar × BAF Argentina Builder Challenge 2026",
      slidePrefix: "Slide",
      of: "of"
    },
    slidesData: [
      { title: "Cover", subtitle: "ReWork — Trust Guaranteed by Code" },
      { title: "The Problem", subtitle: "25% Problem Validation" },
      { title: "The Solution", subtitle: "25% Product Focus" },
      { title: "Core Modules", subtitle: "Workspaces, Service Network & Quests" },
      { title: "4 Stellar Primitives", subtitle: "25% Technical Execution (#1 Tie-Breaker)" },
      { title: "Live Product", subtitle: "UX, Metrics & Live Farming" },
      { title: "Architecture", subtitle: "Stellar Building Blocks & Soroban" },
      { title: "Business Model", subtitle: "25% Business Focus" },
      { title: "Traction & Quality", subtitle: "0 Mocks, Tests & Active Deploy" },
      { title: "Comparison", subtitle: "Advantages over Alternatives" },
      { title: "90-Day Roadmap", subtitle: "Instawards & SCF 7.0 Pipeline" },
      { title: "Team & Closing", subtitle: "Builders & Contact" },
      { title: "Demo & Thanks", subtitle: "YouTube Walkthrough & Thank You" }
    ],
    slide0: {
      badge: "Argentina Builder Challenge · Stellar × BAF · Scale Track",
      quote: "“The value of trust guaranteed by code.”",
      description:
        "Decentralized B2B Workspace platform, Soroban Smart Escrow, and Sovereign Reputation for companies, agencies, and DAOs in Latin America.",
      badge1Title: "Soroban Smart Escrow",
      badge1Sub: "Trustless Work V1/V2",
      badge2Title: "SEP-0007 QR Pay",
      badge2Sub: "Deep-linking USDC/ARS",
      badge3Title: "DeFi Yield & Swaps",
      badge3Sub: "Stellar AMM Protocol 20+",
      badge4Title: "AURA On-Chain CV",
      badge4Sub: "Sovereign Reputation"
    },
    slide1: {
      tag: "01 / Criterion 1 (25%): Problem Validation",
      heading: "Lack of Trust Costs Millions to Digital Work in LATAM",
      lead: "In Latin America, over 45 million professionals and companies face frictions that destroy deals. When verifiable technical trust is absent, three critical problems arise:",
      card1Title: "Uncertainty & Non-Payments",
      card1Text:
        "Clients fear paying upfront without receiving the work; freelancers fear delivering without getting paid. Over 30% of freelancers suffer 45+ day delays or total non-payment due to lack of guarantees.",
      card2Title: "Predatory Fees (10-20%)",
      card2Text:
        "Traditional Web2 platforms (Upwork, Fiverr) charge up to 20% just to act as trust middlemen, along with 7-day banking delays and foreign exchange controls.",
      card3Title: "Locked Reputation",
      card3Text:
        "Digital feudalism: reputation built over years of hard work is locked in private servers. If the platform changes terms or closes the account, the professional loses everything.",
      footerMarket: "Target Market: +45M remote workers",
      footerFriction: "Estimated transactional friction: > USD $2.4B annually"
    },
    slide2: {
      tag: "02 / Criterion 2 (25%): Product Focus",
      heading: "ReWork: The Value of Trust Guaranteed by Code",
      lead: "We replace human arbitrariness and predatory fees with immutable code on Stellar: smart contracts that secure funds and clear rules for both parties:",
      card1Title: "Non-Custodial Escrow",
      card1Text:
        "Smart Escrow on Soroban (Trustless Work). The client locks 100% of funds in USDC upfront. Funds release upon verified milestones. Zero non-payment or scam risk.",
      card2Title: "Settlement in Seconds",
      card2Text:
        "Built on Stellar: transfers finalize in 3 to 5 seconds with sub-cent fees. No 7-day international banking waits.",
      card3Title: "Sovereign Identity (AURA)",
      card3Text:
        "Every completed milestone and quest earns immutable on-chain professional reputation tied to the user's Stellar public key, portable to any ecosystem.",
      step1: "1. USDC Deposit in Soroban",
      step2: "2. Milestone Completion",
      step3: "3. Automatic Release + AURA Points"
    },
    slide3: {
      tag: "03 / Product Focus: Solution Ecosystem",
      heading: "A Comprehensive Suite for Companies, Freelancers, and DAOs",
      card1Title: "Multi-Tenant Workspaces",
      card1Text:
        "Independent workspaces (`/app/[slug]`) with role-based access control (Superadmin, Admin, Member, Guest) protected by Postgres Row-Level Security.",
      card2Title: "Service Network & Marketplace",
      card2Text:
        "Open service offerings across all ReWork ecosystem users with no middlemen, featuring auctions and mandatory Soroban escrow contracts.",
      card3Title: "Squad Goals (Team Bounties)",
      card3Text:
        "Team incentives and pooled bounties for shared goals. Funds are pooled collectively and disbursed via voting or tech lead validation.",
      card4Title: "Campaigns & Crowdfunding",
      card4Text:
        "Crowdfunding with total transparency on Stellar. Contributors audit milestone progress before funds are released.",
      footerRoutes: "Live routes: /app/global-network · /app/marketplace · /app/teams · /app/crowdfunding",
      footerStatus: "100% Functional on Testnet"
    },
    slide4: {
      tag: "04 / Criterion 3 (25%): Technical Execution · #1 Tie-Breaker",
      heading: "The 4 Official Stellar Implementations in ReWork",
      lead: "ReWork is not a fork or a cosmetic skin: it leverages Stellar's full native infrastructure stack to eradicate mistrust end-to-end:",
      card1Badge: "01 · PAYMENTS",
      card1Title: "Mobile QR & Deep-Linking SEP-0007",
      card1Text:
        "Standard `web+stellar:pay` URI generation compatible with Lobstr, Freighter, and xBull. 3-5s settlement without copying public keys.",
      card2Badge: "02 · SMART CONTRACTS",
      card2Title: "Non-Custodial Escrow on Soroban",
      card2Text:
        "Robust integration with Trustless Work (V1/V2). Funds locked in USDC and released exclusively upon verified milestone completion.",
      card3Badge: "03 · DEFI & YIELD",
      card3Title: "Stellar AMM & Horizon Path Swaps",
      card3Text:
        "Idle liquidity yields up to +12.8% APY in native pools with the DeFi Agent (`StellarPoolsAgent`), 1-click withdrawal, and direct swaps without slippage.",
      card4Badge: "04 · IDENTITY",
      card4Title: "AURA On-Chain CV & Dual Onboarding",
      card4Text:
        "Immutable reputation portable across platforms. Frictionless onboarding: Web2 social login (Privy) or Web3 native wallet (Stellar Wallets Kit).",
      footerStandards: "Standards: SEP-0007 · SEP-0024/0038 ready · Protocol 20+ Soroban · Horizon v28",
      footerFunctional: "100% Functional"
    },
    slide5: {
      tag: "05 / Criterion 2 (25%): Product Focus & Real UX",
      heading: "World-Class Web3 Experience: 100% Functional",
      desktopOverlay: "Verified Soroban Contracts + DEX Swaps + Service Network",
      desktopCaption:
        "Web3 Desktop Dashboard: Real-time sparklines, Services Network, Soroban Escrow, and Yield Farming",
      mobileHeader: "ReWork Mobile",
      mobileNetwork: "Stellar Testnet",
      mobileNetWorth: "Total Balance",
      mobileLiquid: "Liquid: $350.00",
      mobileStake: "Active Stake: $900.00",
      mobileQr: "QR Pay",
      mobileQrSub: "SEP-0007",
      mobileBank: "ARS Bank",
      mobileBankSub: "Direct Ramp",
      mobileEscrowTitle: "Smart Contract Escrow",
      mobileEscrowBadge: "Active",
      mobileEscrowSub: "Frontend Audit — Milestone 2 of 3",
      mobileEscrowCustody: "Soroban Escrow:",
      mobileCaption: "Mobile PWA experience with deep-linking, SEP-0007 QR, and 1-click withdrawal"
    },
    slide6: {
      tag: "06 / Criterion 3 (25%): Technical Execution · Production Architecture (#1 Tie-Breaker)",
      heading: "Institutional-Grade Architecture on Stellar & Soroban",
      card1Title: "Soroban Smart Contracts",
      card1Text:
        "Programmatic escrow with Trustless Work (V1 in production / V2 in testnet). Conditional lock and release in USDC.",
      card2Title: "Stellar Wallets Kit",
      card2Text:
        "Universal multi-wallet integration with Freighter, Lobstr, xBull, and mobile deep-linking via the SEP-0007 protocol.",
      card3Title: "Hybrid Onboarding",
      card3Text:
        "Web2 social login via Privy with deterministic WebCrypto keys for users without a prior wallet, without compromising custody.",
      card4Title: "Supabase Postgres RLS",
      card4Text:
        "Strict multi-tenant isolation with Row Level Security. 0 database mocks verified with test suites in `scripts/`.",
      footerStack: "Stack: Next.js 16 (Turbopack) · TypeScript 5 · Tailwind CSS v4 · Stellar SDK v14.5 · Soroban RPC",
      footerVerified: "100% Verified on Testnet"
    },
    slide7: {
      tag: "07 / Criterion 4 (25%): Business Focus · Sustainable Monetization",
      heading: "The Economic Model of Trust",
      lead: "ReWork aligns its revenue model with user success: zero barriers to entry or penalties, charging only fair fees for generated value and premium services:",
      card1Stat: "1%",
      card1Title: "Fee per Completed Escrow",
      card1Text:
        "Transparent 1% fee retained only upon successful fund release via Soroban. 10x to 20x cheaper than Upwork/Fiverr (10-20%).",
      card2Stat: "B2B SaaS",
      card2Title: "Workspaces Pro & Enterprise",
      card2Text:
        "Subscription plans for agencies and DAOs: multi-sig treasuries, invoicing/tax reports, team roles, and sub-missions.",
      card3Stat: "0.25% + Yield",
      card3Title: "Fiat Ramp & DeFi Optimization",
      card3Text:
        "Minimal spread on ARS/USDC conversion with local Stellar Anchors (SEP-0024) and revenue share from yield optimization in AMM pools.",
      footerGoal: "Year 1 Goal: USD $1.5M escrow volume processed",
      footerRevenue: "Projected protocol revenue: USD $45k - $60k"
    },
    slide8: {
      tag: "08 / Technical Execution & Quality: 0 Mocks, 100% Verifiable",
      heading: "From Hypothesis to Reality: 0 Simulated Code",
      stat1Title: "Tests Passing",
      stat1Sub: "RLS, Escrow & RPC",
      stat2Title: "TypeScript Errors",
      stat2Sub: "Clean npx tsc --noEmit",
      stat3Title: "Mocks / Fake Data",
      stat3Sub: "Forensically audited",
      stat4Title: "Active Vercel Deploy",
      stat4Sub: "Continuous production",
      boxTitle: "Continuous Verification Suites Available in the Repository",
      bullet1: "• `scripts/detect_fake_code.mjs` (100% real integrity forensic audit)",
      bullet2: "• `scripts/test_services_health.mjs` (Horizon, Soroban RPC, and Supabase)",
      bullet3: "• `scripts/test_crud_rls.mjs` (PostgreSQL multi-tenant isolation)",
      bullet4: "• `scripts/test_escrow_api.mjs` (Soroban escrow lifecycle)"
    },
    slide9: {
      tag: "09 / Criteria 2 & 4: Defensible Competitive Advantages",
      heading: "Why ReWork Outperforms Alternatives?",
      colFeature: "Feature",
      colWeb2: "Web2 Platforms (Upwork)",
      colBank: "Traditional Bank Escrow",
      colReWork: "ReWork on Stellar",
      row1Label: "Fees",
      row1Web2: "10% to 20%",
      row1Bank: "3% to 5% + SWIFT fees",
      row1ReWork: "~1% (Transparent)",
      row2Label: "Payout Speed",
      row2Web2: "7 to 14 days",
      row2Bank: "3 to 5 business days",
      row2ReWork: "3 to 5 seconds",
      row3Label: "Fund Custody",
      row3Web2: "100% Centralized",
      row3Bank: "Banking Entity",
      row3ReWork: "Soroban Smart Contract",
      row4Label: "Reputation",
      row4Web2: "Trapped on platform",
      row4Bank: "Inexistent",
      row4ReWork: "Sovereign On-Chain (AURA CV)",
      row5Label: "Mobile QR Payments",
      row5Web2: "No",
      row5Bank: "No",
      row5ReWork: "Native SEP-0007",
      row6Label: "Yield on Idle Liquidity",
      row6Web2: "0% (Retained by platform)",
      row6Bank: "0% to 1%",
      row6ReWork: "Up to +12.8% APY (Stellar AMM)",
      footerLeft: "15x lower cost · Settlement in seconds · 100% non-custodial control",
      footerRight: "Beats Web2 and Traditional Finance"
    },
    slide10: {
      tag: "10 / Funding Readiness · Instawards & SCF 7.0 Pipeline",
      heading: "90-Day Roadmap: From Testnet to Scale with Stellar",
      col1Badge: "Month 1 · Instaward (USD $5,000)",
      col1Title: "Mainnet Deployment & Audit",
      col1Items: [
        "Deploy escrow contracts on Mainnet.",
        "Formal audit with SDF Audit Bank partner.",
        "Launch 2 initial pilots (Agency + DAO).",
        "Process first USD $10k in escrows."
      ],
      col2Badge: "Month 2 · SCF Tranche #1 (20%)",
      col2Title: "ARS Fiat Ramp & PWA App",
      col2Items: [
        "Integration with local Argentine peso (ARS) anchor SEP-0024.",
        "Progressive Web App (PWA) launch.",
        "Automated invoicing and tax receipt generator.",
        "Reach 10 active workspaces."
      ],
      col3Badge: "Month 3 · SCF Tranche #2 & #3 (70%)",
      col3Title: "Public SDK & LATAM Expansion",
      col3Items: [
        "Publish `@rework/escrow-kit` SDK.",
        "Multi-sig governance for DAO treasuries.",
        "On-chain target: > USD $150k processed.",
        "1,000+ active users in Argentina and LATAM."
      ],
      footerDocs: "Official documents ready in docs/funding_readiness/",
      footerFormat: "Formatted per SCF Handbook 7.0"
    },
    slide11: {
      badge: "11 / Builders 100% Based in Argentina",
      heading: "The Value of Trust Guaranteed by Code",
      lead1Role: "Tech Lead & Fullstack Web3",
      lead1Bio:
        "Soroban smart contract architecture, Stellar Wallets Kit integration, Next.js 16, Supabase RLS, and distributed database optimization. Based in Argentina.",
      lead2Role: "Product Lead & Operations",
      lead2Bio:
        "User-centric product design, validation with companies/DAOs, and coordination of pilots and adoption strategies across LATAM. Based in Argentina.",
      ctaLive: "Explore Live Platform",
      ctaCode: "View Code on GitHub",
      closingQuote:
        "“In a world of opaque intermediaries, ReWork restores sovereignty to work: the value of trust guaranteed by code.”"
    },
    slide12: {
      tag: "12 / Official Demo & Thank You",
      heading: "Thank You!",
      subheading: "Watch ReWork in Action on Stellar & Soroban",
      lead: "We demonstrated how smart contracts, SEP-0007 mobile QR payments, and non-custodial escrow eliminate payment uncertainty for LATAM digital workers.",
      videoTitle: "ReWork Official Walkthrough",
      videoUrl: "https://youtu.be/fycBPw7Y6zg",
      watchYoutube: "Watch on YouTube",
      ctaLive: "Explore Live Platform",
      ctaCode: "GitHub Repository",
      bullet1Title: "SEP-0007 Instant QR Pay",
      bullet1Desc: "Mobile payment flow via Lobstr, Freighter and xBull in seconds.",
      bullet2Title: "Soroban Escrow by Trustless Work",
      bullet2Desc: "Non-custodial milestone-based fund locking and automatic release.",
      bullet3Title: "Sovereign AURA Reputation",
      bullet3Desc: "On-chain credentials and proof of completed missions.",
      closingMessage: "Thank you to the BAF and Stellar teams for empowering builders across Argentina and Latin America!",
      footerLeft: "ReWork Protocol · Stellar × BAF Argentina Builder Challenge 2026",
      footerRight: "Watch Demo on YouTube: youtu.be/fycBPw7Y6zg"
    }
  },
  es: {
    nav: {
      scaleTrack: "Scale Track",
      sub: "Argentina Builder Challenge (BAF × Stellar)",
      prev: "Anterior (←)",
      next: "Siguiente (→)",
      downloadPdf: "Descargar PDF",
      downloadPdfShort: "PDF",
      downloadPdfTitle: "Exportar toda la presentación a PDF",
      fullscreen: "Pantalla Completa (F)",
      viewApp: "Ver App",
      footerLeft: "ReWork Protocol · Stellar × BAF Argentina Builder Challenge 2026",
      slidePrefix: "Diapositiva",
      of: "de"
    },
    slidesData: [
      { title: "Portada", subtitle: "ReWork — Confianza por Código" },
      { title: "El Problema", subtitle: "25% Validación del Problema" },
      { title: "La Solución", subtitle: "25% Foco de Producto" },
      { title: "Módulos Core", subtitle: "Workspaces, Red de Servicios y Misiones" },
      { title: "4 Primitivas Stellar", subtitle: "25% Ejecución Técnica (Desempate #1)" },
      { title: "Producto Real", subtitle: "UX, Métricas & Farming en Vivo" },
      { title: "Arquitectura", subtitle: "Stellar Building Blocks & Soroban" },
      { title: "Modelo de Negocio", subtitle: "25% Foco de Negocio" },
      { title: "Tracción & Calidad", subtitle: "0 Mocks, Tests & Deploy Activo" },
      { title: "Comparativa", subtitle: "Ventajas frente a Alternativas" },
      { title: "Roadmap 90 Días", subtitle: "Instawards & Pipeline SCF 7.0" },
      { title: "Equipo & Cierre", subtitle: "Builders y Contacto" },
      { title: "Demo & Gracias", subtitle: "Video en YouTube y Agradecimientos" }
    ],
    slide0: {
      badge: "Argentina Builder Challenge · Stellar × BAF · Track Scale",
      quote: "«El valor de la confianza garantizado por el código.»",
      description:
        "Plataforma descentralizada de Workspaces B2B, Custodia Inteligente en Soroban y Reputación Soberana para empresas, agencias y DAOs en América Latina.",
      badge1Title: "Soroban Smart Escrow",
      badge1Sub: "Trustless Work V1/V2",
      badge2Title: "Pagos QR SEP-0007",
      badge2Sub: "Deep-linking USDC/ARS",
      badge3Title: "DeFi Yield & Swaps",
      badge3Sub: "Stellar AMM Protocol 20+",
      badge4Title: "AURA CV On-Chain",
      badge4Sub: "Reputación Soberana"
    },
    slide1: {
      tag: "01 / Criterio 1 (25%): Validación del Problema",
      heading: "La Desconfianza Cuesta Millones al Trabajo Digital en LATAM",
      lead: "En América Latina, más de 45 millones de profesionales y empresas enfrentan fricciones que destruyen acuerdos. Cuando no hay confianza técnica verificable, surgen tres problemas críticos:",
      card1Title: "Incertidumbre e Impagos",
      card1Text:
        "El cliente teme pagar por adelantado y no recibir el trabajo; el profesional teme entregar y no cobrar. Más del 30% de freelancers sufren demoras de +45 días o impagos totales por falta de garantías.",
      card2Title: "Comisiones Abusivas (10-20%)",
      card2Text:
        "Plataformas Web2 tradicionales (Upwork, Fiverr) cobran hasta 20% solo por actuar como intermediarios de la desconfianza, sumado a demoras bancarias de 7 días y cepos cambiarios.",
      card3Title: "Reputación Secuestrada",
      card3Text:
        "Feudalismo digital: la reputación construida con años de trabajo queda enjaulada en servidores privados. Si la plataforma cambia términos o cierra la cuenta, el profesional pierde todo.",
      footerMarket: "Mercado Objetivo: +45M de trabajadores remotos",
      footerFriction: "Fricción transaccional estimada: > USD $2.4B anuales"
    },
    slide2: {
      tag: "02 / Criterio 2 (25%): Foco de Producto",
      heading: "ReWork: El Valor de la Confianza Garantizado por el Código",
      lead: "Reemplazamos la arbitrariedad humana y las comisiones predatorias por código inmutable en Stellar: contratos inteligentes que aseguran los fondos y reglas claras para ambas partes:",
      card1Title: "Custodia No-Custodial",
      card1Text:
        "Smart Escrow en Soroban (Trustless Work). El cliente bloquea el 100% de los fondos en USDC al inicio. Los fondos se liberan por hitos verificados. Cero riesgo de impago ni estafas.",
      card2Title: "Liquidaciones en Segundos",
      card2Text:
        "Basado en Stellar: transferencias con finalidad en 3 a 5 segundos y comisiones de centavos de dólar. Sin esperas bancarias internacionales de 7 días.",
      card3Title: "Identidad Soberana (AURA)",
      card3Text:
        "Cada hito y misión completada acumula reputación profesional inmutable on-chain ligada a la clave pública de Stellar del usuario, portable a cualquier ecosistema.",
      step1: "1. Depósito USDC en Soroban",
      step2: "2. Cumplimiento de Hito",
      step3: "3. Liberación Automática + Puntos AURA"
    },
    slide3: {
      tag: "03 / Foco de Producto: Ecosistema de Soluciones",
      heading: "Una Suite Integral para Empresas, Freelancers y DAOs",
      card1Title: "Multi-Tenant Workspaces",
      card1Text:
        "Espacios de trabajo independientes (`/app/[slug]`) con control de acceso basado en roles (Superadmin, Admin, Member, Guest) protegidos por Row-Level Security en Postgres.",
      card2Title: "Red de Servicios & Marketplace",
      card2Text:
        "Oferta abierta de servicios entre todos los usuarios del ecosistema ReWork sin intermediarios, con subastas y contratos de custodia obligatorios en Soroban.",
      card3Title: "Misiones de Equipo (Squad Goals)",
      card3Text:
        "Incentivos y bonos grupales por objetivos comunitarios. Los fondos se fondean en conjunto y se desembolsan por votación o validación del lead técnico.",
      card4Title: "Colectas & Crowdfunding",
      card4Text:
        "Financiamiento colectivo con transparencia absoluta en Stellar. Los aportantes auditan el progreso de cada hito antes de que los fondos sean liberados.",
      footerRoutes: "Rutas operativas: /app/global-network · /app/marketplace · /app/teams · /app/crowdfunding",
      footerStatus: "100% Funcional en Testnet"
    },
    slide4: {
      tag: "04 / Criterio 3 (25%): Ejecución Técnica · Primer Criterio de Desempate",
      heading: "Las 4 Implementaciones Oficiales de Stellar en ReWork",
      lead: "ReWork no es un fork ni una interfaz cosmética: aprovecha la pila completa de infraestructura nativa de Stellar para erradicar la desconfianza de punta a punta:",
      card1Badge: "01 · PAGOS",
      card1Title: "QR Móvil & Deep-Linking SEP-0007",
      card1Text:
        "Generación de URIs estándar `web+stellar:pay` compatibles con Lobstr, Freighter y xBull. Liquidación en 3-5 segundos sin copiar claves públicas.",
      card2Badge: "02 · SMART CONTRACTS",
      card2Title: "Custodia No-Custodial en Soroban",
      card2Text:
        "Integración robusta con Trustless Work (V1/V2). Fondos bloqueados en USDC y liberados únicamente por cumplimiento de hitos verificados.",
      card3Badge: "03 · DEFI & YIELD",
      card3Title: "Stellar AMM & Horizon Path Swaps",
      card3Text:
        "La liquidez ociosa rinde hasta +12.8% APY en pools nativos con el Agente DeFi (`StellarPoolsAgent`), retiro en 1 clic y swaps directos sin slippage.",
      card4Badge: "04 · IDENTIDAD",
      card4Title: "AURA CV On-Chain & Onboarding Dual",
      card4Text:
        "Reputación inmutable portable entre plataformas. Onboarding sin fricción: social login Web2 (Privy) o billetera nativa Web3 (Stellar Wallets Kit).",
      footerStandards: "Estándares: SEP-0007 · SEP-0024/0038 ready · Protocol 20+ Soroban · Horizon v28",
      footerFunctional: "100% Funcional"
    },
    slide5: {
      tag: "05 / Criterio 2 (25%): Foco de Producto & UX Real",
      heading: "Experiencia Web3 de Clase Mundial: 100% Funcional",
      desktopOverlay: "Contratos Soroban verificados + DEX Swaps + Red de Servicios",
      desktopCaption:
        "Dashboard Web3 Desktop: Sparklines en tiempo real, Red de Servicios, Escrow Soroban y Yield Farming",
      mobileHeader: "ReWork Mobile",
      mobileNetwork: "Stellar Testnet",
      mobileNetWorth: "Patrimonio Total",
      mobileLiquid: "Líquido: $350.00",
      mobileStake: "Stake Activo: $900.00",
      mobileQr: "Cobro QR",
      mobileQrSub: "SEP-0007",
      mobileBank: "Banco ARS",
      mobileBankSub: "Rampa Directa",
      mobileEscrowTitle: "Smart Contract Escrow",
      mobileEscrowBadge: "Activo",
      mobileEscrowSub: "Auditoría Frontend — Hito 2 de 3",
      mobileEscrowCustody: "Custodia Soroban:",
      mobileCaption: "Experiencia Mobile PWA con deep-linking, QR SEP-0007 y retiro en 1 clic"
    },
    slide6: {
      tag: "06 / Criterio 3 (25%): Ejecución Técnica · Arquitectura de Producción (Desempate #1)",
      heading: "Arquitectura de Grado Institucional en Stellar & Soroban",
      card1Title: "Soroban Smart Contracts",
      card1Text:
        "Custodia programática con Trustless Work (V1 en producción / V2 en testnet). Bloqueo y liberación condicional en USDC.",
      card2Title: "Stellar Wallets Kit",
      card2Text:
        "Integración multi-billetera universal con Freighter, Lobstr, xBull y deep-linking móvil mediante el protocolo SEP-0007.",
      card3Title: "Onboarding Híbrido",
      card3Text:
        "Social login Web2 vía Privy con claves WebCrypto determinísticas para usuarios sin wallet previa, sin comprometer custodia.",
      card4Title: "Supabase Postgres RLS",
      card4Text:
        "Aislamiento multi-tenant estricto con Row Level Security. 0 mocks en base de datos verificado con suites de test en `scripts/`.",
      footerStack: "Stack: Next.js 16 (Turbopack) · TypeScript 5 · Tailwind CSS v4 · Stellar SDK v14.5 · Soroban RPC",
      footerVerified: "100% Verificado en Testnet"
    },
    slide7: {
      tag: "07 / Criterio 4 (25%): Foco de Negocio · Monetización Sostenible",
      heading: "El Modelo Económico de la Confianza",
      lead: "ReWork alinea su modelo de ingresos con el éxito de sus usuarios: no cobra barreras de entrada ni penalizaciones, sino comisiones por valor aportado y servicios de alto valor:",
      card1Stat: "1%",
      card1Title: "Fee por Escrow Completado",
      card1Text:
        "Comisión transparente del 1% retenida sólo ante la liberación exitosa de fondos mediante Soroban. 10x a 20x más económico que Upwork/Fiverr (10-20%).",
      card2Stat: "SaaS B2B",
      card2Title: "Workspaces Pro & Enterprise",
      card2Text:
        "Planes por suscripción para agencias y DAOs: tesorerías multi-firma, reportes de facturación/impuestos, roles de equipo y submisiones.",
      card3Stat: "0.25% + Yield",
      card3Title: "Rampa Fiat & Optimización DeFi",
      card3Text:
        "Spread mínimo en conversión ARS/USDC con Anchors locales de Stellar (SEP-0024) y revenue share por optimización de rendimiento en AMM pools.",
      footerGoal: "Objetivo Año 1: USD $1.5M procesados en escrows",
      footerRevenue: "Ingresos proyectados protocolo: USD $45k - $60k"
    },
    slide8: {
      tag: "08 / Ejecución Técnica & Calidad: 0 Mocks, 100% Verificable",
      heading: "De la Hipótesis a la Realidad: 0 Código Simulado",
      stat1Title: "Tests Pasando",
      stat1Sub: "RLS, Escrow y RPC",
      stat2Title: "Errores TypeScript",
      stat2Sub: "npx tsc --noEmit limpio",
      stat3Title: "Mocks / Fake Data",
      stat3Sub: "Auditado forensemente",
      stat4Title: "Vercel Deploy Activo",
      stat4Sub: "Producción continua",
      boxTitle: "Suites de Verificación Continua Disponibles en el Repositorio",
      bullet1: "• `scripts/detect_fake_code.mjs` (Auditoría forense de integridad 100% real)",
      bullet2: "• `scripts/test_services_health.mjs` (Horizon, Soroban RPC y Supabase)",
      bullet3: "• `scripts/test_crud_rls.mjs` (Aislamiento multi-tenant en PostgreSQL)",
      bullet4: "• `scripts/test_escrow_api.mjs` (Ciclo de vida de custodia Soroban)"
    },
    slide9: {
      tag: "09 / Criterio 2 & 4: Ventajas Competitivas Defendibles",
      heading: "¿Por qué ReWork Supera las Alternativas?",
      colFeature: "Característica",
      colWeb2: "Plataformas Web2 (Upwork)",
      colBank: "Escrow Bancario Tradicional",
      colReWork: "ReWork sobre Stellar",
      row1Label: "Comisiones",
      row1Web2: "10% a 20%",
      row1Bank: "3% a 5% + fees SWIFT",
      row1ReWork: "~1% (Transparente)",
      row2Label: "Velocidad de Cobro",
      row2Web2: "7 a 14 días",
      row2Bank: "3 a 5 días hábiles",
      row2ReWork: "3 a 5 segundos",
      row3Label: "Custodia de Fondos",
      row3Web2: "100% Centralizada",
      row3Bank: "Entidad Bancaria",
      row3ReWork: "Smart Contract Soroban",
      row4Label: "Reputación",
      row4Web2: "Atrapada en el sitio",
      row4Bank: "Inexistente",
      row4ReWork: "Soberana On-Chain (AURA CV)",
      row5Label: "Pagos Móviles QR",
      row5Web2: "No",
      row5Bank: "No",
      row5ReWork: "Nativo SEP-0007",
      row6Label: "Yield en Liquidez Ociosa",
      row6Web2: "0% (Retenido por la plataforma)",
      row6Bank: "0% a 1%",
      row6ReWork: "Hasta +12.8% APY (Stellar AMM)",
      footerLeft: "Costo 15x inferior · Liquidación en segundos · Control 100% no-custodial",
      footerRight: "Vence a Web2 y a Finanzas Tradicionales"
    },
    slide10: {
      tag: "10 / Funding Readiness · Instawards & Pipeline SCF 7.0",
      heading: "Roadmap a 90 Días: De Testnet a Escala con Stellar",
      col1Badge: "Mes 1 · Instaward (USD $5.000)",
      col1Title: "Despliegue a Mainnet & Auditoría",
      col1Items: [
        "Deploy de contratos de custodia en Mainnet.",
        "Auditoría formal con partner de SDF Audit Bank.",
        "Lanzamiento de los 2 pilotos iniciales (Agencia + DAO).",
        "Procesar primeros USD $10k en escrows."
      ],
      col2Badge: "Mes 2 · SCF Tranche #1 (20%)",
      col2Title: "Rampa Fiat ARS & App PWA",
      col2Items: [
        "Integración con Anchor local de pesos (ARS) SEP-0024.",
        "Lanzamiento de la Progressive Web App (PWA).",
        "Generador de comprobantes e impuestos automáticos.",
        "Alcanzar 10 workspaces activos."
      ],
      col3Badge: "Mes 3 · SCF Tranche #2 & #3 (70%)",
      col3Title: "SDK Público & Expansión LATAM",
      col3Items: [
        "Publicación del SDK `@rework/escrow-kit`.",
        "Gobernanza multi-sig para tesorerías DAO.",
        "Meta on-chain: > USD $150k procesados.",
        "1.000+ usuarios activos en Argentina y LATAM."
      ],
      footerDocs: "Documentos oficiales listos en docs/funding_readiness/",
      footerFormat: "Formato adaptado al SCF Handbook 7.0"
    },
    slide11: {
      badge: "11 / Builders 100% Residentes en Argentina",
      heading: "El Valor de la Confianza Garantizado por el Código",
      lead1Role: "Tech Lead & Fullstack Web3",
      lead1Bio:
        "Arquitectura de contratos inteligentes en Soroban, integración de Stellar Wallets Kit, Next.js 16, Supabase RLS y optimización de bases de datos distribuidas. Residente en Argentina.",
      lead2Role: "Product Lead & Operations",
      lead2Bio:
        "Diseño de producto centrado en el usuario, validación con empresas/DAOs y coordinación de pilotos y estrategias de adopción en LATAM. Residente en Argentina.",
      ctaLive: "Explorar Plataforma en Vivo",
      ctaCode: "Ver Código en GitHub",
      closingQuote:
        "«En un mundo de intermediarios opacos, ReWork devuelve la soberanía al trabajo: el valor de la confianza garantizado por el código.»"
    },
    slide12: {
      tag: "12 / Video Demo Oficial y Cierre",
      heading: "¡Muchas Gracias!",
      subheading: "Mira ReWork en Acción sobre Stellar & Soroban",
      lead: "Demostramos cómo los contratos inteligentes, los pagos móviles QR SEP-0007 y la custodia no-custodial eliminan la incertidumbre de cobro para trabajadores digitales en LATAM.",
      videoTitle: "Recorrido Oficial de ReWork",
      videoUrl: "https://youtu.be/fycBPw7Y6zg",
      watchYoutube: "Ver en YouTube",
      ctaLive: "Explorar Plataforma en Vivo",
      ctaCode: "Repositorio en GitHub",
      bullet1Title: "Cobro QR Instantáneo SEP-0007",
      bullet1Desc: "Flujo de pago móvil con Lobstr, Freighter y xBull en segundos.",
      bullet2Title: "Custodia Soroban con Trustless Work",
      bullet2Desc: "Bloqueo no-custodial por hitos y liberación automática de fondos.",
      bullet3Title: "Reputación Soberana AURA",
      bullet3Desc: "Credenciales on-chain y registro inmutable de misiones.",
      closingMessage: "¡Muchas gracias al equipo de BAF y Stellar por impulsar a los builders en Argentina y toda América Latina!",
      footerLeft: "ReWork Protocol · Stellar × BAF Argentina Builder Challenge 2026",
      footerRight: "Ver Demo en YouTube: youtu.be/fycBPw7Y6zg"
    }
  }
};
