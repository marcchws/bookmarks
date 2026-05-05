import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Tooltip } from "@base-ui/react"

import { cn } from "@/lib/utils"
import { NAV_ITEMS, isNavItemActive } from "./nav-items"
import type { NavItem } from "./nav-items"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  pathname: string
}

interface NavLinkProps {
  item: NavItem
  collapsed: boolean
  active: boolean
}

function NavLink({ item, collapsed, active }: NavLinkProps) {
  const Icon = item.icon
  const isPrimary = item.variant === "primary"

  const linkContent = (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 border-l-2 px-3 py-3 transition-[border-color,color,background-color,box-shadow] duration-75 motion-reduce:transition-none",
        "min-h-11",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
        active
          ? isPrimary
            ? "border-primary bg-surface-container text-primary"
            : "border-outline-active bg-surface-container text-primary"
          : isPrimary
            ? "border-transparent text-primary hover:border-primary hover:shadow-glow-sm"
            : "border-transparent text-on-surface-variant hover:border-outline hover:bg-surface-container hover:text-on-surface hover:shadow-glow-sm",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon
        className={cn(
          "shrink-0 transition-colors duration-75 motion-reduce:transition-none",
          "size-5",
          active || isPrimary ? "text-primary" : "",
        )}
        aria-hidden="true"
      />
      {!collapsed && (
        <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em]">
          {item.label}
        </span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger delay={300} render={linkContent} />
        <Tooltip.Portal>
          <Tooltip.Positioner side="right" sideOffset={8}>
            <Tooltip.Popup className="border border-outline-active bg-surface px-2 py-1 font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary shadow-glow-sm">
              {item.label}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  return linkContent
}

export function Sidebar({ collapsed, onToggle, pathname }: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed
          ? "var(--sidebar-width-collapsed)"
          : "var(--sidebar-width-expanded)",
      }}
      className="relative hidden flex-col border-r border-outline bg-surface transition-[width] duration-150 ease-linear motion-reduce:transition-none md:flex"
    >
      {/* Nav items */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            collapsed={collapsed}
            active={isNavItemActive(item, pathname)}
          />
        ))}
      </nav>

      {/* Toggle button */}
      <div className="border-t border-outline p-2">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className="flex w-full items-center justify-center border border-outline py-2 text-on-surface-variant transition-[border-color,color,box-shadow] duration-75 motion-reduce:transition-none hover:border-outline-active hover:text-primary hover:shadow-glow-sm focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)] active:translate-x-0.5"
        >
          {collapsed ? (
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          ) : (
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </aside>
  )
}
