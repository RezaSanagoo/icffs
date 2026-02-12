import { useProfiles } from '../hooks/useProfiles'
import { useActiveProfile } from '../hooks/useProfile'
import { useSetActiveProfile } from '../hooks/useProfiles'

export default function ProfileSwitcher() {
  const { data: profiles, isLoading } = useProfiles()
  const { data: activeProfile } = useActiveProfile()
  const setActive = useSetActiveProfile()

  if (isLoading) return (
    <div className="p-2 flex items-center gap-2 text-gray-400">
      <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
      در حال بارگذاری پروفایل‌ها...
    </div>
  )
  if (!profiles || profiles.length === 0) return (
    <div className="p-2 flex items-center gap-2 text-gray-400">
      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
      هیچ پروفایلی یافت نشد
    </div>
  )

  return (
    <div className="flex gap-2 items-center p-2 bg-gray-900 rounded-lg">
      {profiles.map((profile, index) => (
        <button
          key={`${profile.id ?? 'profile'}-${index}`}
          className={`px-3 py-1 rounded-full border text-sm transition-all ${activeProfile?.id === profile.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-200 border-gray-700'}`}
          onClick={() => setActive.mutate(profile.id)}
          disabled={setActive.isPending}
        >
          {profile.avatar && (
            <img src={profile.avatar} alt={profile.username} className="inline-block w-6 h-6 rounded-full mr-2 align-middle" />
          )}
          {profile.username}
        </button>
      ))}
    </div>
  )
}
