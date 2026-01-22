"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { getModels, getFreeModels, type ModelsResponse } from "@/lib/api";
import useProviderSettings, { STATIC_PROVIDERS } from "@/lib/use-provider-settings";
import dynamic from 'next/dynamic';
import { Box, Gift, Settings } from "lucide-react";

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

export default function ModelsPage() {
    const [models, setModels] = useState<ModelsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const { settings, updateProviderSetting, getProviderSetting } = useProviderSettings();

    const fetchModels = async () => {
        setLoading(true);
        try {
            const data = await getModels();
            setModels(data);
            toast.success("Models fetched successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch models");
        } finally {
            setLoading(false);
        }
    };

    const fetchFreeModels = async () => {
        setLoading(true);
        try {
            const data = await getFreeModels();
            setModels(data);
            toast.success("Free models fetched successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch free models");
        } finally {
            setLoading(false);
        }
    };

    // 检查模型是否免费（input和output cost都为0）
    const isModelFree = (providerId: string, modelId: string) => {
        const provider = models?.[providerId];
        if (!provider) return false;
        
        const model = provider.models[modelId];
        if (!model) return false;
        
        const inputCost = model.cost?.input ?? 0;
        const outputCost = model.cost?.output ?? 0;
        
        return inputCost === 0 && outputCost === 0;
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="container mx-auto px-4 flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16 flex-none">
                <h2 className="text-lg font-semibold">Models</h2>
            </div>
            <Separator className="flex-none" />
            <div className="container mx-auto px-4 flex-1 min-h-0 py-6">
                <Tabs defaultValue="all-models" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all-models" className="gap-2">
                            <Box className="h-4 w-4" />
                            All Models
                        </TabsTrigger>
                        <TabsTrigger value="free-models" className="gap-2">
                            <Gift className="h-4 w-4" />
                            Free Models
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all-models" className="flex-1 min-h-0 mt-6">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <p className="text-sm text-muted-foreground">
                                    All available models from all providers
                                </p>
                                <Button onClick={fetchModels} disabled={loading} variant="outline">
                                    {loading ? "Loading..." : "Refresh"}
                                </Button>
                            </div>
                            <div className="flex-1 min-h-0 rounded-md border p-4 overflow-auto bg-muted/10">
                                {models ? (
                                    <ReactJson
                                        src={models}
                                        theme="rjv-default"
                                        displayDataTypes={false}
                                        collapsed={2}
                                        enableClipboard={true}
                                        style={{ fontSize: '14px', backgroundColor: 'transparent' }}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <p className="mb-2">No models loaded</p>
                                            <Button onClick={fetchModels} disabled={loading}>
                                                Load All Models
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="free-models" className="flex-1 min-h-0 mt-6">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Free models (no cost for input and output)
                                </p>
                                <Button onClick={fetchFreeModels} disabled={loading} variant="outline">
                                    {loading ? "Loading..." : "Refresh"}
                                </Button>
                            </div>
                            <div className="flex-1 min-h-0 rounded-md border p-4 overflow-auto bg-muted/10">
                                {models ? (
                                    <ReactJson
                                        src={models}
                                        theme="rjv-default"
                                        displayDataTypes={false}
                                        collapsed={2}
                                        enableClipboard={true}
                                        style={{ fontSize: '14px', backgroundColor: 'transparent' }}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <p className="mb-2">No free models loaded</p>
                                            <Button onClick={fetchFreeModels} disabled={loading}>
                                                Load Free Models
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="flex-1 min-h-0 mt-6">
                        <div className="h-full flex flex-col">
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Configure API providers and enable them for use in chat
                                </p>
                            </div>
                            <div className="flex-1 min-h-0 rounded-md border p-4 overflow-auto bg-muted/10">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Provider Configuration</h3>
                                        <div className="text-xs text-muted-foreground">
                                            {Object.values(settings).filter(s => s.enabled).length} of {STATIC_PROVIDERS.length} providers enabled
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {STATIC_PROVIDERS.map((provider) => {
                                            const setting = getProviderSetting(provider.id);
                                            const hasFreeModels = models && Object.keys(models[provider.id]?.models || {}).some(modelId => 
                                                isModelFree(provider.id, modelId)
                                            );
                                            
                                            return (
                                                <div key={provider.id} className="p-4 border rounded-lg bg-card">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium">{provider.name}</h4>
                                                                {setting.enabled && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                                        Enabled
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                ID: {provider.id}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                API: {provider.api}
                                                            </p>
                                                            {provider.doc && (
                                                                <a 
                                                                    href={provider.doc} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-blue-600 hover:underline inline-block mt-1"
                                                                >
                                                                    Documentation →
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(setting.enabled)}
                                                                    onChange={(e) => updateProviderSetting(
                                                                        provider.id, 
                                                                        setting.apiKey || '', 
                                                                        e.target.checked
                                                                    )}
                                                                    className="rounded"
                                                                />
                                                                <span className="text-sm">Enabled</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">API Key</label>
                                                        <Input
                                                            type="password"
                                                            value={setting.apiKey}
                                                            onChange={(e) => updateProviderSetting(
                                                                provider.id, 
                                                                e.target.value, 
                                                                Boolean(setting.enabled)
                                                            )}
                                                            placeholder={
                                                                hasFreeModels ? "Uses 'public' key for free models" : "Enter API key..."
                                                            }
                                                            disabled={Boolean(hasFreeModels)}
                                                        />
                                                        {hasFreeModels && (
                                                            <p className="text-xs text-green-600">
                                                                🎁 Free models available - API key will be set to &apos;public&apos; automatically
                                                            </p>
                                                        )}
                                                        {!hasFreeModels && Boolean(setting.enabled) && !setting.apiKey && (
                                                            <p className="text-xs text-amber-600">
                                                                ⚠️ API key required for this provider
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
