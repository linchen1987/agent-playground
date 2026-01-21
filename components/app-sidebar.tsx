"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bot, LayoutDashboard, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar-provider";
import { ModeToggle } from "@/components/mode-toggle";

export function AppSidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();

    const links = [
        {
            name: "Home",
            href: "/",
            icon: Home,
        },
        {
            name: "Chat",
            href: "/chat",
            icon: Bot,
        },
        {
            name: "Models",
            href: "/models",
            icon: Bot,
        },
        {
            name: "Agents",
            href: "/agents",
            icon: Bot,
        },
    ];

    return (
        <div
            className={cn(
                "flex h-screen flex-col border-r bg-background fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn("p-6", isCollapsed && "px-2")}>
                <div className={cn("flex items-center mb-6", isCollapsed ? "justify-center" : "gap-2")}>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                        <LayoutDashboard className="h-6 w-6" />
                    </Button>
                    {!isCollapsed && <span className="font-bold text-xl">AI Playground</span>}
                </div>

                <nav className="space-y-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Button
                                key={link.href}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full",
                                    isActive && "bg-secondary",
                                    isCollapsed ? "flex-col h-auto py-2 gap-1 px-0" : "justify-start gap-2"
                                )}
                                asChild
                            >
                                <Link href={link.href}>
                                    <Icon className="h-4 w-4" />
                                    {isCollapsed ? (
                                        <span className="text-[10px] items-center text-center">{link.name}</span>
                                    ) : (
                                        link.name
                                    )}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t">
                <div className="flex justify-center mb-4">
                    <ModeToggle />
                </div>
                <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
