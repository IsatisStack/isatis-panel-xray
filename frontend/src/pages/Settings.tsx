import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Download, Trash2, Globe, Bell } from 'lucide-react';
import { getStatus, reloadXray } from '../utils/api';
import { ServerStatus } from '../types';
import toast from 'react-hot-toast';

export default function Settings() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await getStatus();
        setStatus(s);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleReload() {
    setReloading(true);
    try {
      await reloadXray();
      toast.success('Xray reloaded successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reload Xray');
    } finally {
      setReloading(false);
    }
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/configs');
      if (!res.ok) throw new Error('Failed to fetch configs');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'railway-vless-configs.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Configs exported');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    }
  }

  async function handleFlushAll() {
    if (!window.confirm('This will delete ALL configurations. Are you sure?')) return;
    if (!window.confirm('Cannot be undone. Continue?')) return;
    try {
      const res = await fetch('/api/configs');
      if (!res.ok) throw new Error('Failed to fetch configs');
      const configs = await res.json();
      for (const config of configs) {
        await fetch(`/api/configs/${config.id}`, { method: 'DELETE' });
      }
      toast.success('All configs flushed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Flush failed');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your panel configuration</p>
      </div>

      <div className="space-y-4">
        {/* General Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Globe size={20} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">General</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Railway Domain</span>
              <span className="text-white text-sm font-mono">{status?.domain || '---'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Port</span>
              <span className="text-white text-sm font-mono">{status?.port || '---'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-sm">Xray Version</span>
              <span className="text-white text-sm font-mono">{status?.xray_version || '---'}</span>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Bell size={20} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Actions</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleReload}
              disabled={reloading}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className={`text-blue-400 ${reloading ? 'animate-spin' : ''}`} />
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Reload Xray</p>
                  <p className="text-gray-500 text-xs">Apply changes without restart</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">{reloading ? 'Reloading...' : 'Reload'}</span>
            </button>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={18} className="text-emerald-400" />
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Export Configs</p>
                  <p className="text-gray-500 text-xs">Download all configs as JSON</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-500/5 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-rose-500/10">
              <Trash2 size={20} className="text-rose-400" />
            </div>
            <h2 className="text-lg font-semibold text-rose-300">Danger Zone</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Irreversible actions. Proceed with caution.
          </p>
          <button
            onClick={handleFlushAll}
            className="w-full py-3 rounded-xl bg-rose-600/10 border border-rose-500/30 text-rose-300 hover:bg-rose-600/20 font-medium transition-colors"
          >
            Flush All Configurations
          </button>
        </div>
      </div>
    </div>
  );
}