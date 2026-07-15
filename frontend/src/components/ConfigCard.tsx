import { useState } from 'react';
import {
  Copy,
  Trash2,
  QrCode,
  Edit,
  Check,
  Server,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Config, ServerStatus } from '../types';
import { generateVlessURL, generateVlessJSON, copyToClipboard, formatDate } from '../utils/helpers';

interface ConfigCardProps {
  config: Config;
  serverInfo: ServerStatus;
  onEdit: (config: Config) => void;
  onDelete: (id: number) => void;
}

export default function ConfigCard({ config, serverInfo, onEdit, onDelete }: ConfigCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const vlessURL = generateVlessURL(config, serverInfo);
  const vlessJSON = generateVlessJSON(config, serverInfo);

  async function handleCopy(field: string, text: string) {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      toast.success(`${field} copied!`);
      setTimeout(() => setCopiedField(null), 2000);
    } else {
      toast.error('Failed to copy');
    }
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Server size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{config.remark}</h3>
              <p className="text-gray-500 text-xs font-mono">
                {config.uuid.slice(0, 8)}...{config.uuid.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(config)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(config.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fingerprint</span>
            <span className="text-gray-300 font-mono text-xs">{config.fingerprint}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">HTTP Version</span>
            <span className="text-gray-300">{config.http_version}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Path</span>
            <span className="text-gray-300 font-mono text-xs">{config.path}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Created</span>
            <span className="text-gray-300 text-xs">{formatDate(config.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleCopy('URL', vlessURL)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-all text-sm"
          >
            {copiedField === 'URL' ? <Check size={14} /> : <Copy size={14} />}
            {copiedField === 'URL' ? 'Copied' : 'Copy URL'}
          </button>
          <button
            onClick={() => handleCopy('JSON', JSON.stringify(vlessJSON, null, 2))}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-all text-sm"
          >
            {copiedField === 'JSON' ? <Check size={14} /> : <Copy size={14} />}
            {copiedField === 'JSON' ? 'Copied' : 'Copy JSON'}
          </button>
          <button
            onClick={() => setShowQR(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            title="Show QR"
          >
            <QrCode size={18} />
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-white/10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              {config.remark}
            </h3>
            <div className="bg-white p-4 rounded-xl mb-4">
              <QRCodeSVG value={vlessURL} size={180} level="M" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy('URL', vlessURL)}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                {copiedField === 'URL' ? 'Copied!' : 'Copy URL'}
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}