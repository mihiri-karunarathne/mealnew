'use client'
import { Menu, Bell } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
  userName?: string
  userRole?: string
  initials?: string
}

export default function Topbar({
  onMenuClick,
  userName  = 'Admin User',
  userRole  = 'Administrator',
  initials  = 'AD',
}: TopbarProps) {
  return (
    <header className={[
      'fixed top-0 right-0 h-16 z-30',
      'left-0 lg:left-60',                        // full width on mobile, offset on desktop
      'bg-white/80 backdrop-blur-md border-b border-slate-100',
      'flex items-center justify-between px-4 sm:px-8',
    ].join(' ')}>

      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          aria-label="Open menu"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>
        <p className="text-[#0F172A] font-semibold text-base sm:text-lg hidden sm:block">
          DigitalEase Health
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification bell */}
        <button
          aria-label="Notifications"
          aria-haspopup="menu"
          className="p-2 rounded-full text-[#475569] hover:bg-slate-100 transition-colors"
        >
          <Bell size={18} />
        </button>

        {/* User info — hide name on very small screens */}
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-[#001B3C] font-semibold text-sm leading-5">{userName}</p>
          <p className="text-[#3E4948] text-[10px] font-medium uppercase">{userRole}</p>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0A8280] flex items-center justify-center text-white font-bold text-xs sm:text-sm ">
          {initials}
        </div>
      </div>
    </header>
  )
}