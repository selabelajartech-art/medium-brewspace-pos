import React, { useState } from 'react'
import { X, Shield, Edit, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import PinAuthModal from './PinAuthModal'

export default function AdminStaffModal({
  setShowAdminStaffModal,
  staffList = [],
  setStaffList,
  setActiveCashier,
  activeCashier
}) {
  // State Otorisasi PIN Manager
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [staffForm, setStaffForm] = useState({ id: null, name: '', role: 'CASHIER', pin: '' })
  const [loading, setLoading] = useState(false)

  // 1. Pintu Gerbang Keamanan: Jika belum terverifikasi PIN Manager, tampilkan Numpad PIN terlebih dahulu
  if (!isAuthenticated) {
    return (
      <PinAuthModal
        onClose={() => setShowAdminStaffModal(false)}
        onSuccess={() => setIsAuthenticated(true)}
        staffList={staffList}
        title="Otorisasi Manager Required"
        description="Masukkan PIN Manager/Admin untuk mengelola data & PIN tim kasir."
      />
    )
  }

  const handleSaveStaff = async (e) => {
    e.preventDefault()
    if (!staffForm.name) return alert('Nama staff wajib diisi!')
    if (!staffForm.pin || staffForm.pin.length < 4) return alert('PIN otorisasi (minimal 4 angka) wajib diisi!')

    const getInitials = (str) =>
      str.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()

    setLoading(true)
    try {
      if (staffForm.id) {
        // Update data ke Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: staffForm.name,
            name: staffForm.name,
            role: staffForm.role.toLowerCase(),
            pin: staffForm.pin,
            initials: getInitials(staffForm.name)
          })
          .eq('id', staffForm.id)

        if (error) throw error

        const updated = staffList.map((s) =>
          s.id === staffForm.id
            ? {
                ...s,
                name: staffForm.name,
                role: staffForm.role || 'CASHIER',
                pin: staffForm.pin,
                initials: getInitials(staffForm.name)
              }
            : s
        )
        setStaffList(updated)

        if (activeCashier?.id === staffForm.id) {
          setActiveCashier({
            ...activeCashier,
            name: staffForm.name,
            role: staffForm.role || 'CASHIER',
            pin: staffForm.pin,
            initials: getInitials(staffForm.name)
          })
        }
      } else {
        // Tambah data baru ke Supabase
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            {
              full_name: staffForm.name,
              name: staffForm.name,
              role: staffForm.role.toLowerCase(),
              pin: staffForm.pin,
              initials: getInitials(staffForm.name)
            }
          ])
          .select()

        if (error) throw error

        if (data && data[0]) {
          const newStaff = {
            id: data[0].id,
            name: staffForm.name,
            role: staffForm.role || 'CASHIER',
            pin: staffForm.pin,
            initials: getInitials(staffForm.name)
          }
          setStaffList([...staffList, newStaff])
        }
      }

      setStaffForm({ id: null, name: '', role: 'CASHIER', pin: '' })
    } catch (err) {
      console.error('Save Staff Error:', err)
      alert('Gagal menyimpan ke database: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStaff = async (id) => {
    const targetStaff = staffList.find((s) => s.id === id)
    if (!targetStaff) return

    if (id === activeCashier?.id) {
      return alert(
        `Akses Ditolak!\nAkun "${targetStaff.name}" sedang aktif digunakan di kasir. Silakan ganti shift terlebih dahulu sebelum menghapus.`
      )
    }

    const adminManagerCount = staffList.filter(
      (s) => s.role === 'ADMIN' || s.role === 'MANAGER'
    ).length

    const isTargetAdminOrManager = targetStaff.role === 'ADMIN' || targetStaff.role === 'MANAGER'

    if (isTargetAdminOrManager && adminManagerCount <= 1) {
      return alert(
        'Akses Ditolak!\nHarus ada minimal 1 akun Admin/Manager yang tersisa di sistem agar otorisasi PIN tidak terkunci.'
      )
    }

    if (staffList.length <= 1) {
      return alert('Minimal harus ada 1 staff/kasir terdaftar di sistem!')
    }

    if (confirm(`Apakah Anda yakin ingin menghapus staf "${targetStaff.name}" (${targetStaff.role})?`)) {
      setLoading(true)
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id)
        if (error) throw error

        const updated = staffList.filter((s) => s.id !== id)
        setStaffList(updated)
      } catch (err) {
        console.error('Delete Staff Error:', err)
        alert('Gagal menghapus staf dari database: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative border border-slate-200">
        <button
          onClick={() => {
            setShowAdminStaffModal(false)
            setStaffForm({ id: null, name: '', role: 'CASHIER', pin: '' })
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Admin System: Kelola Tim Kasir</h3>
            <p className="text-[11px] text-slate-500">Atur hak akses role & PIN otorisasi staf.</p>
          </div>
        </div>

        {/* Form Tambah/Edit Staff */}
        <form onSubmit={handleSaveStaff} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5 text-xs mb-4">
          <h4 className="font-bold text-slate-800">{staffForm.id ? 'Edit Data Staff' : 'Tambah Staff Baru'}</h4>
          
          <input
            type="text"
            placeholder="Nama Kasir / Barista"
            value={staffForm.name}
            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
            required
            disabled={loading}
          />

          <div className="grid grid-cols-3 gap-2">
            <select
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="col-span-2 p-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
              disabled={loading}
            >
              <option value="CASHIER">Kasir (CASHIER)</option>
              <option value="MANAGER">Manager (MANAGER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>

            <input
              type="password"
              maxLength={6}
              placeholder="PIN (4 Digit)"
              value={staffForm.pin}
              onChange={(e) => setStaffForm({ ...staffForm, pin: e.target.value })}
              className="p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-center"
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:bg-slate-300"
            >
              {loading ? 'Menyimpan...' : staffForm.id ? 'Simpan Perubahan' : '+ Tambah Staf'}
            </button>
            {staffForm.id && (
              <button
                type="button"
                onClick={() => setStaffForm({ id: null, name: '', role: 'CASHIER', pin: '' })}
                className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg"
                disabled={loading}
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Daftar Staff */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <h4 className="font-bold text-xs text-slate-700">Daftar Tim Terdaftar ({staffList.length})</h4>
          {staffList.map((stf) => {
            const isActive = activeCashier?.id === stf.id
            const isManagerOrAdmin = stf.role === 'ADMIN' || stf.role === 'MANAGER'

            return (
              <div key={stf.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                    {stf.initials}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 leading-tight truncate">{stf.name}</h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                        isManagerOrAdmin
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {stf.role || 'CASHIER'}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">PIN: {stf.pin ? '****' : 'Belum Set'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => {
                      setActiveCashier(stf)
                      setShowAdminStaffModal(false)
                    }}
                    disabled={isActive || loading}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                      isActive
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {isActive ? 'Aktif' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => setStaffForm({ id: stf.id, name: stf.name, role: stf.role || 'CASHIER', pin: stf.pin || '' })}
                    disabled={loading}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(stf.id)}
                    disabled={loading}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}