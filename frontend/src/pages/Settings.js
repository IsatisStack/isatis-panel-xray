import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Download, Trash2, Globe, Bell } from 'lucide-react';
import { getStatus, reloadXray } from '../utils/api';
import toast from 'react-hot-toast';
export default function Settings() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reloading, setReloading] = useState(false);
    useEffect(() => {
        async function load() {
            try {
                const s = await getStatus();
                setStatus(s);
            }
            catch {
                // ignore
            }
            finally {
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
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to reload Xray');
        }
        finally {
            setReloading(false);
        }
    }
    async function handleExport() {
        try {
            const res = await fetch('/api/configs');
            if (!res.ok)
                throw new Error('Failed to fetch configs');
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'railway-vless-configs.json';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Configs exported');
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : 'Export failed');
        }
    }
    async function handleFlushAll() {
        if (!window.confirm('This will delete ALL configurations. Are you sure?'))
            return;
        if (!window.confirm('Cannot be undone. Continue?'))
            return;
        try {
            const res = await fetch('/api/configs');
            if (!res.ok)
                throw new Error('Failed to fetch configs');
            const configs = await res.json();
            for (const config of configs) {
                await fetch(`/api/configs/${config.id}`, { method: 'DELETE' });
            }
            toast.success('All configs flushed');
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : 'Flush failed');
        }
    }
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsx(Loader2, { size: 32, className: "text-blue-400 animate-spin" }) }));
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-1", children: "Settings" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Manage your panel configuration" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 rounded-xl bg-blue-500/10", children: _jsx(Globe, { size: 20, className: "text-blue-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-white", children: "General" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-white/5", children: [_jsx("span", { className: "text-gray-400 text-sm", children: "Railway Domain" }), _jsx("span", { className: "text-white text-sm font-mono", children: status?.domain || '---' })] }), _jsxs("div", { className: "flex justify-between items-center py-2 border-b border-white/5", children: [_jsx("span", { className: "text-gray-400 text-sm", children: "Port" }), _jsx("span", { className: "text-white text-sm font-mono", children: status?.port || '---' })] }), _jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsx("span", { className: "text-gray-400 text-sm", children: "Xray Version" }), _jsx("span", { className: "text-white text-sm font-mono", children: status?.xray_version || '---' })] })] })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 rounded-xl bg-amber-500/10", children: _jsx(Bell, { size: 20, className: "text-amber-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-white", children: "Actions" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: handleReload, disabled: reloading, className: "w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(RefreshCw, { size: 18, className: `text-blue-400 ${reloading ? 'animate-spin' : ''}` }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-white text-sm font-medium", children: "Reload Xray" }), _jsx("p", { className: "text-gray-500 text-xs", children: "Apply changes without restart" })] })] }), _jsx("span", { className: "text-gray-400 text-sm", children: reloading ? 'Reloading...' : 'Reload' })] }), _jsxs("button", { onClick: handleExport, className: "w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Download, { size: 18, className: "text-emerald-400" }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-white text-sm font-medium", children: "Export Configs" }), _jsx("p", { className: "text-gray-500 text-xs", children: "Download all configs as JSON" })] })] }), _jsx("span", { className: "text-gray-400 text-sm", children: "Export" })] })] })] }), _jsxs("div", { className: "bg-rose-500/5 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 rounded-xl bg-rose-500/10", children: _jsx(Trash2, { size: 20, className: "text-rose-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-rose-300", children: "Danger Zone" })] }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: "Irreversible actions. Proceed with caution." }), _jsx("button", { onClick: handleFlushAll, className: "w-full py-3 rounded-xl bg-rose-600/10 border border-rose-500/30 text-rose-300 hover:bg-rose-600/20 font-medium transition-colors", children: "Flush All Configurations" })] })] })] }));
}
