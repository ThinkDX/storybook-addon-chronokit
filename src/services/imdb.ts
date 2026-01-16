import axios from 'axios'
import { z } from 'zod'

const api = axios.create({
  baseURL: 'https://api.imdbapi.dev',
  paramsSerializer: {
    indexes: null, // genres=Animation&genres=Comedy instead of genres[0]=Animation
  },
})

// Schemas

const titleTypeSchema = z
  .string()
  .transform((val) => val.toUpperCase())
  .pipe(
    z.enum([
      'MOVIE',
      'TV_SERIES',
      'TV_MINI_SERIES',
      'TV_EPISODE',
      'SHORT',
      'VIDEO_GAME',
      'VIDEO',
    ]),
  )

const sortBySchema = z.enum([
  'SORT_BY_POPULARITY',
  'SORT_BY_RELEASE_DATE',
  'SORT_BY_USER_RATING',
  'SORT_BY_USER_RATING_COUNT',
  'SORT_BY_YEAR',
])

const sortOrderSchema = z.enum(['ASC', 'DESC'])

const imageSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
})

const ratingSchema = z.object({
  aggregateRating: z.number(),
  voteCount: z.number(),
})

const personSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const titleSchema = z.object({
  id: z.string(),
  type: titleTypeSchema,
  primaryTitle: z.string(),
  originalTitle: z.string().optional(),
  primaryImage: imageSchema.optional().nullable(),
  startYear: z.number().optional().nullable(),
  endYear: z.number().optional().nullable(),
  runtimeSeconds: z.number().optional().nullable(),
  genres: z.array(z.string()).default([]),
  rating: ratingSchema.optional().nullable(),
  plot: z.string().optional().nullable(),
  directors: z.array(personSchema).default([]),
  writers: z.array(personSchema).default([]),
  stars: z.array(personSchema).default([]),
  originCountries: z.array(z.string()).default([]),
  spokenLanguages: z.array(z.string()).default([]),
})

const listTitlesResponseSchema = z.object({
  titles: z.array(titleSchema),
  totalCount: z.number(),
  nextPageToken: z.string().optional(),
})

// Types

export type TitleType = z.infer<typeof titleTypeSchema>
export type SortBy = z.infer<typeof sortBySchema>
export type SortOrder = z.infer<typeof sortOrderSchema>
export type Image = z.infer<typeof imageSchema>
export type Rating = z.infer<typeof ratingSchema>
export type Person = z.infer<typeof personSchema>
export type Title = z.infer<typeof titleSchema>
export type ListTitlesResponse = z.infer<typeof listTitlesResponseSchema>

export type ListTitlesParams = {
  types?: TitleType[]
  genres?: string[]
  interestIds?: string[]
  countryCodes?: string[]
  languageCodes?: string[]
  startYear?: number
  endYear?: number
  minVoteCount?: number
  maxVoteCount?: number
  minAggregateRating?: number
  maxAggregateRating?: number
  sortBy?: SortBy
  sortOrder?: SortOrder
  pageToken?: string
  limit?: number
}

// API functions

export async function listMovies(
  params: Omit<ListTitlesParams, 'types'> = {},
): Promise<ListTitlesResponse> {
  const response = await api.get('/titles', {
    params: {
      ...params,
      types: 'MOVIE',
    },
  })
  const result = listTitlesResponseSchema.safeParse(response.data)
  if (!result.success) {
    console.error('Zod validation failed for listMovies:', result.error.issues)
    console.error('Raw response data:', response.data)
    throw result.error
  }
  if (params.limit) {
    result.data.titles.length = Math.min(result.data.titles.length, 10)
  }
  return result.data
}

export async function getMovie(titleId: string): Promise<Title> {
  const response = await api.get(`/titles/${titleId}`)
  const result = titleSchema.safeParse(response.data)
  if (!result.success) {
    console.error('Zod validation failed for getMovie:', result.error.issues)
    console.error('Raw response data:', response.data)
    throw result.error
  }
  return result.data
}
