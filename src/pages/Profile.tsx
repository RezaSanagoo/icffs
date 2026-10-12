import { Plus, Grid3x3, Play, RefreshCw, UserCheck, ChevronDown } from 'lucide-react'
import { useActiveProfile } from '../hooks/useProfile'
import Skeleton from '../components/Skeleton'
import ProfileHeader from '../components/ProfileHeader'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const { data: profile, isLoading: profileLoading } = useActiveProfile()

  const postsCount = profile?.postsCount ?? profile?.postCount ?? 0
  const followersCount = profile?.followersCount ?? 0
  const followingCount = profile?.followingCount ?? 0
  const reachCount = profile?.reachCount ?? 0
  const lastPostImage = profile?.lastPostImage

  if (profileLoading) {
    return (
      <>
      <div className="pb-20">
        <div className="px-">
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
      <BottomNav />
      </>
    )
  }

  // if (!profile) {
  //   return (
  //     <div className="pb-20 flex items-center justify-center min-h-screen">
  //       <p className="text-zinc-500">Failed to load profile</p>
  //     </div>
  //   )
  // }

  const formatFollowersCount = (value?: number | null) => {
  const count = Number(value ?? 0)

  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(0)}M`
  }

  if (count >= 10_000) {
    return `${(count / 1_000).toFixed(0)}K`
  }

  return count.toLocaleString()
}


  return (
    <>
    <div className="pb-20 app-bg min-h-screen">
      {/* Header */}
      <ProfileHeader username={profile?.username || ''} notificationCount={9} />

      {/* Profile Section */}
      <div className="px-4 py-3 pb-0">
        {/* Profile Picture and Info Row */}
        <div className="flex items-start gap-4 mb-3">
          {/* Profile Picture */}
          <div className="relative">
            {/* Profile note */}
            <div className="profile-note absolute -top-1 left-0 z-10 flex h-[44px] w-[80px] items-center justify-center rounded-[19px] bg-[#34383e] px-2 text-center text-[11px] leading-[13px] shadow-lg">
              <span>Unpopular<br />opinion...</span>
              <span className="absolute -bottom-1 left-[52px] h-2 w-2 rotate-45 bg-[#34383e]" aria-hidden="true" />
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={profile?.avatar || ''}
                alt={profile?.username || ''}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Add Story Button */}
            <button className="profile-note-plus absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-900">
              <Plus size={14} className="text-zinc-900" strokeWidth={2.5} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex-1 flex items-center justify-around pt-2">
            <div className="text-center">
              <div className="text-base font-semibold">
                {postsCount.toLocaleString?.() ?? 0}
              </div>
              <div className="text-xs text-zinc-400">posts</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold">
                {formatFollowersCount(followersCount)}
              </div>
              <div className="text-xs text-zinc-400">followers</div>
            </div>

            <div className="text-center">
              <div className="text-base font-semibold">
                {followingCount.toLocaleString?.() ?? 0}
              </div>
              <div className="text-xs text-zinc-400">following</div>
            </div>
          </div>
        </div>

        {/* Name and Username */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold mb-1 app-text">{profile?.fullName || ''}</h2>
          <div className="text-xs app-text font-bold rounded-full p-2 py-1 app-border border flex justify-center items-center gap-1 w-fit"> <span className="-mt-1">@</span> {" "}  {profile?.username || ''}</div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="mb-3">
            <p className="text-sm whitespace-pre-line">{profile.bio}</p>
          </div>
        )}

        {/* Professional dashboard */}
        <div className="mb-3 rounded-lg app-panel px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Professional dashboard</p>
              <p className="text-xs text-zinc-400">
                {reachCount > 0
                  ? `${formatFollowersCount(reachCount)} accounts reached in the last 30 days`
                  : 'No reach data yet'}
              </p>
            </div>
            <ChevronDown size={16} className="text-zinc-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <a href={"https://be.1nsta.ir/admin/stories/profile/"+ profile.id +"/change/"} className="flex-1 app-panel text-center rounded-lg py-1.5 px-4 text-sm font-semibold transition-colors">
         
            Edit profile
            </a>
          <button className="flex-1 app-panel rounded-lg py-1.5 px-4 text-sm font-semibold transition-colors">
            Share profile
          </button>
          <button className="app-panel rounded-lg py-1.5 px-3 transition-colors">
            <UserCheck size={18} />
          </button>
        </div>



        {/* Story Highlights */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {/* New Highlight */}
          <a href={`https://be.1nsta.ir/admin/stories/highlight/add/?profile=${profile?.id}`} className="flex flex-col items-center min-w-[70px]">
            <div className="w-16 h-16 rounded-full border-2 border-zinc-600 flex items-center justify-center mb-1">
              <Plus size={24} className="text-zinc-400" />
            </div>
            <span className="text-xs text-zinc-400">New</span>
          </a>

          {profile?.highlights?.slice(0, 4).map((highlight) => (
            <div key={highlight.id} className="flex flex-col items-center min-w-[70px]">
              <div className="w-16 h-16 rounded-full border-2 border-zinc-600 overflow-hidden mb-1">
                {highlight.coverImage ? (
                  <img
                    src={highlight.coverImage}
                    alt={highlight.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 text-[10px]">
                    {highlight.title?.slice(0, 2).toUpperCase() || 'HL'}
                  </div>
                )}
              </div>
              <span className="text-xs text-zinc-400 text-center max-w-[70px] truncate">
                {highlight.title}
              </span>
            </div>
          ))}
        </div>

        {/* Content Tabs */}
        <div className="flex items-center justify-around -ml-4 w-screen border-b border-zinc-800 mt-4">
          <img src="1.png" alt="" className="absolute app-theme-image" />
          <button className="w-12 text-transparent py-3 flex items-center justify-center border-b-2 border-white">
            <Grid3x3 size={24} className="text-transparent" />
          </button>
          <button className="w-12 text-transparent py-3 flex items-center justify-center">
            <Play size={24} className="text-transparent" />
          </button>
          <button className="w-12 text-transparent py-3 flex items-center justify-center">
            <RefreshCw size={24} className="text-transparent" />
          </button>
          <button className="w-12 text-transparent py-3 flex items-center justify-center">
            <UserCheck size={24} className="text-transparent" />
          </button>
        </div>
      </div>

      {/* Posts Grid */}
              {lastPostImage && (
          <div className="">
            <img
              src={lastPostImage}
              alt="Latest post"
              className="w-full object-cover"
            />
          </div>
        )}
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: postsCount }, (_, i) => (
          <div
            key={i}
            className="aspect-square bg-zinc-900"
          />
        ))}
        {postsCount === 0 && (
          <div className="col-span-3 aspect-square bg-zinc-900 flex items-center justify-center">
            <div className="text-zinc-600 text-sm">No posts yet</div>
          </div>
        )}
      </div>
    </div>
    <BottomNav />
    </>
  )
}
