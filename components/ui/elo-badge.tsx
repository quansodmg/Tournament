import { Badge } from "@/components/ui/badge"

interface EloBadgeProps {
  rating: number
  size?: "sm" | "md" | "lg"
  showTier?: boolean
}

export default function EloBadge({ rating, size = "md", showTier = true }: EloBadgeProps) {
  // Function to get rank tier based on ELO
  const getRankTier = (elo: number) => {
    if (elo >= 2400) return { name: "GM", color: "bg-yellow-500 text-black" }
    if (elo >= 2200) return { name: "M", color: "bg-purple-500 text-white" }
    if (elo >= 2000) return { name: "D", color: "bg-blue-500 text-white" }
    if (elo >= 1800) return { name: "P", color: "bg-cyan-500 text-white" }
    if (elo >= 1600) return { name: "G", color: "bg-yellow-400 text-black" }
    if (elo >= 1400) return { name: "S", color: "bg-gray-400 text-black" }
    return { name: "B", color: "bg-amber-700 text-white" }
  }

  const tier = getRankTier(rating)

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-0.5",
    lg: "text-base px-2.5 py-1",
  }

  return (
    <div className="flex items-center gap-1">
      <Badge className={`font-mono ${sizeClasses[size]}`} variant="outline">
        {rating}
      </Badge>
      {showTier && <Badge className={`${tier.color} ${sizeClasses[size]}`}>{tier.name}</Badge>}
    </div>
  )
}
