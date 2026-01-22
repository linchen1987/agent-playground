import useLocalStorage from './use-local-storage';
import { STORAGE_KEYS } from './storage-keys';
import {
  DEFAULT_PROVIDER_SETTINGS,
  STATIC_PROVIDERS,
  type ProviderSettings,
} from './static-config';

interface ProviderSettingsHook {
  settings: ProviderSettings;
  updateProviderSetting: (
    providerId: string,
    apiKey: string,
    enabled: boolean
  ) => void;
  getProviderSetting: (providerId: string) => { apiKey: string; enabled: boolean };
  getEnabledProviders: () => Array<{ id: string; apiKey: string; enabled: boolean }>;
  resetSettings: () => void;
}

function useProviderSettings(): ProviderSettingsHook {
  const [settings, setSettings] = useLocalStorage<ProviderSettings>(
    STORAGE_KEYS.providerSettings,
    DEFAULT_PROVIDER_SETTINGS
  );

  const updateProviderSetting = (
    providerId: string,
    apiKey: string,
    enabled: boolean
  ) => {
    setSettings((prev: ProviderSettings) => ({
      ...prev,
      [providerId]: { apiKey, enabled },
    }));
  };

  const getProviderSetting = (providerId: string) => {
    return settings[providerId] || { apiKey: '', enabled: false };
  };

  const getEnabledProviders = () => {
    return STATIC_PROVIDERS.filter(
      (provider) => settings[provider.id]?.enabled
    ).map((provider) => ({
      id: provider.id,
      apiKey: settings[provider.id]?.apiKey || '',
      enabled: true,
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_PROVIDER_SETTINGS);
  };

  return {
    settings,
    updateProviderSetting,
    getProviderSetting,
    getEnabledProviders,
    resetSettings,
  };
}

export default useProviderSettings;

export { STATIC_PROVIDERS };
