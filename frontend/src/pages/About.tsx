import { Radio, Github, FileJson, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">About</h1>
        <p className="text-gray-400 text-sm">Project information and tech stack</p>
      </div>

      <div className="space-y-4">
        {/* Project Info */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center">
              <Radio size={28} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Railway VLESS Panel</h2>
              <p className="text-gray-400 text-sm">v1.0.0</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            A modern web interface for managing Xray VLESS+WebSocket configurations on Railway.
            Create, manage, and export VLESS configurations with ease.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Tech Stack</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'React 18', icon: FileJson },
              { label: 'TypeScript 5', icon: FileJson },
              { label: 'Vite 6', icon: FileJson },
              { label: 'Tailwind CSS 4', icon: FileJson },
              { label: 'React Router 6', icon: Globe },
              { label: 'Xray Core', icon: Radio },
              { label: 'Lucide Icons', icon: FileJson },
              { label: 'QRCode.react', icon: FileJson },
            ].map((tech) => (
              <div
                key={tech.label}
                className="bg-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition-colors"
              >
                <tech.icon size={20} className="mx-auto mb-1 text-blue-400" />
                <p className="text-gray-300 text-xs font-medium">{tech.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Links</h3>
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Github size={18} className="text-gray-400" />
              <span className="text-gray-300 text-sm">GitHub Repository</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <FileJson size={18} className="text-gray-400" />
              <span className="text-gray-300 text-sm">API Documentation</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}