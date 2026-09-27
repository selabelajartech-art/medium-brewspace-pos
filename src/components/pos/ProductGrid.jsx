import React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import watermarkImg from '../../assets/watermark.png'

export default function ProductGrid({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  ordersHistory = [],
  setActiveTab,
  loading,
  filteredProducts = [],
  onOpenCustomization
}) {
  return (
    <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 relative bg-[#f8f9fa] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
      
      {/* Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-[0.12] select-none p-12">
        <img
          src={watermarkImg}
          alt="Watermark"
          className="w-full max-w-xs h-auto object-contain grayscale mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 space-y-5 pb-36 lg:pb-6">
        
        {/* Category Filter Pills */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">Kategori Menu</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua Menu
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Antrean Order Aktif Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">Antrean Order Aktif</h3>
            <button onClick={() => setActiveTab('history')} className="text-xs text-blue-600 font-bold hover:underline">
              Lihat Semua
            </button>
          </div>
          
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 -mx-3 px-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ordersHistory.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">Belum ada riwayat transaksi aktif.</div>
            ) : (
              ordersHistory.slice(0, 5).map((ord) => (
                <div key={ord.id} className="bg-white border border-slate-200/80 p-3 rounded-2xl min-w-[150px] shrink-0 space-y-1 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[90px]">{ord.customers?.name || 'Pelanggan'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{ord.order_number.substring(0, 5)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{ord.order_items?.length || 1} item • {ord.table_number || ord.order_type}</p>
                  <div className="pt-0.5">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md text-[10px] font-bold">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Grid Catalog */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">Pilih Produk</h3>
            <span className="text-[11px] text-slate-400 font-medium">{filteredProducts.length} Item Tersedia</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredProducts.map((product) => {
                const variant = product.product_variants?.[0]
                if (!variant) return null

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all space-y-3 group"
                  >
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug group-hover:text-blue-600 transition">
                        {product.name}
                      </h4>
                      <p className="text-xs font-mono font-bold text-blue-600">
                        Rp {parseFloat(variant.price).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenCustomization(product)}
                      className="w-full py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition shadow-xs"
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
    </div>
  )
}