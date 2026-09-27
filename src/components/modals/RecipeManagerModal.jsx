import React, { useState } from 'react'
import { X, Plus, Trash2, ChefHat, Calculator } from 'lucide-react'

export default function RecipeManagerModal({
  product,
  ingredientsList = [],
  productRecipes = [],
  onClose,
  handleSaveRecipe,
  handleDeleteRecipeItem
}) {
  const variant = product?.product_variants?.[0]
  const [selectedIngredientId, setSelectedIngredientId] = useState('')
  const [qtyRequired, setQtyRequired] = useState('')

  // Filter resep untuk produk ini
  const currentRecipes = productRecipes.filter((r) => r.variant_id === variant?.id)

  // Kalkulasi Otomatis Total HPP (COGS)
  const totalHPP = currentRecipes.reduce((sum, item) => {
    const ing = ingredientsList.find((i) => i.id === item.ingredient_id)
    const cost = ing ? parseFloat(ing.cost_per_unit || 0) : 0
    return sum + cost * parseFloat(item.quantity_required || 0)
  }, 0)

  const handleAddIngredient = (e) => {
    e.preventDefault()
    if (!selectedIngredientId || !qtyRequired) return alert('Pilih bahan dan masukkan takaran!')

    handleSaveRecipe({
      variant_id: variant?.id,
      ingredient_id: selectedIngredientId,
      quantity_required: parseFloat(qtyRequired)
    })

    setSelectedIngredientId('')
    setQtyRequired('')
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative border border-slate-200/80 space-y-4 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Atur Komposisi Resep</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {product?.name || 'Produk'} ({variant?.variant_name || 'Regular'})
              </p>
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

        {/* Ringkasan HPP & Harga Jual */}
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex justify-between items-center text-xs shadow-xs">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Kalkulasi HPP (COGS)
            </span>
            <span className="text-base font-mono font-black text-blue-400 mt-0.5 block">
              Rp {totalHPP.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Harga Jual Menu
            </span>
            <span className="text-base font-mono font-bold text-white mt-0.5 block">
              Rp {parseFloat(variant?.price || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Form Tambah Bahan ke Resep */}
        <form onSubmit={handleAddIngredient} className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Tambah Takaran Bahan Baku
          </label>
          <div className="flex gap-2">
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-semibold text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            >
              <option value="">-- Pilih Bahan --</option>
              {ingredientsList.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </option>
              ))}
            </select>

            <input
              type="number"
              step="any"
              placeholder="Jumlah"
              value={qtyRequired}
              onChange={(e) => setQtyRequired(e.target.value)}
              className="w-24 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-mono font-bold text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />

            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition shadow-xs flex items-center justify-center shrink-0 active:scale-98"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Daftar Komposisi Terpasang */}
        <div className="space-y-2 pt-1">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Bahan Terpakai Per 1 Porsi ({currentRecipes.length})
          </h4>
          
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {currentRecipes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                Belum ada takaran resep yang ditambahkan.
              </div>
            ) : (
              currentRecipes.map((item) => {
                const ing = ingredientsList.find((i) => i.id === item.ingredient_id)
                const itemCost = (ing ? parseFloat(ing.cost_per_unit || 0) : 0) * parseFloat(item.quantity_required || 0)

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h5 className="font-extrabold text-slate-900 truncate">{ing?.name || 'Bahan'}</h5>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {item.quantity_required} {ing?.unit || ''} • <span className="font-bold text-blue-600">Modal: Rp {itemCost.toLocaleString('id-ID')}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecipeItem?.(item.id)}
                      className="text-slate-300 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}