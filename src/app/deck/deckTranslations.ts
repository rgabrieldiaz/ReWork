export type DeckLanguage = "en" | "es";
export type DeckEcosystem = "solana" | "stellar";

export interface SlideData {
  title: string;
  subtitle: string;
}

export const deckTranslations = {
  solana: {
    en: {
      nav: {
        scaleTrack: "Solana Colosseum",
        sub: "Superteam Argentina Track @ Crypto World's Fair (10,000 USDC)",
        prev: "Previous (←)",
        next: "Next (→)",
        downloadPdf: "Download PDF",
        downloadPdfShort: "PDF",
        downloadPdfTitle: "Export entire presentation to PDF",
        fullscreen: "Fullscreen (F)",
        viewApp: "View App",
        footerLeft: "ReWork Protocol · Superteam Argentina @ Crypto World's Fair (Colosseum 2026)",
        slidePrefix: "Slide",
        of: "of"
      },
      slidesData: [
        { title: "Cover", subtitle: "ReWork — Trust Guaranteed by Code on Solana" },
        { title: "The Problem", subtitle: "Problem Validation in LatAm & Remote Work" },
        { title: "The Solution", subtitle: "Decentralized Escrow on Solana" },
        { title: "Core Modules", subtitle: "Workspaces, Marketplace & Squad Goals" },
        { title: "4 Solana Pillars", subtitle: "Technical Execution & Ecosystem Architecture" },
        { title: "Live Product", subtitle: "Real UX, Live DEX Swap & Kamino/Marinade Vaults" },
        { title: "Architecture", subtitle: "@solana/kit, Triton RPC & Anchor Contracts" },
        { title: "Business Model", subtitle: "1% Fee, B2B SaaS & Sustainable Economics" },
        { title: "Traction & Quality", subtitle: "0 Mocks, Strict Tests & Active Deploy" },
        { title: "Comparison", subtitle: "ReWork vs Upwork vs Traditional Banking" },
        { title: "Roadmap to Scale", subtitle: "From Superteam Mentorship to Global Venture" },
        { title: "Team & Vision", subtitle: "Builders Co-Founded in Argentina" },
        { title: "Demo & Closing", subtitle: "Live Walkthrough & Next Steps" }
      ],
      slide0: {
        badge: "Superteam Argentina Track · Crypto World's Fair (Colosseum Hackathon)",
        quote: "“The value of trust guaranteed by code on Solana.”",
        description:
          "Decentralized freelance marketplace, sub-second programmable escrow in USDC, and sovereign on-chain reputation for builders, agencies, and DAOs worldwide.",
        badge1Title: "Solana Smart Escrow",
        badge1Sub: "Sub-second & Sub-cent",
        badge2Title: "Hybrid Onboarding",
        badge2Sub: "Privy Wallets + Phantom",
        badge3Title: "Multichain DEX & Yield",
        badge3Sub: "SOL, USDC & Kamino/Marinade",
        badge4Title: "AURA On-Chain CV",
        badge4Sub: "Sovereign Reputation"
      },
      slide1: {
        tag: "01 / Problem Validation: Emerging Markets & Remote Work",
        heading: "Lack of Trust Costs Billions to Digital Labor in LATAM",
        lead: "Over 45 million remote workers and international clients face systemic barriers that destroy deals. When verifiable trust is absent, three critical bottlenecks emerge:",
        card1Title: "Uncertainty & Non-Payments",
        card1Text:
          "Clients fear paying upfront without receiving deliverables; freelancers fear delivering without getting paid. Over 30% of freelancers suffer 45+ day delays or total non-payment due to lack of enforceable escrow.",
        card2Title: "Predatory Fees (15-20%)",
        card2Text:
          "Legacy platforms (Upwork, Fiverr) charge up to 20% in commissions, hold payouts for 14 days, and legacy SWIFT banking drains another 10-15% through forced exchange rates.",
        card3Title: "Locked Reputation",
        card3Text:
          "Digital feudalism: years of hard-earned professional reputation remain trapped in proprietary silos. If a centralized platform bans an account, the professional loses their entire livelihood.",
        footerMarket: "Target Market: +45M remote workers in emerging economies",
        footerFriction: "Estimated transactional friction: > USD $2.4B annually"
      },
      slide2: {
        tag: "02 / Product Focus: Core Value Proposition",
        heading: "ReWork: The Value of Trust Guaranteed by Code",
        lead: "We replace human arbitrariness and predatory middlemen with immutable code on Solana: smart contract vaults that secure funds with clear rules for both parties:",
        card1Title: "Sub-Second Smart Escrow",
        card1Text:
          "Audited programmable vaults on Solana. The client deposits 100% of milestone funds in USDC. Payouts unlock automatically upon verified deliverable approval in ~400ms.",
        card2Title: "Sub-Cent Settlement",
        card2Text:
          "Powered by Solana: instant transactions with network fees of ~$0.0008. Enables micro-milestones and continuous payouts without 14-day banking hold periods.",
        card3Title: "Sovereign Identity (AURA)",
        card3Text:
          "Every fulfilled milestone and completed bounty mints immutable on-chain reputation tied to the user's public key, universally portable across ecosystems.",
        step1: "1. USDC Deposit in Solana Vault",
        step2: "2. Milestone Delivery Verification",
        step3: "3. Instant Release + AURA CV Score"
      },
      slide3: {
        tag: "03 / Product Focus: Solution Ecosystem",
        heading: "A Comprehensive Suite for Freelancers, Agencies, and DAOs",
        card1Title: "Multi-Tenant Workspaces",
        card1Text:
          "Isolated workspaces (`/app/[slug]`) with role-based access control (Superadmin, Admin, Member, Evaluator) protected by PostgreSQL Row-Level Security.",
        card2Title: "Marketplace & Auctions",
        card2Text:
          "Open talent and service discovery with peer-to-peer bidding, milestone breakdowns, and programmable Solana escrow contracts.",
        card3Title: "Squad Goals & Team Bounties",
        card3Text:
          "Collaborative milestones and pooled bounties for dev teams and DAOs. Funds are held in multisig escrow and disbursed upon milestone validation.",
        card4Title: "Campaigns & Crowdfunding",
        card4Text:
          "Community collective funding with total transparency on Solana. Contributors audit milestone delivery proofs before funds release.",
        footerRoutes: "Live routes: /app/marketplace · /app/goals · /app/workspaces · /app/profile",
        footerStatus: "100% Functional on Solana Devnet"
      },
      slide4: {
        tag: "04 / Technical Execution: 4 Core Solana Pillars",
        heading: "The 4 Native Solana Implementations in ReWork",
        lead: "ReWork is not a cosmetic wrapper: it leverages Solana's full high-throughput architecture to eradicate freelance friction end-to-end:",
        card1Badge: "01 · ESCROW",
        card1Title: "Sub-Second Escrow Vaults",
        card1Text:
          "Smart contract vaults on Solana Devnet in USDC. 400ms finality and sub-cent fees (~$0.0008) with verifiable links on Solana Explorer.",
        card2Badge: "02 · ONBOARDING",
        card2Title: "Hybrid Privy & Wallet Standard",
        card2Text:
          "Zero-friction onboarding: Web2 users sign in via Google/Email with Privy embedded Solana wallets (no gas/SOL needed). Web3 pros connect Phantom or Solflare.",
        card3Badge: "03 · MULTICHAIN",
        card3Title: "SOL Rail & Live DEX Swap",
        card3Text:
          "Native `SOL` 4th currency toggle across balances, net worth, and quotes. In-app Swap widget executes live on Devnet with `@solana/kit` RPC Triton validation.",
        card4Badge: "04 · DEFI YIELD",
        card4Title: "Solana DeFi Treasury Vaults",
        card4Text:
          "Idle milestone and treasury funds generate streaming yield: Marinade mSOL (7.4%), Kamino Vault (18.2%), Meteora (15.6%), and Raydium (16.9%).",
        footerStandards: "Solana Standards: @solana/kit v8+ · SPL Token / Token-2022 · Triton RPC · Wallet Standard",
        footerFunctional: "100% Functional on Devnet"
      },
      slide5: {
        tag: "05 / Real UX & World-Class Interface",
        heading: "Consumer-Grade Web3 Experience: Fast, Clean & Reliable",
        desktopOverlay: "Live Solana Escrow + DEX Swap + DeFi Yield Vaults",
        desktopCaption:
          "Web3 Desktop Dashboard: Real-time sparklines, Solana Escrow Vault, DEX Swap, and Multichain Farming",
        mobileHeader: "ReWork Mobile",
        mobileNetwork: "Solana Devnet",
        mobileNetWorth: "Total Portfolio",
        mobileLiquid: "Liquid: $350.00",
        mobileStake: "DeFi Yield: $900.00",
        mobileQr: "Swap DEX",
        mobileQrSub: "SOL ⇄ USDC",
        mobileBank: "DeFi Vaults",
        mobileBankSub: "Kamino / Marinade",
        mobileEscrowTitle: "Solana Escrow Vault",
        mobileEscrowBadge: "Active (~400ms)",
        mobileEscrowSub: "Full-Stack Audit — Milestone 2 of 3",
        mobileEscrowCustody: "Solana Vault:",
        mobileCaption: "Responsive PWA experience with instant Solana wallet signing, 4 currencies, and 1-click execution"
      },
      slide6: {
        tag: "06 / Technical Execution · Institutional Architecture",
        heading: "Modern High-Performance Architecture on Solana",
        card1Title: "Solana Modular SDK",
        card1Text:
          "Built with `@solana/kit` v8+ plugin architecture (`createClient().use(...)`), avoiding legacy web3.js v1 bloat for lightning-fast bundling.",
        card2Title: "Triton Dedicated RPC",
        card2Text:
          "High-reliability RPC connection with zero rate-limiting on Devnet, enabling instant blockhash retrieval and transaction confirmation.",
        card3Title: "Privy Embedded Wallets",
        card3Text:
          "Web2 social onboarding generating non-custodial Solana keypairs, sponsored transactions, and seamless passkey recovery.",
        card4Title: "Supabase Multi-Tenant RLS",
        card4Text:
          "Strict database security isolation with Row Level Security. Evaluators auto-enrolled in flagship workspace with 500 AURA points.",
        footerStack: "Stack: Next.js 16 (Turbopack) · TypeScript 5 · @solana/kit v8.4 · Triton RPC · Supabase RLS",
        footerVerified: "100% Verified on Solana Devnet"
      },
      slide7: {
        tag: "07 / Business Focus · Sustainable Economics",
        heading: "The Economic Model of Decentralized Work",
        lead: "ReWork aligns incentives with builder success: zero upfront platform barriers, charging only fair fees for completed value:",
        card1Stat: "1%",
        card1Title: "Fee per Completed Escrow",
        card1Text:
          "Transparent 1% protocol fee retained only upon successful milestone release on Solana. 15x to 20x cheaper than Upwork or Fiverr (15-20%).",
        card2Stat: "B2B SaaS",
        card2Title: "Workspaces Pro & Enterprise",
        card2Text:
          "Tiered subscriptions for boutique software agencies and DAOs: multisig treasury management, tax reporting, team roles, and private talent pools.",
        card3Stat: "DeFi Spread",
        card3Title: "Yield & Swap Optimization",
        card3Text:
          "Small protocol spread on DEX swaps (`SOL ⇄ USDC`) and shared yield optimization on idle milestone treasuries in Solana DeFi pools.",
        footerGoal: "Year 1 Target: USD $2.5M escrow volume processed on Solana",
        footerRevenue: "Projected annual protocol revenue: USD $65k - $95k"
      },
      slide8: {
        tag: "08 / Technical Integrity: 0 Mocks, 100% Verifiable",
        heading: "From Code to Production: Zero Simulated Code",
        stat1Title: "Tests Passing",
        stat1Sub: "RLS, Escrow & RPC",
        stat2Title: "TypeScript Errors",
        stat2Sub: "Clean npx tsc --noEmit",
        stat3Title: "Mocks / Fake Data",
        stat3Sub: "Forensically audited",
        stat4Title: "Active Vercel Deploy",
        stat4Sub: "Continuous production",
        boxTitle: "Continuous Verification Suites Available in the Repository",
        bullet1: "• `scripts/detect_fake_code.mjs` (Forensic audit: 0 fake timeouts, 0 fake alerts)",
        bullet2: "• `scripts/test_services_health.mjs` (Solana RPC, network ping & database latency)",
        bullet3: "• `scripts/test_crud_rls.mjs` (PostgreSQL multi-tenant row isolation)",
        bullet4: "• `npx tsc --noEmit` (100% strict TypeScript compliance across all modules)"
      },
      slide9: {
        tag: "09 / Defensible Competitive Advantages",
        heading: "Why ReWork on Solana Outperforms Alternatives?",
        colFeature: "Feature",
        colWeb2: "Web2 Platforms (Upwork)",
        colBank: "Bank Wire Escrow",
        colReWork: "ReWork on Solana",
        row1Label: "Protocol Fee",
        row1Web2: "15% to 20%",
        row1Bank: "3% to 5% + wire fees",
        row1ReWork: "~1% (Transparent)",
        row2Label: "Payout Speed",
        row2Web2: "7 to 14 days",
        row2Bank: "3 to 5 business days",
        row2ReWork: "Under 500 ms",
        row3Label: "Fund Custody",
        row3Web2: "100% Centralized",
        row3Bank: "Banking Intermediary",
        row3ReWork: "Solana Smart Contract",
        row4Label: "Reputation",
        row4Web2: "Trapped in platform",
        row4Bank: "Non-existent",
        row4ReWork: "Sovereign On-Chain (AURA CV)",
        row5Label: "Network Gas Fee",
        row5Web2: "Hidden / High",
        row5Bank: "$25 - $50 SWIFT",
        row5ReWork: "~$0.0008 (Near Zero)",
        row6Label: "Idle Treasury Yield",
        row6Web2: "0% (Retained by platform)",
        row6Bank: "0% to 0.5%",
        row6ReWork: "Up to 18.2% APY (Kamino/Marinade)",
        footerLeft: "20x lower cost · Finality in 400ms · 100% non-custodial control",
        footerRight: "Outclasses Web2 and Traditional Finance"
      },
      slide10: {
        tag: "10 / Roadmap to Scale · Colosseum to Mainnet Venture",
        heading: "90-Day Roadmap: Scaling ReWork with Solana",
        col1Badge: "Month 1 · Superteam & Colosseum",
        col1Title: "Top Talent Mentorship & Devnet MVP",
        col1Items: [
          "Complete Superteam Top Talent Mentorship cohort.",
          "Refine Anchor contracts with canonical bumps and security checks.",
          "Launch initial pilots with 3 regional software agencies.",
          "Submit dual delivery to Superteam Earn & Colosseum Global."
        ],
        col2Badge: "Month 2 · Mainnet Launch",
        col2Title: "Audited Solana Mainnet & ARS Ramp",
        col2Items: [
          "Formal security audit of escrow program.",
          "Solana Mainnet deployment with USDC SPL / Token-2022.",
          "Fiat on/off-ramp integration for Argentine Pesos (ARS).",
          "Target: USD $50k in cumulative milestone escrow."
        ],
        col3Badge: "Month 3 · Expansion",
        col3Title: "Solana Mobile dApp & LatAm Expansion",
        col3Items: [
          "Solana Mobile Stack (SMS) dApp submission for Saga & Seeker.",
          "B2B agency SaaS onboarding across Colombia, Brazil, and Mexico.",
          "Launch public SDK for third-party freelance integrations.",
          "1,500+ verified active builders on AURA CV."
        ],
        footerDocs: "Official roadmap and hackathon documentation in docs/ROADMAP_HACKATHON_COLOSSEUM.md",
        footerFormat: "Aligned with Superteam Argentina & Colosseum criteria"
      },
      slide11: {
        badge: "11 / Co-Founders Based in Argentina",
        heading: "The Value of Trust Guaranteed by Code",
        lead1Role: "Tech Lead & Fullstack Solana/Web3",
        lead1Bio:
          "Architecture of Solana smart contracts, @solana/kit modular clients, Next.js 16, Supabase multi-tenant RLS, and security verification. Resident in Argentina.",
        lead2Role: "Product Lead & Growth",
        lead2Bio:
          "User experience design, validation with dev agencies/DAOs, and execution of LatAm adoption strategies for remote workers. Resident in Argentina.",
        ctaLive: "Explore Live App",
        ctaCode: "View GitHub Repo",
        closingQuote:
          "“In a world of opaque intermediaries, ReWork gives sovereignty back to builders: the value of trust guaranteed by code on Solana.”"
      },
      slide12: {
        tag: "12 / Official Walkthrough & Next Steps",
        heading: "Thank You, Superteam & Colosseum!",
        subheading: "Watch ReWork in Action on Solana Devnet",
        lead: "We demonstrated how high-speed smart escrow, sub-cent network fees, and hybrid onboarding eradicate payment uncertainty for remote builders across the globe.",
        videoTitle: "ReWork — Technical Product Demo (Solana Devnet)",
        videoUrl: "https://youtu.be/8ErHzzEgisQ",
        videoShort: "youtu.be/8ErHzzEgisQ",
        videoId: "8ErHzzEgisQ",
        watchYoutube: "Watch Demo Video",
        ctaLive: "Launch App",
        ctaCode: "GitHub Repository",
        bullet1Title: "Sub-Second Solana Escrow",
        bullet1Desc: "USDC milestone vaults confirming in ~400ms with verified Explorer links.",
        bullet2Title: "SOL Rail & Devnet DEX Swap",
        bullet2Desc: "Live multi-currency conversions and sub-cent swap execution.",
        bullet3Title: "Solana DeFi Yield Vaults",
        bullet3Desc: "Idle treasury capital generating 7-18% APY with Marinade & Kamino.",
        closingMessage: "Ready to scale through Superteam Argentina's Top Talent Mentorship and compete to win globally at Colosseum!",
        footerLeft: "ReWork Protocol · Superteam Argentina Track @ Crypto World's Fair 2026",
        footerRight: "Explore live at: youtu.be/8ErHzzEgisQ"
      }
    },
    es: {
      nav: {
        scaleTrack: "Solana Colosseum",
        sub: "Track Superteam Argentina @ Crypto World's Fair (10.000 USDC)",
        prev: "Anterior (←)",
        next: "Siguiente (→)",
        downloadPdf: "Descargar PDF",
        downloadPdfShort: "PDF",
        downloadPdfTitle: "Exportar toda la presentación a PDF",
        fullscreen: "Pantalla Completa (F)",
        viewApp: "Ver App",
        footerLeft: "ReWork Protocol · Superteam Argentina @ Crypto World's Fair (Colosseum 2026)",
        slidePrefix: "Diapositiva",
        of: "de"
      },
      slidesData: [
        { title: "Portada", subtitle: "ReWork — Confianza por Código en Solana" },
        { title: "El Problema", subtitle: "Validación del Dolor en LatAm & Trabajo Remoto" },
        { title: "La Solución", subtitle: "Custodia Descentralizada en Solana" },
        { title: "Módulos Core", subtitle: "Workspaces, Marketplace y Squad Goals" },
        { title: "4 Pilares Solana", subtitle: "Ejecución Técnica & Arquitectura de Ecosistema" },
        { title: "Producto Real", subtitle: "UX Real, Swap DEX en Vivo & Bóvedas Kamino/Marinade" },
        { title: "Arquitectura", subtitle: "@solana/kit, Triton RPC & Contratos Anchor" },
        { title: "Modelo de Negocio", subtitle: "Fee del 1%, SaaS B2B & Economía Sostenible" },
        { title: "Tracción & Calidad", subtitle: "0 Mocks, Tests Estrictos & Deploy Activo" },
        { title: "Comparativa", subtitle: "ReWork vs Upwork vs Banca Tradicional" },
        { title: "Roadmap a Escala", subtitle: "De Mentoría Superteam a Empresa Global" },
        { title: "Equipo & Visión", subtitle: "Builders Co-Fundados en Argentina" },
        { title: "Demo & Cierre", subtitle: "Recorrido en Vivo y Próximos Pasos" }
      ],
      slide0: {
        badge: "Track Superteam Argentina · Crypto World's Fair (Colosseum Hackathon)",
        quote: "«El valor de la confianza garantizado por el código en Solana.»",
        description:
          "Marketplace freelance descentralizado, custodia programable de sub-segundo en USDC y reputación soberana on-chain para builders, agencias y DAOs en todo el mundo.",
        badge1Title: "Solana Smart Escrow",
        badge1Sub: "Sub-segundo y Sub-centavo",
        badge2Title: "Onboarding Híbrido",
        badge2Sub: "Wallets Privy + Phantom",
        badge3Title: "DEX Multichain & Yield",
        badge3Sub: "SOL, USDC & Kamino/Marinade",
        badge4Title: "AURA CV On-Chain",
        badge4Sub: "Reputación Soberana"
      },
      slide1: {
        tag: "01 / Validación del Problema: Mercados Emergentes & Trabajo Remoto",
        heading: "La Desconfianza Cuesta Miles de Millones al Trabajo Digital en LATAM",
        lead: "Más de 45 millones de profesionales remotos y clientes internacionales sufren trabas financieras que destruyen acuerdos. Cuando no hay confianza técnica verificable, surgen tres problemas críticos:",
        card1Title: "Incertidumbre e Impagos",
        card1Text:
          "El cliente teme pagar por adelantado y no recibir el trabajo; el profesional teme entregar y no cobrar. Más del 30% de los freelancers sufren demoras de +45 días o impagos totales por falta de garantías.",
        card2Title: "Comisiones Abusivas (15-20%)",
        card2Text:
          "Plataformas Web2 tradicionales (Upwork, Deel) cobran hasta 20% de comisión, retienen pagos durante 14 días y las transferencias SWIFT bancarias recortan hasta un 15% adicional por tipos de cambio forzados.",
        card3Title: "Reputación Secuestrada",
        card3Text:
          "Feudalismo digital: la reputación construida con años de trabajo queda enjaulada en servidores privados. Si la plataforma cierra una cuenta, el profesional pierde todo su historial y sustento.",
        footerMarket: "Mercado Objetivo: +45M de trabajadores remotos en economías emergentes",
        footerFriction: "Fricción transaccional estimada: > USD $2.4B anuales"
      },
      slide2: {
        tag: "02 / Foco de Producto: Propuesta de Valor Central",
        heading: "ReWork: El Valor de la Confianza Garantizado por el Código",
        lead: "Reemplazamos la arbitrariedad humana y las comisiones predatorias por código inmutable en Solana: contratos inteligentes que aseguran los fondos con reglas transparentes para ambas partes:",
        card1Title: "Smart Escrow de Sub-Segundo",
        card1Text:
          "Bóvedas programables auditadas en Solana. El cliente deposita el 100% de los fondos del hito en USDC. Los fondos se liberan de forma automática e inmediata al verificar la entrega en ~400ms.",
        card2Title: "Liquidación a Costo Sub-Centavo",
        card2Text:
          "Impulsado por Solana: transacciones con comisiones de red de ~$0.0008. Hace económicamente viables los micropagos por hora o por tarea sin demoras de 14 días.",
        card3Title: "Identidad Soberana (AURA)",
        card3Text:
          "Cada hito completado y misión cumplida acuña reputación profesional inmutable on-chain ligada a la clave pública del usuario, portable a cualquier ecosistema.",
        step1: "1. Depósito USDC en Bóveda Solana",
        step2: "2. Verificación de Hito Entregado",
        step3: "3. Liberación Inmediata + Puntos AURA"
      },
      slide3: {
        tag: "03 / Foco de Producto: Ecosistema de Soluciones",
        heading: "Una Suite Integral para Freelancers, Agencias y DAOs",
        card1Title: "Workspaces Multi-Tenant",
        card1Text:
          "Espacios de trabajo independientes (`/app/[slug]`) con control de acceso basado en roles (Superadmin, Admin, Member, Evaluator) protegidos por Row-Level Security en Postgres.",
        card2Title: "Marketplace & Subastas",
        card2Text:
          "Descubrimiento abierto de talento y servicios sin intermediarios, con pujas entre pares, desglose de hitos y contratos de custodia obligatorios en Solana.",
        card3Title: "Squad Goals & Bounties de Equipo",
        card3Text:
          "Incentivos y bonos grupales por objetivos compartidos para equipos de desarrollo y DAOs. Fondos fondeados en conjunto y desembolsados por validación de entregables.",
        card4Title: "Colectas & Crowdfunding",
        card4Text:
          "Financiamiento colectivo con transparencia absoluta en Solana. Los aportantes auditan el progreso de cada hito antes de que los fondos sean liberados.",
        footerRoutes: "Rutas operativas: /app/marketplace · /app/goals · /app/workspaces · /app/profile",
        footerStatus: "100% Funcional en Solana Devnet"
      },
      slide4: {
        tag: "04 / Ejecución Técnica: 4 Pilares Nativos en Solana",
        heading: "Las 4 Implementaciones Nativas de Solana en ReWork",
        lead: "ReWork no es una interfaz cosmética: aprovecha la arquitectura completa de alto rendimiento de Solana para erradicar la fricción del trabajo remoto de punta a punta:",
        card1Badge: "01 · ESCROW",
        card1Title: "Bóvedas Escrow de Sub-Segundo",
        card1Text:
          "Smart contracts de custodia en Solana Devnet en USDC. Finalidad en 400ms y costos de ~$0.0008, con enlaces directos verificables en Solana Explorer.",
        card2Badge: "02 · ONBOARDING",
        card2Title: "Híbrido Privy + Wallet Standard",
        card2Text:
          "Onboarding sin barreras: usuarios Web2 ingresan con Google o email mediante billeteras embebidas de Privy en Solana (sin gas/SOL previo). Nativos Web3 conectan Phantom o Solflare.",
        card3Badge: "03 · MULTICHAIN",
        card3Title: "Riel SOL & Swap en Vivo",
        card3Text:
          "Selector de 4 monedas nativo con `SOL` en balances, patrimonio neto y cotizaciones. Widget de Swap con ejecución en Devnet validando blockhashes con `@solana/kit` y Triton RPC.",
        card4Badge: "04 · DEFI YIELD",
        card4Title: "Bóvedas DeFi de Tesorería",
        card4Text:
          "La liquidez ociosa en custodia genera rendimiento en streaming: Marinade mSOL (7.4%), Kamino Vault (18.2%), Meteora (15.6%) y Raydium (16.9%).",
        footerStandards: "Estándares Solana: @solana/kit v8+ · SPL Token / Token-2022 · Triton RPC · Wallet Standard",
        footerFunctional: "100% Funcional en Devnet"
      },
      slide5: {
        tag: "05 / UX Real & Experiencia de Usuario",
        heading: "Experiencia Web3 de Clase Mundial: Rápida, Limpia y Confiable",
        desktopOverlay: "Contratos Solana Devnet + Swap DEX + Bóvedas DeFi",
        desktopCaption:
          "Dashboard Web3 Desktop: Sparklines en tiempo real, Bóveda Escrow Solana, Swap DEX y Pools de Rendimiento",
        mobileHeader: "ReWork Mobile",
        mobileNetwork: "Solana Devnet",
        mobileNetWorth: "Patrimonio Total",
        mobileLiquid: "Líquido: $350.00",
        mobileStake: "Rendimiento DeFi: $900.00",
        mobileQr: "Swap DEX",
        mobileQrSub: "SOL ⇄ USDC",
        mobileBank: "Bóvedas DeFi",
        mobileBankSub: "Kamino / Marinade",
        mobileEscrowTitle: "Bóveda Escrow Solana",
        mobileEscrowBadge: "Activo (~400ms)",
        mobileEscrowSub: "Auditoría Full-Stack — Hito 2 de 3",
        mobileEscrowCustody: "Bóveda Solana:",
        mobileCaption: "Experiencia PWA responsiva con firma instantánea en Solana, 4 monedas y ejecución en 1 clic"
      },
      slide6: {
        tag: "06 / Ejecución Técnica · Arquitectura Institucional",
        heading: "Arquitectura Moderna de Alto Rendimiento en Solana",
        card1Title: "SDK Modular de Solana",
        card1Text:
          "Desarrollado con `@solana/kit` v8+ y arquitectura modular de plugins (`createClient().use(...)`), eliminando el peso de web3.js v1 legacy.",
        card2Title: "RPC Dedicado Triton",
        card2Text:
          "Conexión RPC de alta confiabilidad sin rate-limits en Devnet, permitiendo obtención instantánea de blockhash y confirmación de transacciones.",
        card3Title: "Wallets Embebidas Privy",
        card3Text:
          "Social onboarding Web2 que genera pares de claves en Solana sin custodia, transacciones esponsorizadas y recuperación segura con passkeys.",
        card4Title: "Supabase Multi-Tenant RLS",
        card4Text:
          "Aislamiento estricto de base de datos con Row Level Security. Evaluadores enrolados automáticamente al espacio insignia con 500 puntos AURA.",
        footerStack: "Stack: Next.js 16 (Turbopack) · TypeScript 5 · @solana/kit v8.4 · Triton RPC · Supabase RLS",
        footerVerified: "100% Verificado en Solana Devnet"
      },
      slide7: {
        tag: "07 / Foco de Negocio · Monetización Sostenible",
        heading: "El Modelo Económico del Trabajo Descentralizado",
        lead: "ReWork alinea sus incentivos con el éxito de los builders: cero barreras de entrada, cobrando comisiones justas por valor generado:",
        card1Stat: "1%",
        card1Title: "Fee por Escrow Completado",
        card1Text:
          "Comisión transparente del 1% retenida únicamente tras la liberación exitosa de fondos en Solana. 15x a 20x más económico que Upwork o Deel (15-20%).",
        card2Stat: "SaaS B2B",
        card2Title: "Workspaces Pro & Enterprise",
        card2Text:
          "Planes por suscripción para agencias de software boutique y DAOs: tesorerías multi-firma, reportes impositivos, roles de equipo y pools privados de talento.",
        card3Stat: "Spread DeFi",
        card3Title: "Optimización de Swap y Rendimiento",
        card3Text:
          "Spread mínimo de protocolo en swaps DEX (`SOL ⇄ USDC`) y revenue share por optimización de rendimiento en tesorerías ociosas en pools de Solana.",
        footerGoal: "Objetivo Año 1: USD $2.5M en volumen procesado en Solana",
        footerRevenue: "Ingresos anuales proyectados protocolo: USD $65k - $95k"
      },
      slide8: {
        tag: "08 / Integridad Técnica: 0 Mocks, 100% Verificable",
        heading: "Del Código a Producción: Cero Código Simulado",
        stat1Title: "Tests Pasando",
        stat1Sub: "RLS, Escrow y RPC",
        stat2Title: "Errores TypeScript",
        stat2Sub: "npx tsc --noEmit limpio",
        stat3Title: "Mocks / Fake Data",
        stat3Sub: "Auditado forensemente",
        stat4Title: "Vercel Deploy Activo",
        stat4Sub: "Producción continua",
        boxTitle: "Suites de Verificación Continua Disponibles en el Repositorio",
        bullet1: "• `scripts/detect_fake_code.mjs` (Auditoría forense: 0 falsos timeouts, 0 alertas falsas)",
        bullet2: "• `scripts/test_services_health.mjs` (RPC Solana, latencia de red y base de datos)",
        bullet3: "• `scripts/test_crud_rls.mjs` (Aislamiento multi-tenant en PostgreSQL)",
        bullet4: "• `npx tsc --noEmit` (Compilación TypeScript estricta 100% limpia sin errores)"
      },
      slide9: {
        tag: "09 / Ventajas Competitivas Defendibles",
        heading: "¿Por qué ReWork en Solana Supera las Alternativas?",
        colFeature: "Característica",
        colWeb2: "Plataformas Web2 (Upwork)",
        colBank: "Escrow Bancario Tradicional",
        colReWork: "ReWork en Solana",
        row1Label: "Comisión de Protocolo",
        row1Web2: "15% a 20%",
        row1Bank: "3% a 5% + fees SWIFT",
        row1ReWork: "~1% (Transparente)",
        row2Label: "Velocidad de Cobro",
        row2Web2: "7 a 14 días",
        row2Bank: "3 a 5 días hábiles",
        row2ReWork: "Menos de 500 ms",
        row3Label: "Custodia de Fondos",
        row3Web2: "100% Centralizada",
        row3Bank: "Intermediario Bancario",
        row3ReWork: "Smart Contract Solana",
        row4Label: "Reputación",
        row4Web2: "Atrapada en la plataforma",
        row4Bank: "Inexistente",
        row4ReWork: "Soberana On-Chain (AURA CV)",
        row5Label: "Comisión de Red (Gas)",
        row5Web2: "Oculta / Alta",
        row5Bank: "$25 - $50 SWIFT",
        row5ReWork: "~$0.0008 (Casi Nula)",
        row6Label: "Rendimiento de Tesorería",
        row6Web2: "0% (Retenido por el sitio)",
        row6Bank: "0% a 0.5%",
        row6ReWork: "Hasta 18.2% APY (Kamino/Marinade)",
        footerLeft: "Costo 20x menor · Finalidad en 400ms · Control 100% no-custodial",
        footerRight: "Supera a Web2 y a la Banca Tradicional"
      },
      slide10: {
        tag: "10 / Roadmap a Escala · De Colosseum a Empresa Global",
        heading: "Roadmap a 90 Días: Escalando ReWork con Solana",
        col1Badge: "Mes 1 · Superteam & Colosseum",
        col1Title: "Mentoría Top Talent y MVP en Devnet",
        col1Items: [
          "Participar en el cohort de mentoría Top Talent de Superteam.",
          "Refinar contratos Anchor con canonical bumps y auditoría de cuentas.",
          "Lanzar pilotos con 3 agencias de software regionales.",
          "Presentación dual en Superteam Earn y Colosseum Global."
        ],
        col2Badge: "Mes 2 · Lanzamiento Mainnet",
        col2Title: "Solana Mainnet Auditado & Rampa ARS",
        col2Items: [
          "Auditoría formal de seguridad del programa de custodia.",
          "Deploy a Solana Mainnet con USDC SPL / Token-2022.",
          "Integración de rampa fiat para pesos argentinos (ARS).",
          "Meta: USD $50k en volumen acumulado de escrows."
        ],
        col3Badge: "Mes 3 · Expansión",
        col3Title: "Solana Mobile dApp & Expansión LATAM",
        col3Items: [
          "Publicación en la dApp Store de Solana Mobile (Saga y Seeker).",
          "Onboarding de agencias B2B en Colombia, Brasil y México.",
          "Publicación de SDK abierto para integraciones freelance de terceros.",
          "1.500+ constructores con reputación verificada en AURA CV."
        ],
        footerDocs: "Documentación y roadmap completo en docs/ROADMAP_HACKATHON_COLOSSEUM.md",
        footerFormat: "Alineado con los criterios de evaluación de Superteam y Colosseum"
      },
      slide11: {
        badge: "11 / Co-Fundadores Basados en Argentina",
        heading: "El Valor de la Confianza Garantizado por el Código",
        lead1Role: "Tech Lead & Fullstack Solana/Web3",
        lead1Bio:
          "Arquitectura de smart contracts en Solana, clientes modulares con @solana/kit, Next.js 16, Supabase RLS multi-tenant y verificación de seguridad. Residente en Argentina.",
        lead2Role: "Product Lead & Growth",
        lead2Bio:
          "Diseño de experiencia de usuario, validación con agencias de desarrollo/DAOs y ejecución de estrategias de adopción en LATAM para trabajadores remotos. Residente en Argentina.",
        ctaLive: "Explorar Plataforma en Vivo",
        ctaCode: "Ver Repositorio en GitHub",
        closingQuote:
          "«En un mundo de intermediarios opacos, ReWork devuelve la soberanía a los trabajadores: el valor de la confianza garantizado por el código en Solana.»"
      },
      slide12: {
        tag: "12 / Video Demo Oficial y Próximos Pasos",
        heading: "¡Muchas Gracias, Superteam & Colosseum!",
        subheading: "Mira ReWork en Acción sobre Solana Devnet",
        lead: "Demostramos cómo la custodia programable de sub-segundo, las comisiones de menos de un centavo y el onboarding híbrido eliminan la incertidumbre de cobro para freelancers y creadores en todo el mundo.",
        videoTitle: "ReWork — Demo Técnica del Producto (Solana Devnet)",
        videoUrl: "https://youtu.be/8ErHzzEgisQ",
        videoShort: "youtu.be/8ErHzzEgisQ",
        videoId: "8ErHzzEgisQ",
        watchYoutube: "Ver Video de Demo",
        ctaLive: "Abrir Plataforma",
        ctaCode: "Repositorio en GitHub",
        bullet1Title: "Escrow Solana de Sub-Segundo",
        bullet1Desc: "Bóvedas en USDC confirmando en ~400ms con links verificados a Solana Explorer.",
        bullet2Title: "Riel SOL & Swap DEX en Devnet",
        bullet2Desc: "Conversión de 4 monedas en vivo y ejecución de swaps a comisiones sub-centavo.",
        bullet3Title: "Bóvedas DeFi de Solana",
        bullet3Desc: "Tesorerías generando 7-18% APY en streaming con Marinade y Kamino.",
        closingMessage: "¡Listos para escalar en la mentoría Top Talent de Superteam Argentina y competir para ganar a nivel global en Colosseum!",
        footerLeft: "ReWork Protocol · Track Superteam Argentina @ Crypto World's Fair 2026",
        footerRight: "Explora la demo en: youtu.be/8ErHzzEgisQ"
      }
    }
  },
  stellar: {
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
        bullet1: "• `scripts/detect_fake_code.mjs` (Forensic audit: 0 fake timeouts, 0 fake alerts)",
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
          "Launch of the Progressive Web App (PWA).",
          "Automated receipt and tax generator.",
          "Reach 10 active workspaces."
        ],
        col3Badge: "Month 3 · SCF Tranche #2 & #3 (70%)",
        col3Title: "Public SDK & LATAM Expansion",
        col3Items: [
          "Publish `@rework/escrow-kit` SDK.",
          "Multi-sig governance for DAO treasuries.",
          "On-chain goal: > USD $150k processed.",
          "1,000+ active users in Argentina & LATAM."
        ],
        footerDocs: "Official documents ready in docs/funding_readiness/",
        footerFormat: "Adapted to the SCF Handbook 7.0 format"
      },
      slide11: {
        badge: "11 / Builders 100% Resident in Argentina",
        heading: "The Value of Trust Guaranteed by Code",
        lead1Role: "Tech Lead & Fullstack Web3",
        lead1Bio:
          "Smart contract architecture on Soroban, Stellar Wallets Kit integration, Next.js 16, Supabase RLS, and distributed database optimization. Resident in Argentina.",
        lead2Role: "Product Lead & Operations",
        lead2Bio:
          "User-centric product design, validation with companies/DAOs, and coordination of pilots and adoption strategies in LATAM. Resident in Argentina.",
        ctaLive: "Explore Live Platform",
        ctaCode: "View Code on GitHub",
        closingQuote:
          "“In a world of opaque middlemen, ReWork returns sovereignty to work: the value of trust guaranteed by code.”"
      },
      slide12: {
        tag: "12 / Official Demo Video & Closing",
        heading: "Thank You Very Much!",
        subheading: "See ReWork in Action on Stellar & Soroban",
        lead: "We demonstrated how smart contracts, SEP-0007 mobile QR payments, and non-custodial escrow eradicate payment uncertainty for digital workers in LATAM.",
        videoTitle: "Official ReWork Walkthrough",
        videoUrl: "https://youtu.be/fycBPw7Y6zg",
        videoShort: "youtu.be/fycBPw7Y6zg",
        videoId: "fycBPw7Y6zg",
        watchYoutube: "Watch on YouTube",
        ctaLive: "Explore Live Platform",
        ctaCode: "GitHub Repository",
        bullet1Title: "Instant QR Payments SEP-0007",
        bullet1Desc: "Mobile payment flow with Lobstr, Freighter, and xBull in seconds.",
        bullet2Title: "Soroban Escrow with Trustless Work",
        bullet2Desc: "Non-custodial milestone lock and automatic release of funds.",
        bullet3Title: "AURA Sovereign Reputation",
        bullet3Desc: "On-chain credentials and immutable quest records.",
        closingMessage: "Many thanks to the BAF and Stellar teams for empowering builders in Argentina and all of Latin America!",
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
        bullet1: "• `scripts/detect_fake_code.mjs` (Auditoría forense: 0 falsos timeouts, 0 alertas falsas)",
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
        videoShort: "youtu.be/fycBPw7Y6zg",
        videoId: "fycBPw7Y6zg",
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
  }
};
