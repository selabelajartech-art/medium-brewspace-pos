import React, { useState } from 'react'
import { X, Plus, Edit, Trash2, Store } from 'lucide-react'

export default function TableManagerModal({
  setShowTableModal,
  tablesList,
  setTablesList
}) {
  const [form, setForm] = useState({ id: null, name: '' })

  const handleSaveTable = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return alert('Nama Meja/Area wajib diisi!')

    if (form.id) {
      // Edit Meja Existing
      const updated = tablesList.map((t) =>
        t.id === form.id ? { ...t, name: form.name } : t
      )
      setTablesList(updated)
    } else {
      // Tambah Meja Baru
      const newTable = {
        id: 'tbl-' + Date.now(),
        name: form.name
      }
      setTablesList([...tablesList, newTable])
    }

    setForm({ id: null, name: '' })
  }

  const handleDeleteTable = (id) => {
    if (tablesList.length <= 1) return alert('Minimal harus ada 1 pilihan area/meja!')
    if (!confirm('Apakah Anda yakin ingin menghapus area/meja ini?')) return
    setTablesList(tablesList.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative border border-slate-200">
        <button
          onClick={() => setShowTableModal(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Kelola Daftar Meja & Area</h3>
            <p className="text-[11px] text-slate-500">Atur nomor meja, quiet zone, atau meeting room.</p>
          </div>
        </div>

        {/* Form Tambah/Edit Meja */}
        <form onSubmit={handleSaveTable} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs mb-4">
          <h4 className="font-bold text-slate-800">{form.id ? 'Edit Meja/Area' : 'Tambah Meja/Area Baru'}</h4>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: Outdoor Table 04 / Meeting Room B"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-medium"
              required
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
              {form.id ? 'Simpan' : '+ Tambah'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({ id: null, name: '' })}
                className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Daftar Meja Terdaftar */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <h4 className="font-bold text-xs text-slate-700">Daftar Meja / Zona Terdaftar ({tablesList.length})</h4>
          {tablesList.map((tbl) => (
            <div key={tbl.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
              <span className="font-bold text-xs text-slate-800">{tbl.name}</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setForm({ id: tbl.id, name: tbl.name })}
                  className="p-1.5 text-slate-400 hover:text-blue-600"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteTable(tbl.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}