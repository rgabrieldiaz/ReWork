"use client";

import { useSettings } from "@/hooks/useSettings";
export default function HelpDeskPage() {
    const { t } = useSettings();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{t.helpdesk.title}</h1>
                <p className="text-muted">{t.helpdesk.subtitle}</p>
            </div>

            <div className="flex items-center justify-center py-20 bg-card border border-border-subtle rounded-2xl">
                <p className="text-muted">{t.helpdesk.notAvailable}</p>
            </div>
        </div>
    );
}
