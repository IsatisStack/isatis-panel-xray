import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { generateVlessURL } from '../utils/helpers';
export default function QRModal({ isOpen, onClose, config, serverInfo }) {
    const [copied, setCopied] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const qrRef = useRef(null);
    const vlessURL = generateVlessURL(config, serverInfo);
    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(vlessURL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            const textarea = document.createElement('textarea');
            textarea.value = vlessURL;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }
    function handleDownload() {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `${config.remark}-qrcode.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 2000);
        }
    }
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in", onClick: onClose, role: "dialog", "aria-modal": "true", "aria-labelledby": "qr-title", children: _jsxs("div", { className: "bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-white/10 animate-slide-up", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { id: "qr-title", className: "text-white font-semibold text-lg", children: config.remark }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors", "aria-label": "Close", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "bg-white p-4 rounded-xl mb-4 flex justify-center", ref: qrRef, children: _jsx(QRCodeCanvas, { value: vlessURL, size: 180, level: "M" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleCopy, className: "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors", children: [copied ? _jsx(Check, { size: 16 }) : _jsx(Copy, { size: 16 }), copied ? 'Copied!' : 'Copy URL'] }), _jsxs("button", { onClick: handleDownload, className: "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors", children: [downloaded ? _jsx(Check, { size: 16 }) : _jsx(Download, { size: 16 }), downloaded ? 'Saved!' : 'Save PNG'] })] }), _jsx("p", { className: "text-center text-gray-500 text-xs mt-3", children: "Scan with your VLESS client" })] }) }));
}
