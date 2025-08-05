import { z } from "zod"

// API Response schemas for validation
export const JournalEntrySchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  content: z.string(),
  date: z.string(),
  sentiment: z.string().optional(),
})

export const JournalEntriesSchema = z.array(JournalEntrySchema)

export type JournalEntry = z.infer<typeof JournalEntrySchema>

interface ApiOptions {
  retries?: number
  timeout?: number
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class ApiClient {
  private baseUrl: string
  private defaultOptions: ApiOptions

  constructor(baseUrl = "http://localhost:8080", options: ApiOptions = {}) {
    this.baseUrl = baseUrl
    this.defaultOptions = { retries: 3, timeout: 10000, ...options }
  }

  private async fetchWithRetry(url: string, options: RequestInit & ApiOptions = {}): Promise<Response> {
    const { retries = this.defaultOptions.retries!, timeout = this.defaultOptions.timeout!, ...fetchOptions } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
        }

        return response
      } catch (error) {
        lastError = error as Error

        if (attempt === retries) break

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    clearTimeout(timeoutId)
    throw lastError!
  }

  async getEntries(token: string): Promise<JournalEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/journal`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      return JournalEntriesSchema.parse(data || [])
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError("Invalid data format received from server")
      }
      throw error
    }
  }

  async getEntry(token: string, id: string): Promise<JournalEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/journal/id/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      console.log(response)
      const data = await response.json()
      return JournalEntrySchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError("Invalid entry data received from server")
      }
      throw error
    }
  }

  async updateEntry(token: string, id: string, entry: { title: string; content: string }): Promise<void> {
    await fetch(`${this.baseUrl}/journal/id/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    })
  }

  async deleteEntry(token: string, id: string): Promise<void> {
    await fetch(`${this.baseUrl}/journal/id/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async createEntry(token: string, entry: { title: string; content: string }): Promise<void> {
    await fetch(`${this.baseUrl}/journal`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    })
  }

  async getGreeting(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return response.text()
  }
}

export const apiClient = new ApiClient()
