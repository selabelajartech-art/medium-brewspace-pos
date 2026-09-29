import React from 'react'
import { Plus, Minus, Trash2, Settings, ShoppingBag, ArrowRight, User } from 'lucide-react'

export default function OrderRegisterPane({
  customerName,
  setCustomerName,
  customerId,
  setCustomerId,
  customersList = [],
  tableNumber,
  setTableNumber,
  tablesList = [],
  setShowTableModal,
  cart = [],
  updateCartQuantity,
  removeCartItem,
  subtotal = 0,
  setShowPaymentModal,
  setPayments
}) {
  const safeCart = Array.isArray(cart) ? cart : []
  const safeCustomers = Array.isArray(customersList) ? customersList : []

  return (
    <div className="w-full bg-white flex flex-col justify-between h-full space-y-3">
      
      {/* Upper Cart Details */}
      <div className="space-y-3 overflow-y-auto pr-1 flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Header Rincian Tagihan */}
        <div className="pb-2.5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Rincian Tagihan</h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {safeCart.reduce((acc, item) => acc + (item?.quantity || 0), 0)} Porsi ({safeCart.length} Jenis Item)
            </p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* Input Customer & Table Selector */}
        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
              <span>Pelanggan</span>
              {customerId && (
                <span className="text-emerald-600 text-[9px] font-bold">+Poin Aktif</span>
              )}
            </label>
            
            <div className="flex gap-1.5">
              <select
                value={customerId || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '') {
                    setCustomerId?.(null)
                  } else {
                    const found = safeCustomers.find((c) => String(c.id) === String(val))
                    setCustomerId?.(found?.id || val)
                    if (found) setCustomerName?.(found.name)
                  }
                }}
                className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
              >
                <option value="">Pelanggan Umum (Tanpa Member)</option>
                {safeCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.points || 0} Poin)
                  </option>
                ))}
              </select>
            </div>

            {!customerId && (
              <input
                type="text"
                placeholder="Nama Pelanggan Manual (Opsional)..."
                value={customerName || ''}
                onChange={(e) => setCustomerName?.(e.target.value)}
                className="w-full mt-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            )}
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Area / Nomor Meja
            </label>
            <div className="flex gap-1.5">
              <select
                value={tableNumber || ''}
                onChange={(e) => setTableNumber?.(e.target.value)}
                className="flex-1 px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
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
                className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition shrink-0"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* List Cart */}
        <div className="space-y-2 pt-1">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Item Pesanan</h4>
          {safeCart.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              Keranjang belanja masih kosong.
            </div>
          ) : (
            <div className="space-y-2">
              {safeCart.map((item) => (
                <div key={item.cartKey} className="p-2.5 sm:p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h4>
                      {item.notes && (
                        <p className="text-[10px] text-blue-600 font-medium leading-tight mt-0.5">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem?.(item.cartKey)}
                      className="text-slate-300 hover:text-red-500 transition p-0.5 shrink-0"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Rp {((item.finalPrice || 0) * (item.quantity || 1)).toLocaleString('id-ID')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity?.(item.cartKey, -1)}
                        className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 transition active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold font-mono w-4 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity?.(item.cartKey, 1)}
                        className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:bg-blue-700 transition active:scale-90"
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

      {/* Ringkasan & Tombol Aksi */}
      <div className="pt-2 border-t border-slate-100 space-y-2.5 shrink-0">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Subtotal Pesanan</span>
            <span className="font-mono text-slate-900 font-extrabold">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            * Diskon & metode pembayaran diatur pada langkah selanjutnya.
          </p>
        </div>

        <button
          type="button"
          disabled={safeCart.length === 0}
          onClick={() => {
            if (typeof setPayments === 'function') {
              setPayments([{ method: 'CASH', amount: subtotal.toString() }])
            }
            setShowPaymentModal?.(true)
          }}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs transition shadow-md shadow-blue-600/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none active:scale-98 flex items-center justify-center gap-2"
        >
          <span>Lanjut ke Pembayaran</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}