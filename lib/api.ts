export interface ModelCost {
    input: number;
    output: number;
    reasoning?: number;
    cache_read?: number;
    cache_write?: number;
    input_audio?: number;
    output_audio?: number;
}

export interface ModelLimit {
    context: number;
    output: number;
}

export interface ModelModalities {
    input: string[];
    output: string[];
}

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
    modalities: ModelModalities;
    open_weights?: boolean;
    cost?: ModelCost;
    limit?: ModelLimit;
    interleaved?: boolean | { field: string };
}

export interface Provider {
    id: string;
    name: string;
    api: string;
    doc?: string;
    env?: string[];
    npm?: string;
    models: Record<string, Model>;
}

export type ModelsResponse = Record<string, Provider>;

export async function getModels(): Promise<ModelsResponse> {
    const res = await fetch('/api/models');
    if (!res.ok) {
        throw new Error('Failed to fetch models');
    }
    return res.json();
}

export async function getFreeModels(): Promise<ModelsResponse> {
    const models = await getModels();
    const freeModels: ModelsResponse = {};

    for (const [providerId, provider] of Object.entries(models)) {
        const filteredModels: Record<string, Model> = {};

        for (const [modelId, model] of Object.entries(provider.models)) {
            const inputCost = model.cost?.input ?? 0;
            const outputCost = model.cost?.output ?? 0;

            if (inputCost === 0 && outputCost === 0) {
                filteredModels[modelId] = model;
            }
        }

        if (Object.keys(filteredModels).length > 0) {
            freeModels[providerId] = {
                ...provider,
                models: filteredModels
            };
        }
    }

    return freeModels;
}
