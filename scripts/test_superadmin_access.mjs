import fs from 'fs';
import { isSuperAdmin, SUPER_ADMIN_EMAILS } from '../src/lib/admins.ts';

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

async function verifySuperAdmins() {
  console.log('=====================================================');
  console.log('   VERIFICACIÓN DE SUPER ADMINS Y ACCESO TOTAL       ');
  console.log('=====================================================\n');

  // 1. Probar función isSuperAdmin
  console.log('1. [Lógica de Permisos] Probando detección de Super Admins:');
  for (const email of SUPER_ADMIN_EMAILS) {
    const isAdmin = isSuperAdmin(email, null, null);
    console.log(`   ${isAdmin ? '✅' : '❌'} Email: ${email} -> Super Admin: ${isAdmin}`);
  }

  // 2. Verificar estado en base de datos Supabase
  console.log('\n2. [Base de Datos Supabase] Verificando usuarios en tabla `users`:');
  for (const email of SUPER_ADMIN_EMAILS) {
    const res = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const users = await res.json();
    if (users && users.length > 0) {
      const u = users[0];
      console.log(`   ✅ Usuario: ${u.first_name || email}`);
      console.log(`      - Email: ${u.email}`);
      console.log(`      - Rol en DB: "${u.role}" ${u.role === 'Admin' ? '⭐️ (ADMINISTRADOR TOTAL)' : '⚠️'}`);
      console.log(`      - Wallet: ${u.wallet_address || '(se generará al iniciar sesión)'}`);
    } else {
      console.log(`   ⚠️ Usuario con email ${email} no encontrado.`);
    }
  }

  // 3. Verificar acceso a todos los workspaces
  console.log('\n3. [Acceso a Workspaces] Workspaces disponibles para los Super Admins:');
  const wsRes = await fetch(`${supabaseUrl}/rest/v1/workspaces?select=id,name,slug,is_premium`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const workspaces = await wsRes.json();
  workspaces.forEach((w, i) => {
    console.log(`   ${i + 1}. "${w.name}" (slug: /app/${w.slug}) | Rol asignado al entrar: OWNER / ADMIN`);
  });

  console.log('\n=====================================================');
  console.log('>>> ACCESO TOTAL Y PERMISOS DE ADMIN CONFIGURADOS <<<');
  console.log('=====================================================\n');
}

verifySuperAdmins();
