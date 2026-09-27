import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toast, setToast }) {
  const { show, message, type = 'info' } = toast || {}

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }))
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [show, setToast])

  if (!show || !message) return null

  const config = {
    success: {
      bg: 'bg-slate-900 border-blue-500 text-white',
      icon: <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
    },
    error: {
      bg: 'bg-slate-900 border-red-500 text-white',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
    },
    warning: {
      bg: 'bg-slate-900 border-amber-500 text-white',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
    },
    info: {
      bg: 'bg-slate-900 border-blue-500 text-white',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />
    }
  }

  const current = config[type] || config.info

  return (
    // Menggunakan z-[100] dan bg-slate-900 solid agar tidak terkena efek backdrop blur modal
    <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl max-w-sm ${current.bg}`}>
        {current.icon}
        <p className="text-xs font-bold leading-snug flex-1">{message}</p>
        <button
          onClick={() => setToast((prev) => ({ ...prev, show: false }))}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}