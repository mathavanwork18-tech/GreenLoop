import type { ApiResponse } from '../../types/api.types'

/**
 * Enhanced API client with automatic REST request handling, base URL support, and fallback.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    body?: unknown
    headers?: Record<string, string>
    delayMs?: number
  }
): Promise<T> {
  const method = options?.method || 'GET'
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    }

    if (options?.body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, fetchOptions)
    if (response.ok) {
      const json = await response.json()
      return json as T
    }

    const errorBody = await response.text().catch(() => '')
    throw new Error(`API request failed [${response.status}]: ${errorBody || response.statusText}`)
  } catch (error: any) {
    console.error(`[API Client] Network call to ${url} failed:`, error?.message || error)
    throw error
  }
}

export function handleApiResponse<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    statusCode,
  }
}

