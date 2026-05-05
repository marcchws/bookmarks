import { describe, it, expect, vi, afterEach } from "vitest"
import { formatRelativeTime, formatFullDate } from "./relative-time"

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("should return 'just now' for a date equal to now", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    expect(formatRelativeTime(now.toISOString())).toBe("now")
  })

  it("should return seconds ago for a date a few seconds in the past", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    const past = new Date(now.getTime() - 30 * 1000).toISOString()
    const result = formatRelativeTime(past)
    expect(result).toMatch(/30 seconds ago/i)
  })

  it("should return minutes ago for a date 5 minutes in the past", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    const past = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    const result = formatRelativeTime(past)
    expect(result).toMatch(/5 minutes ago/i)
  })

  it("should return hours ago for a date 2 hours in the past", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    const past = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(past)
    expect(result).toMatch(/2 hours ago/i)
  })

  it("should return days ago for a date 3 days in the past", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    const past = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(past)
    expect(result).toMatch(/3 days ago/i)
  })

  it("should return weeks ago for a date 2 weeks in the past", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    const past = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(past)
    expect(result).toMatch(/2 weeks ago/i)
  })

  it("should return months ago for a date ~2 months in the past", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    const past = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(past)
    expect(result).toMatch(/2 months ago/i)
  })

  it("should return years ago for a date 2 years in the past", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    const past = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(past)
    expect(result).toMatch(/2 years ago/i)
  })

  it("should return future relative time for a date in the future", () => {
    const now = new Date("2025-05-05T12:00:00.000Z")
    vi.setSystemTime(now)
    const future = new Date(now.getTime() + 5 * 60 * 1000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toMatch(/in 5 minutes/i)
  })
})

describe("formatFullDate", () => {
  it("should format a date string to a human-readable full date", () => {
    const dateString = "2025-01-15T10:30:00.000Z"
    const result = formatFullDate(dateString)
    // Should include the year, month and day
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/January|Jan/i)
    expect(result).toMatch(/15/)
  })

  it("should include time in the formatted output", () => {
    const dateString = "2025-05-05T14:00:00.000Z"
    const result = formatFullDate(dateString)
    // Should include some time component
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})
