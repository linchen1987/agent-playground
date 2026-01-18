"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getFreeModels, type ModelsResponse } from "@/lib/api";
import { toast } from "sonner";

export default function LLMsPage() {
    const [selectedModel, setSelectedModel] = useState<string>("big-pickle");
    const [freeModels, setFreeModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string, rawData?: any}>>([]);
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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                })
            });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Failed to send message: ${errorText}`);
        }

        const responseData = await response.json();
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: responseData.text || 'No response content',
                rawData: responseData
            }]);
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
        <div className="h-screen flex flex-col pl-4">
            <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16 flex-none">
                <h2 className="text-lg font-semibold">LLM Models</h2>
            </div>
            <Separator className="flex-none" />
            <div className="container flex-1 py-6">
                <div className="max-w-[1200px] space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium">Free Models (OpenCode)</h3>
                        <p className="text-sm text-muted-foreground">
                            Select a free model provided by OpenCode to start experimenting.
                        </p>

                        <div className="flex flex-col gap-4 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Model Selection
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

                            {selectedModel && (
                                <div className="mt-4 p-4 rounded bg-muted/50 text-sm">
                                    <span className="font-semibold">Selected:</span> {selectedModel}
                                </div>
                            )}
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
                                                "p-3 rounded-lg",
                                                message.role === 'user' ? "bg-primary/10 ml-8" : "bg-secondary/10 mr-8"
                                            )}>
                                                <div className="font-medium text-sm mb-2">
                                                    {message.role === 'user' ? 'You' : selectedModel}
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm">
                                                    {message.content}
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
                                        ))
                                    )}
                                    {isLoading && (
                                        <div className="bg-secondary/10 mr-8 p-3 rounded-lg">
                                            <div className="font-medium text-sm mb-2">{selectedModel}</div>
                                            <div className="text-sm text-muted-foreground">Thinking...</div>
                                        </div>
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
