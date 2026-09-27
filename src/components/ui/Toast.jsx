import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

export default function Toast({ toast, setToast }) {
  // Auto-dismiss otomatis hilang setelah 3 detik
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast?.((prev) => ({ ...prev, show: false }))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast?.show, setToast])

  if (!toast?.show) return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
  }

  const styles = {
    success: 'bg-slate-900/95 border-slate-800 text-white shadow-2xl shadow-slate-950/50',
    error: 'bg-red-950/95 border-red-800/80 text-red-100 shadow-2xl shadow-red-950/50',
    warning: 'bg-slate-900/95 border-slate-800 text-white shadow-2xl shadow-slate-950/50',
    info: 'bg-slate-900/95 border-slate-800 text-white shadow-2xl shadow-slate-950/50'
  }

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-[9999] pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className={`p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl flex items-center gap-3 relative shadow-2xl ${styles[toast.type] || styles.info}`}>
        {icons[toast.type] || icons.info}
        
        <div className="flex-1 pr-1 min-w-0">
          <p className="text-xs font-bold leading-snug truncate sm:whitespace-normal">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={() => setToast?.((prev) => ({ ...prev, show: false }))}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0 active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}