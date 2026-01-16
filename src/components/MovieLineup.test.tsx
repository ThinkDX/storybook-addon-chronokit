import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MovieLineup } from './MovieLineup'

const mockMovies = {
  titles: [
    {
      id: 'tt0110357',
      type: 'MOVIE' as const,
      primaryTitle: 'The Lion King',
      originalTitle: 'The Lion King',
      primaryImage: {
        url: 'https://example.com/lionking.jpg',
        width: 300,
        height: 450,
      },
      startYear: 1994,
      runtimeSeconds: 5280,
      genres: ['Animation', 'Adventure', 'Drama'],
      rating: { aggregateRating: 8.5, voteCount: 1000000 },
      directors: [],
      writers: [],
      stars: [],
      originCountries: ['US'],
      spokenLanguages: ['en'],
    },
    {
      id: 'tt2948356',
      type: 'MOVIE' as const,
      primaryTitle: 'Soul',
      originalTitle: 'Soul',
      primaryImage: {
        url: 'https://example.com/soul.jpg',
        width: 300,
        height: 450,
      },
      startYear: 2020,
      runtimeSeconds: 6000,
      genres: ['Animation', 'Adventure', 'Comedy'],
      rating: { aggregateRating: 8.1, voteCount: 500000 },
      directors: [],
      writers: [],
      stars: [],
      originCountries: ['US'],
      spokenLanguages: ['en'],
    },
  ],
  totalCount: 2,
}

vi.mock('@/services/imdb', () => ({
  listMovies: vi.fn(),
}))

import { listMovies } from '@/services/imdb'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MovieLineup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders loading skeletons while fetching', () => {
    vi.mocked(listMovies).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    )

    const { container } = renderWithProviders(<MovieLineup />)

    expect(screen.getByText('Now Showing')).toBeInTheDocument()
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(10)
  })

  it('renders movies when data is loaded', async () => {
    vi.mocked(listMovies).mockResolvedValue(mockMovies)

    renderWithProviders(<MovieLineup />)

    await waitFor(() => {
      expect(screen.getByText('The Lion King')).toBeInTheDocument()
    })

    expect(screen.getByText('Soul')).toBeInTheDocument()
  })

  it('renders error state when fetch fails', async () => {
    vi.mocked(listMovies).mockRejectedValue(new Error('API Error'))

    renderWithProviders(<MovieLineup />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load movies. Please try again later.'),
      ).toBeInTheDocument()
    })
  })

  it('renders empty state when no movies returned', async () => {
    vi.mocked(listMovies).mockResolvedValue({ titles: [], totalCount: 0 })

    renderWithProviders(<MovieLineup />)

    await waitFor(() => {
      expect(
        screen.getByText('No movies available at this time.'),
      ).toBeInTheDocument()
    })
  })

  it('renders genre filter buttons', () => {
    vi.mocked(listMovies).mockImplementation(() => new Promise(() => {}))

    renderWithProviders(<MovieLineup />)

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
    expect(screen.getByText('Comedy')).toBeInTheDocument()
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
  })

  it('renders movie cards with showtimes', async () => {
    vi.mocked(listMovies).mockResolvedValue(mockMovies)

    renderWithProviders(<MovieLineup />)

    await waitFor(() => {
      expect(screen.getByText('The Lion King')).toBeInTheDocument()
    })

    // Check that showtimes are rendered
    expect(screen.getAllByText(/AM|PM/).length).toBeGreaterThan(0)
  })

  it('renders countdown badges on first two movies', async () => {
    vi.mocked(listMovies).mockResolvedValue(mockMovies)

    renderWithProviders(<MovieLineup />)

    await waitFor(() => {
      expect(screen.getByText('The Lion King')).toBeInTheDocument()
    })

    // First two movies should have "Leaving in" badges
    const leavingBadges = screen.getAllByText('Leaving in')
    expect(leavingBadges).toHaveLength(2)
  })
})
