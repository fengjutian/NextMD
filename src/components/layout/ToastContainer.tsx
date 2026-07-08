import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';

const icons = {
  error: <AlertTriangle size={16} className="text-red-400" />,
  success: <CheckCircle size={16} className="text-green-400" />,
  info: <Info size={16} className="text-blue-400" />,
};

const bgColors = {
  error: 'border-red-500/20 bg-red-500/5',
  success: 'border-green-500/20 bg-green-500/5',
  info: 'border-blue-500/20 bg-blue-500/5',
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-[var(--shadow-lg)] pointer-events-auto text-sm ${bgColors[toast.type]}`}
          style={{ background: 'var(--bg-card)' }}
        >
          {icons[toast.type]}
          <span className="text-[var(--text-primary)]">{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
