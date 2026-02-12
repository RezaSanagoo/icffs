import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import { Profile } from '../types'

export function useProfiles() {
  return useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const res = await api.profile.list()
      return res.profiles
    },
    staleTime: 5 * 60 * 1000, // 5 دقیقه کش
    retry: false,
  })
}
export function useActiveProfile() {
  return useQuery<Profile | null>({
    queryKey: ['activeProfile'],
    queryFn: async () => {
      try {
        return await api.profile.getActive()
      } catch (error) {
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}


export function useSetActiveProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profileId: string) =>
      api.profile.setActive(profileId),

    onMutate: async (profileId) => {
      await queryClient.cancelQueries({ queryKey: ['activeProfile'] })

      const previousProfile = queryClient.getQueryData<Profile>([
        'activeProfile',
      ])

      const profiles = queryClient.getQueryData<Profile[]>(['profiles'])

      const newActive = profiles?.find(p => p.id === profileId)

      if (newActive) {
        queryClient.setQueryData(['activeProfile'], newActive)
      }

      return { previousProfile }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['activeProfile'], context.previousProfile)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activeProfile'] })
    },
  })
}
