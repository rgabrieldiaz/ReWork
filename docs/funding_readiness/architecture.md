# ReWork — Architecture & Technical Specification
> **Track:** Scale Track — Argentina Builder Challenge (Stellar × BAF)  
> **Scope:** Decentralized B2B & DAO Workspace with Soroban Smart Escrow, Milestone Settlements & Sovereign Reputation

---

## 1. System Overview

ReWork is architected as a modular, non-custodial decentralized application (dApp) that bridges traditional Web2 business operations with on-chain financial infrastructure on the **Stellar Network**.

```
                           +----------------------------------------+
                           |          Client Layer (Next.js 16)     |
                           |   App Router, Turbopack, React 19      |
                           +-------------------+--------------------+
                                               |
                     +-------------------------+-------------------------+
                     |                                                   |
                     v                                                   v
      +------------------------------+                  +-------------------------------+
      |       Authentication         |                  |    Blockchain & Web3 Rail     |
      | - Privy (Web2 Social/Email)  |                  | - Stellar SDK v14.5           |
      | - Stellar Wallets Kit v2.1   |                  | - Stellar Wallets Kit         |
      |   (Freighter, Lobstr, xBull) |                  | - SEP-0007 QR URI Engine      |
      | - WebCrypto Deterministic Key|                  | - Trustless Work Escrow SDK   |
      +--------------+---------------+                  +---------------+---------------+
                     |                                                  |
                     v                                                  v
      +------------------------------+                  +-------------------------------+
      |       Database & RBAC        |                  |    Stellar Network / Soroban  |
      | - Supabase PostgreSQL        |                  | - Soroban Smart Contracts     |
      | - Multi-tenant Workspaces    |                  |   (Single & Multi-Release)    |
      | - Row-Level Security (RLS)   |                  | - Native USDC (SEP-41 SAC)    |
      | - Realtime Subscriptions     |                  | - Horizon & Soroban RPC       |
      +------------------------------+                  +-------------------------------+
```

---

## 2. Stellar Building Blocks Integration

### 2.1. Soroban Smart Contracts (Trustless Work Escrow)
- **Protocol:** Trustless Work Protocol (V1 for Mainnet production / V2 on Testnet).
- **Contract Type:** Non-custodial escrow contracts with programmatic milestones.
- **Settlement Asset:** Native **USDC** on Stellar (fast finality in 3–5 seconds, transaction fee < $0.0001).
- **Life Cycle:**
  1. `deploy_escrow`: Client establishes terms (milestone amount, contractor public key, release conditions).
  2. `fund_escrow`: Client deposits USDC into contract address.
  3. `submit_deliverable`: Contractor marks milestone completion.
  4. `release_funds`: Client or multi-sig approval unlocks funds directly to contractor wallet.
  5. `dispute_resolution`: Pre-configured arbitration window or refund timeout.

### 2.2. Multi-Wallet Connection & Deep Linking
- **Library:** `@creit.tech/stellar-wallets-kit` v2.1.0 with `WalletConnectModule`.
- **Supported Wallets:** Freighter (Browser & Mobile), Lobstr, xBull, Albedo, Hana, and WalletConnect v2.
- **Mobile Support:** Mobile deep-linking using standard URI schemes (`web+stellar:pay`) allows instant signing from mobile devices without copy-pasting addresses.

### 2.3. Mobile Payments & QR Protocol (SEP-0007)
- **Standard:** Stellar Ecosystem Proposal 0007 (SEP-0007).
- **Implementation:** Standardized QR codes encoding `web+stellar:pay?destination=...&amount=...&asset_code=USDC&asset_issuer=...`.
- **Use Cases:** Instant invoice settlement, peer-to-peer task bounties, and point-of-sale funding for crowdfund initiatives.

---

## 3. Data Layer & Multi-Tenant Security

### 3.1. Multi-Tenancy Architecture
- Each team, agency, or DAO operates within an isolated `workspace` identified by a unique slug (`/app/[workspace-slug]`).
- Resources (Squad Goals, Marketplace items, Bounties, Donations) are tied to `workspace_id`.

### 3.2. Row-Level Security (RLS) Policies
- All PostgreSQL tables in Supabase enforce strict RLS policies.
- **Roles:**
  - `Superadmin`: System-wide oversight and contract health verification.
  - `Admin`: Workspace management, member invitations, and milestone verification.
  - `Member`: Bidding, goal contribution, and escrow participation.
  - `Guest/Public`: Read-only access to public collective campaigns.

### 3.3. Test & Verification Suites
The codebase maintains automated verification scripts in `scripts/`:
- `test_services_health.mjs`: Tests Stellar RPC, Supabase and Trustless Work API availability.
- `test_crud_rls.mjs`: Validates CRUD operations under active RLS policies.
- `test_escrow_api.mjs`: Tests escrow deployment and transaction endpoints.
- `test_superadmin_access.mjs`: Tests permission boundaries across tenants.

---

## 4. Performance & Deployment

- **Frontend:** Next.js 16 with Turbopack for sub-second hot-reloads and optimized static page generation.
- **Hosting:** Vercel edge deployment with automated CI/CD upon push to `main`.
- **Client-Side Footprint:** Tree-shaken bundle, glassmorphism design system using Tailwind CSS v4, zero heavy runtime CSS dependencies.
