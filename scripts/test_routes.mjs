const routes = [
  { path: '/', label: 'Landing Page' },
  { path: '/app', label: 'Dashboard Principal' },
  { path: '/app/marketplace', label: 'Marketplace P2P' },
  { path: '/app/squad-goals', label: 'Squad Goals / Misiones' },
  { path: '/app/crowdfunding', label: 'Crowdfunding / Colectas' },
  { path: '/app/admin', label: 'Panel de Administración' },
  { path: '/workspaces', label: 'Directorio de Workspaces' },
  { path: '/join/rework', label: 'Invitación a Workspace' },
  { path: '/about', label: 'Acerca de' },
  { path: '/features', label: 'Características' },
  { path: '/pricing', label: 'Precios / Planes' },
  { path: '/docs', label: 'Documentación' },
  { path: '/status', label: 'Estado del Sistema' }
];

async function runRouteAudit() {
  console.log('==============================================');
  console.log('   FASE 3: AUDITORÍA DE RUTAS Y FRONTEND UX  ');
  console.log('==============================================\n');

  let failedRoutes = 0;

  for (const r of routes) {
    const start = Date.now();
    try {
      const res = await fetch(`http://localhost:3000${r.path}`);
      const duration = Date.now() - start;
      if (res.ok) {
        console.log(`   ✅ [${res.status}] ${r.label.padEnd(28)} -> ${r.path} (${duration}ms)`);
      } else {
        console.log(`   ❌ [${res.status}] ${r.label.padEnd(28)} -> ${r.path} (${duration}ms)`);
        failedRoutes++;
      }
    } catch (e) {
      console.log(`   ❌ [ERR] ${r.label.padEnd(28)} -> ${r.path}: ${e.message}`);
      failedRoutes++;
    }
  }

  console.log('\n==============================================');
  if (failedRoutes === 0) {
    console.log('>>> FASE 3 COMPLETADA CON ÉXITO (Todas las rutas responden HTTP 200) <<<');
  } else {
    console.log(`>>> FASE 3 CON ADVERTENCIAS (${failedRoutes} rutas fallidas) <<<`);
  }
  console.log('==============================================\n');
}

runRouteAudit();
