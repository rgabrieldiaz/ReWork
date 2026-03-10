"use client";

import { useState, useEffect, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useFreighter } from "@/hooks/useFreighter";
import { useSettings } from "@/hooks/useSettings";
import { X, Check, Upload, Loader2, Moon, Sun, Monitor, Copy, CheckCircle2, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { address } = useFreighter();
    const { profile, updateProfile, loading } = useProfile();
    const { language, setLanguage, theme, setTheme, t } = useSettings();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [addressCopied, setAddressCopied] = useState(false);
    const [wsName, setWsName] = useState("");
    const [wsDesc, setWsDesc] = useState("");
    const [wsId, setWsId] = useState<string | null>(null);
    const [savingWs, setSavingWs] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = profile?.role?.toLowerCase() === 'admin';

    const handleCopyAddress = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
    };

    const handleSaveWorkspace = async () => {
        if (!wsId || !isAdmin) return;
        setSavingWs(true);
        await supabase.from('workspaces').update({ name: wsName.trim(), description: wsDesc.trim() }).eq('id', wsId);
        setSavingWs(false);
    };

    // Sync state when profile loads
    useEffect(() => {
        if (profile) {
            setFirstName(profile.first_name || "");
            setLastName(profile.last_name || "");
            setBirthDate(profile.birth_date || "");
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile]);

    // Load workspace for admin users
    useEffect(() => {
        if (!address || !isAdmin) return;
        supabase.from('workspaces').select('id, name, description').eq('owner_wallet', address).eq('is_public', false).maybeSingle().then(({ data }) => {
            if (data) { setWsId(data.id); setWsName(data.name || ''); setWsDesc(data.description || ''); }
        });
    }, [address, isAdmin]);

    if (!isOpen) return null;

    const handleAutoSave = async (field: string, value: string | null) => {
        await updateProfile({
            first_name: field === 'first_name' ? value : firstName,
            last_name: field === 'last_name' ? value : lastName,
            birth_date: field === 'birth_date' ? value : birthDate,
            avatar_url: field === 'avatar_url' ? value : avatarUrl
        });
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !address) return;

        try {
            setIsUploading(true);

            // Create a unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${address}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            await handleAutoSave('avatar_url', publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(t.profile.uploadError);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-card/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md p-6 relative shadow-2xl border border-border-subtle rounded-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8 text-center mt-2">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        disabled={isUploading}
                    />
                    <div className="flex flex-col items-center justify-center mb-6">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-24 h-24 rounded-full bg-muted/10 flex items-center justify-center border-2 border-accent-teal shadow-[0_0_15px_rgba(0,242,255,0.3)] mb-3 relative group overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-navy focus:ring-accent-teal transition-all disabled:opacity-50"
                            title="Cambiar foto de perfil"
                        >
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-accent-teal animate-spin" />
                            ) : avatarUrl ? (
                                <>
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                    <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="w-6 h-6 text-foreground" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="font-bold text-accent-teal text-xl group-hover:opacity-0 transition-opacity">
                                        {firstName ? firstName.charAt(0).toUpperCase() : "U"}
                                    </span>
                                    <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="w-6 h-6 text-foreground" />
                                    </div>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-xs font-semibold text-accent-teal hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            <Upload className="w-3 h-3" /> {t.profile.photoChange}
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mt-2">{t.profile.editProfile}</h2>
                    {address && (
                        <button
                            onClick={handleCopyAddress}
                            className="flex items-center gap-1.5 mt-1 text-xs font-mono text-muted hover:text-foreground transition-colors group"
                            title="Copiar dirección completa"
                        >
                            {addressCopied
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                : <Copy className="w-3.5 h-3.5 group-hover:text-accent-teal transition-colors" />
                            }
                            <span className={addressCopied ? 'text-emerald-400' : ''}>
                                {addressCopied ? 'Copiado!' : `${address.slice(0, 8)}...${address.slice(-6)}`}
                            </span>
                        </button>
                    )}
                    <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase border ${
                        profile?.role?.toLowerCase() === 'admin'
                            ? 'text-accent-teal bg-accent-teal/10 border-accent-teal/30'
                            : 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'
                    }`}>
                        {profile?.role || t.profile.role}
                    </span>
                </div>

                <div className="space-y-4">
                    {/* First + Last name on the same row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">{t.profile.firstName}</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                onBlur={(e) => handleAutoSave('first_name', e.target.value)}
                                className="w-full bg-muted/10 border border-border-subtle rounded-xl px-3 py-3 text-foreground focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all"
                                placeholder={t.profile.firstNamePlaceholder}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">{t.profile.lastName}</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                onBlur={(e) => handleAutoSave('last_name', e.target.value)}
                                className="w-full bg-muted/10 border border-border-subtle rounded-xl px-3 py-3 text-foreground focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all"
                                placeholder={t.profile.lastNamePlaceholder}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">{t.profile.birthDate}</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            onBlur={(e) => handleAutoSave('birth_date', e.target.value)}
                            className="w-full bg-muted/10 border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>

                    {/* Workspace Settings — solo admin */}
                    {isAdmin && wsId && (
                        <div className="pt-5 border-t border-border-subtle mt-5">
                            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-accent-teal" />
                                Workspace
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Nombre</label>
                                    <input
                                        type="text"
                                        value={wsName}
                                        onChange={e => setWsName(e.target.value)}
                                        className="w-full bg-muted/10 border border-border-subtle rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-accent-teal transition-all"
                                        placeholder="Nombre del workspace"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Descripción</label>
                                    <textarea
                                        value={wsDesc}
                                        onChange={e => setWsDesc(e.target.value)}
                                        rows={3}
                                        className="w-full bg-muted/10 border border-border-subtle rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-accent-teal transition-all resize-none"
                                        placeholder="Descripción del workspace"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveWorkspace}
                                    disabled={savingWs}
                                    className="flex items-center gap-2 px-4 py-2 bg-accent-teal text-black font-bold text-sm rounded-xl hover:bg-accent-teal/90 transition-colors disabled:opacity-50"
                                >
                                    {savingWs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    {savingWs ? 'Guardando...' : 'Guardar Workspace'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Interface Settings */}
                    <div className="pt-6 border-t border-border-subtle mt-6">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-accent-teal" />
                            {t.profile.interfaceSettings}
                        </h3>

                        {/* Language Selector */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">{t.profile.language}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    onClick={() => setLanguage('es')}
                                    className={`relative cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-colors ${language === 'es' ? 'bg-accent-teal/10 border-accent-teal' : 'bg-muted/10 border-border-subtle hover:border-foreground/30'}`}
                                >
                                    <span className="text-2xl" role="img" aria-label="Español">🇪🇸</span>
                                    <span className={`font-medium ${language === 'es' ? 'text-accent-teal' : 'text-muted'}`}>Español</span>
                                    {language === 'es' && <Check className="w-4 h-4 text-accent-teal absolute right-3" />}
                                </div>
                                <div
                                    onClick={() => setLanguage('en')}
                                    className={`relative cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-colors ${language === 'en' ? 'bg-accent-teal/10 border-accent-teal' : 'bg-muted/10 border-border-subtle hover:border-foreground/30'}`}
                                >
                                    <span className="text-2xl" role="img" aria-label="English">🇬🇧</span>
                                    <span className={`font-medium ${language === 'en' ? 'text-accent-teal' : 'text-muted'}`}>English</span>
                                    {language === 'en' && <Check className="w-4 h-4 text-accent-teal absolute right-3" />}
                                </div>
                            </div>
                        </div>

                        {/* Theme Selector */}
                        <div>
                            <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">{t.profile.theme}</label>
                            <div className="flex bg-muted/10 border border-border-subtle rounded-xl p-1">
                                {[
                                    { id: 'light', icon: Sun, label: t.profile.themeLight },
                                    { id: 'dark', icon: Moon, label: t.profile.themeDark },
                                    { id: 'system', icon: Monitor, label: t.profile.themeSystem }
                                ].map((tOption) => {
                                    const Icon = tOption.icon;
                                    const isActive = theme === tOption.id;
                                    return (
                                        <button
                                            key={tOption.id}
                                            type="button"
                                            onClick={() => setTheme(tOption.id as any)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${isActive ? 'bg-foreground/10 text-foreground shadow-sm' : 'text-muted hover:text-muted'}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tOption.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
