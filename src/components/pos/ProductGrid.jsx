import React from 'react'
import { Plus, Minus, RefreshCw } from 'lucide-react'

export default function ProductGrid({
  categories,
  selectedCategory,
  setSelectedCategory,
  ordersHistory,
  setActiveTab,
  loading,
  filteredProducts,
  getCartQuantity,
  updateCartQuantity
}) {
  return (
    <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5">
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            selectedCategory === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua Produk
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Antrean Order Aktif */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Antrean Order Aktif</h3>
          <button onClick={() => setActiveTab('history')} className="text-[11px] text-blue-600 font-bold hover:underline">Lihat Semua</button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {ordersHistory.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-1">Belum ada riwayat transaksi.</div>
          ) : (
            ordersHistory.slice(0, 5).map((ord) => (
              <div key={ord.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl min-w-[150px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[90px]">{ord.customers?.name || 'Pelanggan'}</span>
                  <span className="text-[9px] text-slate-400 font-mono">#{ord.order_number.substring(0, 5)}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{ord.order_items?.length || 1} item • {ord.table_number || ord.order_type}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                  {ord.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid Katalog Produk */}
      {loading ? (
        <div className="flex justify-center py-12 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProducts.map((product) => {
            const variant = product.product_variants?.[0]
            if (!variant) return null
            const stock = variant.inventories?.[0]?.stock ?? 0
            const cartQty = getCartQuantity(product.id, variant.id)

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-blue-500 transition duration-150"
              >
                <div>
                  <img
                    src={product.image_url || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{product.name}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Stok: {stock} Pcs
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                  <span className="font-bold text-blue-700 text-xs font-mono">
                    Rp {parseFloat(variant.price).toLocaleString('id-ID')}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQuantity(product, variant, -1)}
                      disabled={cartQty === 0}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{cartQty}</span>
                    <button
                      onClick={() => updateCartQuantity(product, variant, 1)}
                      className="w-6 h-6 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}