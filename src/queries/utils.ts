import {
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback } from 'react'

type QueryConfig<TData, TParams> = {
  queryKey: (params: TParams) => QueryKey
  queryFn: (params: TParams) => Promise<TData>
  staleTime?: number
  gcTime?: number
}

type QueryActions<TData, TParams> = {
  use: (
    params: TParams,
    options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>,
  ) => ReturnType<typeof useQuery<TData>>
  useHelpers: (params: TParams) => {
    invalidate: () => Promise<void>
    update: (updater: TData | ((old: TData | undefined) => TData)) => void
    fetch: () => Promise<TData>
  }
  getQueryKey: (params: TParams) => QueryKey
}

export function createQuery<TData, TParams = void>(
  config: QueryConfig<TData, TParams>,
): QueryActions<TData, TParams> {
  const { queryKey, queryFn, staleTime, gcTime } = config

  return {
    getQueryKey: queryKey,

    use: (params, options = {}) => {
      return useQuery({
        queryKey: queryKey(params),
        queryFn: () => queryFn(params),
        staleTime,
        gcTime,
        ...options,
      })
    },

    useHelpers: (params) => {
      const queryClient = useQueryClient()
      const key = queryKey(params)

      const invalidate = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: key })
      }, [queryClient, key])

      const update = useCallback(
        (updater: TData | ((old: TData | undefined) => TData)) => {
          queryClient.setQueryData<TData>(key, updater)
        },
        [queryClient, key],
      )

      const fetch = useCallback(async () => {
        return queryClient.fetchQuery({
          queryKey: key,
          queryFn: () => queryFn(params),
          staleTime,
        })
      }, [queryClient, key, params])

      return { invalidate, update, fetch }
    },
  }
}

type MutationConfig<TData, TVariables> = {
  mutationKey: QueryKey
  mutationFn: (variables: TVariables) => Promise<TData>
}

type MutationActions<TData, TVariables> = {
  use: (
    options?: Omit<
      UseMutationOptions<TData, Error, TVariables>,
      'mutationKey' | 'mutationFn'
    >,
  ) => ReturnType<typeof useMutation<TData, Error, TVariables>>
}

export function createMutation<TData, TVariables>(
  config: MutationConfig<TData, TVariables>,
): MutationActions<TData, TVariables> {
  const { mutationKey, mutationFn } = config

  return {
    use: (options = {}) => {
      return useMutation({
        mutationKey,
        mutationFn,
        ...options,
      })
    },
  }
}
