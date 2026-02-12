import { useQuery } from 'react-query';
import { getStoryInsightsOptions, StoryInsightsOption } from '../utils/insightsOptionsApi';

export function useStoryInsightsOptions() {
  return useQuery<StoryInsightsOption[]>(['story-insights-options'], getStoryInsightsOptions);
}
