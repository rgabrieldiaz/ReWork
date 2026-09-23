# ReWork — Official Application Draft: Instawards & SCF 7.0
> **Target Programs:** Stellar Instawards (Sprint de 30 días - USD $5,000) & Stellar Community Fund (SCF Build Award - Integration Track)  
> **Applicant Organization:** ReWork Protocol (Argentina)  
> **Repository:** [https://github.com/rgabrieldiaz/ReWork](https://github.com/rgabrieldiaz/ReWork)  
> **Live Demo:** [https://rework.vercel.app](https://rework.vercel.app)

---

## 1. Project Overview

### 1.1. Project Name & Description
- **Project Name:** ReWork
- **One-Sentence Elevator Pitch:** A non-custodial decentralized workspace and milestone escrow platform on Stellar that eliminates freelance payment disputes and builds sovereign professional reputation (AURA).
- **Category:** Integration Track (Incorporating Trustless Work, Stellar Wallets Kit, SEP-0007, and Native USDC).

### 1.2. Problem Statement
Freelancers and digital agencies in Latin America face severe financial friction:
1. **Payment Insecurity:** 30%+ of contractors report delayed or defaulted payments. Clients hesitate to prepay full fees without guaranteed delivery.
2. **Abusive Middlemen Fees:** Traditional platforms (Upwork, Freelancer) take 10% to 20% in platform cuts, plus exorbitant wire fees and foreign exchange spreads.
3. **Trapped Identity & Reputation:** Work history is siloed in proprietary databases. Professionals cannot port their verified track record across platforms.

### 1.3. Solution Summary
ReWork replaces intermediaries with code:
- **Soroban Smart Escrow:** Funds are deposited in USDC into non-custodial smart contracts powered by Trustless Work.
- **Micro-Fees & Instant Finality:** Payments settle in 3–5 seconds on Stellar for less than $0.0001 per transaction.
- **Sovereign Identity (AURA):** Completed escrows mint on-chain verifiable reputation badges linked to the user's Stellar account.
- **Mobile SEP-0007 QR Payments:** Frictionless payments from mobile wallets (Lobstr, Freighter Mobile) directly into smart contracts.

---

## 2. Stellar Ecosystem Integration & Building Blocks

| Building Block | Current Integration Status | Planned Enhancements in 30-Day Sprint |
| :--- | :--- | :--- |
| **Soroban Smart Contracts** | Live on Testnet via Trustless Work SDK | Deploy and verify production V1 contracts on Mainnet |
| **Stellar Wallets Kit** | v2.1.0 integrated with WalletConnect module | Biometric auto-connect & mobile deep-link handling |
| **SEP-0007 QR URIs** | Implemented in `QRPaymentsModal.tsx` | Native payment URI schema (`web+stellar:pay`) verification |
| **USDC Native Token** | Testnet USDC integrated | Mainnet USDC token addresses and balance sync |
| **Anchors (SEP-0024)** | Simulated bank transfers | Partnership integration with Argentine ARS anchor |

---

## 3. Instaward Proposal (30-Day Sprint — USD $5,000)

### 3.1. Scope & Objective
Transition ReWork from a verified Testnet MVP to an audited, production-grade Mainnet platform serving our first 2 pilot organizations in Argentina.

### 3.2. Deliverables & Budget Breakdown

| Deliverable | Description | Budget Allocation (USD) |
| :--- | :--- | :--- |
| **D1: Mainnet Contract Deployment** | Deploy Trustless Work V1 escrow contracts on Stellar Mainnet; configure production RPC endpoints. | $1,500 |
| **D2: Security Audit & UX Review** | Complete SDF Audit Bank security check and execute mobile UX polish for SEP-0007 QR flows. | $1,500 |
| **D3: Pilot Launch & User Testing** | Onboard 2 pilot organizations (1 agency + 1 DAO), onboard 100 users, process first $10k in escrows. | $1,200 |
| **D4: Open-Source Documentation & Metrics** | Publish public API docs, setup on-chain telemetry dashboard, and complete final video walkthrough. | $800 |
| **Total Requested:** | **USD $5,000 (equivalent in XLM at settlement price)** | **$5,000** |

---

## 4. SCF 7.0 Build Award — Follow-on Tranche Structure

Upon successful completion of the Instaward sprint, ReWork will graduate to the SCF 7.0 Build Award ($30,000 – $60,000 tier):

- **Tranche #0 (10%):** Legal entity onboarding, KYB verification, and initial infrastructure provisioning.
- **Tranche #1 (20%):** Local anchor integration (ARS ↔ USDC) and mobile PWA launch.
- **Tranche #2 (30%):** Release of `@rework/escrow-kit` SDK and expansion to 10 workspaces.
- **Tranche #3 (40%):** Committed on-chain milestone: $150,000+ cumulative volume settled through ReWork smart escrows across 1,000+ active users.

---

## 5. Team & Execution Capability

- **Gabriel Díaz:** Tech Lead / Fullstack Web3 Developer. Specialization in Next.js, Soroban SDK, TypeScript, and database architecture.
- **Marco Ungaro:** Product Lead & Business Operations. Specialization in UI/UX, B2B pilot coordination, and ecosystem growth.
- **Location:** Argentina (100% team residence meets all regional eligibility requirements).
