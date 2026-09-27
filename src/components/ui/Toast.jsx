import React from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

export default function Toast({ toast, setToast }) {
  if (!toast?.show) return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  }

  const styles = {
    success: 'bg-slate-900 border-slate-800 text-white shadow-2xl',
    error: 'bg-red-950/90 border-red-800 text-red-100 shadow-2xl shadow-red-950/40',
    warning: 'bg-slate-900 border-slate-800 text-white shadow-2xl',
    info: 'bg-slate-900 border-slate-800 text-white shadow-2xl'
  }

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full pointer-events-auto transition-all duration-300">
      <div className={`p-4 rounded-2xl border backdrop-blur-md flex items-center gap-3 relative shadow-2xl ${styles[toast.type] || styles.info}`}>
        {icons[toast.type] || icons.info}
        
        <div className="flex-1 pr-2">
          <p className="text-xs font-bold leading-snug">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={() => setToast?.({ ...toast, show: false })}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}