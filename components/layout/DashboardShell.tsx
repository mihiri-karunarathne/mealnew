'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content — offset by sidebar width on lg+ screens */}
      <main className="lg:ml-60 pt-16 min-h-screen">
        <div className="w-full max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}