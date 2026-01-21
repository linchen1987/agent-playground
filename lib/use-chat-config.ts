import useLocalStorage from './use-local-storage';

type ThinkingSpeed = "disabled" | "fast" | "slow" | null;

interface ChatConfig {
  selectedModel: string;
  thinkingSpeed: ThinkingSpeed;
}

const DEFAULT_CONFIG: ChatConfig = {
  selectedModel: 'big-pickle',
  thinkingSpeed: 'fast',
};

function useChatConfig() {
  const [selectedModel, setSelectedModel, removeSelectedModel] = useLocalStorage(
    '@aiplayground/selectedModel',
    DEFAULT_CONFIG.selectedModel
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

  const resetConfig = () => {
    removeSelectedModel();
    removeThinkingSpeed();
  };

  return {
    selectedModel,
    setSelectedModel,
    thinkingSpeed,
    setThinkingSpeed,
    resetConfig,
  };
}

export default useChatConfig;