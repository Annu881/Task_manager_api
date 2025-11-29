'use client'
import { useRouter } from 'next/navigation'
import { CheckSquare, Zap, Shield, TrendingUp } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && authAPI.isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router, mounted])

  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Quick task management with instant updates' },
    { icon: Shield, title: 'Secure', description: 'Your data is encrypted and protected' },
    { icon: TrendingUp, title: 'Productive', description: 'Stay organized and boost productivity' },
    { icon: CheckSquare, title: 'Simple', description: 'Clean interface, powerful features' }
  ]

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 mb-6 shadow-2xl shadow-purple-500/30 animate-pulse">
            <CheckSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4 animate-fade-in">
            Task Management
          </h1>
          <p className="text-2xl text-slate-600 dark:text-slate-400 mb-8 animate-slide-up">
            Production-grade task management inspired by Nifty
          </p>

          <div className="flex items-center justify-center gap-4 animate-slide-up">
            <button
              onClick={() => router.push('/auth/login')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-8 py-4 rounded-xl glass-card hover:shadow-xl transition-all text-slate-900 dark:text-white font-medium hover:scale-105"
            >
              Sign Up Free
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, index) => (
            <div key={index} className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}