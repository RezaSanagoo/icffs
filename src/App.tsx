import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import ProfileSwitcher from './components/ProfileSwitcher'
import StatusBar from './components/StatusBar'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Stories from './pages/Stories'
import StoryInsights from './pages/StoryInsights'
import Settings from './pages/Settings'
import Search from './pages/Search'
import Activity from './pages/Activity'
import StoriesArchive from './pages/StoriesArchive'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <div className="app-shell min-h-screen">
      {/* <div className="p-2">
        <ProfileSwitcher />
      </div> */}
        <Routes>
        <Route path="/feed" element={<Feed />} />
        <Route path="/search" element={<Search />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/" element={<Profile />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/insights/story/:id" element={<StoryInsights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/archive/stories" element={<StoriesArchive />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
