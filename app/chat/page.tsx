'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProviderModelSelect } from '@/components/provider-model-select';
import { streamChat, type StreamChunk } from '@/lib/api';
import useProviderSettings from '@/lib/use-provider-settings';
import useModelSelection from '@/lib/use-model-selection';
import { PUBLIC_API_KEY } from '@/lib/static-config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Send,
  Trash2,
  Bot,
  User,
  AlertCircle,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  reasoning?: string;
  timestamp: number;
  rawData?: Array<Record<string, unknown>>;
}

export default function ChatPage() {
  const { getProviderSetting } = useProviderSettings();
  const {
    selectedProviderId,
    selectedModelId,
    setSelectedProviderId,
    setSelectedModelId,
  } = useModelSelection();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSpeed, setThinkingSpeed] = useState<string>('fast');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const isReady = Boolean(selectedProviderId && selectedModelId);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || !selectedProviderId || !selectedModelId || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const providerSetting = getProviderSetting(selectedProviderId);
      const apiKey = providerSetting.apiKey || PUBLIC_API_KEY;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        reasoning: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await streamChat(
        {
          providerId: selectedProviderId,
          modelId: selectedModelId,
          apiKey,
          thinking: {
            type: thinkingSpeed === 'disabled' ? 'disabled' : 'enabled',
            speed: thinkingSpeed === 'disabled' ? undefined : (thinkingSpeed as 'fast' | 'slow'),
          },
          messages: [
            ...messages.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            { role: 'user', content: userMessage.content },
          ],
        },
        {
          onData: (chunk: StreamChunk) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.id !== assistantMessage.id) return prev;

              const updated = { ...last };

              switch (chunk.type) {
                case 'text':
                  updated.content += chunk.content;
                  break;
                case 'reasoning':
                  updated.reasoning = (updated.reasoning || '') + chunk.content;
                  break;
                case 'error':
                  updated.role = 'error';
                  updated.content = chunk.message;
                  break;
              }

              updated.rawData = [...(last.rawData || []), chunk];

              return [...prev.slice(0, -1), updated];
            });
          },
          onError: (error: Error) => {
            toast.error(error.message);
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.id !== assistantMessage.id) return prev;
              return [
                ...prev.slice(0, -1),
                { ...last, role: 'error', content: error.message },
              ];
            });
          },
          onComplete: () => {
            toast.success('Response received');
          },
        }
      );
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    input,
    selectedProviderId,
    selectedModelId,
    isLoading,
    messages,
    thinkingSpeed,
    getProviderSetting,
  ]);

  const handleClearChat = () => {
    setMessages([]);
    setExpandedMessages(new Set());
    toast.success('Chat cleared');
  };

  const toggleRawData = (messageId: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 py-3 flex-none">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Chat
        </h1>
      </div>

      <div className="container mx-auto px-4 flex-1 flex gap-4 min-h-0">
        <div className="w-72 flex-none">
          <ProviderModelSelect
            selectedProviderId={selectedProviderId}
            selectedModelId={selectedModelId}
            onChange={(providerId, modelId) => {
              setSelectedProviderId(providerId);
              setSelectedModelId(modelId);
            }}
          />
          {selectedProviderId && selectedModelId && (
            <div className="mt-4">
              <label className="text-sm font-medium flex items-center gap-1 mb-2">
                <Bot className="h-4 w-4" />
                Thinking
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {thinkingSpeed === 'fast' ? 'Fast (Low Effort)' :
                     thinkingSpeed === 'slow' ? 'Slow (High Effort)' :
                     thinkingSpeed === 'disabled' ? 'Disabled' : 'Auto'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setThinkingSpeed('fast')}>
                    <Check className={cn('mr-2 h-4 w-4', thinkingSpeed === 'fast' ? 'opacity-100' : 'opacity-0')} />
                    Fast (Low Effort)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThinkingSpeed('slow')}>
                    <Check className={cn('mr-2 h-4 w-4', thinkingSpeed === 'slow' ? 'opacity-100' : 'opacity-0')} />
                    Slow (High Effort)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThinkingSpeed('disabled')}>
                    <Check className={cn('mr-2 h-4 w-4', thinkingSpeed === 'disabled' ? 'opacity-100' : 'opacity-0')} />
                    Disabled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0 border rounded-xl bg-card/50">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Bot className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Start a conversation</p>
                  {!isReady && (
                    <p className="text-xs text-amber-500 mt-2">
                      Please select a provider and model
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="flex-none mt-1">
                      {message.role === 'user' ? (
                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      ) : message.role === 'error' ? (
                        <div className="h-7 w-7 rounded-full bg-destructive/20 flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {message.role === 'assistant' && message.reasoning && (
                        <details open className="text-xs text-muted-foreground/70 mb-2 ml-1">
                          <summary className="cursor-pointer hover:text-muted-foreground">
                            Thinking
                          </summary>
                          <pre className="whitespace-pre-wrap mt-1.5 pl-2 border-l border-muted">
                            {message.reasoning}
                          </pre>
                        </details>
                      )}

                      <div className={`inline-block max-w-[85%] rounded-lg px-4 py-2.5 text-base leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-primary/10 text-foreground'
                          : message.role === 'error'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted/50 text-foreground'
                      }`}>
                        {message.content || (
                          <span className="text-muted-foreground/50 italic">
                            ...
                          </span>
                        )}
                      </div>

                      {message.role === 'assistant' && message.rawData && message.rawData.length > 0 && (
                        <button
                          onClick={() => toggleRawData(message.id)}
                          className="mt-1 text-xs text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1"
                        >
                          {expandedMessages.has(message.id) ? (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              Hide raw data
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-3 w-3" />
                              Show raw data
                            </>
                          )}
                        </button>
                      )}

                      {expandedMessages.has(message.id) && message.rawData && (
                        <div className="max-w-[85%] mt-2 rounded-md border border-muted/50 overflow-hidden">
                          <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              fontSize: '12px',
                              lineHeight: '1.5',
                              backgroundColor: 'rgba(0,0,0,0.2)',
                              wordBreak: 'break-all',
                              whiteSpace: 'pre-wrap',
                              maxWidth: '100%',
                            }}
                            codeTagProps={{
                              style: {
                                wordBreak: 'break-all',
                                whiteSpace: 'pre-wrap',
                              }
                            }}
                            wrapLongLines={true}
                          >
                            {JSON.stringify(message.rawData, null, 2)}
                          </SyntaxHighlighter>
                        </div>
                      )}
                    </div>
                  </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-2">
                      <div className="flex-none mt-1">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1 rounded-lg bg-muted/50 px-3 py-2">
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Generating...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
          </div>

          <div className="border-t p-3 bg-card">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  isReady ? 'Type your message...' : 'Select a model first'
                }
                disabled={!isReady || isLoading}
                className="flex-1 h-9"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isReady || !input.trim() || isLoading}
                size="sm"
                className="h-9"
              >
                <Send className="h-4 w-4" />
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="h-9 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
