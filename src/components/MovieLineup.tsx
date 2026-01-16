import { MovieCard } from '@/components/MovieCard'
import { moviesQuery } from '@/queries/movies'

const SHOWTIME_OPTIONS = [
  ['10:30 AM', '1:15 PM', '4:00 PM', '7:30 PM'],
  ['11:00 AM', '2:00 PM', '5:15 PM', '8:45 PM'],
  ['10:00 AM', '12:45 PM', '3:30 PM', '6:30 PM', '9:30 PM'],
  ['11:30 AM', '2:30 PM', '5:00 PM', '8:00 PM', '10:30 PM'],
  ['10:15 AM', '1:00 PM', '4:30 PM', '7:00 PM', '9:45 PM'],
  ['12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'],
  ['10:45 AM', '1:30 PM', '4:15 PM', '7:15 PM', '10:00 PM'],
  ['11:15 AM', '2:15 PM', '5:30 PM', '8:30 PM'],
  ['10:00 AM', '1:45 PM', '4:45 PM', '7:45 PM', '10:15 PM'],
  ['12:30 PM', '3:15 PM', '6:15 PM', '9:15 PM'],
]

// First movie leaves in 6 hours, second in 2 days
const LEAVING_TIMES = [
  Date.now() + 6 * 60 * 60 * 1000,
  Date.now() + 2 * 24 * 60 * 60 * 1000,
]

export function MovieLineup() {
  const { data, isLoading, error } = moviesQuery.use({
    countryCodes: ['US'],
    genres: ['Animation', 'Adventure', 'Family'],
    sortBy: 'SORT_BY_USER_RATING',
    sortOrder: 'DESC',
    minAggregateRating: 8,
    limit: 10,
  })

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Now Showing</h2>
        <div className="flex gap-2">
          {['All', 'Action', 'Drama', 'Comedy', 'Sci-Fi'].map((genre) => (
            <button
              key={genre}
              type="button"
              className="rounded-full bg-gray-800 px-4 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`skeleton-${i.toString()}`}
              className="animate-pulse rounded-lg bg-gray-900"
            >
              <div className="aspect-[2/3] bg-gray-800" />
              <div className="p-4">
                <div className="mb-2 h-4 rounded bg-gray-800" />
                <div className="h-3 w-2/3 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/20 p-6 text-center">
          <p className="text-red-400">
            Failed to load movies. Please try again later.
          </p>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.titles.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              showtimes={SHOWTIME_OPTIONS[index % SHOWTIME_OPTIONS.length]}
              leavingAt={index < 2 ? LEAVING_TIMES[index] : undefined}
            />
          ))}
        </div>
      )}

      {data && data.titles.length === 0 && (
        <div className="rounded-lg bg-gray-900 p-12 text-center">
          <p className="text-gray-400">No movies available at this time.</p>
        </div>
      )}
    </section>
  )
}
