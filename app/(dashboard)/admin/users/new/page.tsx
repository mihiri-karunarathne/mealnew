'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Copy, Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  name:        z.string().min(2, 'Full name is required'),
  nic:         z.string().min(9, 'Enter a valid NIC number'),
  role: z.string()
    .min(1, 'Role is required')
    .refine(val => {
      return ['nurse', 'doctor', 'office_clerk', 'kitchen_clerk'].includes(val)
    }, 'Please select a valid role'),
  designation: z.string().min(2, 'Designation is required'),
  ward:        z.string().min(1, 'Select a ward'),
  address:     z.string().min(5, 'Address is required'),
})

type FormData = z.infer<typeof schema>

const ROLES = [
  { value: 'nurse',         label: 'Nurse'          },
  { value: 'doctor',        label: 'Doctor'         },
  { value: 'office_clerk',  label: 'Office Clerk'   },
  { value: 'kitchen_clerk', label: 'Kitchen Clerk'  },
]

interface Ward { ward_number: string; ward_name: string }

// ── Reusable field components ──────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[13px] font-medium text-[#3E4948] mb-1.5">
      {children}
    </label>
  )
}

const inputBase = [
  'w-full px-4 py-3.5 bg-[#F0F3FF] rounded-lg',
  'border border-[rgba(189,201,200,0.30)] text-[#001B3C] text-base',
  'placeholder:text-[rgba(110,121,120,0.50)]',
  'focus:outline-none focus:ring-2 focus:ring-[#006766]/40',
  'transition-shadow',
].join(' ')

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1">{msg}</p>
}

function AutoField({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center justify-between bg-[#E7EEFF] px-4 py-3 rounded-lg border border-[rgba(189,201,200,0.20)]">
        <span className={cn(
          'text-sm',
          italic ? 'italic text-[rgba(62,73,72,0.60)]' : 'font-mono text-[#001B3C]'
        )}>
          {value}
        </span>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function NewStaffPage() {
  const router = useRouter()
  const [wards, setWards]     = useState<Ward[]>([])
  const [loadingWards, setLoadingWards] = useState(true)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [result, setResult]   = useState<{ staff_id: string; tempPassword: string } | null>(null)
  const [copied, setCopied]   = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
  setLoadingWards(true)
  fetch('/api/wards')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(data => {
      setWards(Array.isArray(data) ? data : [])
    })
    .catch(error => {
      console.error('Wards error:', error)
      setWards([])
    })
    .finally(() => setLoadingWards(false))
}, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/staff', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setServerError(json.error); return }
      setResult({ staff_id: json.staff_id, tempPassword: json.tempPassword })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="px-4 sm:px-8 lg:px-16 xl:px-40 py-12 sm:py-20">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(26,54,93,0.10)] p-8 sm:p-10">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Check className="text-teal-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-[#001B3C] mb-1">Staff Registered!</h2>
          <p className="text-[#3E4948] text-sm mb-6">
            Share these credentials securely with the new staff member.
          </p>

          <div className="space-y-3 mb-8">
            {[
              { label: 'Staff ID',       value: result.staff_id,      key: 'id'  },
              { label: 'Temp Password',  value: result.tempPassword,  key: 'pw'  },
            ].map(({ label, value, key }) => (
              <div key={key}
                className="flex items-center justify-between bg-[#E7EEFF] px-4 py-3.5 rounded-xl">
                <div>
                  <p className="text-[10px] text-[#6E7978] uppercase font-semibold mb-0.5">{label}</p>
                  <p className="font-mono font-semibold text-[#001B3C] text-sm">{value}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(value, key)}
                  className="p-1.5 text-[#6E7978] hover:text-[#006766] transition-colors"
                >
                  {copied === key ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setResult(null)}
              className="flex-1 py-3 rounded-xl border border-[rgba(189,201,200,0.40)] text-[#006766] font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Register Another
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex-1 py-3 rounded-xl bg-[#006766] text-white font-semibold text-sm hover:bg-[#005555] transition-colors"
            >
              View Staff List
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-8 lg:px-16 xl:px-40 py-12 sm:py-20">

      {/* Page header */}
      <div className="flex items-center gap-4 mb-8 w-full max-w-180 mx-auto xl:mx-0">
        <div className="w-10 h-10 bg-[#F0F3FF] rounded-full flex items-center justify-center shrink-0">
          <Users size={18} className="text-[#006766]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#001B3C] leading-8">
            Register New Staff Member
          </h1>
          <p className="text-sm text-[#3E4948]">
            Create a secure profile for a new clinical or administrative staff member.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="w-full max-w-180 mx-auto xl:mx-0 bg-white rounded-xl shadow-[0_10px_30px_-10px_rgba(26,54,93,0.08)] p-6 sm:p-10">

        {serverError && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-5">

            {/* Full Name */}
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <input
                {...register('name')}
                placeholder="Dr. Jane Smith"
                className={inputBase}
              />
              <FieldError msg={errors.name?.message} />
            </div>

            {/* NIC */}
            <div>
              <FieldLabel>NIC Number</FieldLabel>
              <input
                {...register('nic')}
                placeholder="199012345678"
                className={inputBase}
              />
              <FieldError msg={errors.nic?.message} />
            </div>

            {/* Role */}
            <div>
              <FieldLabel>Role</FieldLabel>
              <select {...register('role')} className={inputBase}>
                <option value="">Select staff role</option>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <FieldError msg={errors.role?.message} />
            </div>

            {/* Designation */}
            <div>
              <FieldLabel>Designation</FieldLabel>
              <input
                {...register('designation')}
                placeholder="Senior Registrar"
                className={inputBase}
              />
              <FieldError msg={errors.designation?.message} />
            </div>

            {/* Ward */}
            <div>
  <FieldLabel>Ward</FieldLabel>
  <select
    {...register('ward')}
    className={cn(inputBase, errors.ward && 'border-red-300 ring-1 ring-red-200')}
    disabled={!Array.isArray(wards) || wards.length === 0}
  >
    <option value="">Select ward</option>
    {Array.isArray(wards) && wards.length > 0 ? (
      wards.map((w: Ward) => (
        <option key={w.ward_number} value={w.ward_number}>
          {w.ward_name}
        </option>
      ))
    ) : (
      <option value="" disabled>
        {loadingWards ? 'Loading wards...' : 'No wards available'}
      </option>
    )}
  </select>
  <FieldError msg={errors.ward?.message} />
</div>

            {/* Address */}
            <div>
              <FieldLabel>Address</FieldLabel>
              <textarea
                {...register('address')}
                rows={3}
                placeholder="Residential address"
                className={cn(inputBase, 'resize-none')}
              />
              <FieldError msg={errors.address?.message} />
            </div>

            {/* Auto-generated fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <AutoField label="Staff ID" value="Auto-generated on submit" />
              <AutoField label="Password" value="Generated on submit" italic />
            </div>

            {/* Divider */}
            <div className="border-t border-[rgba(189,201,200,0.15)] pt-2" />

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 sm:px-8 py-3.5 rounded-xl border border-[rgba(189,201,200,0.40)] text-[#006766] font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 sm:px-8 py-3.5 bg-[#006766] text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-[#005555] transition-colors disabled:opacity-60"
              >
                {loading ? 'Registering…' : 'Register Staff'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Footer note */}
      <div className="w-full max-w-180 mx-auto xl:mx-0 mt-4 px-2 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#A2EDED] rounded-full flex items-center justify-center">
            <div className="w-2.5 h-3 bg-[#13696A] rounded-sm" />
          </div>
          <span className="text-[#3E4948] text-xs">System security protocols enabled</span>
        </div>
        <span className="text-[#6E7978] text-xs">v2.4.1 Healthcare Enterprise Edition</span>
      </div>
    </div>
  )
}