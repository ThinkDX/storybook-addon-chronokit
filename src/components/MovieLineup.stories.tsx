import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse, delay } from 'msw'
import { MovieLineup } from './MovieLineup'

// Fixed base time for stable stories (Wednesday afternoon)
const BASE_TIME = new Date('2025-01-15T14:30:00').getTime()

const mockMovies = {
  titles: [
    {
      id: 'tt0110357',
      type: 'movie',
      primaryTitle: 'The Lion King',
      originalTitle: 'The Lion King',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_.jpg',
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
    },
    {
      id: 'tt2948356',
      type: 'movie',
      primaryTitle: 'Soul',
      originalTitle: 'Soul',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BZGE1MDg5M2MtNTkyZS00MTY5LTg1YzUtZTlhZmM1Y2EwNmFmXkEyXkFqcGdeQXVyNjA3OTI0MDc@._V1_.jpg',
        width: 300,
        height: 450,
      },
      startYear: 2020,
      runtimeSeconds: 6000,
      genres: ['Animation', 'Adventure', 'Comedy'],
      rating: { aggregateRating: 8.1, voteCount: 500000 },
      directors: [{ id: 'nm0224931', name: 'Pete Docter' }],
      writers: [],
      stars: [{ id: 'nm0000329', name: 'Jamie Foxx' }],
      originCountries: ['US'],
      spokenLanguages: ['en'],
    },
    {
      id: "tt4633694",
      type: "movie",
      primaryTitle: "Spider-Man: Into the Spider-Verse",
      originalTitle: "Spider-Man: Into the Spider-Verse",
      primaryImage: {
          url: "https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgzOF5BMl5BanBnXkFtZTgwNTkwNTQ3NjM@._V1_.jpg",
          width: 1381,
          height: 2048
      },
      startYear: 2018,
      runtimeSeconds: 7020,
      genres: [
          "Animation",
          "Action",
          "Adventure",
          "Family",
          "Fantasy",
          "Sci-Fi"
      ],
      rating: {
          aggregateRating: 8.4,
          voteCount: 771078
      },
      plot: "Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities."
  },
    {
      id: 'tt0317705',
      type: 'movie',
      primaryTitle: 'The Incredibles',
      originalTitle: 'The Incredibles',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMTY5OTU0OTc2NV5BMl5BanBnXkFtZTcwMzU4MDcyMQ@@._V1_.jpg',
        width: 300,
        height: 450,
      },
      startYear: 2004,
      runtimeSeconds: 6900,
      genres: ['Animation', 'Action', 'Adventure'],
      rating: { aggregateRating: 8.0, voteCount: 800000 },
      directors: [{ id: 'nm0083348', name: 'Brad Bird' }],
      writers: [],
      stars: [{ id: 'nm0000168', name: 'Craig T. Nelson' }],
      originCountries: ['US'],
      spokenLanguages: ['en'],
    },
    {
      id: 'tt0892769',
      type: 'movie',
      primaryTitle: 'How to Train Your Dragon',
      originalTitle: 'How to Train Your Dragon',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMjA5NDQyMjc2NF5BMl5BanBnXkFtZTcwMjg5ODcyMw@@._V1_.jpg',
        width: 300,
        height: 450,
      },
      startYear: 2010,
      runtimeSeconds: 5880,
      genres: ['Animation', 'Action', 'Adventure'],
      rating: { aggregateRating: 8.1, voteCount: 750000 },
      directors: [{ id: 'nm0194517', name: 'Dean DeBlois' }],
      writers: [],
      stars: [{ id: 'nm0070035', name: 'Jay Baruchel' }],
      originCountries: ['US'],
      spokenLanguages: ['en'],
    },
  ],
  totalCount: 5,
}

const meta = {
  title: 'Components/MovieLineup',
  component: MovieLineup,
  decorators: [
    (Story) => (
      <div className="bg-gray-950 p-8 min-h-screen">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    storyRouter: {
      path: '/',
      allowNavigation: false,
    },
    date: {
      now: BASE_TIME,
      canProgress: true,
    },
  },
} satisfies Meta<typeof MovieLineup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://api.imdbapi.dev/titles', () => {
          return HttpResponse.json(mockMovies)
        }),
      ],
    },
  },
}

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://api.imdbapi.dev/titles', async () => {
          await delay('infinite')
          return HttpResponse.json(mockMovies)
        }),
      ],
    },
  },
}

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://api.imdbapi.dev/titles', () => {
          return HttpResponse.error()
        }),
      ],
    },
  },
}

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://api.imdbapi.dev/titles', () => {
          return HttpResponse.json({ titles: [], totalCount: 0 })
        }),
      ],
    },
  },
}

export const Frozen: Story = {
  parameters: {
    date: {
      now: BASE_TIME,
      canProgress: false,
    },
    msw: {
      handlers: [
        http.get('https://api.imdbapi.dev/titles', () => {
          return HttpResponse.json(mockMovies)
        }),
      ],
    },
  },
}

export const FastForward: Story = {
  parameters: {
    date: {
      now: BASE_TIME,
      canProgress: true,
      clockSpeed: 600, // 10 minute per second
    },
    msw: {
      handlers: [
        http.get('https://api.imdbapi.dev/titles', () => {
          return HttpResponse.json(mockMovies)
        }),
      ],
    },
  },
}
