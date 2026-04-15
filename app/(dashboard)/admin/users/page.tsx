'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search, Users, Eye } from 'lucide-react'
import type { Staff } from '@/types/user'

const PAGE_SIZE = 10

const ROLE_LABELS: Record<string, string> = {
  nurse:         'Nurse',
  doctor:        'Doctor',
  office_clerk:  'Office Clerk',
  kitchen_clerk: 'Kitchen Clerk',
}

const ROLE_COLORS: Record<string, string> = {
  nurse:         'bg-blue-100 text-blue-700 border border-blue-100',
  doctor:        'bg-teal-100 text-teal-700 border border-blue-100',
  office_clerk:  'bg-purple-100 text-purple-700 border border-blue-100',
  kitchen_clerk: 'bg-orange-100 text-orange-700 border border-blue-100',
}

const THEAD = ['Staff ID', 'Name', 'Ward', 'Role', 'NIC', 'Address', 'Actions']

export default function StaffListPage() {
  const [staff, setStaff]     = useState<Staff[]>([])
  const [query, setQuery]     = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error,    setError]    = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/staff')
      if (!res.ok) throw new Error('Failed to fetch staff')
      const data = await res.json()
      setStaff(Array.isArray(data) ? data : [])
    } catch  {
      setError('Could not load staff. Check your database connection.')
     setStaff([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ PERFECT: Empty deps = load once on mount (load is stable from useCallback)
  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
       setStaff(prev => prev.filter(s => s.staff_id !== id))
    } catch {
      alert('Failed to delete. This staff member may have linked records.')
    } finally {
      setDeleting(null)
    }
  }, [])  // ✅ Only depends on load

  /*const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.staff_id.toLowerCase().includes(query.toLowerCase()) ||
    s.nic.includes(query)
  )*/
const filtered = staff.filter(s =>
  [s.name, s.staff_id, s.nic, s.ward_name ?? s.ward_number]
      .some(v => v?.toLowerCase().includes(query.toLowerCase()))
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  useEffect(() => {
    if (!loading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, loading, totalPages])

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6"> 

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 ">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F0F3FF] rounded-full flex items-center justify-center shrink-0">
            <Users size={17} className="text-[#006766]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#001B3C]">Staff Management</h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              {loading ? 'Loading…' : `${filtered.length} of ${staff.length} members`}
            </p>
          </div>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#006766] text-white rounded-xl text-sm font-semibold hover:bg-[#005555] transition-colors"
        >
          <Plus size={15} /> Register Staff
        </Link>
      </div>

      {/* Search */}
       <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name, ID, NIC…"
          className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006766]/25"
        />
      </div>
     {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

       {/* ── Table card ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(26,54,93,0.07)] overflow-hidden">

        {/* Loading skeleton */}
        {loading ? (
          <div className="divide-y divide-slate-50">
            <div className="h-11 bg-[#F8FAFC]" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-4 py-4 animate-pulse">
                <div className="h-3 w-14 bg-slate-100 rounded" />
                <div className="h-3 w-28 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="py-16 text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={18} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">
              {query ? 'No staff match your search.' : 'No staff registered yet.'}
            </p>
          </div>

        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-225">

              {/* Head */}
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-100">
                  {THEAD.map(h => (
                    <th key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-50">
                {pageRows.map(s => (
                  <tr key={s.staff_id} className="hover:bg-[#F9FFFE] transition-colors">

                    {/* Staff ID */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-medium text-[#001B3C] bg-[#F0F3FF] px-2 py-0.5 rounded">
                        {s.staff_id}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#001B3C]">
                      {s.name}
                    </td>

                    {/* Ward — show ward_name from JOIN, fallback to ward_number */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-[#3E4948]">
                      {s.ward_name ?? s.ward_number ?? <span className="text-slate-300">—</span>}
                    </td>

                    {/* Role badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLORS[s.role] ?? 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_LABELS[s.role] ?? s.role}
                      </span>
                    </td>

                    {/* NIC */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-[#3E4948]">
                      {s.nic}
                    </td>

                    {/* Address — truncated */}
                    <td className="px-4 py-3.5 max-w-40">
                      <span className="block truncate text-xs text-[#3E4948]" title={s.address ?? undefined}>
                        {s.address || <span className="text-slate-300">—</span>}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">

                        {/* View */}
                        <Link
                          href={`/admin/users/${s.staff_id}`}
                          title="View"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#006766] hover:bg-teal-50 transition-colors"
                        >
                          <Eye size={15} />
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/admin/users/${s.staff_id}/edit`}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(s.staff_id, s.name)}
                          disabled={deleting === s.staff_id}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                        >
                          {deleting === s.staff_id
                            ? <span className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" />
                            : <Trash2 size={15} />
                          }
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
     {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-50 bg-[#F8FAFC]">
            <p className="text-xs text-[#64748B]">
              Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length} staff members
              {query && ` · filtered by "${query}"`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}