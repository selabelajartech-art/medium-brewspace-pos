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
  setShowCategoryModal // <-- Prop Baru
}) {
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId)
    return cat?.name || 'Menu'
  }

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f8f9fa] space-y-5 pb-28 md:pb-8">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="font-black text-sm text-slate-900">Kelola Produk & Bahan Baku</h3>
          <p className="text-[11px] text-slate-400 font-medium">Atur takaran resep, HPP otomatis, dan kelola ketersediaan produk.</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCategoryModal?.(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" /> Kategori Menu
          </button>
          <button
            onClick={() => setShowHppModal?.(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4 text-blue-600" /> Kalkulator HPP
          </button>
          <button
            onClick={setShowIngredientModal}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Package className="w-4 h-4 text-blue-600" /> Bahan Baku
          </button>
          <button
            onClick={() => setShowToppingModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-blue-600" /> Topping
          </button>
          <button
            onClick={() => handleOpenProductModal(null)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-98"
          >
            <PlusCircle className="w-4 h-4" /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const variant = product.product_variants?.[0]
          const stock = variant?.inventories?.[0]?.stock ?? 0
          const categoryName = getCategoryName(product.category_id)

          return (
            <div key={product.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200/60 mb-2">
                  {categoryName}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{product.name}</h4>
                <p className="text-xs font-mono font-bold text-blue-600 mt-0.5">
                  Rp {parseFloat(variant?.price || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Stok Menu: <strong className="text-slate-800">{stock} Pcs</strong>
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRecipeProduct(product)}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <ChefHat className="w-3.5 h-3.5 text-blue-600" /> Atur Komposisi Resep
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenProductModal(product)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="py-2 px-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
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