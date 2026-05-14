export type ContentType = 'book' | 'webnovel' | 'indie' | 'original'

export type ReadingStatus =
  | 'to_read'
  | 'reading'
  | 'completed'
  | 'dropped'
  | 'rereading'
  | 'waiting'
  | 'up_to_date'

export type ActivityAction =
  | 'progress'
  | 'status_change'
  | 'review_written'
  | 'started'
  | 'completed'

export interface Content {
  id: string
  user_id: string
  type: ContentType
  title: string
  author: string
  cover_url: string | null
  genre: string[]
  isbn: string | null
  external_id: string | null
  total_pages: number | null
  total_episodes: number | null
  is_ongoing: boolean
  created_at: string
}

export interface ReadingRecord {
  id: string
  user_id: string
  content_id: string
  status: ReadingStatus
  progress_page: number | null
  progress_episode: number | null
  started_at: string | null
  completed_at: string | null
  is_in_store: boolean
}

export interface ActivityLog {
  id: string
  user_id: string
  content_id: string
  record_id: string
  action: ActivityAction
  note: string | null
  progress_snapshot: number | null
  logged_at: string
}

export interface Review {
  id: string
  user_id: string
  content_id: string
  body: string
  rating: number
  is_public: boolean
  ai_keywords: string[] | null
  ai_emotion: string | null
  ai_depth: string | null
  created_at: string
  updated_at: string
}

export interface UserProfile {
  user_id: string
  store_name: string
  theme_id: string
  store_level: number
  store_reputation: number
  created_at: string
}

export interface ContentWithRecord extends Content {
  reading_record: ReadingRecord | null
}
