"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { getModels, getFreeModels, type ModelsResponse } from "@/lib/api";
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

export default function ModelsPage() {
    const [models, setModels] = useState<ModelsResponse | null>(null);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="h-screen flex flex-col pl-4">
            <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16 flex-none">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Models</h2>
                    <div className="flex gap-2">
                        <Button onClick={fetchModels} disabled={loading} variant="outline">
                            List All Models
                        </Button>
                        <Button onClick={fetchFreeModels} disabled={loading}>
                            {loading ? "Loading..." : "List Free Models"}
                        </Button>
                    </div>
                </div>
            </div>
            <Separator className="flex-none" />
            <div className="container flex-1 min-h-0 py-6">
                <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px]">
                    <div className="hidden flex-col space-y-4 sm:flex md:order-2">
                        <div className="grid gap-2">
                            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Mode
                            </span>
                            <div className="rounded-md border p-4 text-sm text-muted-foreground">
                                Configuration controls will go here.
                            </div>
                        </div>
                    </div>
                    <div className="md:order-1 min-h-0 flex flex-col">
                        <div className="flex h-full flex-col space-y-4">
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
                                        Response Data
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
