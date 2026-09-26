import React from 'react'
import { X, Printer } from 'lucide-react'

export default function ReceiptModal({
  setShowReceiptModal,
  setSelectedOrderDetail,
  selectedOrderDetail,
  lastTransaction
}) {
  const items = selectedOrderDetail ? selectedOrderDetail.order_items : lastTransaction?.items
  const orderNum = selectedOrderDetail?.order_number || lastTransaction?.order_number || '-'
  const dateStr = selectedOrderDetail ? new Date(selectedOrderDetail.created_at).toLocaleString('id-ID') : (lastTransaction?.date || new Date().toLocaleString('id-ID'))
  const customer = selectedOrderDetail?.customers?.name || lastTransaction?.customer || 'Umum'
  const cashier = lastTransaction?.cashier || 'Kasir'
  const totalAmount = selectedOrderDetail ? parseFloat(selectedOrderDetail.total_amount) : (lastTransaction?.grandTotal || 0)

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: absolute; left: 0; top: 0; width: 100%; max-width: 80mm;
            padding: 10px; margin: 0; box-shadow: none !important; border: none !important;
            background: white !important; color: black !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="printable-receipt" className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative border border-slate-200">
        <button 
          onClick={() => { setShowReceiptModal(false); setSelectedOrderDetail(null) }} 
          className="no-print absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-3">
          <h3 className="font-black text-base text-slate-900 uppercase tracking-wide">Medium Brew & Space</h3>
          <p className="text-[10px] text-slate-600 leading-tight mt-0.5">Jl. Pajajaran Dalam 94/72, Bandung</p>
          <p className="text-[9px] text-slate-500 font-mono mt-0.5">Wi-Fi: MediumSpace | Pass: brew2026</p>
        </div>

        <div className="border-t border-b border-dashed border-slate-300 py-2 my-2 text-[11px] font-mono space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">No. Order:</span>
            <span className="font-bold text-slate-900">{orderNum}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Waktu:</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pelanggan:</span>
            <span>{customer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Kasir:</span>
            <span>{cashier}</span>
          </div>
        </div>

        <div className="py-1 space-y-2 text-xs font-mono">
          {items?.map((item, idx) => {
            const itemName = item.name || item.product_variants?.products?.name || 'Produk'
            const qty = item.quantity || 1
            const price = item.finalPrice || item.price || item.unit_price || 0
            const subtotal = item.subtotal || (price * qty)
            const notes = item.notes

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-800 leading-tight">{itemName}</p>
                    <span className="text-[10px] text-slate-500">{qty} x Rp {price.toLocaleString('id-ID')}</span>
                  </div>
                  <span className="font-bold text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {notes && (
                  <p className="text-[9px] text-slate-600 italic pl-1 border-l-2 border-slate-300">
                    {notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="border-t border-dashed border-slate-300 pt-2 mt-2 space-y-1 font-mono text-xs">
          <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
            <span>TOTAL:</span>
            <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="text-center mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Powered by Medium Brewspace POS</p>
        </div>

        <div className="no-print mt-5 pt-3 border-t border-slate-100">
          <button 
            onClick={() => window.print()} 
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Cetak Struk Thermal
          </button>
        </div>

      </div>
    </div>
  )
}