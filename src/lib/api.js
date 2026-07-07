export async function apiRequest(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const timeoutMs = options.timeout ?? 15000
  const { timeout, signal, ...fetchOptions } = options

  const url = (() => {
    if (/^https?:\/\//i.test(path)) {
      return path
    }

    const trimmedBase = baseUrl.replace(/\/+$/g, '')
    const trimmedPath = path.replace(/^\/+/, '')

    return `${trimmedBase}/${trimmedPath}`
  })()

  const controller = new AbortController()
  const abortSignal = signal || controller.signal
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response

  try {
    response = await fetch(url, {
      signal: abortSignal,
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
      },
      ...fetchOptions,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timed out. Please try again.')
      timeoutError.status = 408
      throw timeoutError
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}