/**
 * Core API client for making requests to various endpoints
 */
import { toast } from "@/components/ui/use-toast"

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  cache?: RequestCache
  credentials?: RequestCredentials
  next?: { revalidate?: number | false; tags?: string[] }
  retries?: number
  retryDelay?: number
}

export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  status: number
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

export class ApiClient {
  private baseUrl: string
  private defaultOptions: ApiRequestOptions

  constructor(baseUrl = "", defaultOptions: ApiRequestOptions = {}) {
    this.baseUrl = baseUrl
    this.defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      retries: 1,
      retryDelay: 1000,
      ...defaultOptions,
    }
  }

  async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const requestOptions = this.mergeOptions(options)

    let retries = requestOptions.retries || 0
    const retryDelay = requestOptions.retryDelay || 1000

    while (true) {
      try {
        const response = await fetch(url, {
          method: requestOptions.method,
          headers: requestOptions.headers,
          body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
          cache: requestOptions.cache,
          credentials: requestOptions.credentials,
          next: requestOptions.next,
        })

        if (!response.ok) {
          // Handle rate limiting specifically
          if (response.status === 429) {
            console.warn(`Rate limited when calling ${url}. Retrying in ${retryDelay}ms...`)
            if (retries > 0) {
              retries--
              await new Promise((resolve) => setTimeout(resolve, retryDelay))
              continue
            }
          }

          const errorText = await response.text()
          let errorMessage: string

          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.message || errorJson.error || `API Error: ${response.status}`
          } catch {
            errorMessage = errorText || `API Error: ${response.status}`
          }

          return {
            data: null,
            error: errorMessage,
            status: response.status,
          }
        }

        const data = await response.json()
        return {
          data,
          error: null,
          status: response.status,
        }
      } catch (error) {
        if (retries > 0) {
          retries--
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          continue
        }

        console.error(`API request failed: ${url}`, error)
        return {
          data: null,
          error: error instanceof Error ? error.message : "Unknown error occurred",
          status: 0,
        }
      }
    }
  }

  async get<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T = any>(endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body: data })
  }

  async put<T = any>(endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body: data })
  }

  async patch<T = any>(endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body: data })
  }

  async delete<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }

  private mergeOptions(options: ApiRequestOptions): ApiRequestOptions {
    return {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    }
  }
}

// Create a default API client instance for internal API calls
export const apiClient = new ApiClient("/api")

// Helper function to handle API responses
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
  }: {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    successMessage?: string
    errorMessage?: string
  } = {},
) {
  if (response.error) {
    const message = errorMessage || response.error
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
    if (onError) onError(response.error)
    return false
  }

  if (successMessage) {
    toast({
      title: "Success",
      description: successMessage,
    })
  }

  if (onSuccess && response.data) onSuccess(response.data)
  return true
}
