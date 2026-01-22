import type { Provider, Model, ProviderSettings } from './types';

export type { ProviderSettings } from './types';

export const STATIC_PROVIDERS: Omit<Provider, 'models'>[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    api: 'https://api.openai.com/v1',
    doc: 'https://platform.openai.com/docs',
    env: ['OPENAI_API_KEY'],
    npm: '@ai-sdk/openai-compatible',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    api: 'https://api.anthropic.com/v1',
    doc: 'https://docs.anthropic.com/',
    env: ['ANTHROPIC_API_KEY'],
    npm: '@ai-sdk/anthropic',
  },
  {
    id: 'google',
    name: 'Google',
    api: 'https://generativelanguage.googleapis.com/v1beta',
    doc: 'https://ai.google.dev/docs',
    env: ['GOOGLE_API_KEY'],
    npm: '@ai-sdk/google',
  },
  {
    id: 'xai',
    name: 'xAI',
    api: 'https://api.x.ai/v1',
    doc: 'https://docs.x.ai/',
    env: ['XAI_API_KEY'],
    npm: '@ai-sdk/openai-compatible',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    api: 'https://api.deepseek.com/v1',
    doc: 'https://platform.deepseek.com/',
    env: ['DEEPSEEK_API_KEY'],
    npm: '@ai-sdk/openai-compatible',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    api: 'https://openrouter.ai/api/v1',
    doc: 'https://openrouter.ai/docs',
    env: ['OPENROUTER_API_KEY'],
    npm: '@ai-sdk/openai-compatible',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    api: 'https://opencode.ai/zen/v1',
    doc: 'https://opencode.ai/',
    env: ['OPENCODE_API_KEY'],
    npm: '@ai-sdk/openai-compatible',
  },
  {
    id: 'zhipuai',
    name: 'Zhipu AI',
    api: 'https://open.bigmodel.cn/api/paas/v4',
    doc: 'https://docs.z.ai/guides/overview/pricing',
    env: ['ZHIPU_API_KEY'],
    npm: '@ai-sdk/openai-compatible',
  },
];

export const STATIC_MODELS: Record<string, Record<string, Model>> = {
  openai: {
    'gpt-4o': {
      id: 'gpt-4o',
      name: 'GPT-4o',
      family: 'gpt-4o',
      attachment: true,
      reasoning: false,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2024-11',
      modalities: { input: ['text', 'image'], output: ['text'] },
      cost: { input: 5.0, output: 15.0 },
      limit: { context: 128000, output: 16384 },
    },
    'gpt-4o-mini': {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      family: 'gpt-4o',
      attachment: false,
      reasoning: false,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2024-11',
      modalities: { input: ['text', 'image'], output: ['text'] },
      cost: { input: 0.15, output: 0.6 },
      limit: { context: 128000, output: 16384 },
    },
    'o1': {
      id: 'o1',
      name: 'o1',
      family: 'o-series',
      attachment: false,
      reasoning: true,
      tool_call: true,
      structured_output: false,
      temperature: false,
      knowledge: '2024-12',
      modalities: { input: ['text'], output: ['text'] },
      cost: { input: 15.0, output: 60.0 },
      limit: { context: 200000, output: 100000 },
    },
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      family: 'claude-3-5',
      attachment: true,
      reasoning: false,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2024-10',
      modalities: { input: ['text', 'image'], output: ['text'] },
      cost: { input: 3.0, output: 15.0 },
      limit: { context: 200000, output: 8192 },
    },
    'claude-3-5-haiku-20241022': {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      family: 'claude-3-5',
      attachment: true,
      reasoning: false,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2024-10',
      modalities: { input: ['text', 'image'], output: ['text'] },
      cost: { input: 0.25, output: 1.25 },
      limit: { context: 200000, output: 8192 },
    },
    'claude-3-opus-20240229': {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      family: 'claude-3',
      attachment: true,
      reasoning: true,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2024-08',
      modalities: { input: ['text', 'image'], output: ['text'] },
      cost: { input: 15.0, output: 75.0 },
      limit: { context: 200000, output: 4096 },
    },
  },
  google: {
    'gemini-1.5-pro': {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      family: 'gemini-1.5',
      attachment: true,
      reasoning: true,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2024-09',
      modalities: { input: ['text', 'image', 'audio', 'video'], output: ['text'] },
      cost: { input: 1.25, output: 5.0 },
      limit: { context: 2000000, output: 8192 },
    },
    'gemini-1.5-flash': {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      family: 'gemini-1.5',
      attachment: true,
      reasoning: false,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2024-09',
      modalities: { input: ['text', 'image', 'audio', 'video'], output: ['text'] },
      cost: { input: 0.075, output: 0.3 },
      limit: { context: 1000000, output: 8192 },
    },
  },
  xai: {
    'grok-4-1-fast': {
      id: 'grok-4-1-fast',
      name: 'Grok 4.1 Fast',
      family: 'grok',
      attachment: true,
      reasoning: true,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2025-07',
      release_date: '2025-11-19',
      last_updated: '2025-11-19',
      modalities: { input: ['text', 'image'], output: ['text'] },
      open_weights: false,
      cost: { input: 0.2, output: 0.5, cache_read: 0.05 },
      limit: { context: 2000000, output: 30000 },
    },
    'grok-4-1-fast-non-reasoning': {
      id: 'grok-4-1-fast-non-reasoning',
      name: 'Grok 4.1 Fast (Non-Reasoning)',
      family: 'grok',
      attachment: true,
      reasoning: false,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2025-07',
      release_date: '2025-11-19',
      last_updated: '2025-11-19',
      modalities: { input: ['text', 'image'], output: ['text'] },
      open_weights: false,
      cost: { input: 0.2, output: 0.5, cache_read: 0.05 },
      limit: { context: 2000000, output: 30000 },
    },
    'grok-code-fast-1': {
      id: 'grok-code-fast-1',
      name: 'Grok Code Fast 1',
      family: 'grok',
      attachment: false,
      reasoning: true,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2023-10',
      release_date: '2025-08-28',
      last_updated: '2025-08-28',
      modalities: { input: ['text'], output: ['text'] },
      open_weights: false,
      cost: { input: 0.2, output: 0.5, cache_read: 0.05 },
      limit: { context: 2000000, output: 30000 },
    },
  },
  deepseek: {
    'deepseek-chat': {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      family: 'deepseek',
      attachment: false,
      reasoning: false,
      tool_call: true,
      structured_output: true,
      temperature: true,
      knowledge: '2024-11',
      modalities: { input: ['text'], output: ['text'] },
      cost: { input: 0.14, output: 0.28 },
      limit: { context: 131072, output: 8192 },
    },
  },
  openrouter: {
    'deepseek/deepseek-r1': {
      id: 'deepseek/deepseek-r1',
      name: 'DeepSeek R1 (OpenRouter)',
      family: 'deepseek-r1',
      attachment: false,
      reasoning: true,
      tool_call: false,
      structured_output: false,
      temperature: false,
      knowledge: '2024-12',
      modalities: { input: ['text'], output: ['text'] },
      cost: { input: 0.0, output: 0.0 },
      limit: { context: 131072, output: 8192 },
    },
  },
  opencode: {
    'gpt-5-nano': {
      id: 'gpt-5-nano',
      name: 'GPT-5 Nano',
      family: 'gpt-nano',
      attachment: true,
      reasoning: true,
      tool_call: true,
      structured_output: true,
      temperature: false,
      knowledge: '2024-05-30',
      release_date: '2025-08-07',
      last_updated: '2025-08-07',
      modalities: { input: ['text', 'image'], output: ['text'] },
      open_weights: false,
      cost: { input: 0, output: 0, cache_read: 0 },
      limit: { context: 400000, input: 272000, output: 128000 },
    },
    'big-pickle': {
      id: 'big-pickle',
      name: 'Big Pickle',
      family: 'big-pickle',
      attachment: false,
      reasoning: true,
      tool_call: true,
      temperature: true,
      knowledge: '2025-01',
      release_date: '2025-10-17',
      last_updated: '2025-10-17',
      modalities: { input: ['text'], output: ['text'] },
      open_weights: false,
      cost: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
      limit: { context: 200000, output: 128000 },
    },
    'glm-4.7-free': {
      id: 'glm-4.7-free',
      name: 'GLM-4.7',
      family: 'glm-free',
      attachment: false,
      reasoning: true,
      tool_call: true,
      interleaved: { field: 'reasoning_content' },
      temperature: true,
      knowledge: '2025-04',
      release_date: '2025-12-22',
      last_updated: '2025-12-22',
      modalities: { input: ['text'], output: ['text'] },
      open_weights: true,
      cost: { input: 0, output: 0, cache_read: 0 },
      limit: { context: 204800, output: 131072 },
    },
    'grok-code': {
      id: 'grok-code',
      name: 'Grok Code Fast 1',
      family: 'grok',
      attachment: true,
      reasoning: true,
      tool_call: true,
      temperature: true,
      release_date: '2025-08-20',
      last_updated: '2025-08-20',
      modalities: { input: ['text'], output: ['text'] },
      open_weights: false,
      cost: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
      limit: { context: 256000, output: 256000 },
    },
    'minimax-m2.1-free': {
      id: 'minimax-m2.1-free',
      name: 'MiniMax M2.1',
      family: 'minimax',
      attachment: false,
      reasoning: true,
      tool_call: true,
      temperature: true,
      knowledge: '2025-01',
      release_date: '2025-12-23',
      last_updated: '2025-12-23',
      modalities: { input: ['text'], output: ['text'] },
      open_weights: true,
      cost: { input: 0, output: 0, cache_read: 0 },
      limit: { context: 204800, output: 131072 },
      provider: { npm: '@ai-sdk/anthropic' },
    },
  },
  zhipuai: {
    'glm-4.6v-flash': {
      id: 'glm-4.6v-flash',
      name: 'GLM-4.6V-Flash',
      family: 'glm',
      attachment: true,
      reasoning: true,
      tool_call: true,
      temperature: true,
      knowledge: '2025-04',
      release_date: '2025-12-08',
      last_updated: '2025-12-08',
      modalities: {
        input: ['text', 'image', 'video'],
        output: ['text'],
      },
      open_weights: true,
      cost: { input: 0, output: 0 },
      limit: { context: 128000, output: 32768 },
    },
    'glm-4.7-flash': {
      id: 'glm-4.7-flash',
      name: 'GLM-4.7-Flash',
      family: 'glm-flash',
      attachment: false,
      reasoning: true,
      tool_call: true,
      temperature: true,
      knowledge: '2025-04',
      release_date: '2026-01-19',
      last_updated: '2026-01-19',
      modalities: {
        input: ['text'],
        output: ['text'],
      },
      open_weights: true,
      cost: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
      limit: { context: 200000, output: 131072 },
    },
  },
};

export const STATIC_CONFIG: Record<string, Provider> = Object.fromEntries(
  STATIC_PROVIDERS.map((provider) => [
    provider.id,
    {
      ...provider,
      models: STATIC_MODELS[provider.id] || {},
    },
  ])
);

export const DEFAULT_PROVIDER_SETTINGS: ProviderSettings = {
  openai: { apiKey: '', enabled: false },
  anthropic: { apiKey: '', enabled: false },
  google: { apiKey: '', enabled: false },
  xai: { apiKey: '', enabled: false },
  deepseek: { apiKey: '', enabled: false },
  openrouter: { apiKey: '', enabled: false },
  opencode: { apiKey: 'public', enabled: true },
  zhipuai: { apiKey: '', enabled: false },
};

export function getProvider(providerId: string): Provider | undefined {
  return STATIC_CONFIG[providerId];
}

export function getModel(providerId: string, modelId: string): Model | undefined {
  return STATIC_CONFIG[providerId]?.models[modelId];
}

export function isModelFree(model: Model): boolean {
  return (model.cost?.input ?? 0) === 0 && (model.cost?.output ?? 0) === 0;
}

export const PUBLIC_API_KEY = 'public';

export function isAllModelsFree(providerId: string): boolean {
  const models = STATIC_MODELS[providerId];
  if (!models) return false;
  return Object.values(models).every(isModelFree);
}

export function isModelAvailable(
  providerId: string,
  modelId: string,
  settings: ProviderSettings
): boolean {
  const providerSetting = settings[providerId];
  if (!providerSetting?.enabled) return false;

  const model = getModel(providerId, modelId);
  if (!model) return false;

  if (isModelFree(model)) return true;

  return Boolean(providerSetting.apiKey);
}

export function getEnabledProviders(settings: ProviderSettings): Provider[] {
  return STATIC_PROVIDERS.filter((p) => settings[p.id]?.enabled).map((p) => ({
    ...STATIC_CONFIG[p.id]!,
    apiKey: settings[p.id]!.apiKey,
    enabled: true,
  })) as Provider[];
}
