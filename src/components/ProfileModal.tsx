"use client";

import { useState, useEffect, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useFreighter } from "@/hooks/useFreighter";
import { X, Check, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { address } = useFreighter();
    const { profile, updateProfile, loading } = useProfile();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when profile loads
    useEffect(() => {
        if (profile) {
            setFirstName(profile.first_name || "");
            setLastName(profile.last_name || "");
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile]);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const { error } = await updateProfile({
            first_name: firstName,
            last_name: lastName,
            avatar_url: avatarUrl
        });
        setIsSaving(false);

        if (!error) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 1500);
        }
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
        } catch (error) {
            console.error('Error uploading image:', error);
            alert("Hubo un error al subir la imagen.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md p-6 relative shadow-2xl border-white/10 animate-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
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
                            className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-accent-teal shadow-[0_0_15px_rgba(0,242,255,0.3)] mb-3 relative group overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-navy focus:ring-accent-teal transition-all disabled:opacity-50"
                            title="Cambiar foto de perfil"
                        >
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-accent-teal animate-spin" />
                            ) : avatarUrl ? (
                                <>
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="font-bold text-accent-teal text-xl group-hover:opacity-0 transition-opacity">
                                        {firstName ? firstName.charAt(0).toUpperCase() : "U"}
                                    </span>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-xs font-semibold text-accent-teal hover:text-white transition-colors flex items-center gap-1"
                        >
                            <Upload className="w-3 h-3" /> Cambiar foto
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-2">Tu Perfil</h2>
                    <p className="text-sm text-slate-400 font-mono mt-1">{address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ""}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded tracking-widest uppercase border border-indigo-400/20">
                        {profile?.role || "Colaborador"}
                    </span>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Nombre</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-deep-navy/50 border border-border-glass rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all"
                            placeholder="Tu nombre"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Apellido</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-deep-navy/50 border border-border-glass rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all"
                            placeholder="Tu apellido"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving || loading}
                        className="w-full mt-6 py-3 bg-accent-teal text-deep-navy font-bold rounded-xl transition-all relative overflow-hidden group disabled:opacity-50"
                    >
                        {showSuccess ? (
                            <span className="flex items-center justify-center gap-2">
                                <Check className="w-5 h-5" /> Guardado
                            </span>
                        ) : (
                            <span className="group-hover:tracking-wider transition-all">
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
