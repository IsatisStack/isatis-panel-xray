export function generateVlessURL(config, serverInfo) {
    const params = new URLSearchParams({
        type: 'ws',
        host: config.host || serverInfo.domain,
        path: config.path || '/ws',
        security: 'tls',
        sni: config.sni || serverInfo.domain,
        fp: config.fingerprint || 'chrome'
    });
    if (config.http_version && config.http_version !== 'auto') {
        params.set('alpn', config.http_version);
    }
    const port = serverInfo.port || '443';
    const tag = encodeURIComponent(config.remark || 'vless');
    return `vless://${config.uuid}@${serverInfo.domain}:${port}?${params.toString()}#${tag}`;
}
export function generateVlessJSON(config, serverInfo) {
    return {
        v: '2',
        ps: config.remark || 'vless',
        add: serverInfo.domain,
        port: serverInfo.port || 443,
        id: config.uuid,
        aid: '0',
        scy: 'auto',
        net: 'ws',
        type: 'none',
        host: config.host || serverInfo.domain,
        path: config.path || '/ws',
        tls: 'tls',
        sni: config.sni || serverInfo.domain,
        fp: config.fingerprint || 'chrome',
        alpn: config.http_version || ''
    };
}
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    }
    catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}
export function formatDate(date) {
    return new Date(date).toLocaleString();
}
export function formatUptime(seconds) {
    const secs = typeof seconds === 'string' ? parseInt(seconds, 10) || 0 : seconds;
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0)
        parts.push(`${minutes}m`);
    return parts.join(' ');
}
