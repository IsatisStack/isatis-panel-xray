import { useState, useRef } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Config, ServerStatus } from '../types';
import { generateVlessURL } from '../utils/helpers';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Config;
  serverInfo: ServerStatus;
}

export default function QRModal({ isOpen, onClose, config, serverInfo }: QRModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const vlessURL = generateVlessURL(config, serverInfo);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(vlessURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-title"
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-white/10 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="qr-title" className="text-white font-semibold text-lg">
            {config.remark}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl mb-4 flex justify-center" ref={qrRef}>
          <QRCodeCanvas value={vlessURL} size={180} level="M" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          >
            {downloaded ? <Check size={16} /> : <Download size={16} />}
            {downloaded ? 'Saved!' : 'Save PNG'}
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-3">
          Scan with your VLESS client
        </p>
      </div>
    </div>
  );
}