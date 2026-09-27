import React from 'react'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Hapus Transaksi?',
  description = 'Apakah Anda yakin ingin menghapus riwayat transaksi ini? Data yang dihapus tidak dapat dikembalikan.',
  loading = false
}) {
  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-slate-200 space-y-4 my-auto text-center">
        
        {/* Tombol Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Warning */}
        <div className="w-12 h-12 bg-red-50 border border-red-200/60 text-red-600 rounded-2xl flex items-center justify-center mx-auto shrink-0 mt-2">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Teks Dialog */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-slate-900">{title}</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">{description}</p>
        </div>

        {/* Tombol Aksi */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition active:scale-95"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-red-600/20 active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>
        </div>

      </div>
    </div>
  )
}