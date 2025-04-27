import { render, screen } from "@testing-library/react"
import { HeroSlider } from "@/components/home/hero-slider"

describe("HeroSlider", () => {
  it("renders slides correctly", () => {
    const mockSlides = [
      { id: 1, name: "Tournament 1", slug: "tournament-1", banner_image: "/image1.jpg" },
      { id: 2, name: "Tournament 2", slug: "tournament-2", banner_image: "/image2.jpg" },
    ]

    render(<HeroSlider slides={mockSlides} />)

    expect(screen.getByText("Tournament 1")).toBeInTheDocument()
    expect(screen.getByText("Tournament 2")).toBeInTheDocument()
  })

  it("handles empty slides", () => {
    render(<HeroSlider slides={[]} />)
    expect(screen.getByText("No featured tournaments")).toBeInTheDocument()
  })
})
