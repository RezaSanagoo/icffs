import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, User, Bookmark, Archive, Activity, Bell, Clock, Lock, Star, Grid3x3, Ban } from 'lucide-react'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import Skeleton from '../components/Skeleton'

export default function Settings() {
  const navigate = useNavigate()
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  if (isLoading || !settings) {
    return (
      <div className="pb-20 bg-black min-h-screen">
        <div className="px-4 py-4">
          <Skeleton className="h-10 w-10 rounded-full mb-4" />
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-24 mb-4" />
          <Skeleton className="h-32 mb-4" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  const handleUpdate = (updates: Partial<typeof settings>) => {
    updateSettings.mutate({ ...settings, ...updates })
  }

  return (
    <div className="pb-20 bg-black min-h-screen">
      {/* Header */}
      <header className="sticky bg-black border-b border-gray-800 z-10">
        <div className="px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-base font-semibold flex-1">Settings and activity</h1>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-2.5">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
          />
        </div>
      </div>

      <div className="px-4">
        {/* Your account section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 px-1">Your account</h2>
          
          <div className="bg-transparent rounded-lg">
            <div className="flex items-start gap-3 py-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Accounts Center</span>
                  <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  Password, security, personal details, ad preferences
                </p>
              </div>
            </div>
                <p className="text-xs text-gray-500">
                  Manage your connected experiences and account settings across Meta technologies.{' '}
                  <span className="text-blue-500">Learn more</span>
                </p>
          </div>
        </div>

        {/* How you use Instagram section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 px-1">How you use Instagram</h2>
          
          <div className="space-y-0">
            {[
              { icon: Bookmark, label: 'Saved' },
              { icon: Archive, label: 'Archive' },
              { icon: Activity, label: 'Your activity' },
              { icon: Bell, label: 'Notifications' },
              { icon: Clock, label: 'Time management' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.label === 'Your activity') {
                      navigate('/activity')
                    }
                    if (item.label === 'Archive') {
                      navigate('/archive/stories')
                    }
                  }}
                  className="w-full flex items-center gap-3 py-3 border-b border-gray-800 last:border-0"
                >
                  <Icon size={24} />
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Who can see your content section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 px-1">Who can see your content</h2>
          
          <div className="space-y-0">
            <button className="w-full flex items-center gap-3 py-3 border-b border-gray-800">
              <Lock size={24} />
              <span className="flex-1 text-left text-sm">Account privacy</span>
              <span className="text-xs text-gray-400 mr-2">Public</span>
              <ArrowLeft size={16} className="text-gray-400 rotate-180" />
            </button>
            
            <button className="w-full flex items-center gap-3 py-3 border-b border-gray-800">
              <Star size={24} />
              <span className="flex-1 text-left text-sm">Close Friends</span>
              <span className="text-xs text-gray-400 mr-2">5</span>
              <ArrowLeft size={16} className="text-gray-400 rotate-180" />
            </button>
            
            <button className="w-full flex items-center gap-3 py-3 border-b border-gray-800">
              <Grid3x3 size={24} />
              <span className="flex-1 text-left text-sm">Crossposting</span>
              <ArrowLeft size={16} className="text-gray-400 rotate-180" />
            </button>
            
            <button className="w-full flex items-center gap-3 py-3">
              <Ban size={24} />
              <span className="flex-1 text-left text-sm">Blocked</span>
              <ArrowLeft size={16} className="text-gray-400 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
