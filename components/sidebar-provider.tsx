"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
    isCollapsed: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    // Initialize with false, assuming expanded by default
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Optional: Persist state to local storage
    useEffect(() => {
        const savedState = localStorage.getItem("sidebar_collapsed");
        if (savedState) {
            setIsCollapsed(savedState === "true");
        }
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const newState = !prev;
            localStorage.setItem("sidebar_collapsed", String(newState));
            return newState;
        });
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
