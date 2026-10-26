# Agents on Open Rails — Celo × Loops House Hackathon (Oct 26 – Nov 9, 2026)

> **Portal Oficial:** [https://www.loops.house/agents-on-open-rails](https://www.loops.house/agents-on-open-rails)  
> **Fecha de Inicio:** Lunes 26 de Octubre de 2026 (09:00 GMT)  
> **Deadline de Entrega:** 🚨 **Lunes 9 de Noviembre de 2026 — 09:00 GMT (06:00 ART)**  
> **Anuncio de Ganadores:** Lunes 23 de Noviembre de 2026  
> **Premios Totales:** **$5,000 USD** distribuidos en 4 tracks + **3 meses de Chainstack Growth Tier ($147 valor)** para todos los ganadores + Acceso directo a **Prezenti Grants** ($165,000 otorgados a alumni de hackathons previos).

---

## 🚨 4 Reglas Mandatorias de Elegibilidad (Criterio de Descalificación)

Si falta cualquiera de estos 4 puntos, el proyecto **no suma puntos en el leaderboard on-chain** o queda descalificado:

1. **Celo Mainnet Obligatorio (`Chain ID: 42220`):**
   - Toda la actividad puntuable debe ocurrir en **Celo Mainnet**.
   - Se permiten referencias a Celo Sepolia (`11142220`) en el código para testing, pero las queries del leaderboard y los jueces verifican exclusivamente Mainnet.
2. **ERC-8021 Attribution Tag en TODAS las Transacciones:**
   - Al inscribir el proyecto en `loops.house/agents-on-open-rails`, la plataforma genera un **código de atribución único**.
   - **Cada transacción enviada por la app o el agente** (swaps, transfers, escrows, depósitos) debe adjuntar el sufijo **ERC-8021 Attribution Tag** al final del `calldata`.
   - ⚠️ **No es retroactivo:** Las transacciones enviadas sin el tag antes de configurarlo no cuentan en el leaderboard.
   - Para pagos vía **x402** (donde el facilitador ejecuta el settlement), se registra la dirección de recepción (`PayTo`) del equipo para atribuir el volumen.
   - Spec y librería oficial: [https://github.com/celo-org/attribution-tags](https://github.com/celo-org/attribution-tags)
3. **Identidad de Agente On-Chain (ERC-8004):**
   - El proyecto **solo es válido** si registra un **ERC-8004 Agent ID** en Celo Mainnet desde la wallet del agente antes del cierre.
   - Registro y explorador: [https://www.8004scan.io/](https://www.8004scan.io/) | Docs: [https://docs.celo.org/build-on-celo/build-with-ai/8004](https://docs.celo.org/build-on-celo/build-with-ai/8004)
4. **Inscripción e Instalación de Skills Oficiales:**
   - Loops House Hackathon Skill (conecta el agente al grafo de conocimiento de sponsors, criterios de evaluación y submisión por CLI):
     ```bash
     npx loopshouse add agents-on-open-rails
     ```
   - Celopedia Skills (documentación técnica de Celo para agentes):
     ```bash
     npx skills add celo-org/celopedia-skills
     ```
   - Buy Skill (para Track 3 `@celo/buy`):
     ```bash
     npx skills add celo-org/buy-skill
     ```

---

## 🏆 Los 4 Tracks en los que Participa ReWork

ReWork está diseñado estratégicamente para competir de forma nativa y sinérgica en **los 4 tracks en simultáneo**:

---

### Track 1: Stable Agents: LatAm (Ripio × Celo Core Co.)
- **Premios:** 🥇 **$1,500** · 🥈 **$500** + 3 meses Chainstack Growth Tier
- **Tesis:** Agentes autónomos que mueven dinero real en monedas locales latinoamericanas (**wFIAT** de Ripio) sobre Celo Mainnet con costos sub-centavo, integrando **Ripio Ramp**, **Ripio Bridge** y liquidación **x402**.

#### Contratos Oficiales wFIAT en Celo Mainnet (`Chain ID: 42220`, 18 decimales)
| Token | País / Moneda | Dirección en Celo Mainnet | Explorer |
| :--- | :--- | :--- | :--- |
| **`wARS`** | 🇦🇷 Peso Argentino | `0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d` | [Celoscan](https://celoscan.io/token/0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d) |
| **`wBRL`** | 🇧🇷 Real Brasileño | `0xd76f5faf6888e24d9f04bf92a0c8b921fe4390e0` | [Celoscan](https://celoscan.io/token/0xd76f5faf6888e24d9f04bf92a0c8b921fe4390e0) |
| **`wMXN`** | 🇲🇽 Peso Mexicano | `0x337e7456b420bd3481e7fa61fa9850343d610d34` | [Celoscan](https://celoscan.io/token/0x337e7456b420bd3481e7fa61fa9850343d610d34) |
| **`wCOP`** | 🇨🇴 Peso Colombiano | `0x8a1d45e102e886510e891d2ec656a708991e2d76` | [Celoscan](https://celoscan.io/token/0x8a1d45e102e886510e891d2ec656a708991e2d76) |
| **`wPEN`** | 🇵🇪 Sol Peruano | `0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE` | [Celoscan](https://celoscan.io/token/0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE) |
| **`wCLP`** | 🇨🇱 Peso Chileno | `0x61D450a098b6a7f69fC4b98CE68198fe59768651` | [Celoscan](https://celoscan.io/token/0x61D450a098b6a7f69fC4b98CE68198fe59768651) |

#### Infraestructura Ripio (Sin KYB para el Hackathon)
- **Ripio Ramp (On-Ramp Fiat → Celo wFIAT):**
  ```text
  https://ramp.ripio.com/?country=AR&chain=42220&token=WARS&amount=10000&address=0x...
  ```
- **Ripio Ramp (Off-Ramp Celo wFIAT → Banco Local):**
  ```text
  https://ramp.ripio.com/offramp?country=AR&chain=42220&token=WARS&amount=10000&address=0x...
  ```
- **Ripio Bridge (`BridgeDeposit` en Celo Mainnet):**
  - App: `https://bridge.ripio.com`
  - Contrato `BridgeDeposit`: `0x465e642387d3d73a57CDc1368fFA53A800bA5D47`
- **Celo x402 Facilitator para wFIAT:**
  - Liquida `wARS`, `wBRL` y `wCOP` en Celo Mainnet vía **Permit2** (como los tokens wFIAT no tienen EIP-3009 nativo, el usuario aprueba `Permit2` una sola vez y luego firma off-chain).
- **Proyecto de Referencia Oficial (Arturo Grande):**
  - [https://github.com/artugrande/alcancia](https://github.com/artugrande/alcancia)

#### Criterios de Evaluación Track 1 (20% cada uno)
1. **Uso de wFIAT en Celo Mainnet (20%):** Transacciones verificadas con `wARS`, `wBRL`, `wMXN`, `wCOP`, `wPEN`, `wCLP` + ERC-8021 attribution tag.
2. **Integración del Stack Celo (20%):** ERC-8004 (identidad del agente), x402 (pagos HTTP nativos) y/o Fee Abstraction.
3. **Autonomía y Utilidad del Agente (20%):** El agente toma decisiones y ejecuta acciones reales en nombre del usuario.
4. **UX para Personas Reales (20%):** Onboarding sin fricción, montos expresados en moneda local, sin jerga cripto innecesaria.
5. **Impacto en LatAm (20%):** Problema real resuelto (alquileres/depósitos, cobros QR, protección cambiaria, pagos P2P/freelance).

---

### Track 2: Stable Agents: Open Corridors | Textile FX (Celo Core Co.)
- **Premios:** 🥇 **$750** · 🥈 **$250** + 3 meses Chainstack Growth Tier
- **Tesis:** Agentes de liquidez, market making o **gestión de tesorería multi-divisa (Treasury Agents)** que operan sobre el RFQ y `LimitOrderReactor` de **Textile FX** en Celo Mainnet.

#### Contratos Oficiales Textile FX en Celo Mainnet
| Componente | Dirección en Celo Mainnet | Notas |
| :--- | :--- | :--- |
| **`LimitOrderReactor`** | `0xa9AA0a64769cBed4d3B1Ceb4Df01CdE915C235b3` | Liquidación atómica de órdenes RFQ firmadas (EIP-712) |
| **`Fee Controller (1 bps)`** | `0x7b005466F905DD882A959888154587fA76cd3Ea7` | Fee protocolar de 1 punto básico |
| **`Permit2`** | `0x000000000022D473030F116dDEE9F6B43aC78BA3` | Aprobación unificada de tokens |
| **`USDC` (Circle Native)** | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | 6 decimales |
| **`USD₮` (Tether Native)** | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` | 6 decimales |
| **`cNGN` (Nigeria)** | `0xF6829D7393dAe24509eb1E52eE8e572e2E271a4f` | Corredor FX emergente |
| **`IDRX` (Indonesia)** | `0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22` | Corredor FX emergente |

- **Portal y Docs Textile:** `https://app.textile.money` | `https://docs.textile.money/makers/overview`

#### Criterios de Evaluación Track 2
1. **Strategy P&L (40%):** Retorno neto sobre capital desplegado y preservación de valor.
2. **Volume Quoted & Filled (30%):** Volumen total cotizado/ejecutado y consistencia.
3. **Originalidad (30%):** Creatividad de la estrategia — el propio track destaca explícitamente: *"a treasury agent that manages a business's currency exposure using Textile's corridors"*.

---

### Track 3: Build with `buy` (`usebuy.ai` — Celo Core Co.)
- **Premios:** 🏅 **5 ganadores × $200 USD ($1,000 total)** + 3 meses Chainstack Growth Tier
- **Tesis:** Integrar la CLI/librería `@celo/buy` (`usebuy.ai`) para que el agente de ReWork descubra y compre servicios de otros agentes o endpoints pagados por request vía **x402** en Celo Mainnet.

#### Stack Oficial `@celo/buy`
- **Catálogo de Servicios:** `https://gateway.usebuy.ai/v1/catalog`
- **Directorio Ecosistema:** `https://agent402.tools/`
- **Skill / Repo:** [https://github.com/celo-org/buy-skill](https://github.com/celo-org/buy-skill) (`npx skills add celo-org/buy-skill`)
- **Sitio Web:** [https://usebuy.ai](https://usebuy.ai)

#### Criterios de Evaluación Track 3
1. **Calidad del Caso de Uso (40%):** Qué problema resuelve el agente combinando servicios pagados por request.
2. **Profundidad de Integración con `buy` (35%):** Llamadas pagas reales verificadas on-chain vía x402 en Celo Mainnet.
3. **Demanda Creada (25%):** Tráfico y pagos legítimos hacia otros agentes/servicios del ecosistema.

---

### Track 4: Stable Agents: Open Corridors | USA₮ with x402 (Celo Core Co.)
- **Premios:** 🥇 **$750** · 🥈 **$250** + 3 meses Chainstack Growth Tier
- **Tesis:** Pagos y liquidación agéntica o humana utilizando **`USA₮`** (el dólar digital regulado federalmente en EE.UU. emitido por Anchorage Digital Bank bajo el marco GENIUS Act) y el **Facilitador x402 de Celo** (transferencias gasless vía `EIP-3009`).

#### Contratos y Endpoints Oficiales `USA₮` + x402 en Celo Mainnet
| Recurso | Valor / Dirección | Detalles Técnicos |
| :--- | :--- | :--- |
| **Token `USA₮` (Mainnet)** | `0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771` | **6 decimales** · EIP-3009 (`TransferWithAuthorization`) |
| **EIP-712 Domain `name`** | `"Tether America USD"` | Exacto para firmas EIP-3009 |
| **EIP-712 Domain `version`** | `"1"` | Exacto para firmas EIP-3009 |
| **Fee Adapter `USA₮`** | `0x0357EE22278c922e1D36cFe6b899269b161880C4` | 18 decimales (solo para pagar gas directamente en `USA₮`, NO transferir) |
| **Celo x402 Facilitator** | `https://api.x402.celo.org` | Endpoints: `/verify`, `/settle`, `/supported`, `/health` |
| **Portal API Key x402** | `https://x402.celo.org` | Registro gratuito con wallet (`100 req/min`) |
| **Faucet Gratuito `USA₮`** | [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/celo/mainnet) | Requiere verificación Self (ZK Proof-of-Human) |
| **Self Protocol Docs** | [https://docs.self.xyz/](https://docs.self.xyz/) | Verificación de humanidad con pasaporte/DNI vía NFC |

#### Criterios de Evaluación Track 4 (25% cada uno)
1. **Liquidación Real en Mainnet (25%):** Al menos un pago `USA₮` liquidado vía `https://api.x402.celo.org` en Celo Mainnet con hash verificable.
2. **Contraparte Independiente Nombrada (25%):** Pago entre dos partes distintas con propósito claro (ej. Inquilino → Propietario en depósito de alquiler, Cliente → Freelancer en Marketplace, o Agente → Proveedor).
3. **Flujo Repetible (25%):** Al menos una segunda liquidación verificada en el mismo flujo.
4. **Razón Clara para Usar `USA₮` (25%):** Explicación explícita de por qué un dólar regulado en EE.UU. (`USA₮`) con liquidación x402 gasless aporta valor real al caso de uso.
