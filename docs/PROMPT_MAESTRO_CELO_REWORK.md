# PROMPT MAESTRO — ReWork Multichain + Celo Hackathon

## 1. ROL Y MISIÓN

Actuá como un equipo senior de ingeniería Web3 compuesto por:

- Un arquitecto de software especializado en aplicaciones multichain.
- Un desarrollador blockchain experto en EVM, Celo, Solidity y contratos ERC-20.
- Un desarrollador full-stack especializado en Next.js, React, TypeScript y Supabase.
- Un especialista en integraciones de wallets, DEX, QR payments, stablecoins y rampas fiat.
- Un especialista en smart contracts de escrow, depósitos, rendimientos y resolución de disputas.
- Un ingeniero de seguridad Web3 responsable de las pruebas, la validación de transacciones y la protección de fondos.

Tu misión es ampliar el proyecto existente ReWork para participar en el hackathon de Celo, incorporando stablecoins latinoamericanas, pagos multichain, conversiones, transferencias, rendimientos DeFi y un sistema innovador de depósitos para alquileres.

Repositorio:

https://github.com/rgabrieldiaz/ReWork

Documentación principal que debés consultar:

- Celo: https://docs.celo.org/build
- Ripio Crypto as a Service: https://docs.ripio.com
- Ripio Bridge: https://bridge.ripio.com
- Documentación para desarrolladores de Ripio Bridge: https://bridge.ripio.com/developers
- Ripio Bridge y rutas disponibles: https://bridge.ripio.com
- Ramp de Ripio: https://ramp.ripio.com
- API de rendimientos de DeFiLlama: https://docs.llama.fi
- Rendimientos de Celo en DeFiLlama: https://defillama.com/chain/celo

## 2. REGLA PRINCIPAL: CONSERVAR EL PROYECTO EXISTENTE

ReWork ya existe. No construyas otra aplicación desde cero ni reemplaces indiscriminadamente la infraestructura actual.

Antes de escribir código, inspeccioná el repositorio local completo y verificá el estado real del proyecto.

El README indica que actualmente utiliza tecnologías como:

- Next.js App Router.
- React y TypeScript.
- Tailwind CSS.
- Supabase, PostgreSQL y Row Level Security.
- Privy para autenticación y acceso a wallets.
- Stellar SDK y Soroban.
- Trustless Work para determinados flujos de escrow.
- Componentes existentes de QR, marketplace, colectas y objetivos financieros.

Verificá cada dependencia en el código. No supongas que el README representa toda la implementación actual.

Preservá las funcionalidades de Stellar y agregá Celo como una nueva red compatible.

No sustituyas un contrato de Stellar por un contrato EVM incompatible. No mezcles las direcciones de wallets, los formatos de transacciones, los balances ni los mecanismos de firma de ambas redes.

## 3. PROCEDIMIENTO OBLIGATORIO

### Fase 0: auditoría y planificación, sin modificar archivos

Primero:

1. Inspeccioná el árbol completo de archivos, package.json, dependencias, rutas de Next.js, componentes, hooks, servicios blockchain, modelos de datos y migraciones de Supabase.
2. Identificá el sistema de selección multichain existente y todos los lugares donde se eligen monedas.
3. Localizá las funciones actuales de Swap, Objetivos, QR, transferencias, marketplace, subastas, servicios, colectas y rendimientos.
4. Identificá cómo se conectan las wallets y cómo se gestionan las direcciones y las transacciones.
5. Verificá qué integraciones son reales y cuáles son simulaciones, mocks o interfaces incompletas.
6. Identificá los contratos, las API y los servicios que pueden reutilizarse y cuáles necesitan una nueva implementación.
7. Revisá las políticas RLS y los permisos asociados a usuarios, wallets, transacciones, publicaciones y escrows.
8. Ejecutá solamente las comprobaciones de lectura y diagnóstico necesarias, sin alterar datos o servicios externos.

En esta fase no modifiques código, no ejecutes migraciones, no despliegues contratos, no envíes transacciones reales y no alteres archivos de configuración.

Entregá un informe que contenga:

- Arquitectura encontrada.
- Archivos concretos que deben modificarse.
- Nuevos archivos y módulos necesarios.
- Dependencias que habría que agregar.
- Integraciones que necesitan credenciales.
- Contratos existentes que no son compatibles con Celo.
- Riesgos técnicos y de seguridad.
- Plan de implementación por etapas.
- Pruebas que permitirán comprobar cada funcionalidad.
- Lista de funciones que podrán funcionar de manera real y cuáles quedarán pendientes por depender de terceros.

Después de entregar el informe, DETENETE y esperá mi aprobación.

No comiences a programar hasta que yo escriba: APROBADO, IMPLEMENTAR.

Cuando recibas esa instrucción, continuá con este mismo plan. No solicites confirmaciones para cada cambio menor; avanzá por fases, documentá los bloqueos reales y solicitá autorización antes de cualquier despliegue de producción, operación financiera real o acción irreversible.

## 4. ARQUITECTURA MULTICHAIN

Una vez aprobado el plan, implementá una arquitectura multichain modular.

Creá o extendé un registro central de redes, activos y capacidades.

Cada activo debe incluir, como mínimo:

- Identificador único.
- Símbolo.
- Nombre.
- Red y chainId.
- Dirección de contrato cuando corresponda.
- Decimales.
- Tipo de activo: moneda nativa o token ERC-20.
- Explorador de bloques.
- Logo, si existe.
- Disponibilidad para envío, recepción, swap, QR y otros usos.
- Disponibilidad verificada por red y tipo de operación.

No dupliques direcciones y metadatos en cada componente. Usá una fuente centralizada.

La arquitectura debe permitir incorporar nuevas redes y tokens sin reescribir toda la aplicación.

Creá adaptadores separados para Stellar/Soroban y EVM/Celo. Cada adaptador debe encargarse de sus wallets, lectura de balances, envío de transacciones, consultas y confirmación de operaciones.

Para Celo, utilizá las bibliotecas EVM que mejor encajen con el proyecto existente. Evaluá viem, wagmi y las integraciones actuales antes de instalar nuevas dependencias.

Configurá Celo Mainnet con chainId 42220. Usá fuentes oficiales para validar la configuración de red, RPC y explorador.

Incorporá CELO como moneda nativa para balances, transferencias y tarifas de gas. Si el código utiliza la interfaz ERC-20 de CELO, verificá cómo expone el token la red antes de definir su configuración.

No guardes claves privadas en código, bases de datos accesibles al cliente ni variables públicas. No reutilices una dirección de una red como si identificara una cuenta diferente en otra red.

## 5. CATÁLOGO DE STABLECOINS LATINOAMERICANAS

Incorporá las seis stablecoins wFiat de Ripio.

Todas utilizan 18 decimales según la documentación del bridge.

Configuración solicitada:

- wARS — peso argentino:
  0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d

- wBRL — real brasileño:
  0xd76f5faf6888e24d9f04bf92a0c8b921fe4390e0

- wMXN — peso mexicano:
  0x337e7456b420bd3481e7fa61fa9850343d610d34

- wCOP — peso colombiano:
  0x8a1d45e102e886510e891d2ec656a708991e2d76

- wPEN — sol peruano:
  0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE

- wCLP — peso chileno:
  0x61D450a098b6a7f69fC4b98CE68198fe59768651

Fuentes de referencia:

https://bridge.ripio.com/developers

https://www.coingecko.com/en/coins/argentine-peso

https://www.coingecko.com/en/coins/brazilian-real

https://www.coingecko.com/en/coins/mexican-peso

https://www.coingecko.com/en/coins/colombian-peso

https://www.coingecko.com/en/coins/peruvian-sol

https://www.coingecko.com/en/coins/chilean-peso

Verificá los contratos contra la documentación oficial y el explorador de Celo antes de habilitarlos.

No confundas la existencia de un contrato con la disponibilidad de liquidez o la posibilidad de utilizarlo en cualquier ruta.

### Interfaz requerida

Agregá un selector desplegable de stablecoins latinoamericanas en la sección de monedas y reutilizá el mismo catálogo en todas las secciones de la aplicación.

El usuario deberá poder identificar fácilmente el símbolo, el nombre, el país, la red y, cuando corresponda, el saldo disponible.

Agregá los activos a los selectores de Swap, transferencias, pagos QR, cobros, marketplace, subastas, servicios, colectas y Objetivos, siempre que la operación seleccionada sea compatible.

Los activos no compatibles con una operación deben aparecer deshabilitados o no aparecer en ese selector, con un motivo claro. No permitas seleccionar un token de una red para enviar una transacción en otra.

## 6. USDC, CELO Y VALIDACIÓN DE ACTIVOS

Incorporá USDC en Celo y en el selector multichain.

No inventes una dirección de contrato ni asumas que todo token cuyo símbolo sea USDC es el activo oficial.

Verificá la dirección y la identidad del activo utilizando documentación oficial de Celo, Circle y un explorador de bloques confiable. Diferenciá USDC nativo de versiones puenteadas cuando corresponda.

Incorporá la información correcta de decimales, balances y compatibilidad.

Conservá los activos y el soporte de USDC que ya existan en las redes actuales.

## 7. TODOS LOS SWAPS DEL SITIO

Localizá todas las interfaces de Swap y todas las funciones de intercambio de activos.

Hacé que compartan los selectores y la configuración central de tokens, sin duplicar reglas en cada pantalla.

Implementá el soporte EVM de Celo respetando el sistema de swaps que realmente exista en el proyecto.

Antes de permitir un swap:

1. Comprobá la red seleccionada.
2. Identificá el contrato de cada activo.
3. Consultá si existe una ruta de intercambio real.
4. Obtené una estimación del importe de salida, comisiones y slippage cuando la infraestructura lo permita.
5. Verificá las aprobaciones de tokens y los límites correspondientes.
6. Mostrá la información de la transacción antes de firmar.
7. Confirmá el resultado utilizando el hash de transacción y la red correcta.

No inventes precios, cotizaciones, pools ni rutas de intercambio.

No asumas que agregar los seis tokens implica que existen todos los pares de swap posibles.

Si falta liquidez o no hay una ruta válida, explicá la limitación y deshabilitá la operación.

## 8. INTEGRACIÓN CON RIPIO BRIDGE

Evaluá e implementá la integración del bridge de Ripio para mover los activos entre redes compatibles.

Documentación:

https://bridge.ripio.com/developers

Verificá en la documentación oficial la dirección del contrato, su ABI, las rutas disponibles, las tarifas, los límites de capacidad y el estado de las transferencias.

La dirección documentada de BridgeDeposit es:

0x465e642387d3d73a57CDc1368fFA53A800bA5D47

Utilizala únicamente después de verificar que corresponde al contrato de bridge requerido para la red y la operación.

La interfaz debe permitir seleccionar la red de origen, el activo, la red de destino y el destinatario.

Antes de ejecutar, mostrale al usuario los importes, tarifas y condiciones disponibles.

Mantené un registro del estado de la transferencia, el hash de origen y la confirmación del destino.

No muestres una transferencia como completada antes de verificarla.

No interpretes Swap y Bridge como si fueran la misma operación.

## 9. PAGOS Y COBROS MEDIANTE QR

Extendé los componentes de QR existentes para soportar Celo y los activos admitidos.

El usuario deberá poder:

- Generar un QR para cobrar.
- Escanear un QR para pagar.
- Elegir CELO, USDC o una stablecoin latinoamericana compatible.
- Definir un importe cuando corresponda.
- Consultar y confirmar el destinatario, la moneda y la red.
- Revisar el estado de la transacción.
- Acceder a su comprobante y al hash de blockchain.

El formato del QR debe incluir los datos necesarios para identificar la operación, como un identificador de versión, chainId, destinatario, activo o contrato, importe y referencia opcional.

Para solicitudes de pago dinámicas, incorporá identificadores únicos y controles contra la reutilización de solicitudes cuando sean necesarios.

Validá que el QR pertenezca a una red y a un token admitidos antes de mostrar la operación para firma.

Nunca ejecutes un pago solamente porque se escaneó un QR. La wallet del usuario debe autorizar la transacción y la aplicación debe mostrar claramente los detalles antes de firmar.

Conservá la funcionalidad QR de Stellar y diferenciá los formatos de ambas redes.

## 10. NUEVO BOTÓN Y SELECTOR DE CELO

Agregá Celo al selector de redes existente.

El nuevo botón debe seguir el lenguaje visual y el comportamiento de los demás botones de redes del proyecto.

Al seleccionar Celo, la aplicación debe:

- Conectar o cambiar a una wallet EVM compatible.
- Comprobar chainId.
- Mostrar el balance de CELO.
- Mostrar los balances de los tokens admitidos.
- Permitir consultar el historial de transacciones.
- Calcular y mostrar las tarifas de gas cuando estén disponibles.
- Permitir enviar, recibir y operar con los activos habilitados.

No desconectes ni reemplaces automáticamente la wallet de Stellar sin una transición controlada.

Si el usuario todavía no dispone de una wallet compatible, explicá cómo conectar o crear una mediante los mecanismos existentes del proyecto.

## 11. MARKETPLACE, SUBASTAS, SERVICIOS Y COLECTAS

Extendé las siguientes secciones:

- Marketplace.
- Subastas y ofertas.
- Red de servicios.
- Colectas y crowdfunding.
- Objetivos de equipos y misiones.
- Contrataciones y pagos por hitos.

Cada publicación debe poder especificar la red y el activo de liquidación admitidos.

Permití seleccionar CELO, USDC y wARS, wBRL, wMXN, wCOP, wPEN y wCLP cuando el activo correspondiente sea compatible con esa operación.

Cada publicación deberá mantener sus datos de negocio, como descripción, importe, creador, plazos, condiciones y estado.

Diferenciá claramente:

1. Crear y publicar una oferta en la base de datos.
2. Reservar o bloquear fondos.
3. Ejecutar un pago.
4. Liberar fondos al completar un servicio.
5. Reembolsar o resolver una disputa.

No afirmes que una publicación está registrada on-chain cuando sólo está guardada en Supabase.

### Escrows multichain

Analizá los escrows existentes y comprobá qué redes soportan realmente.

No reutilices directamente contratos Soroban como si fueran contratos EVM.

Diseñá una interfaz común de escrow y adaptadores independientes para Stellar y Celo.

Para Celo, evaluá un contrato Solidity específico o una integración compatible con contratos existentes que hayan sido debidamente verificados.

No despliegues nuevos contratos en Mainnet sin revisión y autorización expresa.

## 12. OBJETIVOS: ENVÍO DE DIVISAS Y TRANSFERENCIAS

Incorporá dentro de Objetivos una sección de envío de divisas.

Debe permitir al usuario:

- Elegir el activo de origen.
- Seleccionar la red.
- Indicar un destinatario.
- Introducir un importe.
- Consultar la cotización si la operación requiere una conversión.
- Revisar comisiones y recibir una estimación del importe final.
- Confirmar la operación.
- Consultar su estado.

Diferenciá una transferencia del mismo token entre usuarios de una conversión a otro activo.

Si la operación cambia de moneda, utilizá una cotización procedente de una fuente real y verificable.

No presentes una cotización estimada como un importe de liquidación garantizado.

## 13. OBJETIVOS: TRANSFERENCIAS BANCARIAS A ARGENTINA

Diseñá una integración para que los usuarios puedan acceder al flujo de conversión y retiro en pesos argentinos mediante las rampas y servicios disponibles de Ripio.

Documentación:

https://ramp.ripio.com

https://docs.ripio.com

Evaluá primero la integración por URL con los parámetros admitidos para el país, la red, el token, el importe y la wallet de destino.

Como referencia para evaluar el flujo de Argentina:

https://ramp.ripio.com/?country=AR&chain=42220&token=WARS&amount=10000

No asumas que todos los activos de Latinoamérica se pueden retirar directamente a cualquier banco argentino.

Verificá qué combinaciones de país, red y token acepta el proveedor, y qué pasos de KYC o validación bancaria exige.

Cuando sea posible, presentá una acción clara para continuar en Ripio y regresar a ReWork después de la operación.

No afirmes que un retiro bancario se ha completado si sólo se ha abierto una URL externa.

Si la integración directa por API requiere una cuenta empresarial, KYB, credenciales o aprobación de Ripio, documentá los requisitos y prepará un adaptador configurable. No inventes credenciales ni simules una liquidación real.

Separá la interfaz, el proveedor de cotizaciones y la integración de off-ramp para que puedan ampliarse en el futuro.

## 14. OBJETIVOS: TRANSFERENCIAS P2P POR EMAIL O WALLET

Implementá transferencias entre usuarios de ReWork.

El destinatario podrá identificarse mediante:

- Su dirección de wallet.
- Su email verificado y asociado a una wallet de destino en la red seleccionada.

El sistema debe comprobar que el usuario y la wallet de destino están correctamente vinculados.

Antes de confirmar, mostrar:

- Destinatario.
- Red.
- Token.
- Importe.
- Comisiones estimadas.
- Dirección de destino.
- Información relevante para evitar errores.

El envío mediante email debe resolver el destinatario a una dirección válida; el email por sí mismo no es una dirección blockchain.

No reveles información privada de los usuarios. Implementá las restricciones necesarias en Supabase y no permitas que un usuario modifique la dirección de destino de otro.

Si el destinatario no tiene wallet en la red de destino, informá que debe completar el proceso de configuración antes de realizar una transferencia on-chain.

## 15. OBJETIVOS: DESCUBRIMIENTO DE RENDIMIENTOS EN CELO

Incorporá una sección para consultar oportunidades de rendimiento DeFi en Celo.

Fuente de referencia:

https://defillama.com/chain/celo

https://docs.llama.fi

La interfaz debe mostrar, según los datos disponibles:

- Protocolo.
- Nombre del pool.
- Tokens del pool.
- APY actual.
- TVL.
- Composición de la rentabilidad cuando exista información.
- Comisiones, riesgos y advertencias relevantes.
- Fecha y hora de actualización de la información.

Priorizá fuentes oficiales o APIs documentadas. Si se utiliza DeFiLlama, respetá sus datos, formatos y condiciones de acceso.

No asumas que el APY de una consulta histórica continúa vigente.

### Separar consulta y ejecución

La primera fase permitirá descubrir y comparar pools reales.

La posibilidad de depositar fondos debe implementarse únicamente para protocolos y contratos efectivamente disponibles, después de validar la compatibilidad de los activos, la liquidez y los métodos de depósito y retiro.

No inventes un botón de invertir que no ejecuta ninguna operación real.

No garantices rendimientos ni prometas capital protegido.

Antes de depositar, la aplicación debe presentar el protocolo, la estrategia, la exposición a pérdida, las comisiones y la información disponible sobre los riesgos.

El acceso a fondos reales requiere confirmación explícita del usuario y una revisión de seguridad.

## 16. NUEVA FUNCIONALIDAD DIFERENCIAL: DEPÓSITO INTELIGENTE PARA ALQUILERES

Desarrollá una nueva funcionalidad dentro de Objetivos denominada:

**Depósito Inteligente de Alquiler**

Objetivo: permitir que un propietario y un inquilino registren un acuerdo de alquiler y mantengan un depósito en un escrow inteligente durante el período acordado, inicialmente dos años.

La funcionalidad debe ser un módulo independiente, integrado con el sistema de usuarios, wallets, identidad y notificaciones de ReWork.

### 16.1. Creación del acuerdo

El inquilino y el propietario deben ser usuarios registrados de ReWork.

El acuerdo debe registrar, como mínimo:

- Identificación de ambas partes.
- Importe y activo del depósito.
- Red en la que se bloquean los fondos.
- Identificador del contrato de alquiler.
- Fecha de inicio y vencimiento.
- Reglas de liberación.
- Reglas de distribución de rendimientos.
- Condiciones de mantenimiento, reclamos y resolución de disputas.

Ambas partes deben revisar y aprobar las condiciones antes de financiar el escrow.

### 16.2. Bloqueo del depósito

Implementá un escrow de Celo mediante un contrato EVM diseñado para este propósito, o adaptá un protocolo compatible que haya sido revisado.

El contrato debe mantener un estado inequívoco de la operación y permitir consultar el saldo bloqueado.

No utilices un depósito centralizado en una cuenta de la aplicación presentado como si fuera un escrow descentralizado.

No uses las claves privadas de ReWork para autorizar pagos de los usuarios.

### 16.3. Distribución 50/50 de los rendimientos

La regla solicitada es que los rendimientos netos atribuibles al depósito se distribuyan:

- 50 % para el inquilino.
- 50 % para el propietario.

Esta distribución se refiere a los rendimientos, no al capital inicial del depósito, salvo que el acuerdo aprobado establezca expresamente otra cosa.

Definí de forma verificable el rendimiento neto después de las comisiones aplicables y documentá cómo se contabilizan las ganancias, pérdidas y retiros.

No inventes una estrategia de inversión ni prometas una tasa determinada.

Si el capital se coloca en un protocolo DeFi, verificá que exista un mecanismo compatible para contabilizar los activos depositados y los rendimientos. Diferenciá las ganancias realizadas de los valores estimados.

La disponibilidad del capital debe estar condicionada a la estrategia seleccionada, los períodos de desbloqueo y las condiciones del contrato.

### 16.4. Finalización al cabo de dos años

Al alcanzar la fecha de vencimiento, el sistema debe permitir iniciar la solicitud de cierre.

El propietario tendrá una opción para generar un QR de liberación asociado al contrato específico.

El inquilino podrá escanearlo desde su cuenta de ReWork.

El QR debe identificar la solicitud o el acuerdo, pero no debe funcionar como una clave secreta suficiente para controlar los fondos.

El proceso requiere que ambas partes autoricen la operación con sus propias wallets o mecanismos de firma válidos.

La liberación debe respetar las reglas pactadas para el capital y los rendimientos.

Registrá el resultado y la referencia de la transacción para que ambas partes puedan verificarla.

### 16.5. Resolución de disputas mediante un agente de IA

Si existe un conflicto entre propietario e inquilino, debe iniciarse un proceso de disputa.

El sistema debe poder recibir evidencias pertinentes, por ejemplo:

- Recibos de pago.
- Inventarios.
- Fotografías.
- Documentos del acuerdo.
- Constancias de entrega del inmueble.
- Comunicaciones relacionadas con el reclamo.

No guardes documentos privados sin los controles de acceso, protección y retención adecuados.

Los archivos y documentos deben almacenarse fuera de la blockchain mediante un mecanismo seguro, con acceso restringido. Cuando corresponda, guardá en la blockchain hashes y referencias verificables, no el contenido privado de las evidencias.

Implementá un agente especializado que pueda:

1. Recopilar las evidencias autorizadas.
2. Ordenarlas cronológicamente.
3. Compararlas con las condiciones del contrato.
4. Identificar contradicciones y documentos faltantes.
5. Aplicar las reglas previamente pactadas.
6. Elaborar una recomendación estructurada de resolución.
7. Explicar qué evidencias y reglas sustentan su recomendación.

El agente debe comportarse como un evaluador de disputas, no como un chatbot genérico.

No le permitas inventar evidencias, alterar documentos ni afirmar que comprobó hechos que no pudo verificar.

### 16.6. Autorización de la resolución y protección de fondos

La decisión del agente debe convertirse en una instrucción de resolución estructurada, con importes, destinatarios, fundamento y referencia al expediente.

No permitas que una salida de texto libre de un modelo de IA ejecute directamente una transferencia.

Diseñá un mecanismo verificable para autorizar la resolución y ejecutar el pago conforme a las reglas del escrow.

El contrato debe validar el estado de la disputa, los importes y las autorizaciones correspondientes.

Incluí mecanismos para impugnar una recomendación, gestionar errores y recurrir a una instancia humana de revisión o al procedimiento de arbitraje que las partes hayan aceptado.

No afirmes que la decisión de un agente de IA es jurídicamente vinculante por el solo hecho de estar registrada en blockchain.

Documentá qué puede resolver automáticamente el sistema, qué requiere autorización adicional y cómo se preservan las evidencias.

### 16.7. Máquina de estados

Diseñá una máquina de estados explícita, con transiciones verificables. Como mínimo:

- Creado.
- Pendiente de aprobación.
- Pendiente de depósito.
- Activo.
- Vencimiento alcanzado.
- Pendiente de liberación.
- En disputa.
- Pendiente de resolución.
- Liberado.
- Reembolsado o cerrado.

Definí qué actores pueden ejecutar cada transición y qué sucede cuando falta una firma, se inicia una disputa o vence un plazo.

El mecanismo de resolución de disputas debe impedir que se liberen fondos de forma unilateral fuera de las reglas acordadas.

### 16.8. Pruebas y seguridad

Antes de operar con fondos reales:

- Implementá pruebas unitarias e integración.
- Probá los casos de liberación por acuerdo mutuo.
- Probá las disputas y las autorizaciones inválidas.
- Probá la expiración del contrato y los errores de transferencia.
- Probá reentradas, autorizaciones, doble liberación y otros riesgos relevantes de Solidity.
- Revisá la lógica de distribución del capital y los rendimientos.
- Usá una red de pruebas y activos de prueba.

No despliegues el escrow de alquileres en Celo Mainnet ni aceptes depósitos reales hasta que el contrato haya pasado por las revisiones de seguridad necesarias y exista autorización expresa.

## 17. INTERFAZ Y EXPERIENCIA DE USUARIO

Conservá la identidad visual existente de ReWork.

No rediseñes todas las páginas si los componentes actuales pueden reutilizarse.

Creá componentes compartidos para:

- Selector de red.
- Selector de activos.
- Balances.
- Envíos y recepciones.
- Confirmación de transacciones.
- QR.
- Cotizaciones y comisiones.
- Estados de operaciones.
- Publicaciones y pagos.
- Consulta de rendimientos.
- Depósito inteligente de alquiler.

Los errores deben explicarse en lenguaje claro, sin mostrar mensajes internos ni datos sensibles.

Mostrá los estados de carga, confirmación, rechazo, error y espera de terceros.

No muestres datos de prueba como si fueran saldos o transacciones reales.

Priorizá que la experiencia sea consistente en escritorio y móvil.

## 18. BASE DE DATOS Y SEGURIDAD

Inspeccioná el esquema actual de Supabase antes de introducir nuevas tablas o columnas.

Extendé los modelos existentes cuando sea apropiado y evitá crear registros duplicados de usuarios, wallets y activos.

Para las nuevas entidades, definí las relaciones necesarias para representar redes, activos, operaciones, publicaciones, depósitos y disputas.

Si se necesitan migraciones, hacelas incrementales, documentadas y compatibles con los datos existentes.

Mantené las políticas RLS y los controles de autorización del servidor. El cliente no debe poder modificar importes, destinatarios o estados sensibles sin validar los permisos.

Separá los datos que se guardan en Supabase de los estados que deben comprobarse en blockchain.

No incluyas secretos, claves privadas, tokens de API ni credenciales en los archivos versionados o en el código público.

## 19. VARIABLES DE ENTORNO E INTEGRACIONES EXTERNAS

Inspeccioná .env.example y actualizalo únicamente con las variables necesarias para las nuevas integraciones.

Utilizá nombres claros y documentados para las configuraciones de Celo, RPC, servicios de datos y proveedores externos.

Las claves privadas y las credenciales sensibles deben permanecer del lado del servidor o en mecanismos de gestión de secretos adecuados.

No inventes credenciales de Ripio ni supongas que una cuenta empresarial está habilitada.

Si falta una credencial, implementá una configuración deshabilitada de forma segura, una explicación visible para desarrolladores y los pasos necesarios para habilitar la integración.

No reemplaces una integración pendiente con una simulación que parezca operar con dinero real.

## 20. ESTRATEGIA DE IMPLEMENTACIÓN

Después de mi aprobación, ejecutá el trabajo en incrementos verificables.

### Fase 1 — Base multichain

- Registro centralizado de redes y activos.
- Integración de Celo.
- CELO nativo.
- wARS, wBRL, wMXN, wCOP, wPEN y wCLP.
- Validación de USDC.
- Conexión de wallets y lectura de balances.

### Fase 2 — Operaciones

- Envíos de tokens.
- Recepciones.
- Pagos y cobros mediante QR.
- Transferencias P2P por wallet o email.
- Selector compartido de monedas.
- Swaps cuando exista una ruta real.

### Fase 3 — Aplicación comercial

- Marketplace.
- Subastas.
- Servicios.
- Colectas.
- Pagos y escrows multichain compatibles.
- Integración del bridge cuando las rutas estén disponibles.

### Fase 4 — Rampas y Objetivos

- Enlaces de on-ramp y off-ramp de Ripio.
- Flujos de conversión y transferencias a bancos argentinos cuando el proveedor lo permita.
- Consulta de pools de Celo.
- Rendimientos y operaciones DeFi únicamente cuando estén verificadas.

### Fase 5 — Depósito Inteligente de Alquiler

- Modelo de datos y acuerdos.
- Contrato de escrow EVM.
- Bloqueo y vencimiento.
- Registro de rendimientos.
- Distribución 50/50.
- QR de liberación con doble autorización.
- Agente de análisis de evidencias.
- Proceso de disputa.
- Pruebas de seguridad y escenarios de error.

No intentes programar todas las funcionalidades simultáneamente en un único bloque sin pruebas intermedias. Cada fase debe apoyarse en los componentes que hayan quedado verificados en la anterior.

## 21. PRUEBAS OBLIGATORIAS

Revisá los scripts y comandos ya existentes antes de decidir cómo ejecutar las comprobaciones.

Como mínimo, verificá:

- Que el proyecto compile.
- Que TypeScript no presente errores.
- Que las reglas de lint y las pruebas existentes pasen.
- Que Stellar continúe funcionando.
- Que Celo se conecte a la red correcta.
- Que los activos tengan direcciones y decimales consistentes.
- Que no se puedan intercambiar tokens entre redes incompatibles.
- Que los QR identifiquen correctamente la operación.
- Que los pagos requieran autorización válida.
- Que los estados de las transacciones reflejen la realidad de la blockchain.
- Que los permisos de Supabase no permitan accesos indebidos.
- Que las integraciones externas fallen de forma segura cuando falten credenciales.
- Que el escrow no permita doble liberación ni distribución incorrecta.
- Que las pruebas de disputas y de recuperación de fondos cubran los escenarios relevantes.

Si alguna prueba falla, investigá el origen y documentá la corrección. No ocultes errores para obtener un resultado aparentemente exitoso.

No despliegues en producción, no hagas push ni commits y no ejecutes operaciones con fondos reales sin autorización expresa.

## 22. ENTREGABLES FINALES

Al completar la implementación, entregá:

1. Resumen de las funcionalidades implementadas.
2. Listado de archivos creados y modificados.
3. Descripción de la arquitectura multichain.
4. Inventario de activos habilitados y sus contratos verificados.
5. Integraciones reales, integraciones pendientes y requisitos de acceso.
6. Contratos inteligentes implementados y resultados de sus pruebas.
7. Variables de entorno necesarias, sin revelar secretos.
8. Resultados de build, lint, TypeScript y pruebas.
9. Instrucciones para ejecutar ReWork localmente.
10. Instrucciones para probar las funcionalidades sobre una red de pruebas.
11. Riesgos conocidos y tareas pendientes antes de producción.
12. Un checklist de las diez funcionalidades solicitadas, indicando cuáles están completas, parciales o bloqueadas y por qué.

## 23. CRITERIO DE ÉXITO

El objetivo no es simplemente mostrar botones nuevos en ReWork.

El objetivo es conseguir una aplicación funcional y verificable en la que las operaciones de Stellar sigan funcionando y Celo se incorpore como una red adicional para pagos, stablecoins, transferencias, marketplace y nuevos productos financieros.

Priorizá la seguridad, la compatibilidad con la arquitectura actual y la trazabilidad de todas las operaciones.

No afirmes que algo está implementado si sólo existe la interfaz.

No inventes contratos, balances, precios, rutas de swap, rendimientos, integraciones bancarias ni resultados de transacciones.

Comenzá ahora por la Fase 0: auditoría y planificación. No modifiques archivos hasta que apruebe el plan.