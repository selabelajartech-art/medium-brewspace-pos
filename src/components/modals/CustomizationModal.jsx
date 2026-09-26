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
    // FIX: Modal langsung tertutup otomatis setelah pesanan ditambahkan
    if (typeof onClose === 'function') onClose()
  }

  return (
    // FIX: Klik di luar window langsung menutup modal
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {categoryName || 'Menu'}
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1">{product?.name}</h3>
            <p className="text-xs font-mono font-bold text-blue-600">
              Rp {basePrice.toLocaleString('id-ID')}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opsi Suhu */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 block">Sajian</label>
          <div className="grid grid-cols-2 gap-2">
            {['Ice', 'Hot'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTempOption(opt)}
                className={`py-2 rounded-xl font-bold border transition ${
                  tempOption === opt ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
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
                  sugarOption === opt ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
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
                    className={`w-full p-2 rounded-xl border flex justify-between items-center text-xs transition ${
                      isSelected ? 'bg-blue-50 border-blue-500 font-bold text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{top.name}</span>
                    <span className="font-mono text-[11px]">+Rp {parseFloat(top.price || 0).toLocaleString('id-ID')}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Catatan Khusus */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 block">Catatan Pesanan</label>
          <input
            type="text"
            placeholder="Contoh: Sedikit es, tanpa sedotan..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>

        {/* Total & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block">Total Porsi</span>
            <span className="font-mono font-black text-sm text-blue-600">
              Rp {finalPrice.toLocaleString('id-ID')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirmAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md"
          >
            <ShoppingBag className="w-4 h-4" /> Masukkan Keranjang
          </button>
        </div>

      </div>
    </div>
  )
}