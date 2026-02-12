import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import { Settings } from '../types'
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return await api.settings.get()
    },
    retry: false,
    select: (data) => data?.settings,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (settings: Settings) => {
      // Always save to localStorage
      localStorage.setItem('insta_analytics_settings', JSON.stringify(settings))
      
      return await api.settings.update(settings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

// Local storage fallback for settings
const SETTINGS_KEY = 'insta_analytics_settings'

export function useLocalSettings() {
  const getSettings = (): Settings => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored ? JSON.parse(stored) : defaultSettings
  }

  const setSettings = (settings: Settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }

  return { getSettings, setSettings }
}

