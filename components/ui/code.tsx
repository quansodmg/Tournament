import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface CodeProps extends HTMLAttributes<HTMLElement> {}

export function Code({ className, ...props }: CodeProps) {
  return (
    <code
      className={cn("relative rounded bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-sm", className)}
      {...props}
    />
  )
}
