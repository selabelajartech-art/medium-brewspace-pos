import React from 'react'
import { X, Printer, CheckCircle } from 'lucide-react'

export default function ReceiptModal({
  setShowReceiptModal,
  setSelectedOrderDetail,
  selectedOrderDetail,
  lastTransaction
}) {
  const transactionData = selectedOrderDetail || lastTransaction

  if (!transactionData) return null

  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    if (setShowReceiptModal) setShowReceiptModal(false)
    if (setSelectedOrderDetail) setSelectedOrderDetail(null)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      
      {/* CSS KHUSUS PRINTER THERMAL (58mm / 80mm) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt-printable, #thermal-receipt-printable * {
            visibility: visible !important;
          }
          #thermal-receipt-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 58mm !important;
            max-width: 58mm !important;
            padding: 2mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-size: 10px !important;
            font-family: monospace !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        
        {/* Modal Action Header (Sembunyi saat dicetak) */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Struk Transaksi</h3>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AREA STRUK TERMAL (DICETAK PRESISI KERTAS KASIR) */}
        <div id="thermal-receipt-printable" className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl space-y-3 font-mono text-xs">
          
          {/* Header Kafe */}
          <div className="text-center space-y-1">
            <h2 className="font-black text-sm uppercase text-slate-900 tracking-wider">MEDIUM BREWSPACE</h2>
            <p className="text-[10px] text-slate-500">Coffee & Community Space</p>
            <p className="text-[9px] text-slate-400 border-b border-dashed border-slate-300 pb-2">
              {transactionData.date || new Date().toLocaleString('id-ID')}
            </p>
          </div>

          {/* Meta Transaksi */}
          <div className="text-[10px] space-y-0.5 text-slate-700">
            <div className="flex justify-between">
              <span>No. Order:</span>
              <span className="font-bold">{transactionData.order_number || transactionData.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{transactionData.customer || transactionData.customers?.name || 'Umum'}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{transactionData.cashier || 'Kasir'}</span>
            </div>
          </div>

          {/* Item Pesanan */}
          <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5 text-[11px]">
            {(transactionData.items || transactionData.order_items || []).map((item, idx) => {
              const name = item.name || item.product_variants?.products?.name || 'Item'
              const qty = item.quantity || 1
              const price = item.finalPrice || item.unit_price || 0
              const subtotal = item.subtotal || price * qty

              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="truncate pr-2">{name}</span>
                    <span className="shrink-0">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {qty} x Rp {price.toLocaleString('id-ID')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total & Pembayaran */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between font-black text-xs text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL</span>
              <span>Rp {(transactionData.grandTotal || transactionData.total_amount || 0).toLocaleString('id-ID')}</span>
            </div>

            {transactionData.payments && transactionData.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-[10px] text-slate-600">
                <span>Bayar ({p.method}):</span>
                <span>Rp {(parseFloat(p.amount) || 0).toLocaleString('id-ID')}</span>
              </div>
            ))}

            <div className="flex justify-between text-[10px] font-bold text-slate-800 pt-1 border-t border-dashed border-slate-300">
              <span>Kembalian:</span>
              <span>Rp {(transactionData.change || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Footer Struk */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-400 space-y-0.5">
            <p className="font-bold text-slate-600">Terima Kasih atas Kunjungan Anda!</p>
            <p>Wifi Pass: mediumbrew2026</p>
          </div>
        </div>

        {/* Tombol Aksi (Sembunyi saat dicetak) */}
        <div className="flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Cetak Struk
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}