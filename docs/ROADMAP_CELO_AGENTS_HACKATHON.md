# Plan Maestro de Implementación & Auditoría Fase 0 — ReWork × Celo ("Agents on Open Rails")

> **Objetivo:** Escalar **ReWork** a una arquitectura verdaderamente **Multichain (Stellar + Solana + Celo Mainnet)** y ganar en simultáneo los **4 Tracks del Hackathon "Agents on Open Rails" (Celo × Loops House)** sin romper ni sobrescribir ni una sola línea de las integraciones actuales de Stellar y Solana.

---

## 🧠 1. Estrategia Ganadora: Cómo ReWork Conecta la Visión de Marco con los 4 Tracks

El documento de Marco (`PROMPT_MAESTRO_CELO_REWORK.md`) plantea una evolución de producto brillante para América Latina (monedas locales `wFIAT`, Ripio Ramp/Bridge, QR, rendimientos reales vía DeFiLlama y el **Depósito Inteligente de Alquiler con Rendimiento 50/50 + Agente IA de Disputas**).

Al cruzar esa visión con las **reglas técnicas obligatorias de `tracks.txt` y `hackaton.txt`**, logramos una **sinergia perfecta para competir en los 4 tracks a la vez**:

| Track | Premio | Qué Pide el Jurado (Criterios On-Chain) | Cómo lo Resuelve ReWork (Producto + On-Chain) |
| :--- | :--- | :--- | :--- |
| **Track 1: Stable Agents LatAm (Ripio × Celo)** | **$2,000** ($1,500 + $500) | Uso real en Celo Mainnet (`42220`) de `wARS`, `wBRL`, `wMXN`, `wCOP`, `wPEN`, `wCLP` + **Ripio Ramp / Bridge** + **ERC-8004** + **x402** + **ERC-8021 Attribution Tag**. | • Billetera multi-divisa con los **6 tokens wFIAT** reales.<br>• Modal **Ripio Ramp** (`ramp.ripio.com` on/off-ramp a bancos locales) y **Ripio Bridge** (`0x465e...5D47`).<br>• Cobros QR Celo, envíos P2P por email/wallet y **Depósito Inteligente de Alquiler** en `wARS`/`USD₮`/`USDC`/`USA₮`. |
| **Track 2: Open Corridors \| Textile FX** | **$1,000** ($750 + $250) | Operar sobre el `LimitOrderReactor` (`0xa9AA...35b3`) de **Textile FX** en Celo Mainnet. Criterios: P&L (40%), Volumen (30%), Originalidad (30%: *"a treasury agent that manages a business's currency exposure"*). | • **ReWork Treasury & Swap Agent** conectado a **Textile FX** (`Permit2` + `LimitOrderReactor`).<br>• Protege automáticamente los ingresos en moneda local (`wARS`/`wBRL`/`cNGN`/`IDRX`) rotándolos a `USDC`/`USD₮` y cotizando órdenes RFQ con 1 bps fee controller. |
| **Track 3: Build with `buy` (`usebuy.ai`)** | **$1,000** (5 × $200) | Usar `@celo/buy` (`gateway.usebuy.ai/v1/catalog`) para que nuestro agente descubra y pague por request (vía x402 en Celo Mainnet) servicios de otros agentes. | • **Agente IA de Disputas de Alquiler y Auditoría Financiera powered by `@celo/buy`**: Cuando hay un reclamo en el Depósito de Alquiler (`UNDER_AI_REVIEW`) o el usuario pide análisis de pools DeFiLlama, el agente de ReWork usa `@celo/buy` para contratar microservicios verificados del catálogo x402 en Celo Mainnet. |
| **Track 4: Open Corridors \| `USA₮` with x402** | **$1,000** ($750 + $250) | Pagos reales en Celo Mainnet con **`USA₮`** (`0xD2ab...F771`, dólar regulado federalmente en EE.UU. por Anchorage Digital Bank) vía **Celo x402 Facilitator** (`api.x402.celo.org`, EIP-3009 gasless), entre dos partes independientes y con flujo repetible. | • Liquidación **x402 Gasless en `USA₮`** para:<br>1) **Depósito de Alquiler / Cuotas mensuales repetibles** (Inquilino → Propietario / Escrow).<br>2) **Compras en Marketplace y Pagos de Hitos**.<br>• Integración de badge **Self ZK Proof-of-Human** + Faucet oficial de Google Cloud para obtener `USA₮` gratis. |

---

## 🔍 2. Informe de Auditoría Técnica — Fase 0 (Estado Actual del Repositorio)

### 2.1 Arquitectura Detectada y Módulos Reutilizables
- **Framework:** Next.js `16.1.6` (App Router) + React `19.2.3` + TypeScript `5` + TailwindCSS `4`.
- **Autenticación y Wallets (`src/components/PrivyProviderWrapper.tsx` + `src/hooks/useWallet.tsx`):**
  - El proyecto ya utiliza `@privy-io/react-auth` (`^3.19.0`), el cual soporta de forma nativa **wallets embebidas EVM y wallets externas EVM (MetaMask, Rabby, MiniPay, Valora)** en paralelo a Solana y Stellar.
- **Persistencia (`src/lib/supabase.ts`):**
  - Tablas multi-tenant operativas (`profiles`, `workspaces`, `transactions`, `savings_goals`, `marketplace_items`, `crowdfunding_campaigns`). Podemos almacenar metadatos de red (`network: 'celo' | 'solana' | 'stellar'`) y estados del Depósito Inteligente de Alquiler con sincronización en `localStorage` + Supabase.
- **Módulos que NO se tocan (Intactos al 100%):**
  - `src/lib/stellar.ts`, `src/lib/trustlesswork.ts` (Soroban / Trustless Work / SEP-0007).
  - `src/lib/solana.ts`, `src/lib/solana-escrow.ts` (`@solana/kit` / Anchor Devnet).

### 2.2 Archivos Existentes que se Extenderán Limpiamente (Sin Romper Nada)
1. `src/lib/currency.ts` → Extender tipos de moneda para incluir `CELO`, `USAT`, `USDT`, `wARS`, `wBRL`, `wMXN`, `wCOP`, `wPEN`, `wCLP` manteniendo `USDC`, `ARS`, `XLM`, `SOL`.
2. `src/components/Header.tsx` y `src/components/ConnectButton.tsx` → Agregar selector de 3ra red (`🌱 Celo Mainnet`) junto a Stellar y Solana, mostrando balances on-chain de Celo y el badge **ERC-8004 Agent Verified**.
3. `src/components/BankTransferModal.tsx` → Añadir pestaña nativa **Ripio Ramp (On/Off-Ramp bancario LatAm)** + **Ripio Bridge (`BridgeDeposit`)** cuando la red activa es Celo.
4. `src/components/QRPaymentsModal.tsx` → Añadir pestaña **QR Celo Mainnet (`rework-celo-qr-v1`)** con selector de activo (`USA₮`, `USDC`, `USD₮`, `wARS`, `wBRL`, etc.), generación de QR y escaneo/ejecución ERC-20 real con tag ERC-8021.
5. `src/components/StellarPoolsAgent.tsx` → Añadir 3ra pestaña **`🌱 Celo Mainnet (DeFiLlama Live)`** que consulta en vivo `https://yields.llama.fi/pools` filtrando `chain === "Celo"`.
6. `src/app/app/goals/page.tsx` → Incorporar el módulo estrella **"Depósito Inteligente de Alquiler (Smart Rental Escrow 50/50)"**, envíos P2P por email/wallet y el **Agente Textile FX & `@celo/buy`**.
7. `src/app/app/marketplace/page.tsx` y `src/app/app/crowdfunding/page.tsx` → Habilitar publicación, compra, subasta y aporte en activos de Celo (`wARS`, `USA₮` vía x402 gasless, `USDC`, `USD₮`).
8. `src/app/deck/page.tsx` → Añadir la 3ra pestaña **`🌱 Celo Mainnet`** en el switcher del Pitch Deck (`[ ⚡ Solana | 🌐 Stellar | 🌱 Celo ]`).

### 2.3 Nuevos Archivos y Módulos a Crear (Arquitectura Limpia)
- `src/lib/chains/celo.ts` → Configuración oficial de **Celo Mainnet (`42220`)** y **Celo Sepolia (`11142220`)**, RPCs, exploradores (`celoscan.io`) y helper **ERC-8021 Attribution Tag** (que inyecta automáticamente el sufijo de atribución del equipo en cada `calldata`).
- `src/lib/celo-assets.ts` → Registro tipado con direcciones verificadas en Mainnet y decimales exactos (`18` para `CELO` y `wFIAT`; `6` para `USA₮`, `USDC`, `USD₮`).
- `src/lib/celo-x402.ts` → Cliente e integración con `https://api.x402.celo.org` para firmas **EIP-3009 (`TransferWithAuthorization`)** con `USA₮` (`"Tether America USD"`, versión `"1"`) y **Permit2** para `wARS`/`wBRL`/`wCOP`.
- `src/lib/celo-textile.ts` → Integración con **Textile FX** (`LimitOrderReactor` `0xa9AA0a64769cBed4d3B1Ceb4Df01CdE915C235b3` y `Permit2` `0x000000000022D473030F116dDEE9F6B43aC78BA3`) para swaps y cobertura cambiaria del Agente de Tesorería.
- `src/lib/celo-buy-agent.ts` → Integración con **`@celo/buy` (`https://gateway.usebuy.ai/v1/catalog`)** para compras agénticas x402 y resolución asistida por IA en disputas de alquiler.
- `src/lib/defillama.ts` → Servicio con caché y filtros de riesgo (`Bajo / Medio / Alto`) que consume `https://yields.llama.fi/pools` en tiempo real para `chain === "Celo"`.
- `src/hooks/useCeloWallet.tsx` → Hook dedicado para Celo (conexión EVM vía Privy / Injected Wallet, cambio automático a Chain ID `42220`, lectura multicall de balances `CELO` + `USA₮` + `USDC` + `USD₮` + 6 `wFIAT`, transferencias ERC-20 con ERC-8021 tag).
- `contracts/celo/ReWorkRentalEscrow.sol` → Smart contract en Solidity para **Depósito Inteligente de Alquiler** en Celo (custodia del principal, contabilidad de rendimiento 50/50 entre Inquilino y Propietario, liberación por doble firma al vencimiento, y resolución por árbitro/agente ERC-8004 en caso de disputa).
- `src/components/SmartRentalEscrowModal.tsx` → Interfaz completa de creación, fondeo, seguimiento de rendimiento 50/50, **liberación por doble firma con QR mutuo** y **panel de evidencias + dictamen del Agente IA de Disputas**.

### 2.4 Dependencias y Variables de Entorno
- **Paquetes NPM:** `viem` (cliente EVM ligero, tipado y estándar en el ecosistema Celo/x402).
- **Variables de Entorno (`.env.example` / `.env.local`):**
  ```env
  NEXT_PUBLIC_CELO_CHAIN_ID=42220
  NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org
  NEXT_PUBLIC_CELO_ATTRIBUTION_TAG=rework_celo_2026
  NEXT_PUBLIC_CELO_ERC8004_AGENT_ID=
  NEXT_PUBLIC_CELO_ESCROW_ADDRESS=
  CELO_X402_API_KEY=
  ```

---

## 🚀 3. Plan de Ejecución por Fases (Fases 1 a 6)

### Fase 1: Base Celo Mainnet, Registro de Activos wFIAT/Stables y Tag ERC-8021
1. Instalar `viem` y crear `src/lib/chains/celo.ts` + `src/lib/celo-assets.ts` con todas las direcciones oficiales verificadas en Celo Mainnet (`42220`).
2. Implementar el inyector automático de **ERC-8021 Attribution Tag** en todas las transacciones salientes de Celo y el badge de verificación **ERC-8004 Agent ID**.
3. Crear `src/hooks/useCeloWallet.tsx` y conectar el selector de red en `Header.tsx` y `ConnectButton.tsx` (`Stellar` | `Solana` | `Celo Mainnet`).

### Fase 2: Operaciones Celo — Pagos QR, Envíos por Email/Wallet y Swaps con Textile FX (Track 2)
1. **QR Celo (`QRPaymentsModal.tsx`):** Generar y escanear payloads `rework-celo-qr-v1` para cobrar en `wARS`, `wBRL`, `USA₮`, `USDC`, `USD₮`, `CELO` con firma real en Celo Mainnet.
2. **Envíos P2P por Email o Wallet:** Resolución de usuarios registrados en ReWork por email a su wallet EVM de Celo (o envío directo a `0x...`) con recibo verificable en Celoscan.
3. **Swaps & Agente de Tesorería Textile FX (`src/lib/celo-textile.ts`):** Cotización y swap entre `wFIAT` (`wARS`, `wBRL`, `cNGN`, `IDRX`) y dólares digitales (`USDC`, `USD₮`, `USA₮`) interactuando con `Permit2` y `LimitOrderReactor` (`0xa9AA...35b3`).

### Fase 3: Suite Comercial Celo + Pagos Gasless `USA₮` con x402 (Track 4)
1. **Cliente x402 Celo (`src/lib/celo-x402.ts`) + Endpoint API (`/api/celo/x402`):** Soporte de autorización gasless **EIP-3009** para `USA₮` (`0xD2ab...F771`, `"Tether America USD"`) y **Permit2** para `wARS`/`wBRL`/`wCOP` contra `https://api.x402.celo.org`.
2. **Marketplace, Subastas, Colectas y Metas Grupales:** Permitir listar, ofertar, comprar y aportar en Celo Mainnet usando `wFIAT` o **`USA₮` vía x402 gasless**, cumpliendo los 4 criterios del Track 4 (liquidación en Mainnet, contraparte independiente, flujo repetible y justificación regulatoria GENIUS Act).

### Fase 4: Ripio Ramp / Bridge (Track 1) + DeFiLlama Yield Discovery en Vivo
1. **Integración Ripio Ramp & Bridge (`BankTransferModal.tsx`):**
   - On-Ramp directo: `https://ramp.ripio.com/?country=AR&chain=42220&token=WARS&amount=...&address=0x...` (soporte multipaís AR, BR, MX, CO, PE, CL).
   - Off-Ramp bancario directo: `https://ramp.ripio.com/offramp?...`
   - Ripio Bridge: Interacción/enlace con `BridgeDeposit` (`0x465e642387d3d73a57CDc1368fFA53A800bA5D47`).
2. **Descubrimiento de Pools Reales en Celo (`src/lib/defillama.ts` + `StellarPoolsAgent.tsx`):**
   - Consulta en vivo a `https://yields.llama.fi/pools` filtrando `chain === "Celo"`.
   - Filtros por activo (`USDT`, `USDC`, `CELO`, `wFIAT`), ordenamiento por `APY` y `TVL`, y badge de riesgo (`Bajo / Medio / Alto`).

### Fase 5: Depósito Inteligente de Alquiler (50/50 Yield + QR Doble Firma + Agente IA `@celo/buy` Track 3)
1. **Smart Contract (`contracts/celo/ReWorkRentalEscrow.sol`):**
   - Roles: `tenant` (inquilino), `landlord` (propietario), `arbitratorAgent` (agente ERC-8004).
   - Regla financiera: **Principal 100% protegido**; **Rendimiento generado dividido 50% Inquilino / 50% Propietario**.
   - Máquina de 10 estados explícitos (`DRAFT`, `PENDING_COUNTERPARTY`, `ACTIVE_LOCKED`, `YIELDING`, `MATURED_WAITING_DUAL_SIG`, `PARTIALLY_SIGNED`, `RELEASED`, `DISPUTED`, `UNDER_AI_REVIEW`, `RESOLVED`).
2. **Liberación por Doble Firma vía QR al Vencimiento (2 años / configurable para demo):**
   - Al vencer el plazo, el contrato requiere la firma de ambas partes. El Propietario o Inquilino muestra su QR de liberación y la contraparte lo escanea y firma para liberar el principal + el rendimiento 50/50.
3. **Agente IA de Disputas + Integración `@celo/buy` (Track 3):**
   - Si hay daños o reclamos al finalizar el contrato, cualquiera abre disputa (`DISPUTED`) y sube evidencias (fotos, inventario, recibos, texto).
   - El **Agente IA de ReWork** consulta el catálogo de `@celo/buy` (`https://gateway.usebuy.ai/v1/catalog`), ejecuta una llamada pagada vía x402 en Celo Mainnet y emite un **Dictamen Estructurado** (`Resumen`, `Evidencia Considerada`, `Riesgo/Confianza`, `Split Recomendado: 100/0, 0/100 o % parcial`) para que las partes acepten y liquiden on-chain.

### Fase 6: Verificación Integral y Pitch Deck Celo
1. Ejecutar `npx tsc --noEmit` con **0 errores**.
2. Crear script de verificación `scripts/test_celo_integration.mjs` (valida RPC Celo Mainnet, contratos wFIAT/USA₮/Textile, endpoint DeFiLlama y generación de tag ERC-8021).
3. Actualizar `/deck` agregando la pestaña **`🌱 Celo Mainnet`** lista para el video demo de 3 minutos.
