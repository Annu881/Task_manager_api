'use client'
import { useRouter } from 'next/navigation'
import { CheckSquare, Zap, Shield, TrendingUp, X } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && authAPI.isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router, mounted])

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Quick task management with instant updates',
      details: 'Built with Next.js 14 and optimized for speed. Experience instant page transitions and real-time updates without page reloads. Our architecture ensures that your task management experience is fluid and responsive, keeping up with your speed of thought.'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Your data is encrypted and protected',
      details: 'Enterprise-grade security with JWT authentication and encrypted data transmission. Your tasks and personal information are always protected using industry-standard security protocols. We prioritize your privacy and data integrity above all else.'
    },
    {
      icon: TrendingUp,
      title: 'Productive',
      description: 'Stay organized and boost productivity',
      details: 'Streamline your workflow with intuitive task organization, labels, and priority settings. Focus on what matters most with our distraction-free interface. Track your progress with visual indicators and never miss a deadline again.'
    },
    {
      icon: CheckSquare,
      title: 'Simple',
      description: 'Clean interface, powerful features',
      details: 'A clean, distraction-free interface designed for clarity. Powerful features are there when you need them, hidden when you don\'t. We believe in software that gets out of your way and lets you do your best work.'
    }
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
            Production-grade task management for modern teams
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
            <div
              key={index}
              onClick={() => setSelectedFeature(feature)}
              className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedFeature(null)}>
          <div
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6">
              <selectedFeature.icon className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {selectedFeature.title}
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedFeature.details}
            </p>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedFeature(null)}
                className="px-6 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}