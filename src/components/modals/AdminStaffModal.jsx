import React, { useState } from 'react'
import { X, Shield, Edit, Trash2 } from 'lucide-react'

export default function AdminStaffModal({
  setShowAdminStaffModal,
  staffList,
  setStaffList,
  setActiveCashier,
  activeCashier
}) {
  const [staffForm, setStaffForm] = useState({ id: null, name: '', role: '' })

  const handleSaveStaff = (e) => {
    e.preventDefault()
    if (!staffForm.name) return alert('Nama staff wajib diisi!')
    
    const getInitials = (str) => str.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    
    if (staffForm.id) {
      const updated = staffList.map(s => s.id === staffForm.id ? {
        ...s,
        name: staffForm.name,
        role: staffForm.role || 'Kasir',
        initials: getInitials(staffForm.name)
      } : s)
      setStaffList(updated)
      if (activeCashier.id === staffForm.id) {
        setActiveCashier({
          ...activeCashier,
          name: staffForm.name,
          role: staffForm.role || 'Kasir',
          initials: getInitials(staffForm.name)
        })
      }
    } else {
      const newStaff = {
        id: 'stf-' + Date.now(),
        name: staffForm.name,
        role: staffForm.role || 'Kasir',
        initials: getInitials(staffForm.name)
      }
      setStaffList([...staffList, newStaff])
    }
    setStaffForm({ id: null, name: '', role: '' })
  }

  const handleDeleteStaff = (id) => {
    if (staffList.length <= 1) {
      return alert('Minimal harus ada 1 staff/kasir terdaftar!')
    }
    if (!confirm('Apakah Anda yakin ingin menghapus kasir ini?')) return
    
    const updated = staffList.filter(s => s.id !== id)
    setStaffList(updated)
    if (activeCashier.id === id) {
      setActiveCashier(updated[0])
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative border border-slate-200">
        <button onClick={() => { setShowAdminStaffModal(false); setStaffForm({ id: null, name: '', role: '' }); }} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Admin System: Kelola Tim Kasir</h3>
            <p className="text-[11px] text-slate-500">Tambah, edit, atau hapus daftar kasir bertugas.</p>
          </div>
        </div>

        <form onSubmit={handleSaveStaff} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5 text-xs mb-4">
          <h4 className="font-bold text-slate-800">{staffForm.id ? 'Edit Staff' : 'Tambah Staff Baru'}</h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nama Kasir / Barista"
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              className="p-2 bg-white border border-slate-200 rounded-lg font-medium"
              required
            />
            <input
              type="text"
              placeholder="Jabatan / Shift"
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="p-2 bg-white border border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
              {staffForm.id ? 'Simpan Perubahan' : '+ Tambah Kasir'}
            </button>
            {staffForm.id && (
              <button type="button" onClick={() => setStaffForm({ id: null, name: '', role: '' })} className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg">
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <h4 className="font-bold text-xs text-slate-700">Daftar Kasir Terdaftar ({staffList.length})</h4>
          {staffList.map((stf) => (
            <div key={stf.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center border border-slate-200">
                  {stf.initials}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900 leading-tight">{stf.name}</h5>
                  <span className="text-[10px] text-slate-400">{stf.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveCashier(stf)
                    setShowAdminStaffModal(false)
                  }}
                  className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold hover:bg-emerald-100"
                >
                  Aktifkan
                </button>
                <button
                  onClick={() => setStaffForm({ id: stf.id, name: stf.name, role: stf.role })}
                  className="p-1 text-slate-400 hover:text-blue-600"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteStaff(stf.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
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