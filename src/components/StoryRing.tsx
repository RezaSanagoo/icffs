import { useNavigate } from 'react-router-dom'
import { Story } from '../types'

interface StoryRingProps {
  story: Story
  avatar: string
  username: string
  size?: 'sm' | 'md' | 'lg'
  hasNewStories?: boolean
}

export default function StoryRing({
  story,
  avatar,
  username,
  size = 'md',
  hasNewStories = true,
}: StoryRingProps) {
  const navigate = useNavigate()

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const ringSizeClasses = {
    sm: 'w-[60px] h-[60px]',
    md: 'w-[68px] h-[68px]',
    lg: 'w-[84px] h-[84px]',
  }

  const handleClick = () => {
    navigate(`/stories?story=${story.id}`)
  }

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={`${ringSizeClasses[size]} rounded-full p-[2px] ${
          hasNewStories ? 'gradient-ring' : 'bg-gray-600'
        } flex items-center justify-center transition-transform active:scale-95`}
      >
        <div className="w-full h-full rounded-full bg-black p-[2px]">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img
              src={avatar}
              alt={username}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <span className="text-xs mt-1 text-white truncate max-w-[70px]">
        {username}
      </span>
    </div>
  )
}

