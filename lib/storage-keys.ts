export const STORAGE_KEYS = {
  sidebarCollapsed: '@aiplayground/sidebarCollapsed',
  agentProjects: '@aiplayground/agentProjects',
  providerSettings: '@aiplayground/providerSettings',
  selectedProviderId: '@aiplayground/selectedProviderId',
  selectedModelId: '@aiplayground/selectedModelId',
  thinkingSpeed: '@aiplayground/thinkingSpeed',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
