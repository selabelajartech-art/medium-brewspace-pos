import React, { useState } from 'react'
import { X, ShoppingBag } from 'lucide-react'

export default function CustomizationModal({
  product,
  categoryName,
  toppingsList = [],
  onClose,
  onAddToCart
}) {
  const variant = product?.product_variants?.[0] || {}
  const basePrice = parseFloat(variant.price || 0)

  const [tempOption, setTempOption] = useState('Ice')
  const [sugarOption, setSugarOption] = useState('Normal Sugar')
  const [selectedTopping, setSelectedTopping] = useState(null)
  const [notes, setNotes] = useState('')

  const toppingPrice = selectedTopping ? parseFloat(selectedTopping.price || 0) : 0
  const finalPrice = basePrice + toppingPrice

  const handleConfirmAdd = () => {
    if (typeof onAddToCart === 'function') {
      onAddToCart({
        product_id: product.id,
        variant_id: variant.id,
        name: product.name,
        basePrice,
        finalPrice,
        temp: tempOption,
        sugar: sugarOption,
        topping: selectedTopping ? selectedTopping.name : 'No Topping',
        toppingPrice,
        notes,
        quantity: 1
      })
    }
    if (typeof onClose === 'function') onClose()
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl relative border border-slate-200 space-y-4.5 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200/60">
              {categoryName || 'Menu'}
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1.5">{product?.name}</h3>
            <p className="text-xs font-mono font-extrabold text-blue-600 mt-0.5">
              Rp {basePrice.toLocaleString('id-ID')}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opsi Suhu / Sajian */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 block">Pilihan Sajian</label>
          <div className="grid grid-cols-2 gap-2">
            {['Ice', 'Hot'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTempOption(opt)}
                className={`py-2.5 rounded-xl font-bold border text-xs transition ${
                  tempOption === opt 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Opsi Gula */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 block">Tingkat Manis</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['Normal Sugar', 'Less Sugar', 'No Sugar'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSugarOption(opt)}
                className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                  sugarOption === opt 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.replace(' Sugar', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Opsi Topping */}
        {toppingsList.length > 0 && (
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 block">Tambahan / Topping</label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {toppingsList.map((top) => {
                const isSelected = selectedTopping?.id === top.id
                return (
                  <button
                    key={top.id}
                    type="button"
                    onClick={() => setSelectedTopping(isSelected ? null : top)}
                    className={`w-full p-2.5 rounded-xl border flex justify-between items-center text-xs transition ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500 font-bold text-blue-900 shadow-2xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{top.name}</span>
                    <span className="font-mono text-[11px] text-blue-600 font-bold">
                      +Rp {parseFloat(top.price || 0).toLocaleString('id-ID')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Catatan Pesanan */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 block">Catatan Pesanan</label>
          <input
            type="text"
            placeholder="Contoh: Extra es, tanpa sedotan..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
          />
        </div>

        {/* Total & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Tagihan</span>
            <span className="font-mono font-black text-base text-blue-600">
              Rp {finalPrice.toLocaleString('id-ID')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirmAdd}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-blue-600/20 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" /> Masukkan Keranjang
          </button>
        </div>

      </div>
    </div>
  )
}