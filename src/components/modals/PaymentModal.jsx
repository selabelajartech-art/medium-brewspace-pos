import React from 'react'
import { X, RefreshCw, CheckCircle } from 'lucide-react'

export default function PaymentModal({
  setShowPaymentModal,
  grandTotal,
  payments,
  setPayments,
  checkoutLoading,
  handleCheckout
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl relative border border-slate-200 space-y-4">
        <button onClick={() => setShowPaymentModal(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
        <h3 className="font-bold text-sm text-slate-900">Proses Pembayaran</h3>
        <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
          <div className="flex justify-between"><span>Total Tagihan:</span><span className="font-mono font-bold text-blue-700">Rp {grandTotal.toLocaleString('id-ID')}</span></div>
        </div>
        {payments.map((p, idx) => (
          <div key={idx} className="flex gap-2 text-xs">
            <select value={p.method} onChange={(e) => { const u = [...payments]; u[idx].method = e.target.value; setPayments(u) }} className="border p-2 rounded-lg bg-slate-50 font-bold">
              <option value="CASH">Tunai</option><option value="QRIS">QRIS</option><option value="CARD">Kartu Debit/Kredit</option>
            </select>
            <input type="number" value={p.amount} onChange={(e) => { const u = [...payments]; u[idx].amount = e.target.value; setPayments(u) }} placeholder="Nominal Bayar" className="border p-2 rounded-lg flex-1 font-mono font-bold" />
          </div>
        ))}
        <button disabled={checkoutLoading} onClick={handleCheckout} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-blue-700 flex items-center justify-center gap-2">
          {checkoutLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Selesaikan Transaksi
        </button>
      </div>
    </div>
  )
}