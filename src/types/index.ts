export interface Highlight {
  id: string
  title: string
  coverImage?: string
  createdAt?: string
}

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
  reachCount: number
  postCount: number
  lastPostImage?: string
  highlights: Highlight[]
  viewerImage: string
  viewerImage2: string
}

export interface StoryMentionTarget {
  id: string
  username: string
  display_name: string
  avatarUrl: string
  url: string
}

interface StoryInteractiveElement {
  id: string
  elementType: 'link' | 'mention'
  title: string
  url: string
  mentionTarget: StoryMentionTarget | null
  x: number
  y: number
  order: number
}

export interface Story {
  id: string
  profileId: string
  mediaUrl: string
  thumbnailUrl: string
  mediaType: 'image' | 'video'
  createdAt: string
  expiresAt: string
  duration: number
  viewcount: number
  tag: string
  stickerTaps: boolean
  LinkClicks: boolean
  interactiveElements: StoryInteractiveElement[]
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

