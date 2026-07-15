import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export function Toast() {
  const [toastList, setToastList] = useState<ToastItem[]>([]);

  if (toastList.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toastList.map((toast, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg shadow-lg text-sm transition-all"
        >
          <span
            className={`font-medium ${
              toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {toast.message}
          </span>
          <button
            onClick={() => setToastList((prev) => prev.filter((_, i) => i !== idx))}
            className="ml-2 text-gray-400 hover:text-white"
            aria-label="Dismiss"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
