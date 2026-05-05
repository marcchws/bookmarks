// REQ-1, REQ-5
export interface Bookmark {
  id: string
  url: string
  title: string
  description?: string
  tags: string[] // tag slugs
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export interface BookmarkFormValues {
  url: string
  title: string
  description?: string
  tags: string[]
}
