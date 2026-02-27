import { Link, useLocation } from 'react-router-dom'
import { Home, Search, User } from 'lucide-react'
import SquarePlay from './sp';
import Send from './sn';
export default function BottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/feed', icon: Home, label: 'Home' },
    { path: '/activity', icon: SquarePlay, label: 'Messages',},
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
              <Icon
                size={24}
                className={isActive ? 'text-white' : 'text-white'}
                fill={isActive ? 'white' : 'none'}
                strokeWidth={isActive ? 0 : 1.5}
              />
              {item.hasNotification && (
                <span className="absolute top-2 right-1/2 translate-x-3 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

