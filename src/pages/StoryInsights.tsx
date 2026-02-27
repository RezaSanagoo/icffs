import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStoryInsightsOptions } from '../hooks/useStoryInsightsOptions'
import { ArrowLeft, X, Settings, Trash2, MoreHorizontal, BarChart3, Users, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useStoryInsights } from '../hooks/useStories'
import Skeleton from '../components/Skeleton'

export default function StoryInsights() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: insightsOptions, isLoading: optionsLoading } = useStoryInsightsOptions();
  const { data: insightsData, isLoading } = useStoryInsights(id || '')
  const insights = insightsData

  // تب فعال (کلید گزینه)
  const [activeTab, setActiveTab] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (insightsOptions && insightsOptions.length > 0 && !activeTab) {
      const firstEnabled = insightsOptions.find(opt => opt.enabled);
      setActiveTab(firstEnabled ? firstEnabled.key : insightsOptions[0].key);
    }
  }, [insightsOptions, activeTab]);

  if (isLoading || optionsLoading) {
    return (
      <div className="pb-20 bg-black min-h-screen">
        <div className="px-4 py-4">
          <Skeleton className="h-10 w-10 rounded-full mb-4" />
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 mb-6" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center min-h-screen bg-black">
        <svg className="h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
        <p className="text-gray-400 text-lg">دریافت اطلاعات آنالیتیکس با خطا مواجه شد</p>
        <p className="text-gray-500 text-sm mt-2">لطفاً بعداً تلاش کنید یا ارتباط با سرور را بررسی نمایید.</p>
      </div>
    )
  }

  // داده‌های هر گزینه
  const followerData = insights.followers_percentage
    ? [
        { name: 'Followers', value: insights.followers_percentage },
        { name: 'Non-followers', value: insights.non_followers_percentage || 0 },
      ]
    : [];

  const interactionData = [
    { name: 'Likes', value: insights.likes || 0 },
    { name: 'Replies', value: insights.replies || 0 },
    { name: 'Shares', value: insights.shares || 0 },
  ].filter((item) => item.value > 0);

  const totalInteractions = interactionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="pb-20 bg-black min-h-screen">
      {/* Header */}
      <header className="sticky top-6 bg-black border-b border-gray-800 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <Settings size={20} />
            </button>
            {/* Story previews */}
            <div className="w-12 h-20 rounded bg-gray-800 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-gray-800 flex items-center justify-center">
                <span className="text-white text-xs">Story</span>
              </div>
            </div>
            <div className="w-12 h-20 rounded bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
              <span className="text-2xl">📷</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Trash2 size={20} className="text-gray-400" />
            <X size={20} onClick={() => navigate(-1)} className="cursor-pointer" />
          </div>
        </div>
      </header>

      {/* Tabs: گزینه‌های آنالیتیکس */}
      {insightsOptions && insightsOptions.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800 overflow-x-auto">
          {insightsOptions.filter(opt => opt.enabled).map(opt => (
            <button
              key={opt.key}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeTab === opt.key ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              onClick={() => setActiveTab(opt.key)}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-4">
        {/* نمایش داینامیک گزینه‌های آنالیتیکس بر اساس تب فعال */}
        {activeTab === 'reach' && (
          insights.reach !== undefined && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold">Reach</span>
                <span className="ml-auto text-sm font-semibold">{insights.reach}</span>
              </div>
            </div>
          )
        )}
        {activeTab === 'impressions' && (
          insights.impressions !== undefined && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold">Impressions</span>
                <span className="ml-auto text-sm font-semibold">{insights.impressions}</span>
              </div>
            </div>
          )
        )}
        {activeTab === 'likes' && (
          insights.likes !== undefined && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold">Likes</span>
                <span className="ml-auto text-sm font-semibold">{insights.likes}</span>
              </div>
            </div>
          )
        )}
        {activeTab === 'replies' && (
          insights.replies !== undefined && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold">Replies</span>
                <span className="ml-auto text-sm font-semibold">{insights.replies}</span>
              </div>
            </div>
          )
        )}
        {activeTab === 'shares' && (
          insights.shares !== undefined && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold">Shares</span>
                <span className="ml-auto text-sm font-semibold">{insights.shares}</span>
              </div>
            </div>
          )
        )}
        {activeTab === 'navigation_total' && (
          insights.navigation_total !== undefined && (
            <div className="mb-6">
              <div className="text-sm font-semibold mb-3">Navigation</div>
              <div className="text-sm text-gray-400 mb-2">
                Total: <span className="text-white font-semibold">{insights.navigation_total}</span>
              </div>
              <div className="space-y-2">
                {insights.forward !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Forward</span>
                    <span className="text-sm font-semibold">{insights.forward}</span>
                  </div>
                )}
                {insights.next_story !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Next story</span>
                    <span className="text-sm font-semibold">{insights.next_story}</span>
                  </div>
                )}
                {insights.exited !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Exited</span>
                    <span className="text-sm font-semibold">{insights.exited}</span>
                  </div>
                )}
              </div>
            </div>
          )
        )}
        {activeTab === 'profile_activity' && (
          insights.profile_activity !== undefined && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold">Profile activity</span>
                <span className="ml-auto text-sm font-semibold">{insights.profile_activity}</span>
              </div>
              {insights.follows !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Follows</span>
                  <span className="text-sm font-semibold">{insights.follows}</span>
                </div>
              )}
            </div>
          )
        )}

        {/* لیست ویورها */}
        {insights.viewers && insights.viewers.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-semibold mb-3 text-white">Viewers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {insights.viewers.map((viewer: any) => (
                <div key={viewer.id} className="flex items-center gap-3 bg-gray-900 rounded-lg p-2">
                  <img
                    src={viewer.avatarUrl || '/default-avatar.png'}
                    alt={viewer.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                  />
                  <span className="text-white text-sm font-medium">{viewer.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
