import { useState } from "react"
import { useRouterState } from "@tanstack/react-router"

import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { PageHeader } from "./page-header"

const SIDEBAR_KEY = "shell:sidebar-collapsed"

interface RouteConfig {
  title: string
  showBack: boolean
}

const ROUTE_TITLES: Record<string, RouteConfig> = {
  "/": { title: "BOOKMARKS", showBack: false },
  "/bookmarks/new": { title: "NEW BOOKMARK", showBack: false },
  "/design-system": { title: "DESIGN SYSTEM", showBack: false },
}

function getRouteConfig(pathname: string): RouteConfig {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.endsWith("/edit") && pathname.startsWith("/bookmarks/")) {
    return { title: "EDIT BOOKMARK", showBack: true }
  }
  if (pathname.startsWith("/bookmarks/")) {
    return { title: "BOOKMARK DETAIL", showBack: true }
  }
  return { title: "BOOKMARKS", showBack: false }
}

function readSidebarCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_KEY)
    return stored === "true"
  } catch {
    return false
  }
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState<boolean>(readSidebarCollapsed)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const { title, showBack } = getRouteConfig(pathname)

  function handleToggle() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next))
      } catch {
        // private mode — ignore
      }
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar collapsed={collapsed} onToggle={handleToggle} pathname={pathname} />

      {/* Content column */}
      <div className="flex flex-1 flex-col">
        <PageHeader title={title} showBack={showBack} />
        <main
          id="main-content"
          className="flex-1 p-[var(--spacing-gutter)] pb-16 md:pb-[var(--spacing-gutter)]"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNav pathname={pathname} />
    </div>
  )
}
