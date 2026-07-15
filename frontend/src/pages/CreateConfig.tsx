import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Loader2, ArrowLeft, Key, Scan } from 'lucide-react';
import { getStatus, createConfig } from '../utils/api';
import { ServerStatus, CreateConfigRequest, Config } from '../types';
import { generateVlessURL, generateVlessJSON, copyToClipboard } from '../utils/helpers';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

const FINGERPRINTS = ['chrome', 'firefox', 'safari', 'edge', 'android', 'ios', 'random'];
const HTTP_VERSIONS = ['auto', '1.1', '2', '3'];

interface CreateResult {
  config: Config;
  serverInfo: ServerStatus;
}

export default function CreateConfig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [serverInfo, setServerInfo] = useState<ServerStatus | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CreateConfigRequest>({
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
      } catch {
        // optional
      } finally {
        setLoading(false);
      }
    }
    loadServerInfo();
  }, []);

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.remark.trim()) newErrors.remark = 'Remark is required';
    if (!form.path.trim()) newErrors.path = 'Path is required';
    if (!form.host.trim()) newErrors.host = 'Host is required';
    if (!form.sni.trim()) newErrors.sni = 'SNI is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm() || !serverInfo) return;
    setSubmitting(true);
    try {
      const config = await createConfig(form);
      setResult({ config, serverInfo });
      toast.success('Configuration created!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create config');
    } finally {
      setSubmitting(false);
    }
  }

  function updateField<K extends keyof CreateConfigRequest>(key: K, value: CreateConfigRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigate('/configs')}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Configuration</h1>
              <p className="text-gray-400 text-sm">Generate a new VLESS+WS config</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Remark *</label>
              <input
                type="text"
                value={form.remark}
                onChange={(e) => updateField('remark', e.target.value)}
                placeholder="e.g., My VLESS Config"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.remark ? 'border-rose-500' : 'border-white/10'
                }`}
              />
              {errors.remark && <p className="text-rose-400 text-sm mt-1">{errors.remark}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fingerprint</label>
                <select
                  value={form.fingerprint}
                  onChange={(e) => updateField('fingerprint', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {FINGERPRINTS.map((fp) => (
                    <option key={fp} value={fp} className="bg-gray-900">
                      {fp.charAt(0).toUpperCase() + fp.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">HTTP Version</label>
                <select
                  value={form.http_version}
                  onChange={(e) => updateField('http_version', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {HTTP_VERSIONS.map((v) => (
                    <option key={v} value={v} className="bg-gray-900">
                      {v === 'auto' ? 'Auto' : v === '1.1' ? 'HTTP/1.1' : `HTTP/${v}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Path *</label>
                <input
                  type="text"
                  value={form.path}
                  onChange={(e) => updateField('path', e.target.value)}
                  placeholder="/ws"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.path ? 'border-rose-500' : 'border-white/10'
                  }`}
                />
                {errors.path && <p className="text-rose-400 text-sm mt-1">{errors.path}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Host *</label>
                <input
                  type="text"
                  value={form.host}
                  onChange={(e) => updateField('host', e.target.value)}
                  placeholder="domain.railway.app"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.host ? 'border-rose-500' : 'border-white/10'
                  }`}
                />
                {errors.host && <p className="text-rose-400 text-sm mt-1">{errors.host}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">SNI *</label>
              <input
                type="text"
                value={form.sni}
                onChange={(e) => updateField('sni', e.target.value)}
                placeholder="domain.railway.app"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.sni ? 'border-rose-500' : 'border-white/10'
                }`}
              />
              {errors.sni && <p className="text-rose-400 text-sm mt-1">{errors.sni}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
              {submitting ? 'Generating...' : 'Generate Configuration'}
            </button>
          </div>
        </form>
      ) : (
        <ResultView
          config={result.config}
          serverInfo={result.serverInfo}
          onCreateAnother={() => setResult(null)}
        />
      )}
    </div>
  );
}

function ResultView({
  config,
  serverInfo,
  onCreateAnother,
}: {
  config: Config;
  serverInfo: ServerStatus;
  onCreateAnother: () => void;
}) {
  const vlessURL = generateVlessURL(config, serverInfo);
  const vlessJSON = generateVlessJSON(config, serverInfo);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    <div className="space-y-6 animate-slide-up">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Check size={24} className="text-emerald-400" />
          <h2 className="text-xl font-semibold text-white">Configuration Created!</h2>
        </div>
        <p className="text-gray-400">Your VLESS configuration is ready to use</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">UUID</p>
            <p className="text-white font-mono text-sm break-all">{config.uuid}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Remark</p>
            <p className="text-white font-medium">{config.remark}</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Scan size={18} />
            VLESS URL
          </h3>
          <div className="flex gap-2 items-start">
            <div className="flex-1 bg-white/5 rounded-xl p-3 font-mono text-xs text-gray-300 break-all overflow-auto max-h-24">
              {vlessURL}
            </div>
            <button
              onClick={() => handleCopy('URL', vlessURL)}
              className="shrink-0 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {copiedField === 'URL' ? <Check size={16} /> : <Copy size={16} />}
              {copiedField === 'URL' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Key size={18} />
            JSON Config
          </h3>
          <div className="flex gap-2 items-start">
            <div className="flex-1 bg-white/5 rounded-xl p-3 font-mono text-xs text-gray-300 overflow-auto max-h-32">
              {JSON.stringify(vlessJSON, null, 2)}
            </div>
            <button
              onClick={() => handleCopy('JSON', JSON.stringify(vlessJSON, null, 2))}
              className="shrink-0 px-4 py-3 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {copiedField === 'JSON' ? <Check size={16} /> : <Copy size={16} />}
              {copiedField === 'JSON' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 text-center">
          <h3 className="text-white font-medium mb-3">QR Code</h3>
          <div className="inline-flex bg-white p-4 rounded-xl">
            <QRCodeCanvas value={vlessURL} size={180} level="M" />
          </div>
        </div>
      </div>

      <button
        onClick={onCreateAnother}
        className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft size={18} />
        Create Another
      </button>
    </div>
  );
}