import { Link, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import HomeIcon from '/svg/Home.svg'
import Send from './sn';
import { useActiveProfile } from '../hooks/useProfile'
export default function BottomNav() {
  const location = useLocation()
  const { data: activeProfile } = useActiveProfile()
  const reels = '/2.png'
  const navItems = [
    { path: '/feed', icon: HomeIcon, label: 'Home', isSvg: true },
    { path: '/activity', icon: reels, label: 'Messages', isImg: true },
    { path: '/add', icon: Send, label: 'Add', disabled: false, isImg: false },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/profile', icon: activeProfile?.avatar || '', label: 'Profile', isProfile: true },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 app-bg app-bottom-nav z-50 safe-area-bottom"
      aria-label="Primary navigation"
    >
      <div className="flex justify-around items-center h-14 px-2 border-t app-border">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.path === '/profile'
            ? location.pathname === '/' || location.pathname === '/profile'
            : location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`app-nav-item flex-1 flex flex-col items-center justify-center h-full relative ${
                isActive ? 'app-nav-item-active' : ''
              } ${
                item.disabled
                  ? 'opacity-30 cursor-not-allowed pointer-events-none'
                  : ''
              }`}
            >
              {item.isProfile ? (
                <span className="app-nav-icon w-7 h-7 rounded-full overflow-hidden border border-white/70 flex items-center justify-center">
                  {item.icon ? (
                    <img
                      src={item.icon as string}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full bg-zinc-700" aria-hidden="true" />
                  )}
                </span>
              ) : item.isSvg && !item.isImg ? (
                <img
                  src={Icon as string}
                  alt={item.label}
                  className="app-nav-icon app-nav-image w-6 h-6"
                />
              ) : item.isImg ? (
                <img
                  src={Icon as string}
                  alt={item.label}
                  className="app-nav-icon app-nav-image w-6 h-6 p-0.5"
                />
              ) : (
                <Icon
                  size={24}
                  className="app-nav-icon app-text"
                  fill="none"
                  strokeWidth={1.7}
                />
              )}
              <span className="app-nav-active-dot" aria-hidden="true" />
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
