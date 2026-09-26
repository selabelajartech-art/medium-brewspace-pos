import React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import watermarkImg from '../../assets/watermark.png'

export default function ProductGrid({
  categories,
  selectedCategory,
  setSelectedCategory,
  ordersHistory,
  setActiveTab,
  loading,
  filteredProducts,
  onOpenCustomization
}) {
  const getCategoryBadgeClass = (catId) => {
    const cat = categories.find((c) => c.id === catId)
    const name = (cat?.name || '').toLowerCase()

    if (name.includes('coffee') && !name.includes('non')) {
      return { label: cat?.name || 'Coffee', bg: 'bg-amber-50 text-amber-900 border-amber-200/60' }
    } else if (name.includes('non-coffee')) {
      return { label: cat?.name || 'Non-Coffee', bg: 'bg-sky-50 text-sky-900 border-sky-200/60' }
    } else if (name.includes('pastry') || name.includes('makanan') || name.includes('food')) {
      return { label: cat?.name || 'Pastry', bg: 'bg-orange-50 text-orange-900 border-orange-200/60' }
    } else if (name.includes('space') || name.includes('sewa')) {
      return { label: cat?.name || 'Space', bg: 'bg-purple-50 text-purple-900 border-purple-200/60' }
    }
    return { label: cat?.name || 'Menu', bg: 'bg-slate-100 text-slate-700 border-slate-200/60' }
  }

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 relative bg-white">
      
      {/* WATERMARK BACKGROUND OVERLAY */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-[0.20] select-none p-12">
        <img
          src={watermarkImg}
          alt="Watermark"
          className="w-full max-w-sm h-auto object-contain grayscale mix-blend-multiply"
        />
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-0 space-y-6 pb-20 lg:pb-0">
        
        {/* Category Filter Pills - Whitespace & Touch Target Lega */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100/80 border border-slate-200/70 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Semua Menu
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 border border-slate-200/70 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Antrean Order Aktif - Clean Horizontal Slider */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">Antrean Order Aktif</h3>
            <button onClick={() => setActiveTab('history')} className="text-xs text-blue-600 font-semibold hover:underline">
              Lihat Semua
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {ordersHistory.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">Belum ada riwayat transaksi aktif.</div>
            ) : (
              ordersHistory.slice(0, 5).map((ord) => (
                <div key={ord.id} className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-2xl min-w-[160px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[100px]">{ord.customers?.name || 'Pelanggan'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{ord.order_number.substring(0, 5)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{ord.order_items?.length || 1} item • {ord.table_number || ord.order_type}</p>
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[10px] font-bold">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PRODUCT GRID - Single Column di Mobile, 2 Column di Tablet, 3 di Desktop */}
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const variant = product.product_variants?.[0]
              if (!variant) return null
              const badge = getCategoryBadgeClass(product.category_id)

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-400 transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{product.name}</h4>
                    <p className="text-xs font-mono font-bold text-slate-700">
                      Rp {parseFloat(variant.price).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* High-Contrast Touch Button */}
                  <button
                    type="button"
                    onClick={() => onOpenCustomization(product)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
                  >
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}