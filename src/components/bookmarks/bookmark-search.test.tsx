import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BookmarkSearch } from "./bookmark-search"

// REQ-3, REQ-a11y-2
describe("BookmarkSearch", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("should render a search input with aria-label='Search bookmarks'", () => {
    render(<BookmarkSearch value="" onChange={vi.fn()} />)
    expect(screen.getByRole("searchbox", { name: /search bookmarks/i })).toBeInTheDocument()
  })

  it("should render with the provided value as the default value", () => {
    render(<BookmarkSearch value="hello" onChange={vi.fn()} />)
    expect(screen.getByRole("searchbox")).toHaveValue("hello")
  })

  it("should not call onChange before debounce delay elapses", () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<BookmarkSearch value="" onChange={onChange} />)

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "react" } })

    // Not yet called — debounce hasn't fired
    expect(onChange).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  it("should call onChange with the typed value after 300ms debounce", () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<BookmarkSearch value="" onChange={onChange} />)

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "react" } })
    expect(onChange).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onChange).toHaveBeenCalledWith("react")
  })

  it("should reset the debounce timer on each keystroke and fire only once per burst", () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<BookmarkSearch value="" onChange={onChange} />)

    const input = screen.getByRole("searchbox")
    // Two rapid change events
    fireEvent.change(input, { target: { value: "r" } })
    act(() => { vi.advanceTimersByTime(100) })
    fireEvent.change(input, { target: { value: "re" } })
    act(() => { vi.advanceTimersByTime(300) })

    // Only called once — with the last value
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith("re")
  })

  it("should render a search icon that is aria-hidden", () => {
    render(<BookmarkSearch value="" onChange={vi.fn()} />)
    const icons = document.querySelectorAll('[aria-hidden="true"]')
    expect(icons.length).toBeGreaterThan(0)
  })

  it("should allow user to type in the search input", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BookmarkSearch value="" onChange={onChange} />)

    const input = screen.getByRole("searchbox")
    await user.type(input, "react")
    expect(input).toHaveValue("react")
  })
})
