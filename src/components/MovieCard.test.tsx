import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MovieCard } from './MovieCard'
import type { Title } from '@/services/imdb'

const mockMovie: Title = {
  id: 'tt0110357',
  type: 'MOVIE',
  primaryTitle: 'The Lion King',
  originalTitle: 'The Lion King',
  primaryImage: {
    url: 'https://example.com/lion-king.jpg',
    width: 300,
    height: 450,
  },
  startYear: 1994,
  runtimeSeconds: 5280,
  genres: ['Animation', 'Adventure', 'Drama'],
  rating: { aggregateRating: 8.5, voteCount: 1000000 },
  directors: [{ id: 'nm0028610', name: 'Roger Allers' }],
  writers: [],
  stars: [{ id: 'nm0000456', name: 'Matthew Broderick' }],
  originCountries: ['US'],
  spokenLanguages: ['en'],
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('MovieCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders movie title', () => {
    renderWithRouter(
      <MovieCard movie={mockMovie} showtimes={['7:00 PM']} />,
    )

    expect(screen.getByText('The Lion King')).toBeInTheDocument()
  })

  it('renders movie poster image', () => {
    renderWithRouter(
      <MovieCard movie={mockMovie} showtimes={['7:00 PM']} />,
    )

    const img = screen.getByAltText('The Lion King')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/lion-king.jpg')
  })

  it('renders placeholder when no image', () => {
    const movieNoImage: Title = { ...mockMovie, primaryImage: null }

    renderWithRouter(
      <MovieCard movie={movieNoImage} showtimes={['7:00 PM']} />,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('🎬')).toBeInTheDocument()
  })

  it('renders movie rating', () => {
    renderWithRouter(
      <MovieCard movie={mockMovie} showtimes={['7:00 PM']} />,
    )

    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('renders N/A when no rating', () => {
    const movieNoRating: Title = { ...mockMovie, rating: null }

    renderWithRouter(
      <MovieCard movie={movieNoRating} showtimes={['7:00 PM']} />,
    )

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('renders runtime in minutes', () => {
    renderWithRouter(
      <MovieCard movie={mockMovie} showtimes={['7:00 PM']} />,
    )

    // 5280 seconds = 88 minutes
    expect(screen.getByText('88m')).toBeInTheDocument()
  })

  it('does not render runtime when not available', () => {
    const movieNoRuntime: Title = { ...mockMovie, runtimeSeconds: null }

    renderWithRouter(
      <MovieCard movie={movieNoRuntime} showtimes={['7:00 PM']} />,
    )

    expect(screen.queryByText(/^\d+m$/)).not.toBeInTheDocument()
  })

  it('renders start year', () => {
    renderWithRouter(
      <MovieCard movie={mockMovie} showtimes={['7:00 PM']} />,
    )

    expect(screen.getByText('1994')).toBeInTheDocument()
  })

  it('renders up to 2 genres', () => {
    renderWithRouter(
      <MovieCard movie={mockMovie} showtimes={['7:00 PM']} />,
    )

    expect(screen.getByText('Animation')).toBeInTheDocument()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
    expect(screen.queryByText('Drama')).not.toBeInTheDocument()
  })

  it('renders all showtimes', () => {
    const showtimes = ['10:30 AM', '1:15 PM', '4:00 PM', '7:30 PM']

    renderWithRouter(<MovieCard movie={mockMovie} showtimes={showtimes} />)

    for (const time of showtimes) {
      expect(screen.getByText(time)).toBeInTheDocument()
    }
  })

  it('renders Buy Tickets link', () => {
    renderWithRouter(
      <MovieCard movie={mockMovie} showtimes={['7:00 PM']} />,
    )

    const link = screen.getByRole('link', { name: 'Buy Tickets' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/tickets')
  })

  it('does not render countdown when leavingAt is not provided', () => {
    renderWithRouter(
      <MovieCard movie={mockMovie} showtimes={['7:00 PM']} />,
    )

    expect(screen.queryByText('Leaving in')).not.toBeInTheDocument()
    expect(screen.queryByTestId('countdown')).not.toBeInTheDocument()
  })

  it('renders countdown when leavingAt is provided', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const leavingAt = now + 3 * 24 * 60 * 60 * 1000 // 3 days

    renderWithRouter(
      <MovieCard
        movie={mockMovie}
        showtimes={['7:00 PM']}
        leavingAt={leavingAt}
      />,
    )

    expect(screen.getByText('Leaving in')).toBeInTheDocument()
    expect(screen.getByTestId('countdown')).toBeInTheDocument()
    // Should show days and minutes (skips 0 hours, lowestUnit is minutes)
    expect(screen.getByTestId('countdown')).toHaveTextContent('3d 0m')
  })

  it('countdown shows time in minutes as lowest unit', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const leavingAt = now + (2 * 60 * 60 + 30 * 60 + 45) * 1000 // 2h 30m 45s

    renderWithRouter(
      <MovieCard
        movie={mockMovie}
        showtimes={['7:00 PM']}
        leavingAt={leavingAt}
      />,
    )

    // Should show 2h 30m (not seconds)
    expect(screen.getByTestId('countdown')).toHaveTextContent('2h 30m')
    expect(screen.getByTestId('countdown')).not.toHaveTextContent('45s')
  })

  it('renders single genre when only one available', () => {
    const movieOneGenre: Title = { ...mockMovie, genres: ['Animation'] }

    renderWithRouter(
      <MovieCard movie={movieOneGenre} showtimes={['7:00 PM']} />,
    )

    expect(screen.getByText('Animation')).toBeInTheDocument()
  })

  it('renders no genres when empty', () => {
    const movieNoGenres: Title = { ...mockMovie, genres: [] }

    renderWithRouter(
      <MovieCard movie={movieNoGenres} showtimes={['7:00 PM']} />,
    )

    expect(screen.queryByText('Animation')).not.toBeInTheDocument()
    expect(screen.queryByText('Adventure')).not.toBeInTheDocument()
  })
})
