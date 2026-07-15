import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Loader2, ArrowLeft, Key, Scan } from 'lucide-react';
import { getStatus, createConfig } from '../utils/api';
import { generateVlessURL, generateVlessJSON, copyToClipboard } from '../utils/helpers';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
const FINGERPRINTS = ['chrome', 'firefox', 'safari', 'edge', 'android', 'ios', 'random'];
const HTTP_VERSIONS = ['auto', '1.1', '2', '3'];
export default function CreateConfig() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [serverInfo, setServerInfo] = useState(null);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        remark: '',
        fingerprint: 'chrome',
        http_version: 'auto',
        path: '/ws',
        host: '',
        sni: '',
    });
    useEffect(() => {
        async function loadServerInfo() {
            try {
                const status = await getStatus();
                setServerInfo(status);
                if (status.domain !== '---') {
                    setForm((prev) => ({ ...prev, host: status.domain, sni: status.domain }));
                }
            }
            catch {
                // optional
            }
            finally {
                setLoading(false);
            }
        }
        loadServerInfo();
    }, []);
    function validateForm() {
        const newErrors = {};
        if (!form.remark.trim())
            newErrors.remark = 'Remark is required';
        if (!form.path.trim())
            newErrors.path = 'Path is required';
        if (!form.host.trim())
            newErrors.host = 'Host is required';
        if (!form.sni.trim())
            newErrors.sni = 'SNI is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateForm() || !serverInfo)
            return;
        setSubmitting(true);
        try {
            const config = await createConfig(form);
            setResult({ config, serverInfo });
            toast.success('Configuration created!');
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create config');
        }
        finally {
            setSubmitting(false);
        }
    }
    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsx(Loader2, { size: 32, className: "text-blue-400 animate-spin" }) }));
    }
    return (_jsx("div", { className: "max-w-2xl mx-auto", children: !result ? (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("button", { type: "button", onClick: () => navigate('/configs'), className: "p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors", children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Create Configuration" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Generate a new VLESS+WS config" })] })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Remark *" }), _jsx("input", { type: "text", value: form.remark, onChange: (e) => updateField('remark', e.target.value), placeholder: "e.g., My VLESS Config", className: `w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.remark ? 'border-rose-500' : 'border-white/10'}` }), errors.remark && _jsx("p", { className: "text-rose-400 text-sm mt-1", children: errors.remark })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Fingerprint" }), _jsx("select", { value: form.fingerprint, onChange: (e) => updateField('fingerprint', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: FINGERPRINTS.map((fp) => (_jsx("option", { value: fp, className: "bg-gray-900", children: fp.charAt(0).toUpperCase() + fp.slice(1) }, fp))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "HTTP Version" }), _jsx("select", { value: form.http_version, onChange: (e) => updateField('http_version', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: HTTP_VERSIONS.map((v) => (_jsx("option", { value: v, className: "bg-gray-900", children: v === 'auto' ? 'Auto' : v === '1.1' ? 'HTTP/1.1' : `HTTP/${v}` }, v))) })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Path *" }), _jsx("input", { type: "text", value: form.path, onChange: (e) => updateField('path', e.target.value), placeholder: "/ws", className: `w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.path ? 'border-rose-500' : 'border-white/10'}` }), errors.path && _jsx("p", { className: "text-rose-400 text-sm mt-1", children: errors.path })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Host *" }), _jsx("input", { type: "text", value: form.host, onChange: (e) => updateField('host', e.target.value), placeholder: "domain.railway.app", className: `w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.host ? 'border-rose-500' : 'border-white/10'}` }), errors.host && _jsx("p", { className: "text-rose-400 text-sm mt-1", children: errors.host })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "SNI *" }), _jsx("input", { type: "text", value: form.sni, onChange: (e) => updateField('sni', e.target.value), placeholder: "domain.railway.app", className: `w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.sni ? 'border-rose-500' : 'border-white/10'}` }), errors.sni && _jsx("p", { className: "text-rose-400 text-sm mt-1", children: errors.sni })] }), _jsxs("button", { type: "submit", disabled: submitting, className: "w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2", children: [submitting ? _jsx(Loader2, { size: 18, className: "animate-spin" }) : _jsx(Key, { size: 18 }), submitting ? 'Generating...' : 'Generate Configuration'] })] })] })) : (_jsx(ResultView, { config: result.config, serverInfo: result.serverInfo, onCreateAnother: () => setResult(null) })) }));
}
function ResultView({ config, serverInfo, onCreateAnother, }) {
    const vlessURL = generateVlessURL(config, serverInfo);
    const vlessJSON = generateVlessJSON(config, serverInfo);
    const [copiedField, setCopiedField] = useState(null);
    async function handleCopy(field, text) {
        const success = await copyToClipboard(text);
        if (success) {
            setCopiedField(field);
            toast.success(`${field} copied!`);
            setTimeout(() => setCopiedField(null), 2000);
        }
        else {
            toast.error('Failed to copy');
        }
    }
    return (_jsxs("div", { className: "space-y-6 animate-slide-up", children: [_jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Check, { size: 24, className: "text-emerald-400" }), _jsx("h2", { className: "text-xl font-semibold text-white", children: "Configuration Created!" })] }), _jsx("p", { className: "text-gray-400", children: "Your VLESS configuration is ready to use" })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 text-center", children: [_jsxs("div", { className: "bg-white/5 rounded-xl p-4", children: [_jsx("p", { className: "text-gray-400 text-xs mb-1", children: "UUID" }), _jsx("p", { className: "text-white font-mono text-sm break-all", children: config.uuid })] }), _jsxs("div", { className: "bg-white/5 rounded-xl p-4", children: [_jsx("p", { className: "text-gray-400 text-xs mb-1", children: "Remark" }), _jsx("p", { className: "text-white font-medium", children: config.remark })] })] }), _jsxs("div", { className: "bg-white/5 rounded-xl p-4", children: [_jsxs("h3", { className: "text-white font-medium mb-3 flex items-center gap-2", children: [_jsx(Scan, { size: 18 }), "VLESS URL"] }), _jsxs("div", { className: "flex gap-2 items-start", children: [_jsx("div", { className: "flex-1 bg-white/5 rounded-xl p-3 font-mono text-xs text-gray-300 break-all overflow-auto max-h-24", children: vlessURL }), _jsxs("button", { onClick: () => handleCopy('URL', vlessURL), className: "shrink-0 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2", children: [copiedField === 'URL' ? _jsx(Check, { size: 16 }) : _jsx(Copy, { size: 16 }), copiedField === 'URL' ? 'Copied' : 'Copy'] })] })] }), _jsxs("div", { className: "bg-white/5 rounded-xl p-4", children: [_jsxs("h3", { className: "text-white font-medium mb-3 flex items-center gap-2", children: [_jsx(Key, { size: 18 }), "JSON Config"] }), _jsxs("div", { className: "flex gap-2 items-start", children: [_jsx("div", { className: "flex-1 bg-white/5 rounded-xl p-3 font-mono text-xs text-gray-300 overflow-auto max-h-32", children: JSON.stringify(vlessJSON, null, 2) }), _jsxs("button", { onClick: () => handleCopy('JSON', JSON.stringify(vlessJSON, null, 2)), className: "shrink-0 px-4 py-3 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-xl font-medium transition-colors flex items-center gap-2", children: [copiedField === 'JSON' ? _jsx(Check, { size: 16 }) : _jsx(Copy, { size: 16 }), copiedField === 'JSON' ? 'Copied' : 'Copy'] })] })] }), _jsxs("div", { className: "bg-white/5 rounded-xl p-4 text-center", children: [_jsx("h3", { className: "text-white font-medium mb-3", children: "QR Code" }), _jsx("div", { className: "inline-flex bg-white p-4 rounded-xl", children: _jsx(QRCodeCanvas, { value: vlessURL, size: 180, level: "M" }) })] })] }), _jsxs("button", { onClick: onCreateAnother, className: "w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2", children: [_jsx(ArrowLeft, { size: 18 }), "Create Another"] })] }));
}
