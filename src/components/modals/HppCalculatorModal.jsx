import React, { useState } from 'react'

export default function HppCalculatorModal({ onClose }) {
  const [ingredientCost, setIngredientCost] = useState('')
  const [packagingCost, setPackagingCost] = useState('')
  const [wastePercent, setWastePercent] = useState(5) // default 5% waste/overhead
  const [targetMargin, setTargetMargin] = useState(60) // default 60% gross margin

  const ing = parseFloat(ingredientCost) || 0
  const pack = parseFloat(packagingCost) || 0
  const waste = ing * (parseFloat(wastePercent) / 100)

  const totalHpp = ing + pack + waste
  const suggestedPrice = targetMargin < 100 ? totalHpp / (1 - targetMargin / 100) : 0
  const profitPerCup = suggestedPrice - totalHpp

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl">
        <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2">Kalkulator HPP & Margin</h3>
        
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Total Biaya Bahan (Rp)</label>
            <input type="number" value={ingredientCost} onChange={(e) => setIngredientCost(e.target.value)} placeholder="Contoh: 6500" className="w-full border p-2 rounded-lg font-mono" />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Biaya Kemasan / Paper Cup (Rp)</label>
            <input type="number" value={packagingCost} onChange={(e) => setPackagingCost(e.target.value)} placeholder="Contoh: 1200" className="w-full border p-2 rounded-lg font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Waste / Spillage (%)</label>
              <input type="number" value={wastePercent} onChange={(e) => setWastePercent(e.target.value)} className="w-full border p-2 rounded-lg font-mono" />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Target Margin Gross (%)</label>
              <input type="number" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} className="w-full border p-2 rounded-lg font-mono" />
            </div>
          </div>
        </div>

        {/* Output Ringkasan */}
        <div className="bg-slate-50 border p-3 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Estimasi HPP bersih:</span>
            <span className="font-mono font-bold text-slate-900">Rp {Math.round(totalHpp).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-blue-600">
            <span className="font-bold">Harga Jual Rekomendasi:</span>
            <span className="font-mono font-black text-sm">Rp {Math.round(suggestedPrice).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Profit Kotor per Porsi:</span>
            <span className="font-mono font-bold">Rp {Math.round(profitPerCup).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">Tutup</button>
      </div>
    </div>
  )
}