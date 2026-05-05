import { createRootRoute, Link, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link
            to="/design-system"
            className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            [DS]
          </Link>
        </div>
      )}
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  )
}
