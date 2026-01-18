import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { model, messages } = await req.json();

    console.log('Chat API request:', { model, messageCount: messages?.length });

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

    const result = await generateText({
      model: provider.chatModel(model),
      messages: messages,
      temperature: 0.7,
    });

    console.log('Chat API response:', { 
      textLength: result.text.length,
      usage: result.usage
    });

    return new Response(JSON.stringify({
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      model: model,
    }), {
      headers: { 'Content-Type': 'application/json' }
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