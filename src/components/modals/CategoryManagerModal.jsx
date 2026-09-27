import React, { useState } from 'react'
import { X, Plus, Trash2, FolderPlus } from 'lucide-react'

export default function CategoryManagerModal({
  setShowCategoryModal,
  categories = [],
  handleSaveCategory,
  handleDeleteCategory
}) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!newCategoryName.trim()) return
    setLoading(true)
    try {
      await handleSaveCategory?.(newCategoryName.trim())
      setNewCategoryName('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowCategoryModal?.(false)
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Kelola Kategori Menu</h3>
              <p className="text-[11px] text-slate-400 font-medium">Tambah atau hapus kelompok menu kafe.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCategoryModal?.(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Tambah Kategori */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Tambah Kategori Baru
          </label>
          <div className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Contoh: Espresso Based, Artisan Tea..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
            <button
              type="submit"
              disabled={loading || !newCategoryName.trim()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-extrabold transition shadow-xs flex items-center justify-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </form>

        {/* Daftar Kategori Aktif */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Daftar Kategori Aktif ({categories.length})
          </span>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                Belum ada kategori menu.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs"
                >
                  <span className="font-bold text-slate-900">{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory?.(cat.id)}
                    className="text-slate-300 hover:text-red-500 transition p-1 rounded-lg"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}