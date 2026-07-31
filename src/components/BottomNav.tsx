import { Link, useLocation } from 'react-router-dom'
import { Search, User } from 'lucide-react'
import HomeIcon from '/svg/Home.svg'
import SquarePlay from './sp';
import Send from './sn';
export default function BottomNav() {
  const location = useLocation()
  const reels = '/2.png'
  const navItems = [
    { path: '/feed', icon: HomeIcon, label: 'Home', isSvg: true },
    { path: '/activity', icon: reels, label: 'Messages', isImg: true },
    { path: '/add', icon: Send, label: 'Add', disabled: false },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-14 px-2 border-t border-gray-800">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center h-full relative ${
                item.disabled
                  ? 'opacity-30 cursor-not-allowed pointer-events-none'
                  : ''
              }`}
            >
              {item.isSvg && !item.isImg ? (
                <img
                  src={Icon as string}
                  alt={item.label}
                  className="w-6 h-6"
                  style={{ filter: isActive ? 'brightness(1)' : 'brightness(0.75)' }}
                />
              ) : item.isImg ? (
                <img
                  src={Icon as string}
                  alt={item.label}
                  className="w-6 h-6  p-0.5"
                />
              ) : (
                <Icon
                  size={24}
                  className={isActive ? 'text-white' : 'text-white'}
                  fill={isActive ? 'white' : 'none'}
                  strokeWidth={isActive ? 0 : 1.5}
                />
              )}
              {/* {item.hasNotification && (
                <span className="absolute top-2 right-1/2 translate-x-3 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )} */}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

