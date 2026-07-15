import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ConfigList from './pages/ConfigList';
import CreateConfig from './pages/CreateConfig';
import Settings from './pages/Settings';
import About from './pages/About';
export default function App() {
    return (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "configs", element: _jsx(ConfigList, {}) }), _jsx(Route, { path: "create", element: _jsx(CreateConfig, {}) }), _jsx(Route, { path: "settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "about", element: _jsx(About, {}) })] }) }));
}
