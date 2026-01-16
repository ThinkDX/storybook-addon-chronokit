import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-gray-400">Page not found</p>
      <Link
        to="/"
        className="mt-8 rounded-md bg-amber-500 px-6 py-2 font-semibold text-black hover:bg-amber-400"
      >
        Go Home
      </Link>
    </div>
  )
}
