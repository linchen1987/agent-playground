'use client';

import { useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, AlertCircle, Brain, Wrench, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';
import useProviderSettings from '@/lib/use-provider-settings';
import { STATIC_CONFIG, isModelFree } from '@/lib/static-config';
import type { Model } from '@/lib/types';

interface ModelSelectItem {
  providerId: string;
  providerName: string;
  modelId: string;
  modelName: string;
  model: Model;
  disabled: boolean;
  disabledReason?: string;
}

interface ProviderModelSelectProps {
  selectedProviderId: string | null;
  selectedModelId: string | null;
  onChange: (providerId: string, modelId: string) => void;
}

export function ProviderModelSelect({
  selectedProviderId,
  selectedModelId,
  onChange,
}: ProviderModelSelectProps) {
  const { settings } = useProviderSettings();

  const availableModels = useMemo((): ModelSelectItem[] => {
    const items: ModelSelectItem[] = [];

    for (const [providerId, provider] of Object.entries(STATIC_CONFIG)) {
      if (!settings[providerId]?.enabled) continue;

      const providerSetting = settings[providerId];
      const hasApiKey = Boolean(providerSetting.apiKey);

      for (const [modelId, model] of Object.entries(provider.models)) {
        const free = isModelFree(model);
        const disabled = !free && !hasApiKey;
        items.push({
          providerId,
          providerName: provider.name,
          modelId,
          modelName: model.name,
          model,
          disabled,
          disabledReason: disabled ? 'API key required' : undefined,
        });
      }
    }

    return items;
  }, [settings]);

  const selectedItem = useMemo((): ModelSelectItem | null => {
    if (!selectedProviderId || !selectedModelId) return null;
    const provider = STATIC_CONFIG[selectedProviderId];
    const model = provider?.models[selectedModelId];
    if (!model) return null;
    const providerSetting = settings[selectedProviderId];
    const hasApiKey = Boolean(providerSetting?.apiKey);
    const free = isModelFree(model);
    return {
      providerId: selectedProviderId,
      providerName: provider.name,
      modelId: selectedModelId,
      modelName: model.name,
      model,
      disabled: !free && !hasApiKey,
    };
  }, [selectedProviderId, selectedModelId, settings]);

  const selectedValue = selectedProviderId && selectedModelId
    ? `${selectedProviderId}/${selectedModelId}`
    : '';

  const handleValueChange = (providerId: string, modelId: string) => {
    onChange(providerId, modelId);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Model</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              {selectedItem
                ? `${selectedItem.providerName} / ${selectedItem.modelName}`
                : 'Select a model...'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full max-h-80 overflow-y-auto">
            {availableModels.map((item) => (
              <DropdownMenuItem
                key={`${item.providerId}/${item.modelId}`}
                onClick={() => !item.disabled && handleValueChange(item.providerId, item.modelId)}
                disabled={item.disabled}
                className={cn(
                  "cursor-pointer",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedValue === `${item.providerId}/${item.modelId}`
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
                <span className="text-muted-foreground">{item.providerName}</span>
                <span className="mx-1">/</span>
                <span>{item.modelName}</span>
                {isModelFree(item.model) && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    Free
                  </span>
                )}
                {item.disabled && item.disabledReason && (
                  <span className="ml-auto text-xs text-amber-600">
                    {item.disabledReason}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            {availableModels.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No models available. Please configure providers first.
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedItem && (
        <ModelInfo model={selectedItem.model} />
      )}

      {!selectedItem && (
        <div className="flex items-center gap-2 text-amber-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Please select a model to continue</span>
        </div>
      )}
    </div>
  );
}

function ModelInfo({ model }: { model: Model }) {
  const free = isModelFree(model);

  return (
    <div className="p-3 bg-secondary/50 rounded-lg space-y-2 text-sm">
      <div className="font-medium">{model.name}</div>
      <div className="flex flex-wrap gap-1.5">
        {model.reasoning && (
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1">
            <Brain className="h-3 w-3" />
            Reasoning
          </span>
        )}
        {model.tool_call && (
          <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs flex items-center gap-1">
            <Wrench className="h-3 w-3" />
            Tools
          </span>
        )}
        {model.structured_output && (
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-xs flex items-center gap-1">
            <FileJson className="h-3 w-3" />
            Structured
          </span>
        )}
        {free && (
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">
            Free
          </span>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        Context: {model.limit?.context.toLocaleString() || 'N/A'} tokens
        {model.limit?.output &&
          ` • Output: ${model.limit.output.toLocaleString()} tokens`}
      </div>
      {model.knowledge && (
        <div className="text-xs text-muted-foreground">
          Knowledge: {model.knowledge}
        </div>
      )}
    </div>
  );
}
