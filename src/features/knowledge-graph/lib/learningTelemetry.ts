export type LearningSessionType = "topic-test" | "roadmap-assessment" | "skill-level-assessment"

export interface LearningTelemetrySession {
  id: string
  userId: number | null
  type: LearningSessionType
  roadmapId: string
  roadmapTitle: string
  topicId: string | null
  topicTitle: string | null
  sessionLabel: string
  startedAt: string
  finishedAt: string
  durationSec: number
  questionCount: number
  answeredCount: number
  correctCount: number | null
  wrongCount: number
  scorePercent: number
  answerChangeCount: number
  revisitCount: number
  lowConfidenceCount: number
  failed: boolean
}

export type LearningTelemetryPayload = Omit<LearningTelemetrySession, "id">

const LEARNING_TELEMETRY_STORAGE_KEY = "learning_telemetry_sessions_v1"
const MAX_TELEMETRY_SESSIONS = 500

const parseSessions = (): LearningTelemetrySession[] => {
  const raw = localStorage.getItem(LEARNING_TELEMETRY_STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as LearningTelemetrySession[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const toSafeInt = (value: number, fallback = 0) => {
  if (!Number.isFinite(value)) return fallback
  return Math.round(value)
}

const sanitizePayload = (payload: LearningTelemetryPayload): LearningTelemetryPayload => {
  const questionCount = Math.max(0, toSafeInt(payload.questionCount))
  const answeredCount = clamp(toSafeInt(payload.answeredCount), 0, questionCount)
  const correctCount = payload.correctCount === null ? null : clamp(toSafeInt(payload.correctCount), 0, questionCount)

  return {
    ...payload,
    roadmapId: payload.roadmapId.trim(),
    roadmapTitle: payload.roadmapTitle.trim(),
    sessionLabel: payload.sessionLabel.trim() || payload.roadmapTitle.trim(),
    topicId: payload.topicId?.trim() || null,
    topicTitle: payload.topicTitle?.trim() || null,
    durationSec: Math.max(1, toSafeInt(payload.durationSec, 1)),
    questionCount,
    answeredCount,
    correctCount,
    wrongCount: clamp(toSafeInt(payload.wrongCount), 0, Math.max(questionCount, toSafeInt(payload.wrongCount))),
    scorePercent: clamp(toSafeInt(payload.scorePercent), 0, 100),
    answerChangeCount: Math.max(0, toSafeInt(payload.answerChangeCount)),
    revisitCount: Math.max(0, toSafeInt(payload.revisitCount)),
    lowConfidenceCount: Math.max(0, toSafeInt(payload.lowConfidenceCount)),
    failed: Boolean(payload.failed)
  }
}

export const readLearningTelemetrySessions = (): LearningTelemetrySession[] => {
  return parseSessions().sort((first, second) => second.finishedAt.localeCompare(first.finishedAt))
}

export const recordLearningTelemetrySession = (payload: LearningTelemetryPayload) => {
  const sessions = parseSessions()
  const sanitized = sanitizePayload(payload)

  const session: LearningTelemetrySession = {
    ...sanitized,
    id: `lts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  const next = [...sessions, session]
  const trimmed = next.length > MAX_TELEMETRY_SESSIONS
    ? next.slice(next.length - MAX_TELEMETRY_SESSIONS)
    : next

  localStorage.setItem(LEARNING_TELEMETRY_STORAGE_KEY, JSON.stringify(trimmed))

  return session
}
