import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function LoadingSkeleton({ className = '' }) {
    return _jsx("div", { className: `animate-pulse bg-white/5 rounded ${className}` });
}
export function LoadingCard() {
    return (_jsxs("div", { className: "animate-pulse bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(LoadingSkeleton, { className: "w-12 h-12 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(LoadingSkeleton, { className: "h-4 w-3/4 rounded" }), _jsx(LoadingSkeleton, { className: "h-4 w-1/2 rounded" })] })] }), _jsx(LoadingSkeleton, { className: "h-8 w-full rounded" })] }));
}
export function LoadingGrid({ count = 3 }) {
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: Array.from({ length: count }).map((_, i) => (_jsx(LoadingCard, {}, i))) }));
}
