export interface Profile {
  id: string
  username: string
  fullName: string
  avatar: string
  isVerified: boolean
  postsCount: number
  followersCount: number
  followingCount: number
  bio?: string
}

export interface Story {
  id: string
  profileId?: string
  mediaUrl: string
  thumbnailUrl?: string
  mediaType: 'image' | 'video'
  createdAt: string
  expiresAt: string
}

export interface StoryInsights {
  totalViews: number
  uniqueViewers: number
  reach: number
  impressions: number
  viewsTimeline: Array<{
    time: string
    count: number
  }>
  viewers: Array<{
    id: number
    name: string
    avatarUrl: string
  }>
  followersReach?: number
  nonFollowersReach?: number
}

export interface Settings {
  storyInsightsVisible: boolean
  storyExpirationDuration: number // hours
  compressionLevel: 'low' | 'medium' | 'high'
}

