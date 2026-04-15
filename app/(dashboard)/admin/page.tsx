import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Users, UserSquare2, UtensilsCrossed, BarChart3 } from 'lucide-react'

async function getSession() {
  const cookieStore = await cookies() // ✅ Await!
  const raw = cookieStore.get('de_session')?.value
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')

  const cards = [
    { label: 'Total Staff',    icon: Users,           color: 'bg-teal-50   text-teal-600'   },
    { label: 'Patients Today', icon: UserSquare2,     color: 'bg-blue-50   text-blue-600'   },
    { label: 'Meals Served',   icon: UtensilsCrossed, color: 'bg-amber-50  text-amber-600'  },
    { label: 'Active Wards',   icon: BarChart3,       color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#001B3C]">Welcome back, {session.name} 👋</h1>
         <p className="text-[#64748B] text-sm mt-1">Here is what is happening today.</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(26,54,93,0.08)] flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#001B3C]">—</p>
              <p className="text-[#64748B] text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(26,54,93,0.08)]">
        <p className="text-sm font-semibold text-[#001B3C] mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Register Staff', href: '/admin/users/new' },
            { label: 'View All Staff', href: '/admin/users'     },
          ].map(({ label, href }) => (
            <a key={href} href={href}
              className="px-4 py-2 bg-[#F0F3FF] text-[#006766] font-semibold text-sm rounded-lg hover:bg-[#006766] hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}