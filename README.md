# ReWork ⚡
### *El valor de la confianza, garantizado por código.*
> **Decentralized B2B & DAO Workspace with Escrow Payments, Milestones, and Reputation powered by the Stellar Network.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)](https://react.dev/)
[![Stellar Network](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-black?style=flat&logo=stellar)](https://stellar.org/)
[![Trustless Work](https://img.shields.io/badge/Escrow-Trustless%20Work%20V1%2FV2-teal?style=flat)](https://trustlesswork.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres%20RLS-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

---

## 📖 Overview

**ReWork** is a decentralized workspace and B2B incentives platform built on the **Stellar Blockchain** and **Soroban Smart Contracts**. It bridges Web2 organizations and Web3 DAOs by automating milestone-based payments with native USDC, eliminating payment disputes through non-custodial escrows, and establishing an immutable, sovereign professional reputation (**AURA**).

Whether coordinating corporate incentive programs, freelance service contracts, DAO bounties, or collective crowdfunding campaigns, ReWork ensures funds are locked securely and released only when deliverables are verified.

---

## 🚀 Key Features

### 🛡️ Smart Escrow & Milestone Payments (`Trustless Work`)
- **Non-Custodial Escrows:** Automated single-release and multi-release Soroban smart contracts powered by **Trustless Work**.
- **Dispute Mitigation:** Client deposits USDC into escrow; funds are released to contractors or milestone leads upon verification without third-party intermediaries.
- **Micro-fees & Speed:** Instant finality (3-5 seconds) on Stellar with fractions of a cent in transaction fees.

### 🏢 Multi-Tenant Workspaces (`/app/[workspace-slug]`)
- **Isolated Organization Environments:** Corporate entities, agencies, and DAOs can establish dedicated workspaces.
- **Role-Based Access Control (RBAC):** Superadmin, Workspace Admin, Member, and Guest roles enforced with Postgres Row-Level Security (RLS).
- **Custom Branding & Settings:** Workspaces manage their own missions, members, and internal bounties.

### 💼 Services Marketplace & Auctions (`/app/marketplace`)
- **P2P Marketplace:** Offer and contract specialized services with built-in escrow protection.
- **Bounties & Reverse Auctions:** Organizations publish tasks and contractors bid with transparent milestone estimates.

### 🎯 Squad Goals & Team Missions (`/app/squad-goals`)
- **Collaborative Missions:** Team-wide objectives funded through escrow with multi-sig community or lead approvals.
- **Incentive Alignment:** Performance bonuses and rewards disbursed automatically upon code or objective validation.

### 🤝 Crowdfunding & Colectas (`/app/crowdfunding`)
- **Collective Funding Campaigns:** Launch transparent crowdfunding initiatives on Stellar.
- **Milestone-Based Disbursements:** Backers deposit USDC and track fund releases per milestone.

### 📈 Financial Goals Simulator & DeFi Yield (`/app/goals`)
- **Goals Simulator:** Interactive goal planning and savings forecast.
- **Stellar Pools Yield Agent:** Real-time APY simulation and automated liquidity pool strategies on the Stellar DEX.

### 📲 Instant QR Payments & Banking Gateway
- **QR Payments Modal:** Instant mobile payments and requests using SEP-0007 / Stellar standard payment URIs.
- **Fiat On/Off-Ramp Simulator:** Seamless conversion and bank transfer simulation between local fiat and Stellar USDC.

### 🆔 Sovereign Web3 Identity & Reputation (AURA) (`/app/web3-identity`)
- **Portable Professional Identity:** Verified work history, completed escrows, and earned badges.
- **AURA Score:** Sybil-resistant reputation score calculated from verified contributions.

---

## 🛠️ Architecture & Tech Stack

```
ReWork Frontend (Next.js 16 App Router + Tailwind v4 + Lucide)
   │
   ├── Auth Layer
   │    ├── Privy (@privy-io/react-auth) - Social Login (Google, Email)
   │    ├── Stellar Wallets Kit (@creit.tech/stellar-wallets-kit) - Freighter, Lobstr, xBull, etc.
   │    └── Deterministic Keypair Generation (WebCrypto subtle API)
   │
   ├── Blockchain & Smart Contracts
   │    ├── Stellar SDK (@stellar/stellar-sdk) - Horizon & Soroban RPC
   │    └── Trustless Work Escrow SDK (@trustless-work/escrow) - Smart Escrow Contracts
   │
   └── Data & Backend Layer
        ├── Supabase (PostgreSQL with RLS & Realtime)
        └── Next.js Server Routes (/api/trustless-work/*)
```

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16.1.6](https://nextjs.org/) (App Router, Turbopack) |
| **Frontend Library** | [React 19.2.3](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Design System** | [Tailwind CSS v4](https://tailwindcss.com/), Glassmorphism UI, [Lucide React](https://lucide.dev/), Sonner, Canvas Confetti |
| **Blockchain** | [Stellar Network](https://stellar.org/), Soroban Protocol 27, `@stellar/stellar-sdk` |
| **Escrow Protocol** | [Trustless Work](https://trustlesswork.com/) (`@trustless-work/escrow`) |
| **Wallets & Auth** | [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit), [Privy](https://privy.io/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security) |
| **Agent Skills** | Antigravity / Agentic skills for Stellar & Trustless Work in `.agents/skills` |

---

## 📂 Project Structure

```bash
ReWork/
├── .agents/                      # Workspace Agent Skills (Stellar, Trustless Work, etc.)
│   └── skills/
├── public/                       # Static assets & icons
├── scripts/                      # Automated test & verification suites
│   ├── test_services_health.mjs  # Health check for RPC, Supabase & APIs
│   ├── test_crud_rls.mjs         # Database CRUD & RLS verification
│   ├── test_escrow_api.mjs       # Trustless Work Escrow integration tests
│   └── test_superadmin_access.mjs# Superadmin permissions check
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # Landing page, about, features, pricing, terms
│   │   ├── api/trustless-work/   # Server routes for Escrow deployment & transactions
│   │   ├── app/                  # Authenticated Dashboard
│   │   │   ├── [workspace-slug]/ # Multi-tenant workspace view
│   │   │   ├── admin/            # Superadmin / Admin control center
│   │   │   ├── crowdfunding/     # Crowdfunding campaigns
│   │   │   ├── global-network/   # Interactive network & nodes map
│   │   │   ├── goals/            # Financial goals & yield simulator
│   │   │   ├── marketplace/      # P2P Services & Bounties
│   │   │   ├── squad-goals/      # Team missions & milestone funding
│   │   │   └── web3-identity/    # Sovereign profile & AURA reputation
│   │   └── auth/                 # Login & wallet onboarding
│   ├── components/               # UI & Modal components (QR, Transfers, Stellar Pools)
│   ├── hooks/                    # Custom React hooks (Wallet, Profile, Workspace, Staking)
│   └── lib/                      # Stellar utilities, Supabase client, Crypto, Translations
├── .env.example                  # Environment variable reference
├── DESIGN.md                     # UI/UX design specifications (CryptoDash Glassmorphism)
└── package.json                  # Dependencies & npm scripts
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory (you can copy from [`.env.example`](.env.example)):

```env
# Privy Authentication (https://dashboard.privy.io)
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxxxx

# Supabase (https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Trustless Work Escrow (https://trustlesswork.com)
NEXT_PUBLIC_TW_API_KEY=your-trustless-work-api-key

# Stellar Network ("testnet" | "public")
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_MAINNET_RPC_URL=https://mainnet.stellar.validationcloud.io/v1/...

# WalletConnect Cloud Project ID (Optional - has fallback)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=8d234c919d5c4146a782b78a2e106da4

# Application Salt for Deterministic Keypairs (Optional)
NEXT_PUBLIC_APP_ENCRYPTION_SALT=your_custom_salt_here
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` recommended
- **npm**, **pnpm**, or **yarn**
- A Stellar wallet (such as [Freighter](https://www.freighter.app/)) or email/Google account for Privy.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rgabrieldiaz/ReWork.git
   cd ReWork
   ```

2. **Install dependencies:**
   ```bash
   npm install --ignore-scripts
   ```
   > *Note:* `--ignore-scripts` is recommended on Windows environments to prevent build-step script conflicts in hardware wallet dependencies.

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Verification Suites

ReWork includes dedicated verification scripts in `scripts/` to validate critical infrastructure before deployment:

```bash
# Verify health of Stellar RPC, Supabase & external APIs
node scripts/test_services_health.mjs

# Test Supabase database RLS policies & CRUD operations
node scripts/test_crud_rls.mjs

# Test Trustless Work Escrow contract deployment and API routes
node scripts/test_escrow_api.mjs

# Verify Superadmin access and workspace permissions
node scripts/test_superadmin_access.mjs

# Run TypeScript type-checking
npx tsc --noEmit
```

---

## 🚢 Deployment

The project is optimized for deployment on [Vercel](https://vercel.com):

1. Link your GitHub repository to Vercel.
2. In **Project Settings > Environment Variables**, add the environment variables defined in [`.env.example`](.env.example).
3. Deploy! Next.js will build using Turbopack and serve the application globally.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) or [Apache-2.0](.agents/skills/trustless-work-dev/LICENSE) where specified.
