import React from 'react'
import { PlusCircle, Edit, Trash2, Tag, Package, ChefHat, Calculator } from 'lucide-react'

export default function InventoryGrid({
  products,
  categories,
  handleOpenProductModal,
  handleDeleteProduct,
  setShowToppingModal,
  setShowIngredientModal,
  setSelectedRecipeProduct,
  setShowHppModal
}) {
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId)
    return cat?.name || 'Menu'
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4 pb-28 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">Kelola Produk, Resep & Bahan Baku</h3>
          <p className="text-[11px] text-slate-500">Atur takaran resep, HPP otomatis, dan kelola stok bahan baku.</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowHppModal?.(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Calculator className="w-4 h-4 text-indigo-200" /> Kalkulator HPP
          </button>
          <button
            onClick={setShowIngredientModal}
            className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Package className="w-4 h-4 text-amber-300" /> Bahan Baku
          </button>
          <button
            onClick={() => setShowToppingModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Tag className="w-4 h-4 text-blue-400" /> Kelola Topping
          </button>
          <button
            onClick={() => handleOpenProductModal(null)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Tambah Produk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {products.map((product) => {
          const variant = product.product_variants?.[0]
          const stock = variant?.inventories?.[0]?.stock ?? 0
          const categoryName = getCategoryName(product.category_id)

          return (
            <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 mb-1.5">
                  {categoryName}
                </span>
                <h4 className="font-extrabold text-xs text-slate-900">{product.name}</h4>
                <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                  Rp {parseFloat(variant?.price || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Stok Menu: <strong className="text-slate-700">{stock} Pcs</strong>
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRecipeProduct(product)}
                  className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                >
                  <ChefHat className="w-3.5 h-3.5 text-emerald-600" /> Atur Komposisi Resep
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenProductModal(product)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
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