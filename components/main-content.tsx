"use client";

import { useSidebar } from "@/components/sidebar-provider";

export function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    return (
        <main
            className={`flex-1 bg-background transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'}`}
        >
            {children}
        </main>
    );
}
