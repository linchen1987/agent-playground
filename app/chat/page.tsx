"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown, Send, Trash2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getFreeModels, streamFetch, type ModelsResponse, type StreamChunk } from "@/lib/api";
import { toast } from "sonner";

export default function LLMsPage() {
    const [selectedModel, setSelectedModel] = useState<string>("big-pickle");
    const [freeModels, setFreeModels] = useState<string[]>([]);
    const [thinkingSpeed, setThinkingSpeed] = useState<"disabled" | "fast" | "slow" | null>(null);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, reasoning?: string, rawData?: any }>>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleClearChat = () => {
        setMessages([]);
        toast.success("Chat cleared");
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !selectedModel || isLoading) return;

        const userMessage = { role: 'user' as const, content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            let assistantMessage: { role: 'assistant', content: string, reasoning?: string } = { role: 'assistant', content: '' };
            setMessages(prev => [...prev, assistantMessage]);

            await streamFetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    thinking: thinkingSpeed ? { speed: thinkingSpeed === 'disabled' ? undefined : thinkingSpeed, type: thinkingSpeed === 'disabled' ? 'disabled' : undefined } : undefined,
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                })
            }, {
                onData: (chunk) => {
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line) as StreamChunk;
                            if (data.type === 'text') {
                                assistantMessage.content += data.content;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                                    return newMessages;
                                });
                            } else if (data.type === 'reasoning') {
                                assistantMessage.reasoning = (assistantMessage.reasoning || '') + data.content;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                                    return newMessages;
                                });
                            } else if (data.type === 'error') {
                                toast.error(data.message);
                            }
                        } catch (e) {
                            console.error('Failed to parse stream chunk:', line, e);
                        }
                    }
                },
                onComplete: () => {
                    console.log('Stream completed');
                },
                onError: (error) => {
                    console.error('Stream error:', error);
                    toast.error('Failed to send message');
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            try {
                const data: ModelsResponse = await getFreeModels();
                // Only get models from opencode provider
                const opencodeProvider = data.opencode;
                const modelList = opencodeProvider ? Object.keys(opencodeProvider.models) : [];
                setFreeModels(modelList);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch free models");
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, []);

    return (
        <div className="h-screen flex flex-col">
            <div className="container mx-auto px-4 flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16 flex-none">
                <h2 className="text-lg font-semibold">LLM Models</h2>
            </div>
            <Separator className="flex-none" />
            <div className="container mx-auto flex-1 py-6 px-4">
                <div className="max-w-[1200px] space-y-8">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Model
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-[300px] justify-between"
                                        >
                                            {selectedModel || (loading ? "Loading..." : "Select a model...")}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[300px] max-h-[300px] overflow-y-auto">
                                        {freeModels.length > 0 ? (
                                            freeModels.map((model) => (
                                                <DropdownMenuItem
                                                    key={model}
                                                    onClick={() => setSelectedModel(model)}
                                                    className="cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedModel === model
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {model}
                                                </DropdownMenuItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                {loading ? "Loading models..." : "No free models found"}
                                            </div>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Thinking Speed
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-[300px] justify-between"
                                        >
                                            {thinkingSpeed ? (thinkingSpeed.charAt(0).toUpperCase() + thinkingSpeed.slice(1)) : "Default (Auto)"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[300px]">
                                        <DropdownMenuItem onClick={() => setThinkingSpeed(null)}>
                                            <Check className={cn("mr-2 h-4 w-4", !thinkingSpeed ? "opacity-100" : "opacity-0")} />
                                            Default (Auto)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setThinkingSpeed("fast")}>
                                            <Check className={cn("mr-2 h-4 w-4", thinkingSpeed === "fast" ? "opacity-100" : "opacity-0")} />
                                            Fast (Low Effort)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setThinkingSpeed("slow")}>
                                            <Check className={cn("mr-2 h-4 w-4", thinkingSpeed === "slow" ? "opacity-100" : "opacity-0")} />
                                            Slow (High Effort)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setThinkingSpeed("disabled")}>
                                            <Check className={cn("mr-2 h-4 w-4", thinkingSpeed === "disabled" ? "opacity-100" : "opacity-0")} />
                                            Disabled
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {selectedModel && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-medium">Chat</h3>
                                {messages.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearChat}
                                        className="flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Clear Chat
                                    </Button>
                                )}
                            </div>

                            <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                                <div className="h-96 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8">
                                            Start a conversation with {selectedModel}
                                        </div>
                                    ) : (
                                        messages.map((message, index) => (
                                            <div key={index} className={cn(
                                                "p-3 rounded-lg flex gap-3",
                                                message.role === 'user' ? "flex-row-reverse bg-primary/10 ml-auto w-fit max-w-[80%]" : "bg-secondary/10 mr-8"
                                            )}>
                                                <div className="flex-none mt-1">
                                                    {message.role === 'user' ? (
                                                        <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-muted h-8 w-8 rounded-full flex items-center justify-center text-secondary-foreground border">
                                                            <Bot className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="font-medium text-xs mb-1 opacity-50">
                                                        {message.role === 'user' ? 'You' : selectedModel}
                                                    </div>
                                                    <div className="whitespace-pre-wrap text-sm">
                                                        {message.role === 'assistant' && message.reasoning && (
                                                            <details open className="mb-2 text-xs text-muted-foreground border-l-2 pl-2 border-primary/20">
                                                                <summary className="cursor-pointer hover:text-foreground font-medium">
                                                                    Thinking Process
                                                                </summary>
                                                                <div className="mt-1 whitespace-pre-wrap">
                                                                    {message.reasoning}
                                                                </div>
                                                            </details>
                                                        )}
                                                        {/* Loading Skeleton Logic */}
                                                        {message.role === 'assistant' && !message.content && !message.reasoning && isLoading && index === messages.length - 1 ? (
                                                            <div className="space-y-2 animate-pulse">
                                                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                                                <div className="h-4 bg-muted rounded w-1/2"></div>
                                                            </div>
                                                        ) : (
                                                            message.content
                                                        )}
                                                    </div>
                                                    {message.rawData && (
                                                        <details className="mt-3 text-xs">
                                                            <summary className="cursor-pointer font-mono bg-muted p-2 rounded">
                                                                Raw JSON Response
                                                            </summary>
                                                            <pre className="mt-2 p-2 bg-muted/50 rounded overflow-x-auto">
                                                                {JSON.stringify(message.rawData, null, 2)}
                                                            </pre>
                                                        </details>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="border-t p-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Type your message..."
                                            className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!input.trim() || isLoading}
                                            size="sm"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
