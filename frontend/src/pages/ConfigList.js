import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getConfigs, deleteConfig, getStatus } from '../utils/api';
import ConfigCard from '../components/ConfigCard';
import { LoadingGrid } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
export default function ConfigList() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [serverInfo, setServerInfo] = useState({
        running: false,
        domain: '---',
        port: '---',
        config_count: 0,
        uptime: '0',
        ram_usage: '0%',
        cpu_usage: '0%',
        xray_version: '---',
    });
    const fetchData = async () => {
        try {
            setLoading(true);
            const [configsData, statusData] = await Promise.all([getConfigs(), getStatus()]);
            setConfigs(configsData);
            setServerInfo(statusData);
            setError(null);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load data';
            setError(message);
            setConfigs([]);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this configuration?'))
            return;
        try {
            await deleteConfig(id);
            toast.success('Configuration deleted');
            fetchData();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    };
    const filteredConfigs = configs.filter((config) => config.remark.toLowerCase().includes(search.toLowerCase()) ||
        config.uuid.toLowerCase().includes(search.toLowerCase()) ||
        config.fingerprint.toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-1", children: "Configurations" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Manage your VLESS configurations" })] }), _jsxs(Link, { to: "/create", className: "flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto justify-center", children: [_jsx(Plus, { size: 18 }), _jsx("span", { children: "New Config" })] })] }), _jsxs("div", { className: "relative mb-6", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400", size: 18 }), _jsx("input", { type: "text", placeholder: "Search by remark, UUID, fingerprint...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-transparent transition-all" })] }), loading && _jsx(LoadingGrid, { count: 3 }), error && !loading && (_jsxs("div", { className: "text-center py-12", children: [_jsxs("p", { className: "text-gray-400 mb-4", children: ["Error loading configurations: ", error] }), _jsx("button", { onClick: fetchData, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm", children: "Retry" })] })), !loading && !error && filteredConfigs.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4", children: _jsx(Plus, { size: 32, className: "text-gray-500" }) }), _jsx("h3", { className: "text-white text-lg font-medium mb-2", children: "No configurations found" }), _jsx("p", { className: "text-gray-400 text-sm mb-6", children: "Create your first VLESS configuration" }), _jsx(Link, { to: "/create", className: "px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors", children: "Create Configuration" })] })), !loading && !error && filteredConfigs.length > 0 && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredConfigs.map((config) => (_jsx(ConfigCard, { config: config, serverInfo: serverInfo, onEdit: (c) => console.log('Edit:', c), onDelete: handleDelete }, config.id))) }))] }));
}
