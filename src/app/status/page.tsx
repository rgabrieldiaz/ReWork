"use client";

import React, { useState, useEffect } from "react";
import { Server, Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";
import { useSettings } from "@/hooks/useSettings";
import { translations } from "@/lib/translations";

type ServiceStatus = "loading" | "operational" | "down";

export default function StatusPage() {
  const { language } = useSettings();
  const t = translations[language].statusPage;

  const [horizonStatus, setHorizonStatus] = useState<ServiceStatus>("loading");
  const [horizonPing, setHorizonPing] = useState<string>(language === 'es' ? "Conectando..." : "Connecting...");
  
  const [coreStatus, setCoreStatus] = useState<ServiceStatus>("loading");
  const [trustlessStatus, setTrustlessStatus] = useState<ServiceStatus>("loading");

  useEffect(() => {
    // Check Stellar Horizon Network
    const checkHorizon = async () => {
      try {
        const start = Date.now();
        const res = await fetch("https://horizon.stellar.org", { method: "HEAD" });
        const latency = Date.now() - start;
        if (res.ok) {
          setHorizonStatus("operational");
          setHorizonPing(`${latency}ms ${language === 'es' ? 'latencia' : 'latency'}`);
        } else {
          setHorizonStatus("down");
        }
      } catch (error) {
        setHorizonStatus("down");
        setHorizonPing(language === 'es' ? "Fallo de conexión" : "Connection failed");
      }
    };

    // Mock pinging ReWork isolated DB and edge functions
    const checkCore = () => {
      setTimeout(() => setCoreStatus("operational"), 850);
    };

    // Mock pinging Trustless Work Soroban Contracts validation
    const checkTrustless = () => {
      setTimeout(() => setTrustlessStatus("operational"), 1400);
    };

    checkHorizon();
    checkCore();
    checkTrustless();
    
    // Poll Horizon every 10 seconds to keep it "alive"
    const interval = setInterval(() => {
      checkHorizon();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [language]);

  const getStatusColor = (status: ServiceStatus) => {
    if (status === "loading") return "text-yellow-400";
    if (status === "operational") return "text-green-400";
    return "text-red-500";
  };

  const getStatusBgColor = (status: ServiceStatus) => {
    if (status === "loading") return "bg-yellow-500";
    if (status === "operational") return "bg-green-500";
    return "bg-red-500";
  };

  const getStatusText = (status: ServiceStatus) => {
    if (status === "loading") return t.loading;
    if (status === "operational") return t.operational;
    return t.down;
  };

  const StatusIndicator = ({ status }: { status: ServiceStatus }) => (
    <div className={`flex items-center gap-2 font-bold ${getStatusColor(status)}`}>
      {status === "loading" ? (
         <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
         <span className={`w-3 h-3 rounded-full ${getStatusBgColor(status)} ${status === "operational" ? "animate-pulse" : ""}`}></span>
      )}
      {getStatusText(status)}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      <PublicBackground />
      
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)] animate-pulse-slow">
             <Activity className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.title}</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <Server className="w-6 h-6 text-foreground" />
                <div>
                   <h3 className="font-bold text-lg">{t.coreTitle}</h3>
                   <p className="text-sm text-muted">{t.coreDesc}</p>
                </div>
             </div>
             <StatusIndicator status={coreStatus} />
          </div>

           <div className="glass-card p-6 rounded-2xl border border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-foreground" stroke="currentColor" strokeWidth="2">
                   <circle cx="12" cy="12" r="10"></circle>
                   <path d="M12 2v20M2 12h20" strokeDasharray="4 4"></path>
                </svg>
                <div>
                   <h3 className="font-bold text-lg">{t.stellarTitle}</h3>
                   <p className="text-sm text-muted">{t.stellarDesc} {horizonPing}</p>
                </div>
             </div>
             <StatusIndicator status={horizonStatus} />
          </div>

           <div className="glass-card p-6 rounded-2xl border border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-foreground" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <div>
                   <h3 className="font-bold text-lg">{t.trustlessTitle}</h3>
                   <p className="text-sm text-muted">{t.trustlessDesc}</p>
                </div>
             </div>
             <StatusIndicator status={trustlessStatus} />
          </div>
        </div>
        
        <div className="mt-12 text-center text-sm text-muted">
           <p>{t.footer1}</p>
           <p className="mt-2">{t.footer2}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
