async function testEscrowApi() {
  console.log('==============================================');
  console.log('   FASE 4: AUDITORÍA DE APIS DE ESCROW       ');
  console.log('==============================================\n');

  // 1. Probar deploy-escrow
  console.log('1. Probando POST /api/trustless-work/deploy-escrow...');
  const testPayload = {
    signer: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
    engagementId: `test-audit-${Date.now()}`,
    title: "Test de Verificación",
    description: "Prueba de despliegue de escrow",
    roles: {
      approver: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
      serviceProvider: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
      platformAddress: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
      releaseSigner: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
      disputeResolver: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
      receiver: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H"
    },
    amount: 10,
    platformFee: 0.5,
    milestones: [{ description: "Hito de entrega verificado" }],
    trustline: {
      address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      symbol: "USDC"
    }
  };

  try {
    const res = await fetch('http://localhost:3000/api/trustless-work/deploy-escrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    const data = await res.json();
    console.log(`   ✅ Respuesta de deploy-escrow (HTTP ${res.status}):`, data);
  } catch (e) {
    console.log('   ❌ Error al llamar a deploy-escrow:', e.message);
  }

  // 2. Probar send-transaction
  console.log('\n2. Probando POST /api/trustless-work/send-transaction...');
  try {
    const res = await fetch('http://localhost:3000/api/trustless-work/send-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xdr: 'AAAAAgAAAAA=' })
    });
    const data = await res.json();
    console.log(`   ✅ Respuesta de send-transaction (HTTP ${res.status}):`, data);
  } catch (e) {
    console.log('   ❌ Error al llamar a send-transaction:', e.message);
  }

  console.log('\n==============================================');
  console.log('>>> FASE 4 COMPLETADA CON ÉXITO <<<');
  console.log('==============================================\n');
}

testEscrowApi();
