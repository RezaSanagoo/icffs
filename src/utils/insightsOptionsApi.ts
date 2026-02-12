const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export interface StoryInsightsOption {
  id: number;
  name: string;
  key: string;
  percent_of_views: number;
  order: number;
  enabled: boolean;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getStoryInsightsOptions(): Promise<StoryInsightsOption[]> {
  const res = await fetchAPI<{ options: StoryInsightsOption[] }>('/story-insights-options/');
  return res.options;
}
