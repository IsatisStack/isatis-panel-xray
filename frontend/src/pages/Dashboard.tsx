import { useServerStatus } from '../hooks/useServerStatus';
import StatusCard from '../components/StatusCard';
import {
  Activity,
  Globe,
  Cpu,
  HardDrive,
  Clock,
  Zap,
  Radio,
  Hash,
} from 'lucide-react';

export default function Dashboard() {
  const { status, loading, error, refetch } = useServerStatus();

  const cards = [
    {
      title: 'Server Status',
      value: status.running ? 'Online' : 'Offline',
      icon: Radio,
      accent: 'emerald' as const,
    },
    {
      title: 'Railway Domain',
      value: status.domain,
      icon: Globe,
      accent: 'blue' as const,
      subtext: status.domain !== '---' ? `port ${status.port}` : undefined,
    },
    {
      title: 'Xray Version',
      value: status.xray_version,
      icon: Zap,
      accent: 'blue' as const,
    },
    {
      title: 'Config Count',
      value: status.config_count,
      icon: Hash,
      accent: 'amber' as const,
      subtext: 'active configurations',
    },
    {
      title: 'Uptime',
      value: status.uptime,
      icon: Clock,
      accent: 'emerald' as const,
      subtext: 'since last restart',
    },
    {
      title: 'RAM Usage',
      value: status.ram_usage,
      icon: HardDrive,
      accent: 'rose' as const,
      subtext: 'system memory',
    },
    {
      title: 'CPU Usage',
      value: status.cpu_usage,
      icon: Cpu,
      accent: 'rose' as const,
      subtext: 'processing power',
    },
    {
      title: 'Port',
      value: status.port,
      icon: Activity,
      accent: 'blue' as const,
      subtext: 'listening port',
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 max-w-md">
          <Activity size={40} className="text-rose-400 mx-auto mb-4" />
          <h2 className="text-white text-lg font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Server status and overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <StatusCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
            loading={loading}
            subtext={card.subtext}
          />
        ))}
      </div>
    </div>
  );
}