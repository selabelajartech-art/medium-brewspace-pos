import React from 'react'
import { Plus, Minus } from 'lucide-react'

export default function OrderRegisterPane({
  customerName, setCustomerName, tableNumber, setTableNumber,
  cart, updateCartQuantity, subtotal, discountAmount, grandTotal,
  setShowPaymentModal, setPayments
}) {
  return (
    <div className="space-y-4 flex-1 overflow-y-auto flex flex-col justify-between h-full">
      <div className="space-y-3">
        <div className="pb-2 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Detail Pesanan</h3>
          <span className="text-[10px] text-slate-400 font-bold">{cart.length} Jenis Item</span>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nama Pelanggan / Member"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
          />
          <select
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="">Pilih Meja / Area</option>
            <option value="Meja 01 (Indoor)">Meja 01 (Indoor)</option>
            <option value="Meja 02 (Indoor)">Meja 02 (Indoor)</option>
            <option value="Quiet Zone 05">Quiet Zone 05</option>
            <option value="Meeting Room 1">Meeting Room 1</option>
            <option value="Takeaway">Takeaway</option>
          </select>
        </div>

        <div className="space-y-2">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-lg">
              Keranjang masih kosong
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.cartKey} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                  <img src={item.image_url || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                    <span className="text-[10px] text-blue-700 font-mono font-bold">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQuantity({ id: item.product_id }, { id: item.variant_id }, -1)}
                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity({ id: item.product_id }, { id: item.variant_id }, 1)}
                      className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 space-y-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Subtotal</span>
            <span className="font-mono font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Diskon</span>
            <span className="font-mono font-bold text-slate-800">-Rp {discountAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
            <span>Total Tagihan</span>
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
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          Proses Pembayaran
        </button>
      </div>
    </div>
  )
}