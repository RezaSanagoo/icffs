import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, MoreVertical, Heart, Calendar, MapPin, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useArchiveStories } from '../hooks/useStories'
import { useActiveProfile } from '../hooks/useProfile'
import { Story } from '../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThreads } from '@fortawesome/free-brands-svg-icons'


export default function StoriesArchive() {
  const navigate = useNavigate()
  const { data: response, isLoading } = useArchiveStories()
  const { data: activeProfile } = useActiveProfile()
  
  // Get stories only from active profile (including expired) from API
  const archivedStories: (Story & { date: string })[] = (response?.stories || [])
    .filter(story => story.profileId === activeProfile?.id)
    .map(story => ({
      ...story,
      date: new Date(story.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }))

  return (
    <div className="pb-14 bg-black min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-black border-b border-gray-800 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold">Stories archive</h1>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
          <MoreVertical size={24} />
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex sticky top-12 z-50 bg-black items-center justify-around border-b border-gray-800 px-4">
        <button className="py-3 border-b-2 border-white">
          <RefreshCw size={20} />
        </button>
        <button className="py-3">
          <Heart size={20} className="text-gray-400" />
        </button>
        <button className="py-3">
          <Calendar size={20} className="text-gray-400" />
        </button>
        <button className="py-3">
          <MapPin size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Stories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : archivedStories.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <p>No archived stories</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {archivedStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="aspect-[9/16] bg-gray-900 relative overflow-hidden cursor-pointer"
              onClick={() => navigate(`/stories?story=${story.id}`)}
            >
              <img
                src={story.thumbnailUrl || story.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              
              {/* Date overlay */}
              <div className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1">
                <span className="text-white text-xs font-medium">{story.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

