import fs from 'fs';

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

const targetEmails = [
  'gabrieldiaz81@gmail.com',
  'mail.de.celular.2017@gmail.com'
];

async function setupSuperAdminsInDB() {
  console.log('--- CONFIGURANDO SUPER ADMINS EN SUPABASE ---');

  // 1. Obtener todos los workspaces
  const wsRes = await fetch(`${supabaseUrl}/rest/v1/workspaces?select=id,name,slug`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const workspaces = await wsRes.json();
  console.log(`Encontrados ${workspaces.length} workspaces:`, workspaces.map(w => w.name));

  // 2. Actualizar role = 'Admin' para ambos correos y obtener sus IDs
  const userIds = new Set();

  for (const email of targetEmails) {
    const userRes = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const users = await userRes.json();

    if (users && users.length > 0) {
      for (const u of users) {
        userIds.add(u.id);
        // Update to Admin
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${u.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: 'Admin', updated_at: new Date().toISOString() })
        });
        console.log(`✅ Usuario ${email} (ID: ${u.id}) actualizado con role: 'Admin' (HTTP ${updateRes.status})`);
      }
    } else {
      console.log(`⚠️ No se encontró usuario con email ${email} en la tabla users aún`);
    }
  }

  // También incluir el ID histórico de Gabriel si existe
  const gaboAdminRes = await fetch(`${supabaseUrl}/rest/v1/users?role=eq.Admin`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const adminUsers = await gaboAdminRes.json();
  for (const a of adminUsers) {
    userIds.add(a.id);
  }

  console.log('\n3. Asociando Super Admins a todos los workspaces...');
  for (const userId of userIds) {
    for (const ws of workspaces) {
      // Verificar si ya existe membresía
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/workspace_members?user_id=eq.${userId}&workspace_id=eq.${ws.id}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      const existing = await checkRes.json();

      if (existing && existing.length > 0) {
        // Actualizar a admin
        await fetch(`${supabaseUrl}/rest/v1/workspace_members?id=eq.${existing[0].id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: 'admin' })
        });
        console.log(`   ✓ Actualizado rol a 'admin' para user ${userId.slice(0, 8)}... en "${ws.name}"`);
      } else {
        // Insertar membresía admin
        const insRes = await fetch(`${supabaseUrl}/rest/v1/workspace_members`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            workspace_id: ws.id,
            role: 'admin'
          })
        });
        console.log(`   ✓ Agregado como 'admin' user ${userId.slice(0, 8)}... en "${ws.name}" (HTTP ${insRes.status})`);
      }
    }
  }

  console.log('\n✅ ¡Configuración en Base de Datos completada con éxito!');
}

setupSuperAdminsInDB();
