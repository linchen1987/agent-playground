import { NextRequest, NextResponse } from 'next/server';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { STATIC_CONFIG } from '@/lib/static-config';
import { toolSchemas } from '@/lib/tools';
import type { ChatRequest, StreamChunk } from '@/lib/types';

function createProvider(providerId: string, modelId: string, apiKey: string) {
  const config = STATIC_CONFIG[providerId];

  if (!config) {
    throw new Error(`Provider not found: ${providerId}`);
  }

  const modelConfig = config.models[modelId];
  const modelProviderNpm = modelConfig?.provider?.npm;

  if (modelProviderNpm === '@ai-sdk/anthropic') {
    return createAnthropic({
      apiKey,
      baseURL: config.api,
    });
  }

  return createOpenAICompatible({
    name: providerId,
    apiKey,
    baseURL: config.api,
  });
}

function prepareMessages(messages: ChatRequest['messages']) {
  return messages.map((m) => {
    if (m.role === 'tool') {
      let result = m.content;

      return {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: m.toolCallId,
            toolName: m.name,
            output: typeof result === 'string'
              ? { type: 'text', value: result }
              : { type: 'json', value: result },
          },
        ],
      };
    }

    if (m.role === 'system') {
       return {
         role: 'system',
         content: m.content
       }
    }

    if (m.role === 'assistant') {
      const contentParts: any[] = [];
      
      // Add text parts
      if (m.content) {
        if (typeof m.content === 'string') {
          if (m.content.length > 0) {
            contentParts.push({ type: 'text', text: m.content });
          }
        } else if (Array.isArray(m.content)) {
          m.content.forEach((c: any) => {
            if (typeof c === 'string') {
               if (c.length > 0) {
                 contentParts.push({ type: 'text', text: c });
               }
            } else if (c.type === 'text') {
              contentParts.push(c);
            }
          });
        }
      }

      // Add tool call parts
      if (m.toolCalls && m.toolCalls.length > 0) {
        m.toolCalls.forEach((tc: any) => {
          contentParts.push({
            type: 'tool-call',
            toolCallId: tc.id,
            toolName: tc.name,
            input: tc.args,
          });
        });
      }

      return {
        role: 'assistant',
        content: contentParts,
      };
    }

    if (m.role === 'user') {
      return {
        role: 'user',
        content: [{ type: 'text', text: m.content }]
      };
    }

    return m;
  }) as any[];
}

function getProviderThinkingOptions(thinking: ChatRequest['thinking']) {
  if (!thinking) return {};

  const options: Record<string, string> = {};

  if (thinking.type === 'disabled') {
    options.reasoningEffort = 'none';
  } else if (thinking.speed === 'fast') {
    options.reasoningEffort = 'minimal';
  } else if (thinking.speed === 'slow') {
    options.reasoningEffort = 'high';
  }

  return options;
}

function transformStreamPart(part: { type: string; [key: string]: unknown }): StreamChunk | Record<string, unknown> {
  switch (part.type) {
    case 'text-delta':
      return { type: 'text', content: part.text as string };

    case 'reasoning-delta':
      return { type: 'reasoning', content: part.text as string };

    case 'tool-call':
      return {
        type: 'tool-call',
        toolName: part.toolName as string,
        input: (part as any).input, 
        toolCallId: (part as any).toolCallId,
      };

    case 'tool-result':
      return {
        type: 'tool-result',
        toolName: part.toolName as string,
        result: part.result,
        toolCallId: (part as any).toolCallId,
      };

    case 'error':
      return {
        type: 'error',
        message: part.error instanceof Error ? part.error.message : 'Unknown error',
      };

    case 'done':
      return { type: 'done' };

    default:
      // Filter out tool-input-* events to avoid sending them to client
      if (part.type.startsWith('tool-input')) {
        return null as unknown as StreamChunk; // Skip this chunk
      }
      return part as Record<string, unknown>;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { providerId, modelId, apiKey, messages, thinking, temperature, maxOutputTokens } = body;

    if (!providerId || !modelId || !apiKey || !messages?.length) {
      return NextResponse.json(
        { error: 'Missing required parameters: providerId, modelId, apiKey, messages' },
        { status: 400 }
      );
    }

    const providerConfig = STATIC_CONFIG[providerId];
    const modelConfig = providerConfig?.models[modelId];

    if (!providerConfig) {
      return NextResponse.json(
        { error: `Provider not found: ${providerId}` },
        { status: 400 }
      );
    }

    if (!modelConfig) {
      return NextResponse.json(
        { error: `Model not found: ${modelId} in provider ${providerId}` },
        { status: 400 }
      );
    }

    const provider = createProvider(providerId, modelId, apiKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (provider as any).languageModel(modelId);

    const thinkingOptions = getProviderThinkingOptions(thinking);

    const tools = {
      search: tool({
        description: toolSchemas.search.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parameters: toolSchemas.search.parameters as any,
      } as any),
      readUrl: tool({
        description: toolSchemas.readUrl.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parameters: toolSchemas.readUrl.parameters as any,
      } as any),
    };

    const preparedMessages = prepareMessages(messages);

    const result = await streamText({
      model,
      messages: preparedMessages,
      temperature,
      maxOutputTokens,
      tools,
      providerOptions: {
        openai: thinkingOptions,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            const transformed = transformStreamPart(part as any);
            if (transformed) {
              const data = JSON.stringify(transformed);
              controller.enqueue(new TextEncoder().encode(data + '\n'));
            }
          }
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown streaming error',
          });
          controller.enqueue(new TextEncoder().encode(errorData + '\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    // console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
