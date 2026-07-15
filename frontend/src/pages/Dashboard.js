import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useServerStatus } from '../hooks/useServerStatus';
import StatusCard from '../components/StatusCard';
import { Activity, Globe, Cpu, HardDrive, Clock, Zap, Radio, Hash, } from 'lucide-react';
export default function Dashboard() {
    const { status, loading, error, refetch } = useServerStatus();
    const cards = [
        {
            title: 'Server Status',
            value: status.running ? 'Online' : 'Offline',
            icon: Radio,
            accent: 'emerald',
        },
        {
            title: 'Railway Domain',
            value: status.domain,
            icon: Globe,
            accent: 'blue',
            subtext: status.domain !== '---' ? `port ${status.port}` : undefined,
        },
        {
            title: 'Xray Version',
            value: status.xray_version,
            icon: Zap,
            accent: 'blue',
        },
        {
            title: 'Config Count',
            value: status.config_count,
            icon: Hash,
            accent: 'amber',
            subtext: 'active configurations',
        },
        {
            title: 'Uptime',
            value: status.uptime,
            icon: Clock,
            accent: 'emerald',
            subtext: 'since last restart',
        },
        {
            title: 'RAM Usage',
            value: status.ram_usage,
            icon: HardDrive,
            accent: 'rose',
            subtext: 'system memory',
        },
        {
            title: 'CPU Usage',
            value: status.cpu_usage,
            icon: Cpu,
            accent: 'rose',
            subtext: 'processing power',
        },
        {
            title: 'Port',
            value: status.port,
            icon: Activity,
            accent: 'blue',
            subtext: 'listening port',
        },
    ];
    if (error) {
        return (_jsx("div", { className: "flex flex-col items-center justify-center min-h-[60vh] text-center", children: _jsxs("div", { className: "bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 max-w-md", children: [_jsx(Activity, { size: 40, className: "text-rose-400 mx-auto mb-4" }), _jsx("h2", { className: "text-white text-lg font-semibold mb-2", children: "Connection Error" }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: error }), _jsx("button", { onClick: refetch, className: "px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors", children: "Retry Connection" })] }) }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-1", children: "Dashboard" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Server status and overview" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: cards.map((card, index) => (_jsx(StatusCard, { title: card.title, value: card.value, icon: card.icon, accent: card.accent, loading: loading, subtext: card.subtext }, card.title))) })] }));
}
