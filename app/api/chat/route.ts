import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { model, messages, thinking, providerName, apiKey, baseUrl } = await req.json();

    console.log('Chat API request:', { model, messageCount: messages?.length, thinking });

    if (!model || !messages || !providerName || !apiKey || !baseUrl) {
      return new Response(JSON.stringify({ error: 'Model, messages, providerName, apiKey, and baseUrl are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const provider = createOpenAICompatible({
      name: providerName,
      apiKey: apiKey,
      baseURL: baseUrl,
    });

    // reasoning_effort: none, minimal, low, medium, high, xhigh
    let providerOptions: any = {};

    if (thinking) {
      if (thinking.type === 'disabled') {
        providerOptions.reasoningEffort = 'none';
      } else if (thinking.speed === 'fast') {
        providerOptions.reasoningEffort = 'minimal';
        // providerOptions.reasoningEffort = 'low';
      } else if (thinking.speed === 'slow') {
        providerOptions.reasoningEffort = 'high';
      }
    }

    console.log('providerOptions: ', providerOptions);

    const result = await streamText({
      model: provider.chatModel(model),
      messages: messages,
      temperature: 0.7,
      providerOptions: {
        openai: providerOptions,
      },
    });

    console.log('result of streamText:', result);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            // console.log('part: ', part)
            if (part.type === 'text-delta') {
              const data = JSON.stringify({ type: 'text', content: part.text });
              controller.enqueue(new TextEncoder().encode(data + '\n'));
            } else if (part.type === 'reasoning-delta') {
              const data = JSON.stringify({ type: 'reasoning', content: part.text });
              controller.enqueue(new TextEncoder().encode(data + '\n'));
            } else if (part.type === 'error') {
              const errorData = JSON.stringify({ type: 'error', message: part.error instanceof Error ? part.error.message : 'Unknown streaming error' });
              controller.enqueue(new TextEncoder().encode(errorData + '\n'));
            }
          }
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'Unknown streaming error' });
          controller.enqueue(new TextEncoder().encode(errorData + '\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}