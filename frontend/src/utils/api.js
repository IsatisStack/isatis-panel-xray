const BASE_URL = '';
async function request(path, options) {
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
export async function getStatus() {
    return request('/api/status');
}
export async function getConfigs() {
    return request('/api/configs');
}
export async function getConfig(id) {
    return request(`/api/configs/${id}`);
}
export async function createConfig(data) {
    return request('/api/configs', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
export async function updateConfig(id, data) {
    return request(`/api/configs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}
export async function deleteConfig(id) {
    await request(`/api/configs/${id}`, { method: 'DELETE' });
}
export async function reloadXray() {
    return request('/api/xray/reload', { method: 'POST' });
}
export async function getVersion() {
    return request('/api/version');
}
