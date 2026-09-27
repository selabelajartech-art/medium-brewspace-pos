import React, { useState } from 'react'
import { X, Lock, Delete, Check } from 'lucide-react'

export default function PinAuthModal({
  onClose,
  onSuccess,
  staffList = [],
  title = 'Otorisasi PIN Required',
  description = 'Masukkan PIN Manager/Admin untuk melanjutkan.'
}) {
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num)
      setErrorMsg('')
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
    setErrorMsg('')
  }

  const handleClear = () => {
    setPin('')
    setErrorMsg('')
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!pin) return setErrorMsg('Masukkan PIN terlebih dahulu!')

    // 1. Verifikasi PIN ke daftar staf Manager/Admin
    let authorizedStaff = staffList.find(
      (s) =>
        (s.role?.toUpperCase() === 'MANAGER' || s.role?.toUpperCase() === 'ADMIN') &&
        String(s.pin) === String(pin)
    )

    // 2. SAFEGUARD: Fallback PIN darurat
    if (!authorizedStaff && (pin === '1234' || pin === '8888')) {
      authorizedStaff = { name: 'Manager System', role: 'MANAGER' }
    }

    if (authorizedStaff) {
      setPin('')
      setErrorMsg('')
      // HANYA panggil onSuccess agar status isAuthenticated = true
      // JANGAN panggil onClose() di sini agar modal utama tidak tertutup
      if (typeof onSuccess === 'function') {
        onSuccess(authorizedStaff)
      }
    } else {
      setErrorMsg('PIN Salah atau tidak memiliki wewenang!')
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-xs shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">{description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display PIN Input Dots */}
        <div className="space-y-1">
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-center gap-2.5 min-h-[48px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  i < pin.length
                    ? 'bg-blue-600 border-blue-600 scale-110 shadow-xs'
                    : 'border-slate-300 bg-white'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-[10px] font-bold text-red-500 text-center pt-0.5 animate-bounce">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Numpad Keypad Touchscreen */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="py-3 bg-slate-50 hover:bg-slate-100 active:bg-blue-50 text-slate-900 font-extrabold text-lg rounded-2xl transition border border-slate-200/70 font-mono"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="py-3 bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs rounded-2xl border border-red-200/60 transition"
          >
            CLEAR
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3 bg-slate-50 hover:bg-slate-100 active:bg-blue-50 text-slate-900 font-extrabold text-lg rounded-2xl transition border border-slate-200/70 font-mono"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center rounded-2xl border border-slate-200/70 transition"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Submit Action */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pin.length < 4}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 active:scale-98"
        >
          <Check className="w-4 h-4 stroke-[3]" /> Verifikasi PIN
        </button>

      </div>
    </div>
  )
}