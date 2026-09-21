import fs from 'fs';
import * as StellarSdk from '@stellar/stellar-sdk';

// Load .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
  }
}

async function runHealthCheck() {
  console.log('==============================================');
  console.log('   FASE 1: HEALTH CHECK DE SERVICIOS BASE    ');
  console.log('==============================================\n');

  let allPassed = true;

  // 1. Supabase REST API
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.log('1. [Supabase] Probando API REST...');
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/auctions?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (res.ok) {
      console.log('   ✅ Supabase REST API: OK (HTTP 200)');
    } else {
      console.log(`   ❌ Supabase REST API: Error HTTP ${res.status}`);
      allPassed = false;
    }
  } catch (e) {
    console.log(`   ❌ Supabase REST API: Error de red (${e.message})`);
    allPassed = false;
  }

  // 2. Privy Configuration
  const privyAppId = envVars.NEXT_PUBLIC_PRIVY_APP_ID;
  console.log('\n2. [Privy] Verificando App ID...');
  if (privyAppId && privyAppId.length > 5) {
    console.log(`   ✅ Privy App ID configurado: ${privyAppId.slice(0, 6)}...${privyAppId.slice(-4)}`);
  } else {
    console.log('   ❌ Privy App ID: No configurado o vacío');
    allPassed = false;
  }

  // 3. Stellar Horizon Testnet
  console.log('\n3. [Stellar Horizon Testnet] Verificando nodo...');
  try {
    const horizon = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    const info = await horizon.root();
    console.log(`   ✅ Horizon Testnet: Online (Protocolo ${info.current_protocol_version})`);
  } catch (e) {
    console.log(`   ❌ Horizon Testnet: Falló (${e.message})`);
    allPassed = false;
  }

  // 4. Stellar Soroban RPC Testnet
  console.log('\n4. [Stellar Soroban RPC Testnet] Verificando RPC...');
  try {
    const rpc = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org');
    const health = await rpc.getHealth();
    console.log(`   ✅ Soroban RPC: Estado "${health.status}" | Ledger: ${health.latestLedger}`);
  } catch (e) {
    console.log(`   ❌ Soroban RPC: Falló (${e.message})`);
    allPassed = false;
  }

  // 5. Stellar Friendbot Faucet
  console.log('\n5. [Stellar Friendbot] Probando fondeo de cuenta nueva...');
  try {
    const randomKey = StellarSdk.Keypair.random().publicKey();
    const res = await fetch(`https://friendbot.stellar.org?addr=${randomKey}`);
    if (res.ok) {
      console.log(`   ✅ Friendbot Faucet: Fondeo exitoso (10,000 XLM acreditados a ${randomKey.slice(0, 8)}...)`);
    } else {
      console.log(`   ❌ Friendbot Faucet: Error HTTP ${res.status}`);
      allPassed = false;
    }
  } catch (e) {
    console.log(`   ❌ Friendbot Faucet: Error (${e.message})`);
    allPassed = false;
  }

  // 6. Trustless Work API Status
  const twApiKey = envVars.NEXT_PUBLIC_TW_API_KEY;
  console.log('\n6. [Trustless Work] Verificando configuración de Escrow...');
  if (twApiKey && twApiKey.trim().length > 0) {
    console.log(`   ℹ️ Trustless Work API Key presente: ${twApiKey.slice(0, 6)}...`);
  } else {
    console.log('   ⚠️ NEXT_PUBLIC_TW_API_KEY no definida en .env.local (se activará fallback de desarrollo)');
  }

  console.log('\n==============================================');
  console.log(allPassed ? '>>> FASE 1 COMPLETADA CON ÉXITO <<<' : '>>> FASE 1 CON OBSERVACIONES <<<');
  console.log('==============================================\n');
}

runHealthCheck();
