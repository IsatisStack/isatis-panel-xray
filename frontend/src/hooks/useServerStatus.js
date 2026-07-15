import { useState, useEffect } from 'react';
import { getStatus } from '../utils/api';
const DEFAULT_STATUS = {
    running: false,
    domain: '---',
    port: '---',
    config_count: 0,
    uptime: '0',
    ram_usage: '0%',
    cpu_usage: '0%',
    xray_version: '---',
};
export function useServerStatus(pollInterval = 5000) {
    const [status, setStatus] = useState(DEFAULT_STATUS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    async function fetchStatus() {
        try {
            const data = await getStatus();
            setStatus(data);
            setError(null);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch status';
            setError(message);
            setStatus(DEFAULT_STATUS);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, pollInterval);
        return () => clearInterval(interval);
    }, [pollInterval]);
    return { status, loading, error, refetch: fetchStatus };
}
