import { Config, CreateConfigRequest, ServerStatus } from '../types';

const BASE_URL = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getStatus(): Promise<ServerStatus> {
  return request<ServerStatus>('/api/status');
}

export async function getConfigs(): Promise<Config[]> {
  return request<Config[]>('/api/configs');
}

export async function getConfig(id: number): Promise<Config> {
  return request<Config>(`/api/configs/${id}`);
}

export async function createConfig(data: CreateConfigRequest): Promise<Config> {
  return request<Config>('/api/configs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateConfig(id: number, data: Partial<CreateConfigRequest>): Promise<Config> {
  return request<Config>(`/api/configs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteConfig(id: number): Promise<void> {
  await request<void>(`/api/configs/${id}`, { method: 'DELETE' });
}

export async function reloadXray(): Promise<{ message: string }> {
  return request<{ message: string }>('/api/xray/reload', { method: 'POST' });
}

export async function getVersion(): Promise<{ version: string }> {
  return request<{ version: string }>('/api/version');
}