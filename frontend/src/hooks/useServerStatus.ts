import { useState, useEffect } from 'react';
import { getStatus } from '../utils/api';
import { ServerStatus } from '../types';

const DEFAULT_STATUS: ServerStatus = {
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
  const [status, setStatus] = useState<ServerStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    try {
      const data = await getStatus();
      setStatus(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch status';
      setError(message);
      setStatus(DEFAULT_STATUS);
    } finally {
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