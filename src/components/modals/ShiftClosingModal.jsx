import React, { useState } from 'react'
import { X, Calculator, Printer } from 'lucide-react'

export default function ShiftClosingModal({
  onClose,
  activeCashier,
  ordersHistory = [],
  onFinishShift
}) {
  const [startingCash, setStartingCash] = useState('100000') // Modal awal laci (default Rp 100.000)
  const [actualCash, setActualCash] = useState('') // Fisik uang tunai di laci saat closing
  const [notes, setNotes] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // 1. Filter Transaksi Khusus Kasir Aktif
  const cashierOrders = ordersHistory.filter((order) => {
    if (!activeCashier?.name) return true
    const orderCashier =
      order.cashier_name ||
      order.cashier ||
      order.cashiers?.name ||
      order.profiles?.name ||
      ''
    return !orderCashier || orderCashier.toLowerCase() === activeCashier.name.toLowerCase()
  })

  // 2. Hitung Omset per Metode Pembayaran
  let totalCashSales = 0
  let totalNonCashSales = 0
  const paymentBreakdown = { CASH: 0, QRIS: 0, CARD: 0, TRANSFER: 0 }

  cashierOrders.forEach((order) => {
    if (order.order_payments && order.order_payments.length > 0) {
      order.order_payments.forEach((p) => {
        const method = (p.method || 'CASH').toUpperCase()
        const amt = parseFloat(p.amount || 0)
        if (paymentBreakdown[method] !== undefined) {
          paymentBreakdown[method] += amt
        }
        if (method === 'CASH') totalCashSales += amt
        else totalNonCashSales += amt
      })
    } else {
      const amt = parseFloat(order.total_amount || 0)
      paymentBreakdown.CASH += amt
      totalCashSales += amt
    }
  })

  const startCashNum = parseFloat(startingCash) || 0
  const actualCashNum = parseFloat(actualCash) || 0

  // 3. Kalkulasi Reconcile
  const expectedCashInDrawer = startCashNum + totalCashSales
  const discrepancy = actualCashNum - expectedCashInDrawer // Selisih (Positif = Surplus, Negatif = Minus)
  const totalOmsetShift = totalCashSales + totalNonCashSales

  const handlePrintSummary = () => {
    const originalTitle = document.title
    document.title = `Laporan_Closing_Shift_${activeCashier?.name || 'Kasir'}_${new Date().toISOString().split('T')[0]}`
    window.print()
    document.title = originalTitle
  }

  const handleSubmitClosing = (e) => {
    e.preventDefault()
    if (actualCash === '') return alert('Masukkan jumlah fisik uang tunai di laci!')
    setIsSubmitted(true)
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto"
    >
      {/* CSS Cetak Universal: Presisi untuk Printer Bluetooth Thermal (58/80mm) & Rapi Saat Simpan PDF */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body * { 
            visibility: hidden !important; 
          }
          #shift-report-printable, #shift-report-printable * { 
            visibility: visible !important; 
          }
          #shift-report-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 8px !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            font-size: 11px !important;
            font-family: monospace !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { 
            display: none !important; 
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Rekapitulasi Closing Shift</h3>
              <p className="text-[11px] text-slate-400 font-medium">Laporan audit kas & serah terima shift.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AREA TAMPILAN SISTEM & PRINTABLE */}
        <div id="shift-report-printable" className="space-y-3.5">
          
          {/* Header Printable */}
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-200 pb-3">
            <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider">MEDIUM BREWSPACE</h2>
            <p className="text-[10px] text-slate-500 font-bold">LAPORAN CLOSING SHIFT KASIR</p>
            <p className="text-[9px] text-slate-400 font-mono">
              Petugas: {activeCashier?.name || 'Kasir'} • {new Date().toLocaleString('id-ID')}
            </p>
          </div>

          {/* Ringkasan Performa Shift */}
          <div className="grid grid-cols-2 gap-2 text-xs no-print">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
              <p className="text-base font-black text-slate-900 font-mono">{cashierOrders.length} <span className="text-xs font-normal text-slate-400">Nota</span></p>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/60 space-y-0.5">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Total Omset Shift</span>
              <p className="text-base font-black text-blue-700 font-mono">Rp {totalOmsetShift.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Rincian Kas Laci & Reconcile Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmitClosing} className="space-y-3 text-xs no-print">
              <div>
                <label className="font-bold block text-slate-700 mb-1">Modal Awal Laci Kas (Rp)</label>
                <input
                  type="number"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  placeholder="100000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>+ Penjualan Tunai Sistem:</span>
                  <span className="font-bold text-slate-800">Rp {totalCashSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-blue-700 font-bold pt-1 border-t border-slate-200/60">
                  <span>= Ekspektasi Kas di Laci:</span>
                  <span>Rp {expectedCashInDrawer.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div>
                <label className="font-bold block text-slate-700 mb-1">Fisik Uang Tunai Aktual (Hitung di Laci)</label>
                <input
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder="Masukkan nominal hasil hitung fisik..."
                  className="w-full p-2.5 bg-white border border-blue-500 rounded-xl font-mono font-black text-base text-blue-700 focus:ring-2 focus:ring-blue-600/20 focus:outline-none shadow-2xs"
                  required
                />
              </div>

              {actualCash !== '' && (
                <div className={`p-3 rounded-2xl border flex justify-between items-center ${
                  discrepancy === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : discrepancy > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <span className="font-bold text-xs">
                    {discrepancy === 0 ? 'Kas Pas (Sesuai)' : discrepancy > 0 ? 'Surplus Kas' : 'Selisih Kurang (Minus)'}
                  </span>
                  <span className="font-mono font-black text-sm">
                    Rp {Math.abs(discrepancy).toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div>
                <label className="font-bold block text-slate-700 mb-1">Catatan Staf / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pecahan 20rb habis, sisa koin..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-medium focus:bg-white focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition active:scale-98"
              >
                Kunci & Simpan Closing Shift
              </button>
            </form>
          ) : (
            /* TAMPILAN HASIL RECONCILE (BISA DICETAK TERMAL MAUPUN SIMPAN PDF) */
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span>Total Transaksi:</span>
                  <span className="font-bold">{cashierOrders.length} Nota</span>
                </div>
                <div className="flex justify-between">
                  <span>Modal Awal:</span>
                  <span className="font-bold">Rp {startCashNum.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tunai (Cash):</span>
                  <span className="font-bold">Rp {totalCashSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Tunai (QRIS/Card):</span>
                  <span className="font-bold">Rp {totalNonCashSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span>Ekspektasi Kas Laci:</span>
                  <span className="font-bold">Rp {expectedCashInDrawer.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-blue-700 font-bold">
                  <span>Fisik Kas Aktual:</span>
                  <span>Rp {actualCashNum.toLocaleString('id-ID')}</span>
                </div>
                <div className={`flex justify-between pt-1 border-t border-dashed border-slate-300 font-black ${
                  discrepancy >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  <span>Selisih (Variansi):</span>
                  <span>Rp {discrepancy.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {notes && (
                <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-200">
                  Catatan: {notes}
                </p>
              )}

              <div className="flex gap-2 no-print">
                <button
                  type="button"
                  onClick={handlePrintSummary}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onFinishShift === 'function') onFinishShift()
                    onClose?.()
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Selesai Shift
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}