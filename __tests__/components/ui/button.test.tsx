"use client"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "@/components/ui/button"

describe("Button Component", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass("inline-flex")
  })

  it("renders as disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole("button", { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  it("calls onClick handler when clicked", async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable</Button>)

    const button = screen.getByRole("button", { name: /clickable/i })
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("renders with different variants", () => {
    const { rerender } = render(<Button variant="destructive">Destructive</Button>)

    let button = screen.getByRole("button", { name: /destructive/i })
    expect(button).toHaveClass("bg-destructive")

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole("button", { name: /outline/i })
    expect(button).toHaveClass("border")

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole("button", { name: /secondary/i })
    expect(button).toHaveClass("bg-secondary")
  })

  it("renders with different sizes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>)

    let button = screen.getByRole("button", { name: /small/i })
    expect(button).toHaveClass("h-9")

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole("button", { name: /large/i })
    expect(button).toHaveClass("h-11")
  })
})
