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

    // Verifikasi PIN ke daftar staf Manager/Admin
    const authorizedStaff = staffList.find(
      (s) =>
        (s.role?.toUpperCase() === 'MANAGER' || s.role?.toUpperCase() === 'ADMIN') &&
        String(s.pin) === String(pin)
    )

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
      <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
              <p className="text-[10px] text-slate-500 leading-tight">{description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display PIN Input */}
        <div className="space-y-1">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  i < pin.length
                    ? 'bg-purple-600 border-purple-600 scale-110 shadow-xs'
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

        {/* Numpad Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-extrabold text-lg rounded-xl transition shadow-2xs font-mono"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition"
          >
            CLEAR
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-extrabold text-lg rounded-xl transition shadow-2xs font-mono"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center rounded-xl transition"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Submit Action */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pin.length < 4}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Check className="w-4 h-4" /> Verifikasi PIN
        </button>

      </div>
    </div>
  )
}