import { ChevronDown, Bell, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useProfiles, useSetActiveProfile } from '../hooks/useProfiles'

interface ProfileHeaderProps {
  username: string
  notificationCount?: number
}

export default function ProfileHeader({
  username,
  notificationCount = 0,
}: ProfileHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const { data: profiles } = useProfiles()
  const setActive = useSetActiveProfile()

  return (
    <header className="sticky top-0 bg-black z-50 border-b border-gray-800">
      {/* Main header */}
      <div className="px-5 py-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:opacity-70 transition"
          >
            <h1 className="text-base font-semibold">{username}</h1>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-gray-900 rounded-lg shadow-lg min-w-48">
              {profiles?.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setActive.mutate(profile.id)
                    setShowDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition ${
                    profile.username === username ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {profile.avatar && (
                      <img
                        src={profile.avatar}
                        alt={profile.username}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm">{profile.username}</span>
                    {profile.username === username && (
                      <span className="text-blue-500 text-xs ml-auto">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {notificationCount > 0 && (
            <div className="relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            </div>
          )}
          <Link to="/settings">
            <Menu size={24} />
          </Link>
        </div>
      </div>
    </header>
  )
}

