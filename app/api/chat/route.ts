import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { model, messages, thinking } = await req.json();

    console.log('Chat API request:', { model, messageCount: messages?.length, thinking });

    if (!model || !messages) {
      return new Response(JSON.stringify({ error: 'Model and messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const provider = createOpenAICompatible({
      name: 'opencode',
      apiKey: 'public',
      baseURL: 'https://opencode.ai/zen/v1',
    });

    // Map "thinking" config to provider-specific options
    // Assuming "reasoning_effort" is the parameter for OpenAI-compatible providers that support it
    let providerOptions: any = {};

    if (thinking) {
      if (thinking.type === 'disabled') {
        // If the model supports disabling thinking via a specific param, add it here.
        // For now, we might just set effort to low or omit it if that's the default.
        providerOptions.reasoning_effort = 'low';
      } else if (thinking.speed === 'fast') {
        providerOptions.reasoning_effort = 'low';
      } else if (thinking.speed === 'slow') {
        providerOptions.reasoning_effort = 'high';
      }
    }

    const result = await streamText({
      model: provider.chatModel(model),
      messages: messages,
      temperature: 0.7,
      ...providerOptions,
    });

    console.log('Chat API streaming started for model:', model);

    return result.toTextStreamResponse();
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