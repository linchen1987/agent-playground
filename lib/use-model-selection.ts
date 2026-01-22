import useLocalStorage from './use-local-storage';
import { STORAGE_KEYS } from './storage-keys';

interface ModelSelectionHook {
  selectedProviderId: string | null;
  selectedModelId: string | null;
  setSelectedProviderId: (providerId: string | null) => void;
  setSelectedModelId: (modelId: string | null) => void;
  clearSelection: () => void;
  getSelection: () => { providerId: string | null; modelId: string | null };
}

function useModelSelection(): ModelSelectionHook {
  const [selectedProviderId, setSelectedProviderId, removeProviderId] =
    useLocalStorage<string | null>(STORAGE_KEYS.selectedProviderId, null);

  const [selectedModelId, setSelectedModelId, removeModelId] =
    useLocalStorage<string | null>(STORAGE_KEYS.selectedModelId, null);

  const clearSelection = () => {
    removeProviderId();
    removeModelId();
  };

  const getSelection = () => ({
    providerId: selectedProviderId,
    modelId: selectedModelId,
  });

  return {
    selectedProviderId,
    selectedModelId,
    setSelectedProviderId,
    setSelectedModelId,
    clearSelection,
    getSelection,
  };
}

export default useModelSelection;
