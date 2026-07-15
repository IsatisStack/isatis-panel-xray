import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
export function Toast() {
    const [toastList, setToastList] = useState([]);
    if (toastList.length === 0)
        return null;
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 flex flex-col gap-2", children: toastList.map((toast, idx) => (_jsxs("div", { className: "flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg shadow-lg text-sm transition-all", children: [_jsx("span", { className: `font-medium ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`, children: toast.message }), _jsx("button", { onClick: () => setToastList((prev) => prev.filter((_, i) => i !== idx)), className: "ml-2 text-gray-400 hover:text-white", "aria-label": "Dismiss", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, idx))) }));
}
