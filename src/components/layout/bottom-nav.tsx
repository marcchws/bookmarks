import { Link, useRouterState } from "@tanstack/react-router"

import { NAV_ITEMS } from "./nav-items"
import type { NavItem } from "./nav-items"

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.to === "/") return pathname === "/"
  return pathname === item.to || pathname.startsWith(item.to + "/")
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-outline bg-surface md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(item, pathname)
        const Icon = item.icon

        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className={[
              "flex flex-1 flex-col items-center justify-center gap-1 border-t-2 py-3 transition-[border-color,color] duration-75 motion-reduce:transition-none",
              "min-h-11",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
              active
                ? "border-outline-active text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em]">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
