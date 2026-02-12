import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      return await api.stories.list()
    },
    retry: false,
  })
}

export function useArchiveStories() {
  return useQuery({
    queryKey: ['archive-stories'],
    queryFn: async () => {
      return await api.stories.archive()
    },
    retry: false,
  })
}

export function useStoryView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (storyId: string) => {
      const res = await api.stories.view(storyId)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}

export function useStoryInsights(storyId: string) {
  return useQuery({
    queryKey: ['story-insights', storyId],
    queryFn: async () => {
      return await api.stories.insights(storyId)
    },
    enabled: !!storyId,
    retry: false,
  })
}

