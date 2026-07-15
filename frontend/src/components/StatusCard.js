import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function StatusCard({ title, value, icon: Icon, loading = false, accent = 'blue', subtext, }) {
    const accentColors = {
        blue: 'text-blue-400 bg-blue-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
        amber: 'text-amber-400 bg-amber-500/10',
        rose: 'text-rose-400 bg-rose-500/10',
    };
    const accentClass = accentColors[accent];
    if (loading) {
        return (_jsxs("div", { className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-pulse", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("div", { className: "h-4 w-24 bg-white/10 rounded" }), _jsx("div", { className: "h-10 w-10 rounded-xl bg-white/5" })] }), _jsx("div", { className: "h-8 w-32 bg-white/10 rounded" }), subtext && _jsx("div", { className: "mt-2 h-3 w-20 bg-white/5 rounded" })] }));
    }
    return (_jsx("div", { className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 animate-slide-up", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm font-medium mb-1", children: title }), _jsx("p", { className: "text-white text-2xl font-semibold tabular-nums", children: value }), subtext && _jsx("p", { className: "text-gray-500 text-xs mt-1", children: subtext })] }), _jsx("div", { className: `p-3 rounded-xl ${accentClass}`, children: _jsx(Icon, { size: 22 }) })] }) }));
}
