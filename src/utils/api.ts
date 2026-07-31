import { StoryInsights } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://be.1nsta.ir/api'
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.69:8000/api'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
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

export const api = {
profile: {
  get: () =>
    fetchAPI<{ profile: import('../types').Profile }>('/profile/'),

  list: () =>
    fetchAPI<{ profiles: import('../types').Profile[] }>('/profile/list_profiles/'),

  setActive: (profile_id: string) =>
    fetchAPI<{ status: string; profile_id: string }>('/profile/set_active/', {
      method: 'POST',
      body: JSON.stringify({ profile_id }),
      credentials: 'include',
    }),

  getActive: () =>
    fetchAPI<import('../types').Profile>('/profile/active/'),
},

  stories: {
    list: () => fetchAPI<{ stories: import('../types').Story[] }>('/stories/'),
    archive: () => fetchAPI<{ stories: import('../types').Story[] }>('/stories/archive/'),
    view: (id: string) =>
      fetchAPI(`/stories/${id}/view/`, { method: 'POST' }),
    insights: async (id: string) => {
  const res = await fetchAPI<{ insights: StoryInsights }>(
    `/stories/${id}/insights/`
  )
  return res.insights
  }
   
  },
  settings: {
    get: () => fetchAPI<{ settings: import('../types').Settings }>('/settings/'),
    update: (settings: import('../types').Settings) =>
      fetchAPI('/settings/', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),
  },
}

