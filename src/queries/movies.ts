import { createQuery } from './utils'
import {
  type ListTitlesParams,
  type ListTitlesResponse,
  type Title,
  getMovie,
  listMovies,
} from '@/services/imdb'

export const moviesQuery = createQuery<
  ListTitlesResponse,
  Omit<ListTitlesParams, 'types'>
>({
  queryKey: (params) => ['movies', params],
  queryFn: (params) => listMovies(params),
  staleTime: 1000 * 60 * 5, // 5 minutes
})

export const movieQuery = createQuery<Title, string>({
  queryKey: (titleId) => ['movie', titleId],
  queryFn: (titleId) => getMovie(titleId),
  staleTime: 1000 * 60 * 10, // 10 minutes
})
