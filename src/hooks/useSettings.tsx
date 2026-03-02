"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Language, Theme, TranslationDictionary } from "@/lib/translations";

interface SettingsContextType {
    language: Language;
    theme: Theme;
    t: TranslationDictionary;
    setLanguage: (lang: Language) => void;
    setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("es");
    const [theme, setThemeState] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load settings from local storage on mount
        const storedLang = localStorage.getItem("rework_lang") as Language;
        const storedTheme = localStorage.getItem("rework_theme") as Theme;

        if (storedLang && (storedLang === "es" || storedLang === "en")) {
            setLanguageState(storedLang);
        }

        const initialTheme = (storedTheme && ["light", "dark", "system"].includes(storedTheme))
            ? (storedTheme as Theme)
            : "dark";

        setThemeState(initialTheme);
        applyTheme(initialTheme);

        setMounted(true);
    }, []);

    // Listen to system theme changes dynamically
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === "system") {
                const root = window.document.documentElement;
                root.classList.remove("light", "dark");
                root.classList.add(e.matches ? "dark" : "light");
                root.style.colorScheme = e.matches ? "dark" : "light";
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const applyTheme = (newTheme: Theme) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (newTheme === "system") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.add(isDark ? "dark" : "light");
            root.style.colorScheme = isDark ? "dark" : "light";
        } else {
            root.classList.add(newTheme);
            root.style.colorScheme = newTheme;
        }
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("rework_lang", lang);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("rework_theme", newTheme);
        applyTheme(newTheme);
    };

    // Dictionary proxy for easy access
    const t = translations[language];

    // Prevent hydration mismatch by blocking render until mounted
    // Alternatively can return early but may cause flicker
    if (!mounted) {
        return null;
    }

    return (
        <SettingsContext.Provider value={{ language, theme, t, setLanguage, setTheme }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
