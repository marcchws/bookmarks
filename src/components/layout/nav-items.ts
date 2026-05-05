import { BookmarkIcon, PlusIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  variant: "default" | "primary"
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Bookmarks", to: "/", icon: BookmarkIcon, variant: "default" },
  { label: "New Bookmark", to: "/bookmarks/new", icon: PlusIcon, variant: "primary" },
]
