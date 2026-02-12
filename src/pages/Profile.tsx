import { useNavigate } from 'react-router-dom'
import { Plus, Grid3x3, Play, RefreshCw, UserCheck, Share2, ChevronDown } from 'lucide-react'
import { useActiveProfile } from '../hooks/useProfile'
import { useStories } from '../hooks/useStories'
import StoryRing from '../components/StoryRing'
import Skeleton from '../components/Skeleton'
import ProfileHeader from '../components/ProfileHeader'

export default function Profile() {
  const navigate = useNavigate()
  const { data: profile, isLoading: profileLoading } = useActiveProfile()
  const { data: storiesData, isLoading: storiesLoading } = useStories()

  const stories = storiesData?.stories || []

  if (profileLoading) {
    return (
      <div className="pb-20">
        <div className="px-4 py-6">
          <Skeleton className="h-20 w-20 rounded-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-16 w-20" />
            <Skeleton className="h-16 w-20" />
            <Skeleton className="h-16 w-20" />
          </div>
        </div>
      </div>
    )
  }

  // if (!profile) {
  //   return (
  //     <div className="pb-20 flex items-center justify-center min-h-screen">
  //       <p className="text-gray-500">Failed to load profile</p>
  //     </div>
  //   )
  // }

  return (
    <div className="pb-20 bg-black min-h-screen">
      {/* Header */}
      <ProfileHeader username={profile?.username || ''} notificationCount={9} />

      {/* Profile Section */}
      <div className="px-4 py-3">
        {/* Profile Picture and Info Row */}
        <div className="flex items-start gap-4 mb-3">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={profile?.avatar || ''}
                alt={profile?.username || ''}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Add Story Button */}
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full border-2 border-black flex items-center justify-center">
              <Plus size={14} className="text-white" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex-1 flex items-center justify-around pt-2">
            <div className="text-center">
              <div className="text-base font-semibold">
                {profile?.postsCount?.toLocaleString?.() ?? 0}
              </div>
              <div className="text-xs text-gray-400">posts</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold">
                {profile?.followersCount?.toLocaleString?.() ?? 0}
              </div>
              <div className="text-xs text-gray-400">followers</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold">
                {profile?.followingCount?.toLocaleString?.() ?? 0}
              </div>
              <div className="text-xs text-gray-400">following</div>
            </div>
          </div>
        </div>

        {/* Name and Username */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold mb-1">{profile?.fullName || ''}</h2>
          <p className="text-sm text-gray-400">@{profile?.username || ''}</p>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="mb-3">
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-1.5 px-4 text-sm font-semibold transition-colors">
            Edit profile
          </button>
          <button className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-1.5 px-4 text-sm font-semibold transition-colors">
            Share profile
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 rounded-lg py-1.5 px-3 transition-colors">
            <UserCheck size={18} />
          </button>
        </div>

        {/* Story Highlights */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {/* New Highlight */}
          <div className="flex flex-col items-center min-w-[70px]">
            <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center mb-1">
              <Plus size={24} className="text-gray-400" />
            </div>
            <span className="text-xs text-gray-400">New</span>
          </div>
          
          {/* Story Highlights */}
          {stories.slice(0, 4).map((story, index) => (
            <StoryRing
              key={story.id}
              story={story}
              avatar={profile.avatar}
              username={index === 0 ? 'GYM' : `Story ${index + 1}`}
              size="md"
              hasNewStories={false}
            />
          ))}
        </div>

        {/* Content Tabs */}
        <div className="flex items-center justify-around border-t border-gray-800 mt-4">
          <button className="flex-1 py-3 flex items-center justify-center border-t-2 border-white">
            <Grid3x3 size={24} />
          </button>
          <button className="flex-1 py-3 flex items-center justify-center">
            <Play size={24} className="text-gray-400" />
          </button>
          <button className="flex-1 py-3 flex items-center justify-center">
            <RefreshCw size={24} className="text-gray-400" />
          </button>
          <button className="flex-1 py-3 flex items-center justify-center">
            <UserCheck size={24} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: profile?.postsCount || 0 }, (_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-900"
          />
        ))}
        {profile?.postsCount === 0 && (
          <div className="col-span-3 aspect-square bg-gray-900 flex items-center justify-center">
            <div className="text-gray-600 text-sm">No posts yet</div>
          </div>
        )}
      </div>
    </div>
  )
}

