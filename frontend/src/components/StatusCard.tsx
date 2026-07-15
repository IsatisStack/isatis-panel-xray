import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  accent?: 'blue' | 'emerald' | 'amber' | 'rose';
  subtext?: string;
}

export default function StatusCard({
  title,
  value,
  icon: Icon,
  loading = false,
  accent = 'blue',
  subtext,
}: StatusCardProps) {
  const accentColors = {
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
  };

  const accentClass = accentColors[accent];

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-10 w-10 rounded-xl bg-white/5" />
        </div>
        <div className="h-8 w-32 bg-white/10 rounded" />
        {subtext && <div className="mt-2 h-3 w-20 bg-white/5 rounded" />}
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-white text-2xl font-semibold tabular-nums">
            {value}
          </p>
          {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${accentClass}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}