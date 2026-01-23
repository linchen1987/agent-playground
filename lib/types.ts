/**
 * Cost information for a model, in USD per million tokens.
 * Compatible with models.dev/api.json structure.
 */
export interface ModelCost {
  /** Cost per million input tokens */
  input: number;
  /** Cost per million output tokens */
  output: number;
  /** Cost per million reasoning tokens (optional) */
  reasoning?: number;
  /** Cost per million cache read tokens (optional) */
  cache_read?: number;
  /** Cost per million cache write tokens (optional) */
  cache_write?: number;
  /** Cost per million input audio tokens (optional) */
  input_audio?: number;
  /** Cost per million output audio tokens (optional) */
  output_audio?: number;
}

/**
 * Token limit constraints for a model.
 */
export interface ModelLimit {
  /** Maximum number of context tokens the model can process */
  context: number;
  /** Maximum number of output tokens the model can generate */
  output: number;
  /** Maximum number of input tokens (optional, models.dev specific) */
  input?: number;
}

/**
 * Supported input and output modalities for a model.
 */
export interface ModelModalities {
  /** Supported input types, e.g., ["text", "image", "audio"] */
  input: string[];
  /** Supported output types, e.g., ["text", "audio"] */
  output: string[];
}

/**
 * Model configuration interface.
 * Compatible with models.dev/api.json model structure.
 */
export interface Model {
  /** Unique identifier for the model, e.g., "gpt-4o" */
  id: string;
  /** Display name for the model, e.g., "GPT-4o" */
  name: string;
  /** Model family identifier (optional), e.g., "gpt-4" */
  family?: string;
  /** Whether the model supports file attachments/multimodal input (optional) */
  attachment?: boolean;
  /** Whether the model supports reasoning/thinking (optional) */
  reasoning?: boolean;
  /** Whether the model supports tool calling (optional) */
  tool_call?: boolean;
  /** Whether the model supports structured output (optional) */
  structured_output?: boolean;
  /** Whether temperature parameter can be adjusted (optional) */
  temperature?: boolean;
  /** Knowledge cutoff date (optional), e.g., "2024-11" */
  knowledge?: string;
  /** Release date (optional), e.g., "2024-11-06" */
  release_date?: string;
  /** Last update date (optional) */
  last_updated?: string;
  /** Supported input and output modalities */
  modalities: ModelModalities;
  /** Whether model weights are openly available (optional) */
  open_weights?: boolean;
  /** Cost information per million tokens (optional) */
  cost?: ModelCost;
  /** Token limit constraints (optional) */
  limit?: ModelLimit;
  /** Whether interleaved mode is supported (optional) */
  interleaved?: boolean | { field: string };
  /** Provider npm package name (optional), e.g., "@ai-sdk/anthropic" */
  provider?: { npm: string };
}

/**
 * Provider configuration interface.
 * Compatible with models.dev/api.json provider structure.
 */
export interface Provider {
  /** Unique identifier for the provider, e.g., "openai", "anthropic" */
  id: string;
  /** Display name for the provider, e.g., "OpenAI", "Anthropic" */
  name: string;
  /** Provider API base URL, e.g., "https://api.openai.com/v1" */
  api: string;
  /** Link to provider documentation (optional) */
  doc?: string;
  /** Related environment variable names (optional), e.g., ["OPENAI_API_KEY"] */
  env?: string[];
  /** Associated npm package name (optional), e.g., "@ai-sdk/openai-compatible" */
  npm?: string;
  /** Map of model IDs to Model configurations */
  models: Record<string, Model>;
}

/**
 * User configuration for a specific provider.
 */
export interface ProviderUserConfig {
  /** API key for authentication */
  apiKey: string;
  /** Whether this provider is enabled for use */
  enabled: boolean;
}

/**
 * Map of provider IDs to their user configurations.
 */
export type ProviderSettings = Record<string, ProviderUserConfig>;

/**
 * Response type for the models API endpoint.
 * Format: Record<providerId, Provider>
 */
export type ModelsResponse = Record<string, Provider>;

/**
 * Request body for the chat API endpoint.
 */
export interface ChatRequest {
  /** Provider identifier, e.g., "openai" */
  providerId: string;
  /** Model identifier, e.g., "gpt-4o" */
  modelId: string;
  /** API key for authentication */
  apiKey: string;
  /** Conversation message history */
  messages: Array<{
    /** Message role: user, assistant, system, or tool */
    role: 'user' | 'assistant' | 'system' | 'tool';
    /** Message content */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
    /** Tool calls (optional, for assistant role) */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolCalls?: any[];
    /** Tool call ID (optional, for tool role) */
    toolCallId?: string;
    /** Tool name (optional, for tool role) */
    name?: string;
  }>;
  /** Thinking/reasoning configuration (optional) */
  thinking?: {
    /** Enable or disable thinking */
    type?: 'enabled' | 'disabled';
    /** Thinking speed/effort level */
    speed?: 'fast' | 'slow';
  };
  /** Temperature for response randomness (optional, 0-2) */
  temperature?: number;
  /** Maximum number of output tokens (optional) */
  maxOutputTokens?: number;
}

/**
 * Stream chunk types returned from the chat API.
 */
export type StreamChunk =
  | { type: 'text'; content: string }
  | { type: 'reasoning'; content: string }
  | { type: 'tool-call'; toolName: string; input: unknown; toolCallId: string }
  | { type: 'tool-result'; toolName: string; result: unknown; toolCallId: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

/**
 * Options for the streamChat function.
 */
export interface StreamFetchOptions {
  /** Callback invoked for each stream chunk */
  onData?: (chunk: StreamChunk) => void;
  /** Callback invoked when streaming completes */
  onComplete?: () => void;
  /** Callback invoked on error */
  onError?: (error: Error) => void;
}
