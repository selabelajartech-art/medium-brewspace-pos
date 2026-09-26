import React, { useState } from 'react'
import { X, Plus, Trash2, ChefHat, Calculator } from 'lucide-react'

export default function RecipeManagerModal({
  product,
  ingredientsList,
  productRecipes,
  onClose,
  handleSaveRecipe,
  handleDeleteRecipeItem
}) {
  const variant = product.product_variants?.[0]
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
      variant_id: variant.id,
      ingredient_id: selectedIngredientId,
      quantity_required: parseFloat(qtyRequired)
    })

    setSelectedIngredientId('')
    setQtyRequired('')
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative border border-slate-200">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Atur Komposisi Resep</h3>
            <p className="text-[11px] text-slate-500">{product.name} ({variant?.variant_name || 'Regular'})</p>
          </div>
        </div>

        {/* Ringkasan HPP & Margin */}
        <div className="bg-slate-900 text-white p-3 rounded-xl mb-4 flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Kalkulasi HPP (Modal Beli)</span>
            <span className="text-sm font-mono font-black text-emerald-400">
              Rp {totalHPP.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Harga Jual Menu</span>
            <span className="text-sm font-mono font-bold text-white">
              Rp {parseFloat(variant?.price || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Form Tambah Bahan ke Resep */}
        <form onSubmit={handleAddIngredient} className="space-y-2 mb-4">
          <label className="text-xs font-bold text-slate-700 block">Tambah Takaran Bahan Baku:</label>
          <div className="flex gap-2 text-xs">
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
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
              className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
            />

            <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Daftar Komposisi Terpasang */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <h4 className="font-bold text-xs text-slate-700">Bahan Terpakai Per 1 Porsi:</h4>
          {currentRecipes.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">Belum ada takaran resep yang ditambahkan.</p>
          ) : (
            currentRecipes.map((item) => {
              const ing = ingredientsList.find((i) => i.id === item.ingredient_id)
              const itemCost = (ing ? parseFloat(ing.cost_per_unit || 0) : 0) * parseFloat(item.quantity_required || 0)

              return (
                <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{ing?.name || 'Bahan'}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {item.quantity_required} {ing?.unit} • Modal: Rp {itemCost.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteRecipeItem(item.id)} className="p-1 text-slate-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}