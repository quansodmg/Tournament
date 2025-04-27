"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Slide {
  id: string
  name: string
  slug: string
  description: string | null
  banner_image: string | null
  active: boolean
  order: number
}

interface HeroSliderProps {
  slides?: Slide[]
}

// Fallback slides when database is unavailable
const fallbackSlides = [
  {
    id: "1",
    name: "Call of Duty World Championship",
    slug: "call-of-duty-world-championship",
    banner_image: "/placeholder.svg?height=600&width=1200",
    description: null,
    active: true,
    order: 1,
  },
  {
    id: "2",
    name: "Fortnite World Cup",
    slug: "fortnite-world-cup",
    banner_image: "/placeholder.svg?height=600&width=1200",
    description: null,
    active: true,
    order: 2,
  },
  {
    id: "3",
    name: "Rocket League Championship Series",
    slug: "rocket-league-championship-series",
    banner_image: "/placeholder.svg?height=600&width=1200",
    description: null,
    active: true,
    order: 3,
  },
]

export function HeroSlider({ slides: initialSlides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>(initialSlides || fallbackSlides)
  const [loading, setLoading] = useState(!initialSlides)

  useEffect(() => {
    // If slides were not provided as props, fetch them from the database
    if (!initialSlides) {
      const fetchSlides = async () => {
        try {
          setLoading(true)
          const supabase = await createClient()

          const { data, error } = await supabase
            .from("hero_sliders")
            .select("*")
            .eq("active", true)
            .order("order", { ascending: true })

          if (error) {
            console.error("Error fetching hero slides:", error)
            return
          }

          if (data && data.length > 0) {
            setSlides(data)
          }
        } catch (error) {
          console.error("Error in fetchSlides:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchSlides()
    }
  }, [initialSlides])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length)
  }

  if (loading) {
    return (
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={slide.banner_image || "/placeholder.svg?height=600&width=1200"}
              alt={slide.name}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12 text-white">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{slide.name}</h2>
              {slide.description && (
                <p className="text-sm md:text-base lg:text-lg mb-4 max-w-2xl">{slide.description}</p>
              )}
              <Button asChild>
                <Link href={`/tournaments/${slide.slug}`}>Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full opacity-70 hover:opacity-100"
          onClick={goToPrevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous slide</span>
        </Button>
      </div>

      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full opacity-70 hover:opacity-100"
          onClick={goToNextSlide}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-primary" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Also provide a default export
export default HeroSlider
