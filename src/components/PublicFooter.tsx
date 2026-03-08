import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border-subtle py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h4 className="font-bold mb-4">Producto</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/caracteristicas" className="hover:text-accent-teal transition-colors">Características</Link></li>
            <li><Link href="/seguridad" className="hover:text-accent-teal transition-colors">Seguridad</Link></li>
            <li><Link href="/planes" className="hover:text-accent-teal transition-colors">Planes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Desarrolladores</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="#" className="hover:text-accent-teal transition-colors">Documentación API</a></li>
            <li><a href="#" className="hover:text-accent-teal transition-colors">Stellar/Soroban Docs</a></li>
            <li><a href="#" className="hover:text-accent-teal transition-colors">Trustless Work Repo</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Compañía</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/sobre-nosotros" className="hover:text-accent-teal transition-colors">Sobre Nosotros</Link></li>
            <li><a href="#" className="hover:text-accent-teal transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-accent-teal transition-colors">Carreras</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="#" className="hover:text-accent-teal transition-colors">Términos de Uso</a></li>
            <li><a href="#" className="hover:text-accent-teal transition-colors">Privacidad</a></li>
            <li><a href="#" className="hover:text-accent-teal transition-colors">Status</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border-subtle text-sm text-muted">
        <p>© 2026 ReWork Decentralized Infrastructure. All rights reserved.</p>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Stellar Network: Operacional
        </div>
      </div>
    </footer>
  );
}
