import React from 'react'
import { PlusCircle, Edit, Trash2, Tag, Package, ChefHat, Calculator, FolderPlus } from 'lucide-react'

export default function InventoryGrid({
  products = [],
  categories = [],
  handleOpenProductModal,
  handleDeleteProduct,
  setShowToppingModal,
  setShowIngredientModal,
  setSelectedRecipeProduct,
  setShowHppModal,
  setShowCategoryModal
}) {
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId)
    return cat?.name || 'Menu'
  }

  return (
    <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto bg-slate-50/50 space-y-4 sm:space-y-6 pb-28 md:pb-8">
      
      {/* Top Header & Actions Bar - Responsif Tanpa Tabrakan */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        
        {/* Row 1: Judul & Tombol Utama (Stack Vertikal di HP, Sejajar di Tablet/PC) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
              Kelola Produk & Bahan
            </h3>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block mt-0.5">
              Atur takaran resep, HPP otomatis, dan ketersediaan katalog menu.
            </p>
          </div>

          {/* Tombol Utama */}
          <button
            onClick={() => handleOpenProductModal(null)}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-98 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>

        {/* Row 2: Sub-Toolbar Alat Bantu (Scroll Samping Bersih Tanpa Scrollbar Bawaan) */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setShowCategoryModal?.(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-bold transition shadow-2xs flex items-center gap-1 shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-600" /> Kategori
          </button>
          <button
            onClick={() => setShowHppModal?.(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-bold transition shadow-2xs flex items-center gap-1 shrink-0"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" /> HPP
          </button>
          <button
            onClick={setShowIngredientModal}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-bold transition shadow-2xs flex items-center gap-1 shrink-0"
          >
            <Package className="w-3.5 h-3.5 text-blue-600" /> Bahan Baku
          </button>
          <button
            onClick={() => setShowToppingModal(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-bold transition shadow-2xs flex items-center gap-1 shrink-0"
          >
            <Tag className="w-3.5 h-3.5 text-blue-600" /> Topping
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {products.map((product) => {
          const variant = product.product_variants?.[0]
          const stock = variant?.inventories?.[0]?.stock ?? 0
          const categoryName = getCategoryName(product.category_id)

          return (
            <div key={product.id} className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:shadow-lg hover:border-slate-300 transition duration-200">
              <div>
                <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200/60 mb-2.5">
                  {categoryName}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{product.name}</h4>
                <p className="text-sm font-mono font-black text-blue-600 mt-1">
                  Rp {parseFloat(variant?.price || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Stok Menu: <strong className="text-slate-800 font-bold">{stock} Pcs</strong>
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRecipeProduct(product)}
                  className="w-full py-2.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <ChefHat className="w-3.5 h-3.5 text-blue-600" /> Atur Komposisi Resep
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenProductModal(product)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="py-2.5 px-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}