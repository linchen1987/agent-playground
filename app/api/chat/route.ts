import { NextRequest, NextResponse } from 'next/server';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { STATIC_CONFIG } from '@/lib/static-config';
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

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function prepareMessages(messages: Message[]) {
  return messages;
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

function transformStreamPart(part: { type: string; [key: string]: unknown }): StreamChunk | null {
  switch (part.type) {
    case 'text-delta':
      return { type: 'text', content: part.text as string };

    case 'reasoning-delta':
      return { type: 'reasoning', content: part.text as string };

    case 'tool-call':
      return {
        type: 'tool-call',
        toolName: part.toolCallName as string,
        args: part.toolCallArgs,
      };

    case 'tool-result':
      return {
        type: 'tool-result',
        toolName: part.toolName as string,
        result: part.result,
      };

    case 'error':
      return {
        type: 'error',
        message: part.error instanceof Error ? part.error.message : 'Unknown error',
      };

    case 'done':
      return { type: 'done' };

    default:
      return null;
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

    const result = await streamText({
      model,
      messages: prepareMessages(messages),
      temperature,
      maxOutputTokens,
      providerOptions: {
        openai: thinkingOptions,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            const transformed = transformStreamPart(part);
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
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
