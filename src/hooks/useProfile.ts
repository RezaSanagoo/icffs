import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'

export function useActiveProfile() {
  return useQuery({
    queryKey: ['activeProfile'],
    queryFn: async () => {
      return await api.profile.getActive()
    },
    retry: false,
  })
}
