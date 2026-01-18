"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bot, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
    const pathname = usePathname();

    const links = [
        {
            name: "Home",
            href: "/",
            icon: Home,
        },
        {
            name: "Models",
            href: "/models",
            icon: Bot,
        },
        {
            name: "LLMs",
            href: "/llms",
            icon: Bot,
        },
        {
            name: "Agents",
            href: "/agents",
            icon: Bot,
        },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background fixed left-0 top-0 z-30">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-xl mb-6">
                    <LayoutDashboard className="h-6 w-6" />
                    <span>Agent App</span>
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
                                    "w-full justify-start gap-2",
                                    isActive && "bg-secondary"
                                )}
                                asChild
                            >
                                <Link href={link.href}>
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
