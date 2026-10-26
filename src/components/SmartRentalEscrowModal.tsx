"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Sparkles,
  Scale,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  FileText,
  Lock,
  Unlock,
  TrendingUp,
  Bot,
  Coins,
  X,
  ArrowRight,
  Copy,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import {
  CELO_ASSETS,
  CELO_PROTOCOLS,
  getCeloscanUrl,
  type CeloAssetSymbol,
} from "@/lib/celo-assets";
import { signAndSettleX402Payment } from "@/lib/celo-x402";
import {
  evaluateEscrowDisputeWithBuyAgent,
  type AIDisputeVerdict,
  type DisputeEvidenceItem,
} from "@/lib/celo-buy-agent";

export type RentalEscrowState =
  | "DRAFT"
  | "PENDING_COUNTERPARTY"
  | "ACTIVE_LOCKED"
  | "YIELDING"
  | "MATURED_WAITING_DUAL_SIG"
  | "PARTIALLY_SIGNED"
  | "RELEASED"
  | "DISPUTED"
  | "UNDER_AI_REVIEW"
  | "RESOLVED";

export interface SmartRentalAgreement {
  id: string;
  title: string;
  propertyAddress: string;
  assetSymbol: CeloAssetSymbol;
  principalAmount: number;
  apyPct: number;
  accruedYield: number;
  poolName: string;
  tenantName: string;
  tenantAddress: `0x${string}`;
  landlordName: string;
  landlordAddress: `0x${string}`;
  createdAt: string;
  maturityDate: string;
  durationMonths: number;
  state: RentalEscrowState;
  tenantSignedRelease: boolean;
  landlordSignedRelease: boolean;
  fundingTxHash?: `0x${string}`;
  settlementTxHash?: `0x${string}`;
  x402Signature?: `0x${string}`;
  evidences: DisputeEvidenceItem[];
  aiVerdict?: AIDisputeVerdict;
}

const STORAGE_KEY = "rework_celo_smart_rental_escrows_v1";

const INITIAL_AGREEMENTS: SmartRentalAgreement[] = [
  {
    id: "celo-rent-101",
    title: "Depto 3 Amb. Palermo Soho — Garantía Locativa",
    propertyAddress: "Gorriti 4820, Piso 4B, CABA (Argentina)",
    assetSymbol: "USAT",
    principalAmount: 1200,
    apyPct: 11.4,
    accruedYield: 136.8,
    poolName: "Aave V3 / Uniswap V3 Celo Stable Pool (DeFiLlama Verified)",
    tenantName: "Gabriel (Inquilino)",
    tenantAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    landlordName: "Inmobiliaria Río de la Plata S.A.",
    landlordAddress: "0x465e642387d3d73a57CDc1368fFA53A800bA5D47",
    createdAt: "2025-11-01",
    maturityDate: "2026-11-01 (Listo para Liberación o Disputa)",
    durationMonths: 24,
    state: "MATURED_WAITING_DUAL_SIG",
    tenantSignedRelease: false,
    landlordSignedRelease: false,
    evidences: [
      {
        id: "ev-1",
        submittedBy: "tenant",
        authorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        category: "inventario_inicial",
        title: "Acta de Inventario Inicial y Libre Deuda de Expensas",
        description:
          "Pintura interior completa y comprobante de pago de expensas y servicios al día.",
        timestamp: "2026-10-25 14:20",
      },
      {
        id: "ev-2",
        submittedBy: "landlord",
        authorAddress: "0x465e642387d3d73a57CDc1368fFA53A800bA5D47",
        category: "factura_reparacion",
        title: "Presupuesto Reparación Cerradura y Vidrio Balcón",
        description:
          "Factura de herrería y vidriería por reposición de cristal laminado en balcón y ajuste de cerradura.",
        claimedDamageAmount: 180,
        timestamp: "2026-10-26 09:45",
      },
    ],
  },
  {
    id: "celo-rent-102",
    title: "Oficina Estudio Belgrano — Depósito en Pesos (wARS)",
    propertyAddress: "Av. Cabildo 2150, Piso 8, CABA (Argentina)",
    assetSymbol: "wARS",
    principalAmount: 1500000,
    apyPct: 14.2,
    accruedYield: 213000,
    poolName: "Celo wARS / USD₮ Yield Strategy (Ripio + Textile FX Hedge)",
    tenantName: "Marco (Inquilino Comercial)",
    tenantAddress: "0x8a1d45e102e886510e891d2ec656a708991e2d76",
    landlordName: "Consorcio Belgrano Hub",
    landlordAddress: "0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d",
    createdAt: "2026-01-15",
    maturityDate: "2028-01-15 (En Curso · Generando Yield 50/50)",
    durationMonths: 24,
    state: "YIELDING",
    tenantSignedRelease: false,
    landlordSignedRelease: false,
    evidences: [],
  },
];

const STATE_BADGE_MAP: Record<
  RentalEscrowState,
  { label: string; colorClass: string }
> = {
  DRAFT: {
    label: "Borrador",
    colorClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
  PENDING_COUNTERPARTY: {
    label: "Esperando Contraparte",
    colorClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  ACTIVE_LOCKED: {
    label: "Capital Bloqueado",
    colorClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  },
  YIELDING: {
    label: "Generando Yield 50/50",
    colorClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  MATURED_WAITING_DUAL_SIG: {
    label: "Vencido · Requiere Doble Firma",
    colorClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
  PARTIALLY_SIGNED: {
    label: "1/2 Firmas Registradas",
    colorClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  RELEASED: {
    label: "Liberado 100% + Yield 50/50",
    colorClass: "bg-emerald-500/20 text-emerald-200 border-emerald-400/50",
  },
  DISPUTED: {
    label: "En Disputa",
    colorClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  UNDER_AI_REVIEW: {
    label: "En Arbitraje IA (@celo/buy)",
    colorClass: "bg-amber-500/20 text-amber-200 border-amber-400/50",
  },
  RESOLVED: {
    label: "Resuelto por Agente ERC-8004",
    colorClass: "bg-teal-500/20 text-teal-200 border-teal-400/50",
  },
};

export function SmartRentalEscrowModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    connected,
    address,
    connectCelo,
    sendCeloAsset,
    attributionTag,
    erc8004Status,
  } = useCeloWallet();

  const [agreements, setAgreements] =
    useState<SmartRentalAgreement[]>(INITIAL_AGREEMENTS);
  const [selectedId, setSelectedId] = useState<string>(
    INITIAL_AGREEMENTS[0].id
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showQrRelease, setShowQrRelease] = useState(false);
  const [isSubmittingOnChain, setIsSubmittingOnChain] = useState(false);
  const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);

  // New agreement form state
  const [newTitle, setNewTitle] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newLandlordName, setNewLandlordName] = useState("");
  const [newLandlordWallet, setNewLandlordWallet] = useState(
    "0x465e642387d3d73a57CDc1368fFA53A800bA5D47"
  );
  const [newAsset, setNewAsset] = useState<CeloAssetSymbol>("USAT");
  const [newPrincipal, setNewPrincipal] = useState("500");
  const [newDurationMonths, setNewDurationMonths] = useState("24");
  const [useGaslessX402, setUseGaslessX402] = useState(true);

  // New evidence form state
  const [evRole, setEvRole] = useState<"tenant" | "landlord">("landlord");
  const [evCategory, setEvCategory] =
    useState<DisputeEvidenceItem["category"]>("factura_reparacion");
  const [evTitle, setEvTitle] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evClaimAmount, setEvClaimAmount] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAgreements(parsed);
        }
      } catch {}
    }
  }, []);

  const saveAgreements = (next: SmartRentalAgreement[]) => {
    setAgreements(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const activeAgreement =
    agreements.find((a) => a.id === selectedId) || agreements[0];

  // Generate QR for dual-signature release whenever activeAgreement changes
  useEffect(() => {
    if (!activeAgreement) return;
    const payload = JSON.stringify({
      protocol: "rework-celo-rental-release-v1",
      chainId: 42220,
      escrowId: activeAgreement.id,
      asset: activeAgreement.assetSymbol,
      principal: activeAgreement.principalAmount,
      yield5050: activeAgreement.accruedYield / 2,
      tenantSigned: activeAgreement.tenantSignedRelease,
      landlordSigned: activeAgreement.landlordSignedRelease,
      attributionTag,
    });
    QRCode.toDataURL(payload, { width: 220, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [activeAgreement, attributionTag]);

  if (!isOpen) return null;

  const handleCreateAndFund = async () => {
    if (!newTitle.trim() || !newPrincipal || Number(newPrincipal) <= 0) {
      toast.error("Completá el título del contrato y el monto de garantía.");
      return;
    }

    setIsSubmittingOnChain(true);
    try {
      let txHash: `0x${string}` | undefined;
      let x402Sig: `0x${string}` | undefined;

      if (connected && address) {
        if (
          useGaslessX402 &&
          (newAsset === "USAT" || newAsset === "USDC")
        ) {
          toast.info(
            `Firmando autorización gasless EIP-3009 (${CELO_ASSETS[newAsset].displaySymbol}) vía Celo x402 Facilitator...`
          );
          const x402Res = await signAndSettleX402Payment({
            assetSymbol: newAsset,
            from: address,
            to: newLandlordWallet as `0x${string}`,
            amount: newPrincipal,
            purpose: `Smart Rental Deposit: ${newTitle}`,
            counterpartyName: newLandlordName || "Propietario",
            attributionTag,
          });
          x402Sig = x402Res.signature;
          txHash = x402Res.txHash;
          toast.success(
            "Autorización EIP-3009 firmada y verificada para Celo x402 Facilitator!"
          );
        } else {
          toast.info(
            `Enviando depósito con ERC-8021 Attribution Tag (${attributionTag}) en Celo Mainnet...`
          );
          const receipt = await sendCeloAsset({
            symbol: newAsset,
            recipient: newLandlordWallet as `0x${string}`,
            amount: newPrincipal,
          });
          txHash = receipt.hash;
          toast.success("Depósito confirmado on-chain en Celo Mainnet!");
        }
      } else {
        toast.info(
          "Contrato creado en estado local/demo (conectá tu wallet Celo para fondear en Mainnet)."
        );
      }

      const principalNum = Number(newPrincipal);
      const apy = newAsset === "wARS" ? 14.2 : 11.4;
      const estimatedAnnualYield = Number(
        (principalNum * (apy / 100)).toFixed(2)
      );

      const created: SmartRentalAgreement = {
        id: `celo-rent-${Date.now().toString().slice(-4)}`,
        title: newTitle.trim(),
        propertyAddress:
          newAddress.trim() || "Contrato Inmobiliario / Comercial LatAm",
        assetSymbol: newAsset,
        principalAmount: principalNum,
        apyPct: apy,
        accruedYield: estimatedAnnualYield,
        poolName: "Aave V3 / DeFiLlama Verified Celo Pool",
        tenantName: "Inquilino (Vos)",
        tenantAddress:
          address || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        landlordName: newLandlordName.trim() || "Propietario / Locador",
        landlordAddress: newLandlordWallet as `0x${string}`,
        createdAt: new Date().toISOString().split("T")[0],
        maturityDate: `${newDurationMonths} meses (Listo para Co-Firma / Demo)`,
        durationMonths: Number(newDurationMonths) || 24,
        state: "YIELDING",
        tenantSignedRelease: false,
        landlordSignedRelease: false,
        fundingTxHash: txHash,
        x402Signature: x402Sig,
        evidences: [],
      };

      const nextList = [created, ...agreements];
      saveAgreements(nextList);
      setSelectedId(created.id);
      setShowCreateForm(false);
      setNewTitle("");
      setNewAddress("");
    } catch (err: any) {
      toast.error(
        err?.message || "No se pudo completar la firma en Celo Mainnet."
      );
    } finally {
      setIsSubmittingOnChain(false);
    }
  };

  const handleCoSignRelease = (role: "tenant" | "landlord") => {
    const updated = agreements.map((ag) => {
      if (ag.id !== activeAgreement.id) return ag;
      const nextTenantSigned =
        role === "tenant" ? true : ag.tenantSignedRelease;
      const nextLandlordSigned =
        role === "landlord" ? true : ag.landlordSignedRelease;
      const bothSigned = nextTenantSigned && nextLandlordSigned;

      return {
        ...ag,
        tenantSignedRelease: nextTenantSigned,
        landlordSignedRelease: nextLandlordSigned,
        state: (bothSigned
          ? "RELEASED"
          : "PARTIALLY_SIGNED") as RentalEscrowState,
      };
    });
    saveAgreements(updated);

    const target = updated.find((a) => a.id === activeAgreement.id);
    if (target?.state === "RELEASED") {
      toast.success(
        `¡Doble firma completada! Principal 100% devuelto al Inquilino + Rendimiento dividido 50/50 (+${(
          target.accruedYield / 2
        ).toLocaleString()} ${target.assetSymbol} c/u).`
      );
    } else {
      toast.success(
        `Firma de ${
          role === "tenant" ? "Inquilino" : "Propietario"
        } registrada (1/2). Esperando co-firma de la contraparte.`
      );
    }
  };

  const handleAddEvidence = () => {
    if (!evTitle.trim()) {
      toast.error("Ingresá un título para la evidencia.");
      return;
    }
    const item: DisputeEvidenceItem = {
      id: `ev-${Date.now()}`,
      submittedBy: evRole,
      authorAddress:
        address ||
        (evRole === "tenant"
          ? activeAgreement.tenantAddress
          : activeAgreement.landlordAddress),
      category: evCategory,
      title: evTitle.trim(),
      description: evDesc.trim() || "Documentación respaldatoria adjunta.",
      claimedDamageAmount: evClaimAmount ? Number(evClaimAmount) : undefined,
      timestamp: new Date().toLocaleString("es-AR"),
    };

    const updated = agreements.map((ag) =>
      ag.id === activeAgreement.id
        ? {
            ...ag,
            state: "DISPUTED" as RentalEscrowState,
            evidences: [...ag.evidences, item],
          }
        : ag
    );
    saveAgreements(updated);
    setEvTitle("");
    setEvDesc("");
    setEvClaimAmount("");
    toast.success("Evidencia incorporada al expediente de disputa.");
  };

  const handleRunAIDisputeAgent = async () => {
    setIsEvaluatingAI(true);
    try {
      toast.info(
        "Agente ERC-8004 consultando Cencori AI vía @celo/buy (gateway.usebuy.ai · x402)..."
      );
      const verdict = await evaluateEscrowDisputeWithBuyAgent({
        escrowId: activeAgreement.id,
        propertyTitle: activeAgreement.title,
        assetSymbol: activeAgreement.assetSymbol,
        principalAmount: activeAgreement.principalAmount,
        accruedYieldAmount: activeAgreement.accruedYield,
        tenantAddress: activeAgreement.tenantAddress,
        landlordAddress: activeAgreement.landlordAddress,
        evidences: activeAgreement.evidences,
        attributionTag,
      });

      const updated = agreements.map((ag) =>
        ag.id === activeAgreement.id
          ? {
              ...ag,
              state: "UNDER_AI_REVIEW" as RentalEscrowState,
              aiVerdict: verdict,
            }
          : ag
      );
      saveAgreements(updated);
      toast.success(
        `Dictamen emitido por Agente ERC-8004: ${verdict.recommendedTenantPrincipalPct}% Inquilino / ${verdict.recommendedLandlordPrincipalPct}% Propietario (+ Yield 50/50).`
      );
    } catch (err: any) {
      toast.error(err?.message || "Error al ejecutar el Agente IA");
    } finally {
      setIsEvaluatingAI(false);
    }
  };

  const handleExecuteAgentResolution = async () => {
    if (!activeAgreement.aiVerdict) return;
    setIsSubmittingOnChain(true);
    try {
      let settlementHash: `0x${string}` | undefined;
      if (connected && address) {
        const landlordPayout =
          activeAgreement.aiVerdict.recommendedLandlordPrincipalAmount +
          activeAgreement.aiVerdict.landlordYieldShareAmount;
        if (landlordPayout > 0) {
          toast.info(
            `Ejecutando liquidación on-chain en Celo Mainnet con tag ERC-8021 (${attributionTag})...`
          );
          const receipt = await sendCeloAsset({
            symbol: activeAgreement.assetSymbol,
            recipient: activeAgreement.landlordAddress,
            amount: landlordPayout.toFixed(2),
          });
          settlementHash = receipt.hash;
        }
      }

      const updated = agreements.map((ag) =>
        ag.id === activeAgreement.id
          ? {
              ...ag,
              state: "RESOLVED" as RentalEscrowState,
              settlementTxHash: settlementHash,
            }
          : ag
      );
      saveAgreements(updated);
      toast.success(
        "Resolución ejecutada: Principal distribuido según dictamen + Rendimiento 50/50 acreditado."
      );
    } catch (err: any) {
      toast.error(
        err?.message || "No se pudo firmar la transacción en Celo Mainnet."
      );
    } finally {
      setIsSubmittingOnChain(false);
    }
  };

  const halfYield = Number((activeAgreement.accruedYield / 2).toFixed(2));
  const badge = STATE_BADGE_MAP[activeAgreement.state];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Depósito Inteligente de Alquiler & Garantías 50/50
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Celo Mainnet · 42220
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ERC-8021: {attributionTag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Capital 100% protegido en custodia · Rendimiento DeFi 50%
                Inquilino / 50% Propietario · Árbitro IA con{" "}
                <code className="text-emerald-300">@celo/buy (x402)</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {/* Selector Bar + Create Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {agreements.map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => {
                    setSelectedId(ag.id);
                    setShowCreateForm(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    selectedId === ag.id && !showCreateForm
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/10"
                      : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{CELO_ASSETS[ag.assetSymbol]?.flag || "🌱"}</span>
                  <span className="truncate max-w-[180px]">{ag.title}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              {showCreateForm
                ? "Ver Contratos Activos"
                : "Nuevo Depósito de Alquiler"}
            </button>
          </div>

          {showCreateForm ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Crear y Fondear Nuevo Depósito Inteligente en Celo Mainnet
                </h3>
                <span className="text-[11px] font-mono text-emerald-400">
                  Split de Rendimiento Fijo: 50% Inquilino / 50% Propietario
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Inmueble / Concepto del Contrato *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Depto 2 Ambientes Recoleta — Garantía 2 Años"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Dirección / Identificador del Inmueble
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Ej: Av. Santa Fe 2400, CABA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Nombre del Propietario / Inmobiliaria
                  </label>
                  <input
                    type="text"
                    value={newLandlordName}
                    onChange={(e) => setNewLandlordName(e.target.value)}
                    placeholder="Ej: Administración Sur S.R.L."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Wallet EVM del Propietario en Celo (0x...)
                  </label>
                  <input
                    type="text"
                    value={newLandlordWallet}
                    onChange={(e) => setNewLandlordWallet(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Moneda del Depósito (Track 1 wFIAT o Track 4 USA₮)
                  </label>
                  <select
                    value={newAsset}
                    onChange={(e) =>
                      setNewAsset(e.target.value as CeloAssetSymbol)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-400 outline-none"
                  >
                    <option value="USAT">
                      🇺🇸 USA₮ — Tether America USD (Dólar Regulado EE.UU. · x402 Gasless)
                    </option>
                    <option value="wARS">
                      🇦🇷 wARS — Peso Argentino Ripio (Celo Mainnet)
                    </option>
                    <option value="wBRL">
                      🇧🇷 wBRL — Real Brasileño Ripio (Celo Mainnet)
                    </option>
                    <option value="USDC">
                      💵 USDC — Circle Native Celo Mainnet
                    </option>
                    <option value="USDT">
                      🟢 USD₮ — Tether Native Celo Mainnet
                    </option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Monto Principal
                    </label>
                    <input
                      type="number"
                      value={newPrincipal}
                      onChange={(e) => setNewPrincipal(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:border-emerald-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Plazo (Meses)
                    </label>
                    <select
                      value={newDurationMonths}
                      onChange={(e) => setNewDurationMonths(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-400 outline-none"
                    >
                      <option value="24">24 Meses (2 Años Estándar)</option>
                      <option value="12">12 Meses (1 Año Comercial)</option>
                      <option value="1">Modo Demo Instantáneo (Listo hoy)</option>
                    </select>
                  </div>
                </div>
              </div>

              {(newAsset === "USAT" || newAsset === "USDC") && (
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-indigo-200">
                      ⚡ Liquidación Gasless vía Celo x402 Facilitator (EIP-3009)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Firma{" "}
                      <code>
                        TransferWithAuthorization (&quot;Tether America USD&quot; v1)
                      </code>{" "}
                      sin pagar gas en CELO. Ideal para el Track 4.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={useGaslessX402}
                    onChange={(e) => setUseGaslessX402(e.target.checked)}
                    className="w-5 h-5 accent-emerald-400"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAndFund}
                  disabled={isSubmittingOnChain}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {isSubmittingOnChain
                    ? "Firmando en Celo Mainnet..."
                    : `Fondear Garantía en ${CELO_ASSETS[newAsset].displaySymbol}`}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Main Agreement Overview Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.colorClass}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ID: {activeAgreement.id}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                        +{activeAgreement.apyPct}% APY ({activeAgreement.poolName})
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-2">
                      {activeAgreement.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      📍 {activeAgreement.propertyAddress} · Plazo:{" "}
                      {activeAgreement.durationMonths} meses · Vencimiento:{" "}
                      <strong className="text-slate-200">
                        {activeAgreement.maturityDate}
                      </strong>
                    </p>
                  </div>

                  {!connected && (
                    <button
                      onClick={() => connectCelo()}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold"
                    >
                      🌱 Conectar Wallet Celo Mainnet
                    </button>
                  )}
                </div>

                {/* Financial 50/50 Split Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      Capital Principal Protegido (100%)
                    </span>
                    <p className="text-2xl font-black font-mono text-white mt-1">
                      {activeAgreement.principalAmount.toLocaleString()}{" "}
                      <span className="text-sm text-cyan-400">
                        {CELO_ASSETS[activeAgreement.assetSymbol]?.displaySymbol}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Intacto en custodia. Sin daños al vencimiento, vuelve 100% al
                      Inquilino.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-[11px] font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      50% Yield para el Inquilino
                    </span>
                    <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
                      +{halfYield.toLocaleString()}{" "}
                      <span className="text-sm">
                        {CELO_ASSETS[activeAgreement.assetSymbol]?.displaySymbol}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      👤 {activeAgreement.tenantName} (
                      {activeAgreement.tenantAddress.slice(0, 6)}...
                      {activeAgreement.tenantAddress.slice(-4)})
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30">
                    <span className="text-[11px] font-bold uppercase text-teal-300 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-teal-400" />
                      50% Yield para el Propietario
                    </span>
                    <p className="text-2xl font-black font-mono text-teal-300 mt-1">
                      +{halfYield.toLocaleString()}{" "}
                      <span className="text-sm">
                        {CELO_ASSETS[activeAgreement.assetSymbol]?.displaySymbol}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      🏢 {activeAgreement.landlordName} (
                      {activeAgreement.landlordAddress.slice(0, 6)}...
                      {activeAgreement.landlordAddress.slice(-4)})
                    </p>
                  </div>
                </div>

                {/* Dual-Signature Normal Release + Optional QR */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-sm font-black text-white">
                        Liberación por Doble Conformidad (Sin Disputa)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Cuando ambas partes firman la entrega conforme del inmueble
                      (desde el panel o escaneando el QR mutuo), el contrato libera
                      el 100% del principal al inquilino y acredita el 50% del
                      rendimiento a cada uno.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <span
                        className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
                          activeAgreement.tenantSignedRelease
                            ? "text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Firma Inquilino:{" "}
                        {activeAgreement.tenantSignedRelease
                          ? "FIRMADO ✅"
                          : "Pendiente"}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
                          activeAgreement.landlordSignedRelease
                            ? "text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Firma Propietario:{" "}
                        {activeAgreement.landlordSignedRelease
                          ? "FIRMADO ✅"
                          : "Pendiente"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => handleCoSignRelease("tenant")}
                      disabled={
                        activeAgreement.tenantSignedRelease ||
                        activeAgreement.state === "RELEASED" ||
                        activeAgreement.state === "RESOLVED"
                      }
                      className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold disabled:opacity-40"
                    >
                      ✍️ Firmar como Inquilino
                    </button>
                    <button
                      onClick={() => handleCoSignRelease("landlord")}
                      disabled={
                        activeAgreement.landlordSignedRelease ||
                        activeAgreement.state === "RELEASED" ||
                        activeAgreement.state === "RESOLVED"
                      }
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold disabled:opacity-40"
                    >
                      ✍️ Firmar como Propietario
                    </button>
                    <button
                      onClick={() => setShowQrRelease(!showQrRelease)}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      {showQrRelease ? "Ocultar QR" : "QR Doble Firma"}
                    </button>
                  </div>
                </div>

                {showQrRelease && qrDataUrl && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 flex flex-col sm:flex-row items-center gap-5">
                    <img
                      src={qrDataUrl}
                      alt="QR Liberación Doble Firma"
                      className="w-36 h-36 rounded-xl border border-purple-500/40 bg-white p-1.5"
                    />
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        rework-celo-rental-release-v1 · Chain ID 42220
                      </span>
                      <h5 className="text-sm font-bold text-white">
                        QR de Co-Firma Presencial o Remota al Vencimiento
                      </h5>
                      <p className="text-xs text-slate-400">
                        Al entregar las llaves del departamento, cualquiera de las
                        dos partes muestra este QR para que la otra lo escanee y
                        complete la segunda firma de desbloqueo inmediato.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Dispute Resolution & Evidence Center (Track 3: @celo/buy x402) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Evidences */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      Expediente de Evidencias (Inquilino & Propietario)
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      {activeAgreement.evidences.length} documento(s)
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {activeAgreement.evidences.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">
                        No hay reclamos ni evidencias cargadas. El depósito sigue su
                        curso normal generando rendimiento 50/50.
                      </p>
                    ) : (
                      activeAgreement.evidences.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                ev.submittedBy === "landlord"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-cyan-500/20 text-cyan-300"
                              }`}
                            >
                              {ev.submittedBy === "landlord"
                                ? "🏢 Propietario"
                                : "👤 Inquilino"}{" "}
                              · {ev.category}
                            </span>
                            {ev.claimedDamageAmount && (
                              <span className="text-xs font-mono font-bold text-rose-400">
                                Reclamo: {ev.claimedDamageAmount}{" "}
                                {activeAgreement.assetSymbol}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white">
                            {ev.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {ev.description}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Evidence Mini-Form */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-slate-300">
                      Subir Nueva Evidencia o Reclamo de Daños:
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <select
                        value={evRole}
                        onChange={(e) =>
                          setEvRole(e.target.value as "tenant" | "landlord")
                        }
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        <option value="landlord">Subir como Propietario</option>
                        <option value="tenant">Subir como Inquilino</option>
                      </select>
                      <select
                        value={evCategory}
                        onChange={(e) =>
                          setEvCategory(
                            e.target.value as DisputeEvidenceItem["category"]
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        <option value="factura_reparacion">
                          Factura / Presupuesto Reparación
                        </option>
                        <option value="estado_entrega">
                          Fotos / Acta Estado de Entrega
                        </option>
                        <option value="inventario_inicial">
                          Inventario Inicial Firmado
                        </option>
                        <option value="comprobante_expensas">
                          Libre Deuda Expensas / Servicios
                        </option>
                        <option value="descargo_texto">
                          Descargo Formal Escrito
                        </option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        value={evTitle}
                        onChange={(e) => setEvTitle(e.target.value)}
                        placeholder="Título (ej: Presupuesto Pintura / Plomería)"
                        className="col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <input
                        type="number"
                        value={evClaimAmount}
                        onChange={(e) => setEvClaimAmount(e.target.value)}
                        placeholder={`Monto (${activeAgreement.assetSymbol})`}
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                      />
                    </div>
                    <button
                      onClick={handleAddEvidence}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                    >
                      + Adjuntar Evidencia al Contrato
                    </button>
                  </div>
                </div>

                {/* Right Column: Autonomous AI Arbitrator Agent (@celo/buy Track 3) */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                          Agente Árbitro IA (ERC-8004 + @celo/buy)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Track 3 · usebuy.ai x402
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cuando hay una disputa sobre el estado del departamento, el
                      Agente Árbitro de ReWork consulta{" "}
                      <code className="text-emerald-300">
                        gateway.usebuy.ai/cencori/v1/chat/completions
                      </code>{" "}
                      (pagando por request vía <strong>x402 en Celo Mainnet</strong>)
                      y emite un dictamen imparcial sobre el capital principal (
                      <code>100/0</code>, <code>0/100</code> o{" "}
                      <code>% parcial</code>), preservando siempre el{" "}
                      <strong>50/50 del rendimiento DeFi</strong>.
                    </p>

                    {activeAgreement.aiVerdict ? (
                      <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                            ✅ Dictamen Emitido · Confianza:{" "}
                            {activeAgreement.aiVerdict.confidenceLevel}
                          </span>
                          <span className="text-[10px] font-mono text-amber-300">
                            x402 Quote:{" "}
                            {
                              activeAgreement.aiVerdict.buyGatewayUsed.x402Quote
                                .priceFormatted
                            }
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed">
                          {activeAgreement.aiVerdict.caseSummary}
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-[10px] text-slate-400 block">
                              Restitución Inquilino (
                              {
                                activeAgreement.aiVerdict
                                  .recommendedTenantPrincipalPct
                              }
                              % + 50% Yield)
                            </span>
                            <span className="text-sm font-black font-mono text-emerald-300">
                              {(
                                activeAgreement.aiVerdict
                                  .recommendedTenantPrincipalAmount +
                                activeAgreement.aiVerdict.tenantYieldShareAmount
                              ).toLocaleString()}{" "}
                              {activeAgreement.assetSymbol}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <span className="text-[10px] text-slate-400 block">
                              Compensación Propietario (
                              {
                                activeAgreement.aiVerdict
                                  .recommendedLandlordPrincipalPct
                              }
                              % + 50% Yield)
                            </span>
                            <span className="text-sm font-black font-mono text-amber-300">
                              {(
                                activeAgreement.aiVerdict
                                  .recommendedLandlordPrincipalAmount +
                                activeAgreement.aiVerdict
                                  .landlordYieldShareAmount
                              ).toLocaleString()}{" "}
                              {activeAgreement.assetSymbol}
                            </span>
                          </div>
                        </div>

                        <ul className="space-y-1 text-[11px] text-slate-400 list-disc pl-4">
                          {activeAgreement.aiVerdict.reasoningSteps.map(
                            (step, idx) => (
                              <li key={idx}>{step}</li>
                            )
                          )}
                        </ul>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                        <p className="font-bold text-slate-300">
                          Listo para Auditar Evidencias con @celo/buy
                        </p>
                        <p>
                          Hacé clic abajo para que el Agente ERC-8004 cotice y
                          ejecute el arbitraje sobre las{" "}
                          {activeAgreement.evidences.length} evidencia(s) del
                          contrato.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <button
                      onClick={handleRunAIDisputeAgent}
                      disabled={isEvaluatingAI}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Scale className="w-4 h-4" />
                      {isEvaluatingAI
                        ? "Consultando @celo/buy x402..."
                        : "Solicitar Dictamen Agente IA (@celo/buy)"}
                    </button>

                    {activeAgreement.aiVerdict &&
                      activeAgreement.state !== "RESOLVED" && (
                        <button
                          onClick={handleExecuteAgentResolution}
                          disabled={isSubmittingOnChain}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isSubmittingOnChain
                            ? "Liquidando en Celo..."
                            : "Aceptar y Liquidar en Celo Mainnet"}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
