# Guión Oficial para Video Demo (2:45 min) | ReWork
> **Challenge:** Argentina Builder Challenge (BAF × Stellar) — Track Scale  
> **Duración Máxima Recomendada:** 2:30 a 3:00 minutos (150 - 180 segundos)  
> **Lema Central:** *"El valor de la confianza garantizado por el código"*  
> **Presentadores:** Gabriel Díaz (Tech Lead) & Marco Ungaro (Product Lead) — 100% Residentes en Argentina  

---

## 🎬 Estructura y Distribución de Tiempos

| Bloque | Rango | Criterio del Jurado | Foco & Pantalla |
| :--- | :---: | :--- | :--- |
| **1. Hook & El Problema** | 0:00 - 0:30 | **Validación del Problema (25%)** | Portada `/deck` -> Slide 2 (Fricción en LATAM) |
| **2. Demo en Vivo: 4 Primitivas Stellar** | 0:30 - 1:35 | **Foco de Producto (25%) & Ejecución Técnica (Desempate #1)** | Dashboard real (`/app`), Escrow Soroban, QR SEP-0007, Staking DeFi |
| **3. Arquitectura & 0 Mocks** | 1:35 - 2:10 | **Ejecución Técnica & Calidad de Código** | Slide 7 (Arquitectura), terminal con tests y auditoría forense |
| **4. Negocio, Roadmap SCF & Cierre** | 2:10 - 2:45 | **Foco de Negocio (25%) & Funding Readiness** | Slide 8 (1% fee, SaaS), Slide 11 (SCF 7.0) y Slide 12 (Equipo) |

---

## 🎙️ Guión Paso a Paso con Indicaciones de Pantalla

### BLOQUE 1: Hook y Validación del Problema (0:00 - 0:30)
- **[PANTALLA]:** Mostrar Slide 1 del deck (`/deck`) con el logo de ReWork y el lema iluminado. Luego pasar a Slide 2.
- **[VOZ]:**  
  > *"Hola jurado del Argentina Builder Challenge. Somos Gabriel Díaz y Marco Ungaro, y hoy les presentamos **ReWork**.*  
  > *En América Latina, más del 30% de los freelancers sufren impagos o demoras extremas. Al mismo tiempo, plataformas tradicionales como Upwork retienen hasta un 20% en comisiones abusivas, demoran 14 días en liquidar y dejan la reputación de los profesionales atrapada en silos cerrados.*  
  > *Para resolverlo creamos ReWork bajo una premisa innegociable: **El valor de la confianza garantizado por el código**."*

---

### BLOQUE 2: Demo en Vivo de las 4 Primitivas Oficiales de Stellar (0:30 - 1:35)
- **[PANTALLA]:** Cambiar a la plataforma real en vivo en el navegador (`/app`).
- **[VOZ]:**  
  > *"ReWork no es un prototipo: es una plataforma real y funcional sobre Stellar Testnet. Aprovecha 4 implementaciones nativas del ecosistema:*  

1. **Onboarding Dual e Identidad Soberana (AURA CV):**  
   - **[PANTALLA]:** Mostrar brevemente el botón de conexión con Privy (login social Web2 sin custodia) y Stellar Wallets Kit (Freighter, Lobstr, xBull).  
   - **[VOZ]:** *"Primero, eliminamos toda fricción de entrada: onboarding dual con login social Web2 vía Privy o billeteras nativas Web3 con Stellar Wallets Kit. Cada trabajo completado acuña reputación on-chain inmutable en el AURA CV del usuario."*

2. **Smart Contracts en Soroban (Trustless Work Escrow):**  
   - **[PANTALLA]:** Entrar a `/app/marketplace` o a un Workspace. Abrir un contrato con fondos bloqueados.  
   - **[VOZ]:** *"Segundo, custodia programática en Soroban. Integramos Trustless Work: los fondos del cliente se depositan en USDC y quedan resguardados en el contrato. El freelancer trabaja con la certeza de que el dinero existe, y se libera automáticamente al validar cada hito entregado."*

3. **Pagos Móviles Instantáneos con QR SEP-0007:**  
   - **[PANTALLA]:** Abrir el modal de cobro/pago QR (`QRPaymentsModal`). Mostrar el código QR interactivo con URI `web+stellar:pay`.  
   - **[VOZ]:** *"Tercero, pagos móviles bajo el estándar SEP-0007. El usuario genera un QR estándar con el monto en USDC; cualquier persona lo escanea con Lobstr o Freighter en su celular y transfiere en 3 a 5 segundos con comisiones de menos de un centavo."*

4. **DeFi Yield Farming & Stellar AMM:**  
   - **[PANTALLA]:** Mostrar la tarjeta de patrimonio con Sparklines y el widget del Agente DeFi (`StellarPoolsAgent`) con +12.8% APY. Clic en la pestaña de posiciones activas.  
   - **[VOZ]:** *"Cuarto, finanzas descentralizadas reales. La liquidez en custodia u ociosa no duerme: nuestro agente DeFi la conecta a pools de liquidez nativos de Stellar rindiendo hasta un 12.8% de APY, con retiro de fondos en un solo clic."*

---

### BLOQUE 3: Ejecución Técnica & Calidad de Código (0 Mocks) (1:35 - 2:10)
- **[PANTALLA]:** Mostrar Slide 7 (Arquitectura) y una ventana de terminal dividida ejecutando `node scripts/test_services_health.mjs` y `node scripts/detect_fake_code.mjs`.
- **[VOZ]:**  
  > *"En la ejecución técnica —primer criterio de desempate del hackathon— fuimos inflexibles:*  
  > *Arquitectura moderna con Next.js 16 y Turbopack, contratos Soroban Protocol 20+, aislamiento estricto multi-tenant con Supabase Row Level Security y cero código simulado.*  
  > *Realizamos una auditoría forense interna con nuestro script automatizado: **cero alerts de navegador, cero timeouts falsos y cero datos hardcodeados**. Todo el estado proviene de Soroban RPC, Horizon y Postgres."*

---

### BLOQUE 4: Modelo de Negocio, Funding Readiness & Cierre (2:10 - 2:45)
- **[PANTALLA]:** Mostrar Slide 8 (Modelo de Negocio) y luego pasar a Slide 11 (Roadmap SCF) y Slide 12 (Equipo).
- **[VOZ]:**  
  > *"Nuestro modelo de negocio alinea los incentivos con el usuario: cobramos solo un 1% por escrow exitoso —15 veces menos que Web2—, complementado con suscripciones SaaS para agencias y DAOs que necesitan tesorerías multi-firma.*  
  > *Tenemos listo nuestro dossier de **Funding Readiness** adaptado al SCF Handbook 7.0 para postular al Instaward de USD $5.000 y llevar los contratos a Mainnet con auditoría formal el próximo mes.*  
  > *Somos Gabriel y Marco, builders 100% basados en Argentina. Con ReWork, la confianza ya no depende de intermediarios opacos; depende del código. ¡Muchas gracias!"*

---

## 💡 Consejos de Grabación (Checklist Práctico)

1. **Herramienta:** Grabar con Loom o OBS Studio en resolución 1080p (Full HD).
2. **Audio:** Usar micrófono de solapa o headset en un ambiente silencioso; hablar con ritmo dinámico, seguro y entusiasta.
3. **Pestañas Listas:**
   - Pestaña 1: Deck en pantalla completa (`/deck`)
   - Pestaña 2: App en vivo logueada en el Dashboard (`/app`)
   - Pestaña 3: Marketplace con escrow desplegado (`/app/marketplace`)
   - Terminal: Lista con el script `node scripts/test_services_health.mjs` para mostrar verificación en vivo en 5 segundos.
4. **Tiempo:** Cronometrar los bloques para no superar los 2 minutos y 50 segundos.
