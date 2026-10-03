# ReWork — Starting Point Disclosure & Colosseum Hackathon Changelog

> **Official Competition Tracker for Superteam Argentina Track & Colosseum (Crypto World's Fair)**  
> This document distinguishes pre-existing work from new features built specifically during the hackathon period (September 28 – October 12, 2026).

---

## 1. Project Starting Point (State as of September 28, 2026)

### 1.1 Existing Product & Codebase
- **Product Definition:** ReWork is a decentralized freelance and collaborative work platform designed to remove payment friction, intermediaries, and cross-border currency conversion fees for Latin American and global builders.
- **Frontend / Fullstack:** Next.js (App Router), TailwindCSS, TypeScript, Lucide Icons, Bilingual i18n support (English/Spanish).
- **Authentication & Persistence:** Hybrid auth using Privy (Web2 social login + embedded wallets) and Supabase database.
- **Prior Blockchain Integrations:** Stellar testnet escrow and asset payments (Trustless Work V1/V2, SEP-0007 QR payments, classic/SAC USDC).

### 1.2 Users, Revenue & Funding Status
- **Users:** Alpha stage / internal testers and sandbox testnet transactions.
- **Revenue:** 0 USD (pre-revenue, hackathon prototype).
- **Funding:** 0 USD external venture funding (100% bootstrapped by the founding team).

### 1.3 Team & Roles
- **Founding Team:** Based in Argentina.
- **Roles:**
  - Full-stack Development & Smart Contract Architecture.
  - Product Design & UI/UX.
  - Business Development & Go-to-market.

### 1.4 Material Use of AI Disclosure
- **AI-Assisted Development:** In accordance with Colosseum rules, the team uses AI developer assistants (such as Google Antigravity and Cursor) for code refactoring, scaffolding, and test generation. All architectural decisions, security boundaries, and final code reviews are driven and verified by the founders.

---

## 2. Hackathon Goals & Target Milestones

| Milestone | Target Date | Scope & Deliverable |
| :--- | :--- | :--- |
| **Milestone 1: Solana Architecture & Setup** | Oct 02 — Oct 04 | Setup `@solana/kit` v8+, Triton devnet RPC integration, Solana wallet adapters and embedded wallet support. |
| **Milestone 2: Solana Escrow / Payments Engine** | Oct 05 — Oct 08 | Anchor program / Devnet SPL-USDC escrow & milestone release logic. |
| **Milestone 3: UX Polishing & User Testing** | Oct 09 — Oct 10 | End-to-end interactive demo flows, feedback collection from 5+ real freelancers/clients. |
| **Milestone 4: Dual Submission & Videos** | Oct 11 — Oct 12 | 2-minute pitch video, 3-minute product demo video in English, submission on Colosseum and Superteam Earn. |

---

## 3. Weekly Changelog (Work Completed During Competition)

### Week 1 (September 28 – October 04, 2026)
- **Repo & Guidelines Setup:**
  - Integrated official `SOLANA-RULES.md` and `docs/solana_stack_guide.md`.
  - Defined multi-chain expansion strategy for ReWork, incorporating Solana alongside existing rails.
- **Build Station Sprint:**
  - Initial configuration of Solana devnet environment and dependencies (`@solana/kit`).
  - Scaffolding of Solana payments/escrow interaction module.

### Week 2 (October 05 – October 12, 2026)
- *(To be updated as development progresses)*
- Target: Full functional Solana escrow demo, user validation metrics, English pitch & demo video recorded.
