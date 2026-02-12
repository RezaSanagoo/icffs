import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, RefreshCw, UserCheck, Smile, Star, Trash2, Archive, Grid3x3 } from 'lucide-react'

export default function Activity() {
  const navigate = useNavigate()

  return (
    <div className="pb-20 bg-black min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-black border-b border-gray-800 z-10">
        <div className="px-5 py-3 pb-2 flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-base font-semibold flex-1">Your activity</h1>
        </div>
      </header>

      {/* Intro Section */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold mb-2">One place to manage your activity</h2>
        <p className="text-sm text-gray-400">
          View and manage your interactions, content and account activity.{' '}
          <span className="text-blue-500">Learn more</span>
        </p>
      </div>

      <div className="px-4">
        {/* Interactions section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 px-1">Interactions</h2>
          
          <div className="space-y-0">
            {[
              { icon: Heart, label: 'Likes' },
              { icon: MessageCircle, label: 'Comments' },
              { icon: RefreshCw, label: 'Reposts' },
              { icon: UserCheck, label: 'Tags' },
              { icon: Smile, label: 'Sticker responses' },
              { icon: Star, label: 'Reviews' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 py-3 border-b border-gray-800 last:border-0"
                >
                  <Icon size={24} strokeWidth={1.5} />
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Removed and archived content section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 px-1">Removed and archived content</h2>
          
          <div className="space-y-0">
            <button className="w-full flex items-center gap-3 py-3 border-b border-gray-800">
              <Trash2 size={24} strokeWidth={1.5} />
              <span className="flex-1 text-left text-sm">Recently deleted</span>
              <ArrowLeft size={16} className="text-gray-400 rotate-180" />
            </button>
            
            <button
              onClick={() => navigate('/archive/stories')}
              className="w-full flex items-center gap-3 py-3"
            >
              <Archive size={24} strokeWidth={1.5} />
              <span className="flex-1 text-left text-sm">Archived</span>
              <ArrowLeft size={16} className="text-gray-400 rotate-180" />
            </button>
          </div>
        </div>

        {/* Content you shared section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 px-1">Content you shared</h2>
          
          <div className="space-y-0">
            <button className="w-full flex items-center gap-3 py-3">
              <Grid3x3 size={24} strokeWidth={1.5} />
              <span className="flex-1 text-left text-sm">Posts</span>
              <ArrowLeft size={16} className="text-gray-400 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
