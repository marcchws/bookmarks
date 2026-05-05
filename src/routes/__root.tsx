import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import { AppShell } from "@/components/layout/app-shell"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  )
}
