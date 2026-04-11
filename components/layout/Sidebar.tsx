'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, UserSquare2,
  UtensilsCrossed, BarChart3, Settings, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',        href: '/admin',          icon: LayoutDashboard },
  { label: 'Staff Management', href: '/admin/users',    icon: Users           },
  { label: 'Patients',         href: '/admin/patients', icon: UserSquare2     },
  { label: 'Meal Management',  href: '/admin/meals',    icon: UtensilsCrossed },
  { label: 'Reports',          href: '/admin/reports',  icon: BarChart3       },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({ open = true, onClose }: SidebarProps) {
  const path = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? path === '/admin' : path.startsWith(href)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-screen w-60 bg-[#F8FAFC] border-r border-slate-200',
        'flex flex-col justify-between py-6 z-40 transition-transform duration-300',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div>
          <div className="px-6 mb-10 flex items-start justify-between">
            <div>
              <p className="text-[#0F766E] font-bold text-xl leading-7">DigitalEase</p>
              <p className="text-[#64748B] text-[10px] font-semibold uppercase tracking-[0.5px]">
                Health System
              </p>
            </div>
            <button
              aria-label="Close menu"
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600 mt-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="px-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive(href)
                    ? 'bg-[#F0FDFA] text-[#0F766E] font-semibold border-r-4 border-[#0D9488]'
                    : 'text-[#64748B] hover:bg-slate-100 hover:text-slate-700'
                )}
              >
                <Icon size={18} strokeWidth={isActive(href) ? 2.5 : 1.8} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Settings */}
        <div className="px-3">
          <Link
            href="/admin/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              path === '/admin/settings'
                ? 'bg-[#F0FDFA] text-[#0F766E]'
                : 'text-[#64748B] hover:bg-slate-100'
            )}
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>
      </aside>
    </>
  )
}