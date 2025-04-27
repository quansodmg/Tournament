import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// This file contains utility functions that might be imported by other files

// Check if we're in the app directory
export const isAppDirectory = () => {
  // This is a simple heuristic - in a real app you might want to use
  // a more reliable method
  return typeof window === "undefined" && process.env.NEXT_RUNTIME === "nodejs"
}

// Check if we're on the client
export const isClient = () => {
  return typeof window !== "undefined"
}

// Check if we're in the pages directory
export const isPagesDirectory = () => {
  return typeof window === "undefined" && process.env.NEXT_RUNTIME !== "nodejs"
}

// Export any other utility functions that might be needed
export const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

export const formatDateTime = (date: Date) => {
  return `${formatDate(date)} ${formatTime(date)}`
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat("en-US").format(number)
}

export const formatPercentage = (number: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number / 100)
}

export const truncate = (text: string, length: number) => {
  if (text.length <= length) {
    return text
  }
  return `${text.slice(0, length)}...`
}

export const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }

    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), waitFor)
    })
  }
}

export const throttle = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastExecuted = 0

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    const now = Date.now()
    const timeSinceLastExecuted = now - lastExecuted

    if (timeSinceLastExecuted >= waitFor) {
      lastExecuted = now
      return Promise.resolve(func(...args))
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        lastExecuted = Date.now()
        resolve(func(...args))
      }, waitFor - timeSinceLastExecuted)
    })
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Supabase specific utility functions
export const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ""
}

export const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
}

// Helper function to safely parse JSON
export const safeJsonParse = (json: string | null) => {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch (e) {
    console.error("Failed to parse JSON:", e)
    return null
  }
}
