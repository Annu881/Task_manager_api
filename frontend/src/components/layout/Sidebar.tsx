'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Calendar, Tags, Activity, LogOut, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { authAPI } from '@/lib/api/auth'
import { useQueryClient } from '@tanstack/react-query'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { href: '/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/labels', icon: Tags, label: 'Labels' },
    { href: '/activity', icon: Activity, label: 'Activity' },
  ]

  const toggleTheme = () => {
    if (mounted) {
      const html = document.documentElement
      if (html.classList.contains('dark')) {
        html.classList.remove('dark')
        setIsDark(false)
      } else {
        html.classList.add('dark')
        setIsDark(true)
      }
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    queryClient.clear() // Clear all React Query cache
    router.push('/auth/login')
  }

  if (pathname.startsWith('/auth')) return null

  return (
    <aside className="glass-sidebar w-20 h-screen fixed left-0 top-0 flex flex-col items-center py-6 z-50">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}>
              <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
              <div className="absolute left-20 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={toggleTheme}
        className="w-14 h-14 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/50 flex items-center justify-center transition-all duration-300 mb-2"
        suppressHydrationWarning
      >
        {mounted && (isDark ? <Sun className="w-6 h-6 text-slate-600 dark:text-slate-400" /> : <Moon className="w-6 h-6 text-slate-600 dark:text-slate-400" />)}
      </button>

      <button
        onClick={handleLogout}
        className="w-14 h-14 rounded-2xl hover:bg-red-500/10 flex items-center justify-center transition-all duration-300 group"
        suppressHydrationWarning
      >
        <LogOut className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-red-500" />
      </button>
    </aside>
  )
}