import { ArrowLeftIcon } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

interface PageHeaderProps {
  title: string
  showBack?: boolean
}

export function PageHeader({ title, showBack = false }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      aria-label={`Page header: ${title}`}
      className="flex items-center gap-3 border-b border-outline bg-surface px-[var(--spacing-gutter)] py-3"
    >
      {showBack && (
        <button
          type="button"
          aria-label="Back to bookmarks list"
          onClick={() => void navigate({ to: "/" })}
          className="flex size-11 items-center justify-center border border-outline text-on-surface-variant transition-[border-color,color,box-shadow] duration-75 motion-reduce:transition-none hover:border-outline-active hover:text-primary hover:shadow-glow-sm focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)] active:translate-x-0.5"
        >
          <ArrowLeftIcon className="size-5" aria-hidden="true" />
        </button>
      )}
      <h1 className="font-heading text-h1 font-bold uppercase tracking-[-0.02em] text-on-surface">
        {title}
      </h1>
    </header>
  )
}
