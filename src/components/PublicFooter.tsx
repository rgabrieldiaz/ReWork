"use client";

import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";

export function PublicFooter() {
  const { t } = useSettings();

  return (
    <footer className="border-t border-border-subtle py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h4 className="font-bold mb-4">{t.publicFooter.product}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/features" className="hover:text-accent-teal transition-colors">{t.publicFooter.features}</Link></li>
            <li><Link href="/security" className="hover:text-accent-teal transition-colors">{t.publicFooter.security}</Link></li>
            <li><Link href="/pricing" className="hover:text-accent-teal transition-colors">{t.publicFooter.plans}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">{t.publicFooter.developers}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/docs" className="hover:text-accent-teal transition-colors">{t.publicFooter.apiDocs}</Link></li>
            <li><Link href="/docs" className="hover:text-accent-teal transition-colors">{t.publicFooter.stellarDocs}</Link></li>
            <li><Link href="/docs" className="hover:text-accent-teal transition-colors">{t.publicFooter.trustlessRepo}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">{t.publicFooter.company}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/about" className="hover:text-accent-teal transition-colors">{t.publicFooter.about}</Link></li>
            <li><Link href="/blog" className="hover:text-accent-teal transition-colors">{t.publicFooter.blog}</Link></li>
            <li><Link href="/careers" className="hover:text-accent-teal transition-colors">{t.publicFooter.careers}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">{t.publicFooter.legal}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/terms" className="hover:text-accent-teal transition-colors">{t.publicFooter.terms}</Link></li>
            <li><Link href="/privacy" className="hover:text-accent-teal transition-colors">{t.publicFooter.privacy}</Link></li>
            <li><Link href="/status" className="hover:text-accent-teal transition-colors">{t.publicFooter.status}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border-subtle text-sm text-muted">
        <p>{t.publicFooter.rights}</p>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {t.publicFooter.operational}
        </div>
      </div>
    </footer>
  );
}
