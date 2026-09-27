import React, { useState, useEffect } from 'react'
import { Plus, Minus, Trash2, Settings, ShoppingBag, Tag, Percent, DollarSign, X } from 'lucide-react'

export default function OrderRegisterPane({
  customerName, setCustomerName, tableNumber, setTableNumber,
  tablesList = [], setShowTableModal,
  cart = [], updateCartQuantity, removeCartItem, subtotal = 0,
  setShowPaymentModal, setPayments, setDiscountAmount
}) {
  const [showDiscountInput, setShowDiscountInput] = useState(false)
  const [discountType, setDiscountType] = useState('FIXED')
  const [discountValue, setDiscountValue] = useState('')

  const numValue = parseFloat(discountValue) || 0
  const calculatedDiscount = discountType === 'PERCENT'
    ? (subtotal * numValue) / 100
    : numValue

  const finalGrandTotal = Math.max(0, subtotal - calculatedDiscount)

  useEffect(() => {
    if (typeof setDiscountAmount === 'function') {
      setDiscountAmount(calculatedDiscount)
    }
  }, [calculatedDiscount, setDiscountAmount])

  return (
    <div className="w-full bg-white flex flex-col justify-between h-full space-y-3">
      
      {/* Upper Cart Details */}
      <div className="space-y-3 overflow-y-auto pr-1 flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Bill Details Header */}
        <div className="pb-2.5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-sm text-slate-900">Rincian Tagihan</h3>
            <p className="text-[10px] text-slate-400 font-medium">{cart.length} Jenis Item Dipilih</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* Input Customer & Table Selector */}
        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Nama Pelanggan
            </label>
            <input
              type="text"
              placeholder="Contoh: Budi / Umum"
              value={customerName || ''}
              onChange={(e) => setCustomerName?.(e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Area / Nomor Meja
            </label>
            <div className="flex gap-1.5">
              <select
                value={tableNumber || ''}
                onChange={(e) => setTableNumber?.(e.target.value)}
                className="flex-1 px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="">Pilih Meja / Takeaway</option>
                {tablesList.map((tbl) => (
                  <option key={tbl.id} value={tbl.name}>
                    {tbl.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowTableModal?.(true)}
                title="Kelola Daftar Meja"
                className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="space-y-2 pt-1">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Item Pesanan</h4>
          {cart.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              Keranjang belanja masih kosong.
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.cartKey} className="p-2.5 sm:p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h4>
                      {item.notes && (
                        <p className="text-[10px] text-blue-600 font-medium leading-tight mt-0.5">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem?.(item.cartKey)}
                      className="text-slate-300 hover:text-red-500 transition p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Rp {(item.finalPrice * item.quantity).toLocaleString('id-ID')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateCartQuantity?.(item.cartKey, -1)}
                        className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold font-mono w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity?.(item.cartKey, 1)}
                        className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:bg-blue-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Calculation & Action */}
      <div className="pt-2 border-t border-slate-100 space-y-2.5 shrink-0">
        
        {/* Tombol Toggle Diskon */}
        {!showDiscountInput ? (
          <button
            type="button"
            onClick={() => setShowDiscountInput(true)}
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{discountValue !== '' && numValue > 0 ? `Diskon: ${discountType === 'PERCENT' ? `${discountValue}%` : `Rp ${numValue.toLocaleString('id-ID')}`}` : '+ Diskon / Promo'}</span>
          </button>
        ) : (
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Atur Diskon</span>
              <button 
                type="button"
                onClick={() => {
                  setShowDiscountInput(false)
                  setDiscountValue('')
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDiscountType('PERCENT')}
                  className={`px-2 py-1 rounded-lg transition ${discountType === 'PERCENT' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                >
                  <Percent className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('FIXED')}
                  className={`px-2 py-1 rounded-lg transition ${discountType === 'FIXED' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                >
                  <DollarSign className="w-3 h-3" />
                </button>
              </div>

              <input
                type="number"
                placeholder={discountType === 'PERCENT' ? '10 (%)' : '5000 (Rp)'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>
        )}

        {/* Ringkasan Biaya */}
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-1 text-xs font-medium">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {calculatedDiscount > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>Diskon ({discountType === 'PERCENT' ? `${discountValue}%` : 'Nominal'})</span>
              <span className="font-mono font-bold">- Rp {calculatedDiscount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200/60">
            <span>Total Akhir</span>
            <span className="font-mono text-blue-600 text-sm sm:text-base">
              Rp {finalGrandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={() => {
            setPayments?.([{ method: 'CASH', amount: finalGrandTotal.toString() }])
            setShowPaymentModal?.(true)
          }}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition shadow-md shadow-blue-600/20 disabled:bg-slate-200 disabled:text-slate-400 active:scale-98"
        >
          Proses Transaksi
        </button>
      </div>
    </div>
  )
}