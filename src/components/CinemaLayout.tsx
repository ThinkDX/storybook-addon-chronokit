import type { ReactNode } from 'react'
import { Link } from 'react-router'

type CinemaLayoutProps = {
  children: ReactNode
}

export function CinemaLayout({ children }: CinemaLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-white">Cinema Central</h1>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

      <footer className="border-t border-gray-800 bg-gray-900/50 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>Cinema Central • 123 Main Street • Open Daily 10AM - Midnight</p>
        </div>
      </footer>
    </div>
  )
}
