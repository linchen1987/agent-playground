import type { ChatRequest, StreamChunk, StreamFetchOptions } from './types';

export async function streamChat(
  request: ChatRequest,
  options: StreamFetchOptions = {}
): Promise<void> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        try {
          const data = JSON.parse(line) as StreamChunk;
          options.onData?.(data);
        } catch (e) {
          console.error('Failed to parse stream chunk:', line, e);
        }
      }
    }

    options.onComplete?.();
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    options.onError?.(err);
    throw err;
  }
}

export type { StreamChunk, ChatRequest, StreamFetchOptions };
