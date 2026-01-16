import type { Meta, StoryObj } from '@storybook/react-vite'
import { MovieCard } from './MovieCard'
import type { Title } from '@/services/imdb'

// Fixed base time for stable stories
const BASE_TIME = new Date('2025-01-15T14:30:00').getTime()

const mockMovie: Title = {
  id: 'tt0110357',
  type: 'MOVIE',
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
}

const mockMovieNoImage: Title = {
  ...mockMovie,
  id: 'tt0000001',
  primaryTitle: 'Mystery Movie',
  primaryImage: null,
}

const mockMovieNoRating: Title = {
  ...mockMovie,
  id: 'tt0000002',
  primaryTitle: 'Unrated Film',
  rating: null,
}

const mockMovieLongTitle: Title = {
  ...mockMovie,
  id: 'tt0000003',
  primaryTitle:
    'The Incredibly Long Movie Title That Should Be Truncated Properly',
  genres: ['Animation', 'Adventure', 'Drama', 'Family', 'Musical'],
}

const defaultShowtimes = ['10:30 AM', '1:15 PM', '4:00 PM', '7:30 PM']

const meta = {
  title: 'Components/MovieCard',
  component: MovieCard,
  parameters: {
    layout: 'centered',
    storyRouter: {
      path: '/',
      allowNavigation: false,
    },
    date: {
      now: BASE_TIME,
      canProgress: true,
    },
  },
  argTypes: {
    movie: {
      control: 'object',
      description: 'Movie data from IMDB API',
    },
    showtimes: {
      control: 'object',
      description: 'Array of showtime strings',
    },
    leavingAt: {
      control: 'date',
      description: 'Timestamp when the movie leaves theaters',
    },
  },
} satisfies Meta<typeof MovieCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    movie: mockMovie,
    showtimes: defaultShowtimes,
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const WithLeavingCountdown: Story = {
  args: {
    movie: mockMovie,
    showtimes: defaultShowtimes,
    leavingAt: BASE_TIME + 3 * 24 * 60 * 60 * 1000, // 3 days
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const LeavingSoon: Story = {
  args: {
    movie: mockMovie,
    showtimes: defaultShowtimes,
    leavingAt: BASE_TIME + 2 * 60 * 60 * 1000, // 2 hours (critical threshold)
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const NoImage: Story = {
  args: {
    movie: mockMovieNoImage,
    showtimes: defaultShowtimes,
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const NoRating: Story = {
  args: {
    movie: mockMovieNoRating,
    showtimes: defaultShowtimes,
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const LongTitle: Story = {
  args: {
    movie: mockMovieLongTitle,
    showtimes: defaultShowtimes,
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const ManyShowtimes: Story = {
  args: {
    movie: mockMovie,
    showtimes: [
      '9:00 AM',
      '10:30 AM',
      '12:00 PM',
      '1:30 PM',
      '3:00 PM',
      '4:30 PM',
      '6:00 PM',
      '7:30 PM',
      '9:00 PM',
      '10:30 PM',
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const SingleShowtime: Story = {
  args: {
    movie: mockMovie,
    showtimes: ['7:30 PM'],
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const Frozen: Story = {
  parameters: {
    date: {
      now: BASE_TIME,
      canProgress: false,
    },
  },
  args: {
    movie: mockMovie,
    showtimes: defaultShowtimes,
    leavingAt: BASE_TIME + 12 * 60 * 60 * 1000, // 12 hours
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const FastForward: Story = {
  parameters: {
    date: {
      now: BASE_TIME,
      canProgress: true,
      clockSpeed: 600, // 10 minutes per second
    },
  },
  args: {
    movie: mockMovie,
    showtimes: defaultShowtimes,
    leavingAt: BASE_TIME + 2 * 60 * 60 * 1000, // 2 hours
  },
  decorators: [
    (Story) => (
      <div className="w-64 bg-gray-950 p-4">
        <Story />
      </div>
    ),
  ],
}

export const CardGrid: Story = {
  args: {
    movie: mockMovie,
    showtimes: defaultShowtimes,
  },
  render: () => (
    <div className="grid grid-cols-2 gap-4 bg-gray-950 p-4 md:grid-cols-4">
      <MovieCard
        movie={mockMovie}
        showtimes={defaultShowtimes}
        leavingAt={BASE_TIME + 2 * 24 * 60 * 60 * 1000}
      />
      <MovieCard movie={mockMovieNoImage} showtimes={['3:00 PM', '7:00 PM']} />
      <MovieCard
        movie={mockMovieLongTitle}
        showtimes={defaultShowtimes}
        leavingAt={BASE_TIME + 6 * 60 * 60 * 1000}
      />
      <MovieCard movie={mockMovieNoRating} showtimes={['5:00 PM']} />
    </div>
  ),
}
