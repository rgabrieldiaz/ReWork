"use client";

import React, { useState } from "react";
import { Search, Book, Code, ShieldCheck, ArrowRight, FileText } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";
import { useSettings } from "@/hooks/useSettings";

export default function DocsPage() {
  const { t } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would filter docs or redirect to a search page
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden flex flex-col">
      <PublicBackground />
      <PublicHeader />

      <main className="flex-1 w-full pt-12 pb-24">
        {/* Search Hero Section */}
        <div className="w-full bg-gradient-to-b from-black/20 to-transparent border-b border-border-subtle py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.docsPage.heroTitle}</h1>
            <p className="text-lg text-muted mb-10 max-w-2xl mx-auto">
              {t.docsPage.heroSubtitle}
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
              <input 
                type="text" 
                placeholder={t.docsPage.searchPlaceholder}
                className="w-full bg-card/60 backdrop-blur-md border border-border-subtle text-foreground rounded-full py-4 pl-12 pr-6 focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/50 transition-all text-lg shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16">
          {/* External Ecosystem Links */}
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Book className="w-6 h-6 text-accent-teal" /> 
            {t.docsPage.resourcesTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <a href="https://developers.stellar.org/" target="_blank" rel="noopener noreferrer" className="glass-card p-6 rounded-2xl border border-border-subtle hover:border-accent-teal/50 transition-all group cursor-pointer block">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-accent-teal" />
              </div>
              <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                {t.docsPage.stellarDocs} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {t.docsPage.stellarDesc}
              </p>
            </a>

            <a href="https://trustlesswork.com/" target="_blank" rel="noopener noreferrer" className="glass-card p-6 rounded-2xl border border-border-subtle hover:border-accent-teal/50 transition-all group cursor-pointer block">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-accent-teal" />
              </div>
              <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                {t.docsPage.twDocs} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {t.docsPage.twDesc}
              </p>
            </a>

            <div className="glass-card p-6 rounded-2xl border border-border-subtle hover:border-accent-teal/50 transition-all group cursor-pointer">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-accent-teal" />
              </div>
              <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                {t.docsPage.apiDocs} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {t.docsPage.apiDesc}
              </p>
            </div>
          </div>

          {/* Internal Help Links */}
          <h2 className="text-2xl font-bold mb-8 border-t border-border-subtle pt-16">
            {t.docsPage.helpTitle}
          </h2>
          
          <div className="grid gap-6">
            {/* Article Stub 1 */}
            <div className="p-6 md:p-8 rounded-2xl border border-border-subtle bg-card/40 hover:bg-card/60 transition-colors cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between group">
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent-teal transition-colors">{t.docsPage.article1Title}</h3>
                <p className="text-muted leading-relaxed max-w-3xl">
                  {t.docsPage.article1Desc}
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted group-hover:text-accent-teal transition-colors shrink-0" />
            </div>

            {/* Article Stub 2 */}
            <div className="p-6 md:p-8 rounded-2xl border border-border-subtle bg-card/40 hover:bg-card/60 transition-colors cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between group">
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent-teal transition-colors">{t.docsPage.article2Title}</h3>
                <p className="text-muted leading-relaxed max-w-3xl">
                  {t.docsPage.article2Desc}
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted group-hover:text-accent-teal transition-colors shrink-0" />
            </div>

            {/* Article Stub 3 */}
            <div className="p-6 md:p-8 rounded-2xl border border-border-subtle bg-card/40 hover:bg-card/60 transition-colors cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between group">
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent-teal transition-colors">{t.docsPage.article3Title}</h3>
                <p className="text-muted leading-relaxed max-w-3xl">
                  {t.docsPage.article3Desc}
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted group-hover:text-accent-teal transition-colors shrink-0" />
            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
