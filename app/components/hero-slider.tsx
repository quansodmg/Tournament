"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const slides = [
  { id: 1, image: "/tournament1.jpg", title: "Call of Duty World Championship" },
  { id: 2, image: "/tournament2.jpg", title: "Fortnite World Cup" },
  { id: 3, image: "/tournament3.jpg", title: "Rocket League Championship Series" },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-[400px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image src={slide.image || "/placeholder.svg"} alt={slide.title} layout="fill" objectFit="cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <h2 className="text-2xl font-bold">{slide.title}</h2>
          </div>
        </div>
      ))}
    </div>
  )
}
