'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react'
import type { Staff } from '@/types/user'

const ROLE_LABELS: Record<string, string> = {
  nurse:         'Nurse',
  doctor:        'Doctor',
  office_clerk:  'Office Clerk',
  kitchen_clerk: 'Kitchen Clerk',
}

const ROLE_COLORS: Record<string, string> = {
  nurse:         'bg-blue-100 text-blue-700',
  doctor:        'bg-teal-100 text-teal-700',
  office_clerk:  'bg-purple-100 text-purple-700',
  kitchen_clerk: 'bg-orange-100 text-orange-700',
}

export default function StaffListPage() {
  const [staff, setStaff]     = useState<Staff[]>([])
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/staff')
      if (!res.ok) throw new Error('Failed to fetch staff')
      const data = await res.json()
      setStaff(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Load error:', error)
      setStaff([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ PERFECT: Empty deps = load once on mount (load is stable from useCallback)
  useEffect(() => {
    load()
  }, [load])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(`Delete staff member ${id}? This cannot be undone.`)) return
    
    setDeleting(id)
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await load()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete staff member')
    } finally {
      setDeleting(null)
    }
  }, [load])  // ✅ Only depends on load

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.staff_id.toLowerCase().includes(query.toLowerCase()) ||
    s.nic.includes(query)
  )

  return (
    <div className="px-4 sm:px-8 lg:px-16 xl:px-40 py-12 sm:py-20">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#F0F3FF] rounded-full flex items-center justify-center">
            <Users size={18} className="text-[#006766]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#001B3C]">Staff Management</h1>
            <p className="text-sm text-[#3E4948]">{staff.length} registered staff members</p>
          </div>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#006766] text-white rounded-xl text-sm font-semibold hover:bg-[#005555] transition-colors"
        >
          <Plus size={16} /> Register Staff
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, ID or NIC…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006766]/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_10px_30px_-10px_rgba(26,54,93,0.08)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading staff…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            {query ? 'No staff match your search.' : 'No staff registered yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-100">
                  {['Staff ID','Name','Designation','Ward','Role','NIC','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[#3E4948] font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.staff_id}
                    className={`border-b border-slate-50 hover:bg-[#F9F9FF] transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#001B3C] whitespace-nowrap">{s.staff_id}</td>
                    <td className="px-4 py-3.5 font-medium text-[#001B3C] whitespace-nowrap">{s.name}</td>
                    <td className="px-4 py-3.5 text-[#3E4948] whitespace-nowrap">{s.designation}</td>
                    <td className="px-4 py-3.5 text-[#3E4948] whitespace-nowrap">{s.ward}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLORS[s.role] ?? 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_LABELS[s.role] ?? s.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#3E4948] whitespace-nowrap">{s.nic}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${s.staff_id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-[#006766] rounded-lg hover:bg-teal-50 transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(s.staff_id)}
                          disabled={deleting === s.staff_id}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 shrink-0"
                          aria-label={`Delete ${s.name}`}
                          title={`Delete ${s.name}`} >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}