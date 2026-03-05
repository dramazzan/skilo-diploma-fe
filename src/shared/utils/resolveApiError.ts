export interface ResolvedApiError {
  code: number | null
  message: string
}

const NETWORK_ERROR_PATTERNS = [
  /failed to fetch/i,
  /network\s?error/i,
  /load failed/i,
  /timeout/i,
  /connection/i,
  /fetch dynamically imported module/i
]

const NOT_FOUND_PATTERNS = [
  /\b404\b/,
  /not found/i,
  /не найден/i,
  /не существует/i
]

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message

  if (error && typeof error === "object") {
    const anyError = error as Record<string, unknown>
    if (typeof anyError.message === "string") return anyError.message

    const response = anyError.response as Record<string, unknown> | undefined
    if (response && typeof response.data === "object" && response.data) {
      const data = response.data as Record<string, unknown>
      if (typeof data.message === "string") return data.message
    }
  }

  return ""
}

const extractStatusCode = (error: unknown): number | null => {
  if (!error || typeof error !== "object") return null

  const anyError = error as Record<string, unknown>
  const directCode = anyError.status ?? anyError.statusCode

  if (typeof directCode === "number") return directCode

  const response = anyError.response as Record<string, unknown> | undefined
  if (response && typeof response.status === "number") {
    return response.status
  }

  return null
}

export const isNotFoundError = (error: unknown): boolean => {
  const status = extractStatusCode(error)
  if (status === 404) return true

  const message = extractErrorMessage(error)
  return NOT_FOUND_PATTERNS.some((pattern) => pattern.test(message))
}

export const isServerUnavailableError = (error: unknown): boolean => {
  const status = extractStatusCode(error)
  if (status !== null && status >= 500) return true

  const message = extractErrorMessage(error)
  return NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

export const resolveApiError = (error: unknown, fallbackMessage: string): ResolvedApiError => {
  const status = extractStatusCode(error)

  if (isNotFoundError(error)) {
    return {
      code: 404,
      message: "404: такого адреса не существует или данные не найдены."
    }
  }

  if (isServerUnavailableError(error)) {
    return {
      code: status,
      message: "Сервер временно недоступен. Проверьте подключение и попробуйте позже."
    }
  }

  const message = extractErrorMessage(error)
  return {
    code: status,
    message: message || fallbackMessage
  }
}
