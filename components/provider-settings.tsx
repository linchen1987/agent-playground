'use client';

import { Input } from '@/components/ui/input';
import { Lock, Unlock, ExternalLink } from 'lucide-react';
import useProviderSettings from '@/lib/use-provider-settings';
import { STATIC_PROVIDERS, STATIC_CONFIG, isModelFree, isAllModelsFree, PUBLIC_API_KEY } from '@/lib/static-config';

export function ProviderSettings() {
  const { settings, updateProviderSetting, getProviderSetting } = useProviderSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Provider Settings</h2>
        <span className="text-sm text-muted-foreground">
          {Object.values(settings).filter((s) => s.enabled).length} of{' '}
          {STATIC_PROVIDERS.length} providers enabled
        </span>
      </div>

      <div className="grid gap-4">
        {STATIC_PROVIDERS.map((provider) => {
          const setting = getProviderSetting(provider.id);
          const providerConfig = STATIC_CONFIG[provider.id];
          const hasAllFreeModels = providerConfig
            ? isAllModelsFree(provider.id)
            : false;
          const hasFreeModels = providerConfig
            ? Object.values(providerConfig.models).some(isModelFree)
            : false;

          return (
            <div
              key={provider.id}
              className="p-4 border rounded-lg bg-card"
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{provider.name}</span>
                  {setting.enabled ? (
                    <Unlock className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    onChange={(e) =>
                      updateProviderSetting(
                        provider.id,
                        setting.apiKey,
                        e.target.checked
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Enabled</span>
                </label>
              </div>

              <div className="space-y-3 mt-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {provider.api}
                  </span>
                  {provider.doc && (
                    <a
                      href={provider.doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Docs
                    </a>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    type="password"
                    value={setting.apiKey}
                    onChange={(e) =>
                      updateProviderSetting(
                        provider.id,
                        e.target.value,
                        setting.enabled
                      )
                    }
                    placeholder={
                      hasAllFreeModels
                        ? `Uses '${PUBLIC_API_KEY}' key for free models`
                        : `Enter ${provider.name} API key...`
                    }
                    disabled={!setting.enabled || hasAllFreeModels}
                  />
                  {hasAllFreeModels && (
                    <p className="text-xs text-green-600">
                      All models are free - API key not required
                    </p>
                  )}
                  {!hasAllFreeModels && setting.enabled && !setting.apiKey && (
                    <p className="text-xs text-amber-600">
                      API key is required for paid models
                    </p>
                  )}
                </div>

                {providerConfig && Object.keys(providerConfig.models).length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Available Models</label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(providerConfig.models)
                        .slice(0, 5)
                        .map((model) => {
                          const free = isModelFree(model);
                          return (
                            <span
                              key={model.id}
                              className={`px-2 py-0.5 text-xs rounded ${
                                free
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-secondary text-secondary-foreground'
                              }`}
                            >
                              {model.name}
                            </span>
                          );
                        })}
                      {Object.keys(providerConfig.models).length > 5 && (
                        <span className="px-2 py-0.5 text-xs text-muted-foreground">
                          +{Object.keys(providerConfig.models).length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
