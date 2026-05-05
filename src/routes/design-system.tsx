import { createFileRoute } from "@tanstack/react-router"
import {
  AlertCircleIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  PlusIcon,
  SearchIcon,
  TagIcon,
  TrashIcon,
  ZapIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/design-system")({
  component: DesignSystemPage,
})

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

// ─── Token swatch ────────────────────────────────────────────────────────────

type SwatchProps = {
  name: string
  cssVar: string
  hex: string
  onDark?: boolean
}

function Swatch({ name, cssVar, hex, onDark }: SwatchProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-12 w-full border border-outline"
        style={{ backgroundColor: hex }}
        role="img"
        aria-label={name}
      />
      <p className="font-mono text-xs text-foreground">{name}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{cssVar}</p>
      <p
        className="font-mono text-[10px]"
        style={{ color: onDark ? "var(--color-on-surface)" : "var(--color-outline)" }}
      >
        {hex}
      </p>
    </div>
  )
}

// ─── Typography specimen ─────────────────────────────────────────────────────

function TypeSpecimen({
  level,
  label,
  style,
  children,
}: {
  level: string
  label: string
  style: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-outline pb-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {level} · {label}
      </p>
      <div style={style}>{children}</div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-outline px-6 py-4">
        <p className="font-heading text-2xl font-bold uppercase tracking-[-0.02em] text-primary">
          Cyber-OLED Terminal · Design System
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Bookmarks · Living style guide
        </p>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-10">
        {/* ─── SECTION 1: TOKENS ─── */}

        {/* Colors */}
        <Section title="01 · Colors">
          <div className="flex flex-col gap-8">
            {/* Brand palette */}
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Brand
              </p>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                <Swatch name="primary" cssVar="--color-primary" hex="#00ffff" />
                <Swatch name="on-primary" cssVar="--color-on-primary" hex="#000000" />
                <Swatch name="secondary" cssVar="--color-secondary" hex="#ff00ff" />
                <Swatch name="on-secondary" cssVar="--color-on-secondary" hex="#000000" />
                <Swatch name="tertiary" cssVar="--color-tertiary" hex="#32cd32" />
                <Swatch name="on-tertiary" cssVar="--color-on-tertiary" hex="#000000" />
              </div>
            </div>

            {/* Surface hierarchy */}
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Surfaces
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Swatch name="background" cssVar="--color-background" hex="#000000" />
                <Swatch name="surface" cssVar="--color-surface" hex="#131313" />
                <Swatch name="surface-container" cssVar="--color-surface-container" hex="#1f1f1f" />
                <Swatch
                  name="surface-container-high"
                  cssVar="--color-surface-container-high"
                  hex="#2a2a2a"
                />
                <Swatch name="on-surface" cssVar="--color-on-surface" hex="#e2e2e2" />
              </div>
            </div>

            {/* Text & borders */}
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Text &amp; Borders
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Swatch
                  name="on-surface-variant"
                  cssVar="--color-on-surface-variant"
                  hex="#b9cac9"
                />
                <Swatch name="outline" cssVar="--color-outline" hex="#333333" />
                <Swatch name="outline-active" cssVar="--color-outline-active" hex="#00ffff" />
                <Swatch name="error" cssVar="--color-error" hex="#ffb4ab" />
              </div>
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Typography */}
        <Section title="02 · Typography">
          <div className="flex flex-col gap-0">
            <TypeSpecimen
              level="h1"
              label="Space Grotesk · 700 · 48px · -0.02em"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "3rem",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: "var(--color-on-surface)",
              }}
            >
              Bookmark Index
            </TypeSpecimen>

            <TypeSpecimen
              level="h2"
              label="Space Grotesk · 600 · 32px · -0.01em"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "2rem",
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                color: "var(--color-on-surface)",
              }}
            >
              All Collections
            </TypeSpecimen>

            <TypeSpecimen
              level="body-sans"
              label="Inter · 400 · 16px · 0"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "1rem",
                fontWeight: 400,
                lineHeight: 1.5,
                letterSpacing: "0",
                color: "var(--color-on-surface)",
              }}
            >
              A bookmark manager for power users who treat the web as a structured data stream.
              Save, tag, and retrieve at terminal speed.
            </TypeSpecimen>

            <TypeSpecimen
              level="body-mono"
              label="JetBrains Mono · 400 · 14px · 0.05em"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.875rem",
                fontWeight: 400,
                lineHeight: 1.6,
                letterSpacing: "0.05em",
                color: "var(--color-on-surface)",
              }}
            >
              https://github.com/user/repo · saved 2026-05-05 · 14 ms
            </TypeSpecimen>

            <TypeSpecimen
              level="label-caps"
              label="JetBrains Mono · 700 · 12px · 0.1em · UPPERCASE"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.75rem",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-on-surface)",
              }}
            >
              Design · Engineering · Archive · Read Later
            </TypeSpecimen>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Radius */}
        <Section title="03 · Radius">
          <div className="flex items-start gap-6">
            {(["sm", "DEFAULT", "md", "lg", "xl", "full"] as const).map((scale) => (
              <div key={scale} className="flex flex-col items-center gap-2">
                <div
                  className="size-12 border border-primary"
                  style={{ borderRadius: "0px" }}
                  role="img"
                  aria-label={`radius-${scale}`}
                />
                <p className="font-mono text-[10px] text-muted-foreground">{scale}</p>
                <p className="font-mono text-[10px] text-foreground">0px</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            All radii set to 0px per DESIGN.md — zero-radius geometry enforced globally.
          </p>
        </Section>

        <Separator className="border-outline" />

        {/* Spacing */}
        <Section title="04 · Spacing">
          <div className="flex flex-col gap-3">
            {[
              { name: "unit", value: "4px", cssVar: "--spacing-unit" },
              { name: "bento-gap", value: "12px", cssVar: "--spacing-bento-gap" },
              { name: "gutter", value: "16px", cssVar: "--spacing-gutter" },
              { name: "margin", value: "24px", cssVar: "--spacing-margin" },
              { name: "container-max", value: "1440px", cssVar: "--spacing-container-max" },
            ].map(({ name, value, cssVar }) => (
              <div key={name} className="flex items-center gap-4">
                <p className="w-40 font-mono text-xs text-muted-foreground">{cssVar}</p>
                <p className="w-20 font-mono text-xs text-foreground">{name}</p>
                <div
                  className="h-4 bg-primary/30"
                  style={{ width: name === "container-max" ? "200px" : value }}
                />
                <p className="font-mono text-xs text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── SECTION 2: COMPONENTS ─── */}

        <Separator className="border-outline" />

        {/* Buttons */}
        <Section title="05 · Button">
          <div className="flex flex-col gap-6">
            {/* All variants */}
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Variants
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">
                  <ZapIcon />
                  Default
                </Button>
                <Button variant="outline">
                  <BookmarkIcon />
                  Outline
                </Button>
                <Button variant="secondary">
                  <TagIcon />
                  Secondary
                </Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">
                  <TrashIcon />
                  Destructive
                </Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Sizes
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <Button size="xs">XS</Button>
                <Button size="sm">SM</Button>
                <Button size="default">Default</Button>
                <Button size="lg">LG</Button>
                <Button size="icon">
                  <PlusIcon />
                </Button>
                <Button size="icon-sm">
                  <SearchIcon />
                </Button>
                <Button size="icon-lg">
                  <ExternalLinkIcon />
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                States
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>Active</Button>
                <Button disabled>Disabled</Button>
                <Button aria-invalid="true">Invalid</Button>
              </div>
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Input */}
        <Section title="06 · Input">
          <div className="flex max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] text-muted-foreground">Default</p>
              <Input placeholder="https://example.com" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] text-muted-foreground">With value</p>
              <Input defaultValue="https://github.com/user/repo" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] text-muted-foreground">Disabled</p>
              <Input placeholder="Disabled field" disabled />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] text-muted-foreground">Error state</p>
              <Input placeholder="Invalid URL" aria-invalid="true" />
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Badge */}
        <Section title="07 · Badge">
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Variants
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Primary</Badge>
                <Badge variant="secondary">Tag</Badge>
                <Badge variant="success">Active</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="default-solid">Solid Primary</Badge>
                <Badge variant="secondary-solid">Solid Tag</Badge>
                <Badge variant="success-solid">Solid Active</Badge>
              </div>
            </div>
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                With icon
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">
                  <TagIcon />
                  Design
                </Badge>
                <Badge variant="secondary">
                  <BookmarkIcon />
                  Saved
                </Badge>
                <Badge variant="success">
                  <CheckIcon />
                  Read
                </Badge>
              </div>
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Card */}
        <Section title="08 · Card">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Bookmark card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookmarkIcon className="size-4 text-primary" />
                  <CardTitle className="font-mono text-sm uppercase tracking-[0.05em]">
                    github.com
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">
                  https://github.com/tanstack/router
                </p>
                <p className="mt-2 font-sans text-sm text-foreground">
                  TanStack Router — Type-safe routing for React
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex gap-1">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Routing</Badge>
                </div>
              </CardFooter>
            </Card>

            {/* Empty state card */}
            <Card className="flex min-h-[160px] items-center justify-center">
              <CardContent className="flex flex-col items-center gap-2 py-8">
                <BookmarkIcon className="size-8 text-muted-foreground" />
                <p className="font-mono text-xs text-muted-foreground">No bookmarks yet</p>
              </CardContent>
            </Card>

            {/* Error state card */}
            <Card className="border-error">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircleIcon className="size-4 text-error" />
                  <CardTitle className="font-mono text-sm uppercase tracking-[0.05em] text-error">
                    Load Failed
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">
                  Could not fetch bookmark metadata. Check connection.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Checkbox & Switch */}
        <Section title="09 · Checkbox &amp; Switch">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="ck-default" />
                <label
                  htmlFor="ck-default"
                  className="font-mono text-sm text-foreground"
                >
                  Default
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ck-checked" defaultChecked />
                <label
                  htmlFor="ck-checked"
                  className="font-mono text-sm text-foreground"
                >
                  Checked
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ck-disabled" disabled />
                <label
                  htmlFor="ck-disabled"
                  className="font-mono text-sm text-muted-foreground"
                >
                  Disabled
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch id="sw-default" />
                <label
                  htmlFor="sw-default"
                  className="font-mono text-sm text-foreground"
                >
                  Off
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="sw-on" defaultChecked />
                <label
                  htmlFor="sw-on"
                  className="font-mono text-sm text-foreground"
                >
                  On
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="sw-disabled" disabled />
                <label
                  htmlFor="sw-disabled"
                  className="font-mono text-sm text-muted-foreground"
                >
                  Disabled
                </label>
              </div>
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Tabs */}
        <Section title="10 · Tabs">
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Default variant
              </p>
              <Tabs defaultValue="all">
                <TabsList variant="default">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                  <TabsTrigger value="disabled" disabled>
                    Disabled
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <p className="mt-4 font-mono text-sm text-muted-foreground">
                    Showing all bookmarks.
                  </p>
                </TabsContent>
                <TabsContent value="unread">
                  <p className="mt-4 font-mono text-sm text-muted-foreground">
                    Unread items only.
                  </p>
                </TabsContent>
                <TabsContent value="archived">
                  <p className="mt-4 font-mono text-sm text-muted-foreground">
                    Archived items.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Line variant
              </p>
              <Tabs defaultValue="list">
                <TabsList variant="line">
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                  <p className="mt-4 font-mono text-sm text-muted-foreground">List view.</p>
                </TabsContent>
                <TabsContent value="grid">
                  <p className="mt-4 font-mono text-sm text-muted-foreground">Grid view.</p>
                </TabsContent>
                <TabsContent value="table">
                  <p className="mt-4 font-mono text-sm text-muted-foreground">Table view.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Avatar */}
        <Section title="11 · Avatar">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar>
                <AvatarFallback className="font-mono text-xs text-primary">
                  MR
                </AvatarFallback>
              </Avatar>
              <p className="font-mono text-[10px] text-muted-foreground">Default</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-12">
                <AvatarFallback className="font-mono text-sm text-secondary">
                  BK
                </AvatarFallback>
              </Avatar>
              <p className="font-mono text-[10px] text-muted-foreground">Large</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="font-mono text-[9px] text-tertiary">
                  XS
                </AvatarFallback>
              </Avatar>
              <p className="font-mono text-[10px] text-muted-foreground">Small</p>
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Skeleton */}
        <Section title="12 · Skeleton">
          <div className="flex flex-col gap-3 max-w-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Loading state — opacity pulse, no shimmer
            </p>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Separator */}
        <Section title="13 · Separator">
          <div className="flex flex-col gap-4 max-w-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
              Horizontal
            </p>
            <Separator />
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
              Horizontal (accent)
            </p>
            <Separator className="bg-primary" />
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
              Vertical (inline)
            </p>
            <div className="flex h-8 items-center gap-2">
              <span className="font-mono text-xs text-foreground">All</span>
              <Separator orientation="vertical" />
              <span className="font-mono text-xs text-foreground">Unread</span>
              <Separator orientation="vertical" />
              <span className="font-mono text-xs text-foreground">Archived</span>
            </div>
          </div>
        </Section>

        <Separator className="border-outline" />

        {/* Glow / Shadow tokens */}
        <Section title="14 · Glow Shadows (Elevation)">
          <p className="font-mono text-xs text-muted-foreground">
            Standard box-shadows are prohibited. Depth via neon light emission only.
          </p>
          <div className="flex flex-wrap gap-8 pt-2">
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex size-24 items-center justify-center border border-outline bg-surface font-mono text-xs text-muted-foreground"
              >
                no glow
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">--shadow-none</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex size-24 items-center justify-center border border-primary bg-surface font-mono text-xs text-primary"
                style={{ boxShadow: "var(--shadow-glow-sm)" }}
              >
                glow-sm
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">--shadow-glow-sm</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex size-24 items-center justify-center border border-primary bg-surface font-mono text-xs text-primary"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                glow
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">--shadow-glow</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex size-24 items-center justify-center border border-primary bg-surface font-mono text-xs text-primary"
                style={{ boxShadow: "var(--shadow-glow-lg)" }}
              >
                glow-lg
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">--shadow-glow-lg</p>
            </div>
          </div>
        </Section>

        {/* Dropdown select demo */}
        <Separator className="border-outline" />

        <Section title="15 · Select (Dropdown)">
          <div className="flex flex-col gap-4 max-w-xs">
            <p className="font-mono text-[10px] text-muted-foreground">
              Terminal-style dropdown — click to open
            </p>
            <div className="flex items-center gap-2 border border-input px-3 py-2 font-mono text-sm text-muted-foreground">
              <span className="flex-1">Sort by: Date added</span>
              <ChevronDownIcon className="size-4" />
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">
              Full Select component: import from @/components/ui/select
            </p>
          </div>
        </Section>
      </main>

      <footer className="mt-8 border-t border-outline px-6 py-4">
        <p className="font-mono text-[10px] text-muted-foreground">
          Cyber-OLED Terminal · Design System · Bookmarks · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
