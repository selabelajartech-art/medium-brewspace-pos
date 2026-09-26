import React, { useState } from 'react'
import { X, Flame, Snowflake, Check } from 'lucide-react'

export default function CustomizationModal({ product, categoryName, toppingsList, onClose, onAddToCart }) {
  const variant = product.product_variants?.[0]
  const basePrice = parseFloat(variant?.price || 0)

  // Cek apakah jenis produk makanan atau minuman
  const isFood = (categoryName || '').toLowerCase().includes('pastry') || 
                 (categoryName || '').toLowerCase().includes('food') || 
                 (categoryName || '').toLowerCase().includes('makanan')

  // Filter Topping berdasarkan jenis produk (Minuman vs Makanan)
  const availableToppings = [
    { name: 'Tanpa Extra', price: 0 },
    ...(toppingsList || []).filter((t) => {
      if (t.categoryType === 'all') return true
      return isFood ? t.categoryType === 'food' : t.categoryType === 'drink'
    })
  ]

  // States Kustomisasi
  const [temp, setTemp] = useState(isFood ? 'Biasa' : 'Ice')
  const [sugar, setSugar] = useState('100%')
  const [selectedTopping, setSelectedTopping] = useState(availableToppings[0])

  const totalPrice = basePrice + selectedTopping.price

  const handleConfirm = () => {
    const notesArr = []
    if (!isFood) {
      notesArr.push(`Suhu: ${temp}`)
      notesArr.push(`Gula: ${sugar}`)
    } else {
      notesArr.push(`Penyajian: ${temp}`)
    }

    if (selectedTopping.price > 0) {
      notesArr.push(`Topping: ${selectedTopping.name}`)
    }

    const customizedItem = {
      product_id: product.id,
      variant_id: variant.id,
      name: product.name,
      variant_name: variant.variant_name || 'Regular',
      basePrice: basePrice,
      extraPrice: selectedTopping.price,
      finalPrice: totalPrice,
      temp,
      sugar: isFood ? 'N/A' : sugar,
      topping: selectedTopping.name,
      notes: notesArr.join(' • '),
      quantity: 1
    }

    onAddToCart(customizedItem)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-slate-100 space-y-5">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">{product.name}</h3>
            <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">
              Harga Dasar: Rp {basePrice.toLocaleString('id-ID')}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Suhu Varian / Opsi Penyajian */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            {isFood ? 'Opsi Penyajian:' : 'Suhu Varian:'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {!isFood ? (
              <>
                <button
                  type="button"
                  onClick={() => setTemp('Ice')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                    temp === 'Ice'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Snowflake className="w-4 h-4 text-sky-400" /> Ice
                </button>
                <button
                  type="button"
                  onClick={() => setTemp('Hot')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                    temp === 'Hot'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500" /> Hot
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setTemp('Biasa')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                    temp === 'Biasa'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Biasa / Normal
                </button>
                <button
                  type="button"
                  onClick={() => setTemp('Dihangatkan')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                    temp === 'Dihangatkan'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Dihangatkan / Toasted
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2. Level Gula (Hanya Minuman) */}
        {!isFood && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Level Gula:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['100%', '50%', '25%', '0%'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSugar(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    sugar === lvl
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Extra Topping / Shot Dropdown (Dinamis dari Master Topping) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Extra Topping / Shot:</label>
          <select
            value={selectedTopping.name}
            onChange={(e) => {
              const top = availableToppings.find((t) => t.name === e.target.value)
              if (top) setSelectedTopping(top)
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            {availableToppings.map((top) => (
              <option key={top.name} value={top.name}>
                {top.name} {top.price > 0 ? `(+Rp ${top.price.toLocaleString('id-ID')})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Total Harga Item</span>
            <span className="text-base font-black text-slate-900 font-mono">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Tambahkan
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}