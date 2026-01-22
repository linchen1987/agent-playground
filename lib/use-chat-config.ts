import useLocalStorage from './use-local-storage';

type ThinkingSpeed = "disabled" | "fast" | "slow" | null;

interface ChatConfig {
  selectedModel: string;
  selectedProvider: string;
  thinkingSpeed: ThinkingSpeed;
  apiKey: string;
  baseUrl: string;
  providerName: string;
}

const DEFAULT_CONFIG: ChatConfig = {
  selectedModel: 'big-pickle',
  selectedProvider: 'opencode',
  thinkingSpeed: 'fast',
  apiKey: 'public',
  baseUrl: 'https://opencode.ai/zen/v1',
  providerName: 'opencode',
};

function useChatConfig() {
  const [selectedModel, setSelectedModel, removeSelectedModel] = useLocalStorage(
    '@aiplayground/selectedModel',
    DEFAULT_CONFIG.selectedModel
  );

  const [selectedProvider, setSelectedProvider, removeSelectedProvider] = useLocalStorage(
    '@aiplayground/selectedProvider',
    DEFAULT_CONFIG.selectedProvider
  );

  const [thinkingSpeed, setThinkingSpeed, removeThinkingSpeed] = useLocalStorage<ThinkingSpeed>(
    '@aiplayground/thinkingSpeed',
    DEFAULT_CONFIG.thinkingSpeed,
    {
      serializer: {
        read: (value: string) => value === 'null' ? null : (value as ThinkingSpeed),
        write: (value: ThinkingSpeed) => value === null ? 'null' : value,
      }
    }
  );

  const [apiKey, setApiKey, removeApiKey] = useLocalStorage(
    '@aiplayground/apiKey',
    DEFAULT_CONFIG.apiKey
  );

  const [baseUrl, setBaseUrl, removeBaseUrl] = useLocalStorage(
    '@aiplayground/baseUrl',
    DEFAULT_CONFIG.baseUrl
  );

  const [providerName, setProviderName, removeProviderName] = useLocalStorage(
    '@aiplayground/providerName',
    DEFAULT_CONFIG.providerName
  );

  const resetConfig = () => {
    removeSelectedModel();
    removeSelectedProvider();
    removeThinkingSpeed();
    removeApiKey();
    removeBaseUrl();
    removeProviderName();
  };

  return {
    selectedModel,
    setSelectedModel,
    selectedProvider,
    setSelectedProvider,
    thinkingSpeed,
    setThinkingSpeed,
    apiKey,
    setApiKey,
    baseUrl,
    setBaseUrl,
    providerName,
    setProviderName,
    resetConfig,
  };
}

export default useChatConfig;