import { Link } from 'react-router'
import { CountdownComplex } from '@/components/CountdownComplex'
import type { Title } from '@/services/imdb'

type MovieCardProps = {
  movie: Title
  showtimes: string[]
  leavingAt?: number
}

export function MovieCard({ movie, showtimes, leavingAt }: MovieCardProps) {
  const rating = movie.rating?.aggregateRating.toFixed(1) ?? 'N/A'
  const runtime = movie.runtimeSeconds
    ? `${Math.floor(movie.runtimeSeconds / 60)}m`
    : null

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg bg-gray-900 shadow-lg transition-transform hover:scale-105">
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
        {movie.primaryImage ? (
          <img
            src={movie.primaryImage.url}
            alt={movie.primaryTitle}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-600">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        {leavingAt && (
          <div className="absolute top-2 left-2 rounded bg-red-600 px-2 py-1">
            <div className="text-xs font-medium text-white">Leaving in</div>
            <CountdownComplex
              datetime={leavingAt}
              size="s"
              color="white"
              lowestUnit="minutes"
              thresholdProps={{
                warning: { threshold: 86400, color: '#fbbf24' },
                critical: { threshold: 3600, color: '#ef4444' },
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 translate-y-full p-4 transition-transform group-hover:translate-y-0">
          <Link
            to="/tickets"
            className="block w-full rounded-md bg-amber-500 px-4 py-2 text-center font-semibold text-black transition-colors hover:bg-amber-400"
          >
            Buy Tickets
          </Link>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 font-semibold text-white">
          {movie.primaryTitle}
        </h3>
        <div className="mb-2 flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="mb-3 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <span className="text-amber-500">★</span>
            <span>{rating}</span>
          </div>
          {runtime && <span>{runtime}</span>}
          {movie.startYear && <span>{movie.startYear}</span>}
        </div>
        <div className="border-t border-gray-800 pt-3">
          <div className="text-xs font-medium text-gray-500 mb-2">Showtimes</div>
          <div className="flex flex-wrap gap-1">
            {showtimes.map((time) => (
              <span
                key={time}
                className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300"
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
