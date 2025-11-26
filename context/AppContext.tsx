'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
    showBrowser: boolean;
    setShowBrowser: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [showBrowser, setShowBrowser] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('showBrowser');
        if (stored) {
            setShowBrowser(JSON.parse(stored));
        }
    }, []);

    // Save to local storage on change
    const handleSetShowBrowser = (show: boolean) => {
        setShowBrowser(show);
        localStorage.setItem('showBrowser', JSON.stringify(show));
    };

    return (
        <AppContext.Provider value={{ showBrowser, setShowBrowser: handleSetShowBrowser }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
