import React, { useState } from 'react'
import { X, Calculator } from 'lucide-react'

export default function HppCalculatorModal({ onClose }) {
  const [ingredientCost, setIngredientCost] = useState('')
  const [packagingCost, setPackagingCost] = useState('')
  const [wastePercent, setWastePercent] = useState(5)
  const [targetMargin, setTargetMargin] = useState(60)

  const ing = parseFloat(ingredientCost) || 0
  const pack = parseFloat(packagingCost) || 0
  const waste = ing * (parseFloat(wastePercent) / 100)

  const totalHpp = ing + pack + waste
  const suggestedPrice = targetMargin < 100 ? totalHpp / (1 - targetMargin / 100) : 0
  const profitPerCup = suggestedPrice - totalHpp

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl border border-slate-200 relative my-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Kalkulator HPP & Margin</h3>
            <p className="text-[11px] text-slate-400 font-medium">Hitung estimasi modal per cup dan harga jual ideal.</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Total Biaya Bahan (Rp)</label>
            <input
              type="number"
              value={ingredientCost}
              onChange={(e) => setIngredientCost(e.target.value)}
              placeholder="Contoh: 6500"
              className="w-full bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Biaya Kemasan / Paper Cup (Rp)</label>
            <input
              type="number"
              value={packagingCost}
              onChange={(e) => setPackagingCost(e.target.value)}
              placeholder="Contoh: 1200"
              className="w-full bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Waste / Spillage (%)</label>
              <input
                type="number"
                value={wastePercent}
                onChange={(e) => setWastePercent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Target Margin Gross (%)</label>
              <input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Output Ringkasan */}
        <div className="bg-blue-50/60 border border-blue-200/60 p-3.5 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Estimasi HPP bersih:</span>
            <span className="font-mono font-bold text-slate-900">Rp {Math.round(totalHpp).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between border-t border-blue-200/60 pt-2 text-blue-700">
            <span className="font-extrabold">Harga Jual Rekomendasi:</span>
            <span className="font-mono font-black text-sm">Rp {Math.round(suggestedPrice).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Profit Kotor per Porsi:</span>
            <span className="font-mono font-bold">Rp {Math.round(profitPerCup).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          Selesai & Tutup
        </button>
      </div>
    </div>
  )
}