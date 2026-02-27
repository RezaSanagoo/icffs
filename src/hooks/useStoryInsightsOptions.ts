import { useQuery } from '@tanstack/react-query'
import { getStoryInsightsOptions, StoryInsightsOption } from '../utils/insightsOptionsApi'

export function useStoryInsightsOptions() {
  return useQuery<StoryInsightsOption[]>({
    queryKey: ['story-insights-options'],
    queryFn: getStoryInsightsOptions,
    retry: false,
  })
}
