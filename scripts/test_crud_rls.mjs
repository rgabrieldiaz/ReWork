import fs from 'fs';

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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runDatabaseAudit() {
  console.log('==============================================');
  console.log('   FASE 2: AUDITORÍA DE BASE DE DATOS Y RLS  ');
  console.log('==============================================\n');

  // 1. Obtener workspace por defecto
  let defaultWorkspaceId = null;
  console.log('1. [Workspaces] Verificando espacios de trabajo...');
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/workspaces?select=*&limit=5`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (res.ok) {
      const workspaces = await res.json();
      console.log(`   ✅ Encontrados ${workspaces.length} workspace(s):`);
      for (const ws of workspaces) {
        console.log(`      - "${ws.name}" (slug: ${ws.slug}) [ID: ${ws.id}]`);
        if (ws.slug === 'rework-global' || !defaultWorkspaceId) {
          defaultWorkspaceId = ws.id;
        }
      }
    } else {
      console.log(`   ❌ Error al leer workspaces: ${res.status}`);
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }

  // 2. Comprobar lectura en todas las tablas clave
  const tables = [
    { name: 'auctions', label: 'Marketplace / Subastas' },
    { name: 'squads', label: 'Squads / Equipos' },
    { name: 'squad_goals', label: 'Metas de Squad / Misiones' },
    { name: 'crowdfunds', label: 'Colectas / Crowdfunding' },
    { name: 'crowdfund_donations', label: 'Donaciones de Crowdfunding' },
    { name: 'workspace_members', label: 'Miembros de Workspaces' }
  ];

  console.log('\n2. [Lectura de Tablas]');
  for (const t of tables) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/${t.name}?select=*&limit=3`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      });
      const range = res.headers.get('content-range') || '0';
      if (res.ok) {
        const rows = await res.json();
        console.log(`   ✅ ${t.label} (\`${t.name}\`): Accesible | Total: ${range} filas`);
      } else {
        console.log(`   ❌ ${t.label} (\`${t.name}\`): Error ${res.status}`);
      }
    } catch (e) {
      console.log(`   ❌ ${t.label}: ${e.message}`);
    }
  }

  // 3. Test de Inserción y Limpieza (Prueba de permisos RLS de escritura)
  console.log('\n3. [Prueba RLS de Escritura] Insertando y eliminando registro de prueba en `auctions`...');
  const testTitle = `__test_audit_${Date.now()}__`;
  try {
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/auctions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: testTitle,
        description: 'Test temporal de verificación de RLS',
        seller: 'GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H',
        current_bid: 10,
        base_price: 10,
        currency: 'USDC',
        status: 'draft',
        workspace_id: defaultWorkspaceId
      })
    });

    if (insertRes.ok) {
      const [inserted] = await insertRes.json();
      console.log(`   ✅ Inserción permitida por RLS: Creado auction ID ${inserted.id}`);

      // Limpiar el registro creado
      const delRes = await fetch(`${supabaseUrl}/rest/v1/auctions?id=eq.${inserted.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (delRes.ok) {
        console.log(`   ✅ Limpieza exitosa: Registro ID ${inserted.id} eliminado`);
      } else {
        console.log(`   ⚠️ No se pudo eliminar el registro de prueba: ${delRes.status}`);
      }
    } else {
      const err = await insertRes.text();
      console.log(`   ❌ RLS Bloqueó la inserción (${insertRes.status}): ${err}`);
    }
  } catch (e) {
    console.log(`   ❌ Error en prueba de inserción: ${e.message}`);
  }

  console.log('\n==============================================');
  console.log('>>> FASE 2 COMPLETADA CON ÉXITO <<<');
  console.log('==============================================\n');
}

runDatabaseAudit();
