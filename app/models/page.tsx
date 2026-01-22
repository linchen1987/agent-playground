'use client';

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { Box, Gift, Settings, RefreshCw, Globe } from "lucide-react";
import { ProviderSettings } from "@/components/provider-settings";
import { STATIC_CONFIG, isModelFree } from "@/lib/static-config";
import type { ModelsResponse } from "@/lib/types";

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

interface ThemeObject {
    base00: string;
    base01: string;
    base02: string;
    base03: string;
    base04: string;
    base05: string;
    base06: string;
    base07: string;
    base08: string;
    base09: string;
    base0A: string;
    base0B: string;
    base0C: string;
    base0D: string;
    base0E: string;
    base0F: string;
}

const darkTheme: ThemeObject = {
    base00: 'transparent',
    base01: '#1e1e1e',
    base02: '#2d2d2d',
    base03: '#7f8490',
    base04: '#b0b0b0',
    base05: '#d4d4d4',
    base06: '#e8e8e8',
    base07: '#f5f5f5',
    base08: '#f97583',
    base09: '#ffab70',
    base0A: '#ffdc9a',
    base0B: '#a6e3a1',
    base0C: '#89dceb',
    base0D: '#89b4fa',
    base0E: '#cba6f7',
    base0F: '#f5c2e7',
};

type ViewMode = "json" | "raw";
type FilterType = "all" | "free";

export default function ModelsPage() {
    const localModels = STATIC_CONFIG;
    const [remoteModels, setRemoteModels] = useState<ModelsResponse | null>(null);
    const [remoteLoading, setRemoteLoading] = useState(false);
    const [localFilter, setLocalFilter] = useState<FilterType>("all");
    const [remoteFilter, setRemoteFilter] = useState<FilterType>("all");
    const [localViewMode, setLocalViewMode] = useState<ViewMode>("json");
    const [remoteViewMode, setRemoteViewMode] = useState<ViewMode>("json");

    const fetchRemoteModels = async () => {
        setRemoteLoading(true);
        try {
            const data = await fetch('/api/models-dev').then((res) => res.json());
            setRemoteModels(data);
            toast.success("Models.dev data loaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to load models.dev data");
        } finally {
            setRemoteLoading(false);
        }
    };

    const filterModels = (models: ModelsResponse | null, filter: FilterType): ModelsResponse | null => {
        if (!models) return null;
        if (filter === "all") return models;

        return Object.entries(models).reduce((acc, [providerId, provider]) => {
            const freeModels: Record<string, typeof provider.models[string]> = {};
            for (const [modelId, model] of Object.entries(provider.models)) {
                if (isModelFree(model)) {
                    freeModels[modelId] = model;
                }
            }
            if (Object.keys(freeModels).length > 0) {
                acc[providerId] = { ...provider, models: freeModels };
            }
            return acc;
        }, {} as ModelsResponse);
    };

    const localDisplayModels = filterModels(localModels, localFilter);
    const remoteDisplayModels = filterModels(remoteModels, remoteFilter);

    return (
        <div className="h-screen flex flex-col">
            <div className="container mx-auto px-4 flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16 flex-none">
                <h2 className="text-lg font-semibold">Models</h2>
            </div>
            <Separator className="flex-none" />
            <div className="container mx-auto px-4 flex-1 min-h-0 py-6">
                <Tabs defaultValue="local-models" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="models-dev" className="gap-2">
                            <Globe className="h-4 w-4" />
                            models.dev
                        </TabsTrigger>
                        <TabsTrigger value="local-models" className="gap-2">
                            <Box className="h-4 w-4" />
                            Local Models
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="local-models" className="flex-1 min-h-0 mt-6">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Available models from configured providers
                                </p>
                                <div className="flex items-center gap-2">
                                    <Tabs value={localFilter} onValueChange={(v) => setLocalFilter(v as FilterType)}>
                                        <TabsList className="h-8">
                                            <TabsTrigger value="all" className="h-7 px-3 text-xs">All</TabsTrigger>
                                            <TabsTrigger value="free" className="h-7 px-3 text-xs gap-1">
                                                <Gift className="h-3 w-3" />
                                                Free
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                    <Tabs value={localViewMode} onValueChange={(v) => setLocalViewMode(v as ViewMode)}>
                                        <TabsList className="h-8">
                                            <TabsTrigger value="json" className="h-7 px-3 text-xs">JSON</TabsTrigger>
                                            <TabsTrigger value="raw" className="h-7 px-3 text-xs">Raw</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 rounded-md border p-4 overflow-auto bg-muted/10">
                                {localDisplayModels ? (
                                    localViewMode === "json" ? (
                                        <ReactJson
                                            src={localDisplayModels}
                                            theme={darkTheme}
                                            displayDataTypes={false}
                                            collapsed={2}
                                            enableClipboard={true}
                                            style={{ fontSize: '14px', backgroundColor: 'transparent' }}
                                        />
                                    ) : (
                                        <pre className="text-sm font-mono whitespace-pre-wrap">{JSON.stringify(localDisplayModels, null, 2)}</pre>
                                    )
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <p className="mb-2">No models loaded</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="models-dev" className="flex-1 min-h-0 mt-6">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        All models from models.dev API
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Source: <a href="https://models.dev/api.json" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://models.dev/api.json</a>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tabs value={remoteFilter} onValueChange={(v) => setRemoteFilter(v as FilterType)}>
                                        <TabsList className="h-8">
                                            <TabsTrigger value="all" className="h-7 px-3 text-xs">All</TabsTrigger>
                                            <TabsTrigger value="free" className="h-7 px-3 text-xs gap-1">
                                                <Gift className="h-3 w-3" />
                                                Free
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                    <Tabs value={remoteViewMode} onValueChange={(v) => setRemoteViewMode(v as ViewMode)}>
                                        <TabsList className="h-8">
                                            <TabsTrigger value="json" className="h-7 px-3 text-xs">JSON</TabsTrigger>
                                            <TabsTrigger value="raw" className="h-7 px-3 text-xs">Raw</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                    <Button onClick={fetchRemoteModels} disabled={remoteLoading} variant="outline">
                                        {remoteLoading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Refresh
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 rounded-md border p-4 overflow-auto bg-muted/10">
                                {remoteDisplayModels ? (
                                    remoteViewMode === "json" ? (
                                        <ReactJson
                                            src={remoteDisplayModels}
                                            theme={darkTheme}
                                            displayDataTypes={false}
                                            collapsed={1}
                                            enableClipboard={true}
                                            style={{ fontSize: '14px', backgroundColor: 'transparent' }}
                                        />
                                    ) : (
                                        <pre className="text-sm font-mono whitespace-pre-wrap">{JSON.stringify(remoteDisplayModels, null, 2)}</pre>
                                    )
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="mb-2">Click refresh to load models from models.dev</p>
                                            <Button onClick={fetchRemoteModels} disabled={remoteLoading}>
                                                Load from models.dev
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="flex-1 min-h-0 mt-6">
                        <ProviderSettings />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
