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
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error' | 'tool';
  content: string;
  reasoning?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: unknown;
    state?: 'pending' | 'executed';
  }>;
  toolCallId?: string; // For tool role
  name?: string; // For tool role
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

  const { theme, systemTheme } = useTheme();
  const currentTheme = (theme === 'system' ? systemTheme : theme);
  const isDark = currentTheme === 'dark';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSpeed, setThinkingSpeed] = useState<string>('fast');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const isReady = Boolean(selectedProviderId && selectedModelId);

  const executeStream = useCallback(async (messagesToSend: Message[], newAssistantMessage: Message) => {
    if (!selectedProviderId || !selectedModelId) return;

    try {
      const providerSetting = getProviderSetting(selectedProviderId);
      const apiKey = providerSetting.apiKey || PUBLIC_API_KEY;

      await streamChat(
        {
          providerId: selectedProviderId,
          modelId: selectedModelId,
          apiKey,
          thinking: {
            type: thinkingSpeed === 'disabled' ? 'disabled' : 'enabled',
            speed: thinkingSpeed === 'disabled' ? undefined : (thinkingSpeed as 'fast' | 'slow'),
          },
          messages: messagesToSend
            .filter((m) => m.role !== 'error')
            .map((m) => ({
              role: m.role as 'user' | 'assistant' | 'tool',
              content: m.content,
              toolCalls: m.toolCalls,
              toolCallId: m.toolCallId,
              name: m.name,
            })),
        },
        {
          onData: (chunk: StreamChunk) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.id !== newAssistantMessage.id) return prev;

              const updated = { ...last };

              switch (chunk.type) {
                case 'text':
                  updated.content += chunk.content;
                  break;
                case 'reasoning':
                  updated.reasoning = (updated.reasoning || '') + chunk.content;
                  break;
                case 'tool-call':
                  updated.toolCalls = [
                    ...(updated.toolCalls || []),
                    {
                      id: chunk.toolCallId,
                      name: chunk.toolName,
                      args: chunk.input,
                      state: 'pending',
                    },
                  ];
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
              if (last.id !== newAssistantMessage.id) return prev;
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
  }, [selectedProviderId, selectedModelId, thinkingSpeed, getProviderSetting]);

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

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      reasoning: '',
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages([...newMessages, assistantMessage]);
    setInput('');
    setIsLoading(true);

    await executeStream([...newMessages], assistantMessage);
  }, [input, messages, selectedProviderId, selectedModelId, isLoading, executeStream]);

  const handleExecuteTool = useCallback(async (messageId: string, toolCall: { id: string; name: string; args: unknown }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: toolCall.name, args: toolCall.args }),
      });

      if (!response.ok) throw new Error('Tool execution failed');
      const { result } = await response.json();

      // Update the tool call state to executed
      setMessages((prev) => prev.map(m => {
        if (m.id === messageId && m.toolCalls) {
          return {
            ...m,
            toolCalls: m.toolCalls.map(tc => tc.id === toolCall.id ? { ...tc, state: 'executed' } : tc)
          };
        }
        return m;
      }));

      // Add tool result message
      const toolMessage: Message = {
        id: crypto.randomUUID(),
        role: 'tool',
        content: JSON.stringify(result),
        toolCallId: toolCall.id,
        name: toolCall.name,
        timestamp: Date.now(),
      };

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        reasoning: '',
        timestamp: Date.now(),
      };

      // We need the updated messages state, but setMessages is async.
      // We'll reconstruct the latest state based on what we know.
      // Actually we should use the functional update pattern or just use the current 'messages' ref if available.
      // But 'messages' in closure might be stale.
      // Better to rely on functional update or pass messages around.
      // Since we just updated state, let's assume we can rebuild it.
      // Wait, we need to send ALL history including the new tool message.
      
      setMessages((prev) => {
        const updatedPrev = prev.map(m => {
          if (m.id === messageId && m.toolCalls) {
             return {
               ...m,
               toolCalls: m.toolCalls.map(tc => tc.id === toolCall.id ? { ...tc, state: 'executed' } : tc)
             } as Message;
          }
          return m;
        });
        const newHistory = [...updatedPrev, toolMessage];
        // We need to trigger executeStream with newHistory
        // But we can't do it inside setMessages.
        // We'll execute it after.
        return [...newHistory, assistantMessage];
      });

      // Getting the fresh state is tricky without a ref or useEffect.
      // I'll construct the history manually for the API call to avoid race conditions.
      const updatedMessages = messages.map(m => {
        if (m.id === messageId && m.toolCalls) {
          return {
            ...m,
            toolCalls: m.toolCalls.map(tc => tc.id === toolCall.id ? { ...tc, state: 'executed' } : tc)
          } as Message;
        }
        return m;
      });
      
      // TEST: Skip adding toolMessage to history sent to API
      // const newHistory = [...updatedMessages, toolMessage];
      const newHistory = [...updatedMessages, toolMessage]; 
      await executeStream(newHistory, assistantMessage);

    } catch (error) {
      toast.error('Failed to execute tool');
      console.error(error);
      setIsLoading(false);
    }
  }, [messages, executeStream]);

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
                          : message.role === 'tool'
                          ? 'bg-muted/30 text-muted-foreground font-mono text-sm'
                          : 'bg-muted/50 text-foreground'
                      }`}>
                        {message.role === 'tool' ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="font-semibold">Tool Result: {message.name}</span>
                            </div>
                            <details className="text-xs">
                              <summary className="cursor-pointer hover:underline">View Output</summary>
                              <pre className="mt-2 whitespace-pre-wrap overflow-x-auto">
                                {message.content.length > 500 ? message.content.slice(0, 500) + '...' : message.content}
                              </pre>
                            </details>
                          </div>
                        ) : (
                          message.content || (
                            <span className="text-muted-foreground/50 italic">
                              ...
                            </span>
                          )
                        )}

                        {message.toolCalls && message.toolCalls.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-border/50 pt-2">
                            {message.toolCalls.map((tc) => (
                              <div key={tc.id} className="rounded-md border bg-background/50 p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-xs font-medium uppercase text-muted-foreground">
                                      {tc.name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground/70 font-mono">
                                      {(JSON.stringify(tc.args) || '').slice(0, 30)}...
                                    </span>
                                  </div>
                                  {tc.state === 'executed' ? (
                                    <div className="flex items-center gap-1 text-xs text-green-500">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span>Ran</span>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => handleExecuteTool(message.id, tc)}
                                      disabled={isLoading}
                                    >
                                      <Play className="mr-1 h-3 w-3" />
                                      Run
                                    </Button>
                                  )}
                                </div>
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                    View Arguments
                                  </summary>
                                  <pre className="mt-1 overflow-x-auto rounded bg-muted/50 p-2 text-xs font-mono">
                                    {JSON.stringify(tc.args, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            ))}
                          </div>
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
                            style={isDark ? vscDarkPlus : vs}
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              fontSize: '12px',
                              lineHeight: '1.5',
                              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'transparent',
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

          <div className="border-t p-6 bg-card">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  isReady ? 'Type your message...' : 'Select a model first'
                }
                disabled={!isReady || isLoading}
                className="flex-1 h-14 px-4 text-lg shadow-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isReady || !input.trim() || isLoading}
                size="lg"
                className="h-14 w-14 rounded-xl shadow-sm"
              >
                <Send className="h-6 w-6" />
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  className="h-14 w-14 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
