import useLocalStorage from './use-local-storage';

// Provider interface - 数据结构从 /api/models 获取
export interface ProviderConfig {
  id: string;           // provider ID，如 "xai", "deepseek", "openrouter", "openai", "google", "opencode"
  name: string;         // provider 显示名称，如 "xAI", "DeepSeek", "OpenRouter", "OpenAI", "Google", "OpenCode"
  api: string;          // provider API URL，如 "https://api.x.ai/v1"
  doc?: string;         // provider 文档链接
  env?: string[];       // 环境变量名
  npm?: string;         // npm 包名
  models: Record<string, Model>;  // 模型列表
}

// Model interface - 数据结构从 /api/models 获取  
export interface Model {
  id: string;
  name: string;
  family?: string;
  attachment?: boolean;
  reasoning?: boolean;
  tool_call?: boolean;
  structured_output?: boolean;
  temperature?: boolean;
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
  modalities: {
    input: string[];
    output: string[];
  };
  open_weights?: boolean;
  cost?: {
    input: number;
    output: number;
    reasoning?: number;
    cache_read?: number;
    cache_write?: number;
    input_audio?: number;
    output_audio?: number;
  };
  limit?: {
    context: number;
    output: number;
  };
  interleaved?: boolean | { field: string };
}

// 用户配置的 provider settings
interface ProviderSettings {
  [providerId: string]: {
    apiKey: string;
    enabled: boolean;
  };
}

const DEFAULT_SETTINGS: ProviderSettings = {
  xai: { apiKey: '', enabled: false },
  deepseek: { apiKey: '', enabled: false },
  openrouter: { apiKey: '', enabled: false },
  openai: { apiKey: '', enabled: false },
  google: { apiKey: '', enabled: false },
  opencode: { apiKey: 'public', enabled: true }, // opencode 默认启用，使用 public key
};

// 写死的 provider 配置 - name 和 baseURL 固定，无需用户配置
export const STATIC_PROVIDERS: Omit<ProviderConfig, 'models'>[] = [
  {
    id: 'xai',
    name: 'xAI',
    api: 'https://api.x.ai/v1',
    doc: 'https://docs.x.ai/',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    api: 'https://api.deepseek.com/v1',
    doc: 'https://platform.deepseek.com/',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    api: 'https://openrouter.ai/api/v1',
    doc: 'https://openrouter.ai/docs',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    api: 'https://api.openai.com/v1',
    doc: 'https://platform.openai.com/docs',
  },
  {
    id: 'google',
    name: 'Google',
    api: 'https://generativelanguage.googleapis.com/v1beta',
    doc: 'https://ai.google.dev/docs',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    api: 'https://opencode.ai/zen/v1',
    doc: 'https://opencode.ai/',
  },
];

function useProviderSettings() {
  const [settings, setSettings] = useLocalStorage<ProviderSettings>(
    '@aiplayground/providerSettings',
    DEFAULT_SETTINGS
  );

  const updateProviderSetting = (providerId: string, apiKey: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [providerId]: { apiKey, enabled }
    }));
  };

  const getProviderSetting = (providerId: string) => {
    return settings[providerId] || { apiKey: '', enabled: false };
  };

  const getEnabledProviders = () => {
    return Object.entries(settings)
      .filter(([_, config]) => config.enabled)
      .map(([id, config]) => ({ id, ...config }));
  };

  return {
    settings,
    setSettings,
    updateProviderSetting,
    getProviderSetting,
    getEnabledProviders,
  };
}

export default useProviderSettings;