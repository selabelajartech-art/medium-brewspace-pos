import React from 'react'
import { Plus, Minus, Trash2, Settings } from 'lucide-react'

export default function OrderRegisterPane({
  customerName, setCustomerName, tableNumber, setTableNumber,
  tablesList, setShowTableModal,
  cart, updateCartQuantity, removeCartItem, subtotal, discountAmount, grandTotal,
  setShowPaymentModal, setPayments
}) {
  return (
    <div className="space-y-4 flex-1 overflow-y-auto flex flex-col justify-between h-full">
      <div className="space-y-3">
        <div className="pb-2 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Keranjang Belanja</h3>
          <span className="text-[10px] text-slate-400 font-bold">{cart.length} Jenis Item</span>
        </div>

        {/* Input Informasi Pelanggan & Meja */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Pelanggan / Member (Contoh: Budi)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
          />
          
          <div className="flex gap-1.5">
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="">Pilih Meja / Area</option>
              {tablesList.map((tbl) => (
                <option key={tbl.id} value={tbl.name}>
                  {tbl.name}
                </option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={() => setShowTableModal(true)}
              title="Kelola Daftar Meja"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Daftar Item Keranjang */}
        <div className="space-y-2">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
              Keranjang masih kosong
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.cartKey} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h4>
                      {item.notes && (
                        <p className="text-[10px] text-blue-700 font-semibold leading-tight mt-0.5">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.cartKey)}
                      className="text-slate-300 hover:text-red-500 transition p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Rp {(item.finalPrice * item.quantity).toLocaleString('id-ID')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQuantity(item.cartKey, -1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.cartKey, 1)}
                        className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center font-bold"
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

      {/* Kalkulasi Ringkasan */}
      <div className="pt-3 border-t border-slate-200 space-y-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Subtotal</span>
            <span className="font-mono font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Diskon</span>
            <span className="font-mono font-bold text-slate-800">-Rp {discountAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
            <span>Grand Total</span>
            <span className="font-mono text-blue-700">
              Rp {grandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={() => {
            setPayments([{ method: 'CASH', amount: grandTotal.toString() }])
            setShowPaymentModal(true)
          }}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
        >
          Selesaikan Pesanan
        </button>
      </div>
    </div>
  )
}