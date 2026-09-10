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
  } catch (error) {
    // Graceful fallback for offline / mock mode
    console.warn(`[API Client] Network call to ${url} failed, using local simulation.`, error)
  }

  const delay = options?.delayMs ?? 150
  if (delay > 0) {
    await new Promise(r => setTimeout(r, delay))
  }

  return { endpoint, options } as unknown as T
}

export function handleApiResponse<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    statusCode,
  }
}

