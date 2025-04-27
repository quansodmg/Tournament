import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ModernCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function ModernCard({ children, className, hover = true }: ModernCardProps) {
  return (
    <div
      className={cn(
        "bg-[#101113] rounded-xl shadow-lg border border-[rgba(255,255,255,0.1)] overflow-hidden",
        hover && "transition-all duration-300 hover:shadow-xl hover:border-[#0bb5ff]/50 hover:scale-[1.02]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ModernCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6 border-b border-[rgba(255,255,255,0.1)]", className)}>{children}</div>
}

export function ModernCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>
}

export function ModernCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6 border-t border-[rgba(255,255,255,0.1)]", className)}>{children}</div>
}

export function ModernCardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-xl font-bold text-white", className)}>{children}</h3>
}

export function ModernCardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-gray-300 mt-1", className)}>{children}</p>
}
