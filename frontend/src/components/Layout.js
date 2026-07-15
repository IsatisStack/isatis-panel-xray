import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Settings, Plus, List, Info, Menu, Radio, } from 'lucide-react';
const NAV_ITEMS = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/configs', label: 'Configs', icon: List },
    { to: '/create', label: 'Create', icon: Plus },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/about', label: 'About', icon: Info },
];
function NavLinkItem({ to, label, icon: Icon }) {
    return (_jsxs(NavLink, { to: to, className: ({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
            : 'text-gray-400 hover:text-white hover:bg-white/5'}`, children: [_jsx(Icon, { size: 18 }), _jsx("span", { children: label })] }));
}
function Sidebar({ isOpen, onClose }) {
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden", onClick: onClose })), _jsxs("aside", { className: `fixed top-0 left-0 h-full w-64 bg-gray-900/80 backdrop-blur-xl border-r border-white/5 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`, children: [_jsxs("div", { className: "flex items-center gap-3 px-6 py-5 border-b border-white/5", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center", children: _jsx(Radio, { size: 20, className: "text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-white font-semibold text-sm tracking-wide", children: "Railway VLESS" }), _jsx("p", { className: "text-gray-500 text-[11px]", children: "Panel v1.0.0" })] })] }), _jsx("nav", { className: "flex flex-col gap-1 p-4", children: NAV_ITEMS.map((item) => (_jsx(NavLinkItem, { ...item }, item.to))) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 border-t border-white/5", children: _jsx("div", { className: "text-center text-[11px] text-gray-600", children: "Xray VLESS+WS Manager" }) })] })] }));
}
function Header({ onMenuClick }) {
    return (_jsxs("header", { className: "sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between", children: [_jsx("button", { onClick: onMenuClick, className: "lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors", "aria-label": "Toggle menu", children: _jsx(Menu, { size: 20 }) }), _jsx("div", { className: "hidden lg:block" }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), _jsx("span", { className: "text-xs text-gray-400", children: "System Online" })] }) })] }));
}
export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "min-h-screen bg-gray-950", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }), _jsxs("div", { className: "lg:ml-64", children: [_jsx(Header, { onMenuClick: () => setSidebarOpen(true) }), _jsx("main", { className: "p-4 md:p-6 lg:p-8 animate-fade-in", children: _jsx(Outlet, {}) })] })] }));
}
