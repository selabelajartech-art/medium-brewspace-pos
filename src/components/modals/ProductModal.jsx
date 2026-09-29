import React, { useEffect } from 'react'
import { X, PlusCircle, Save, PackagePlus, Calculator, Lock } from 'lucide-react'

export default function ProductModal({
  setShowProductModal,
  editingProduct,
  productForm,
  setProductForm,
  categories = [],
  ingredientsList = [],
  productRecipes = [],
  handleSaveProduct
}) {
  const variantId = editingProduct?.product_variants?.[0]?.id

  // 1. Cari resep khusus untuk produk/varian ini
  const currentRecipes = (productRecipes || []).filter(
    (r) => String(r.variant_id) === String(variantId) &&
    ingredientsList.some((ing) => String(ing.id) === String(r.ingredient_id))
  )

  const hasRecipe = currentRecipes.length > 0

  // 2. Hitung Stok Otomatis berdasarkan bahan baku terkecil (Faktor Pembatas)
  let calculatedStock = null
  if (hasRecipe) {
    const capacities = currentRecipes.map((r) => {
      const ing = ingredientsList.find((i) => String(i.id) === String(r.ingredient_id))
      if (!ing) return 0
      const currentStock = parseFloat(ing.current_stock ?? ing.stock ?? 0)
      const qtyReq = parseFloat(r.quantity_required || 0)
      return qtyReq > 0 ? Math.floor(currentStock / qtyReq) : 0
    })
    calculatedStock = Math.min(...capacities)
  }

  // 3. Auto-sync stok jika produk memiliki resep
  useEffect(() => {
    if (hasRecipe && calculatedStock !== null) {
      setProductForm((prev) => ({ ...prev, stock: calculatedStock.toString() }))
    }
  }, [hasRecipe, calculatedStock])

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowProductModal?.(false)
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-slate-200 space-y-5 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {editingProduct ? 'Edit Menu Katalog' : 'Tambah Menu Baru'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Lengkapi rincian nama, harga, dan stok katalog.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowProductModal?.(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProduct} className="space-y-4">
          
          {/* Nama Menu */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nama Menu</label>
            <input
              type="text"
              required
              placeholder="Contoh: Es Kopi Susu Aren"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl font-medium text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Kategori Menu */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Kategori Menu</label>
            <select
              value={productForm.category_id}
              onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl font-semibold text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
            >
              <option value="">-- Pilih Kategori Menu --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Harga & Stok Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Harga (Rp)</label>
              <input
                type="number"
                required
                placeholder="22000"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl font-mono font-bold text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 block">Stok (Pcs)</label>
                {hasRecipe && (
                  <span className="text-[9px] font-extrabold text-blue-600 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Auto Resep
                  </span>
                )}
              </div>
              <input
                type="number"
                required
                readOnly={hasRecipe}
                placeholder="50"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className={`w-full px-3.5 py-2.5 border rounded-2xl font-mono font-bold text-xs transition ${
                  hasRecipe
                    ? 'bg-blue-50/60 border-blue-200 text-blue-900 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200/80 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
            </div>
          </div>

          {hasRecipe && (
            <p className="text-[10px] text-blue-600 font-medium flex items-center gap-1 bg-blue-50 p-2 rounded-xl border border-blue-100">
              <Calculator className="w-3 h-3 shrink-0" />
              Stok Pcs otomatis dihitung dari sisa takaran resep bahan baku mentah.
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-98 mt-2"
          >
            {editingProduct ? (
              <>
                <Save className="w-4 h-4" /> Simpan Perubahan
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Tambah Menu Baru
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  )
}