"use client";

import {
  MessageCircle,
  Bot,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Home() {

  return (
    <div className="flex flex-col items-center justify-center bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background relative min-h-[calc(100vh-2rem)]">

      <main className="flex flex-col items-center gap-12 px-4 text-center sm:px-8 md:max-w-5xl w-full">
        {/* Hero Section */}
        <div className="space-y-4 pt-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            AI Playground
          </h1>
        </div>

        {/* Features Section */}
        <div className="grid w-full gap-8 md:grid-cols-2 lg:gap-12">
          {/* Chat Card */}
          <Link href="/chat" className="group">
            <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Chat</h3>
              </div>
            </div>
          </Link>

          {/* Models Card */}
          <Link href="/models" className="group">
            <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Models</h3>
              </div>
            </div>
          </Link>

          {/* Agents Card */}
          <Link href="/agents" className="group">
            <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Agents</h3>
              </div>
            </div>
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        <p>Built with Next.js & Tailwind v4</p>
      </footer>
    </div>
  );
}
