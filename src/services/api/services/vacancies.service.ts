import type {
  CandidateWorkLeaderboardEntry,
  CandidateWorkLeaderboardResponse,
  Vacancy,
  VacancyTask,
  VacancyTaskLeaderboardEntry,
  VacancyTaskLeaderboardResponse,
  VacancyTaskSubmission,
  VacancyTaskSubmissionPayload
} from "../types"
import {
  createMockVacancyTaskLeaders,
  createMockWorkLeaders,
  evaluateSubmissionQuality,
  verdictByScore
} from "../shared/vacancies.helpers"
import { delay, resolveMockUserId, USE_MOCK } from "../shared/runtime"
import {
  getCompanyVacanciesDb,
  getVacancyTaskSubmissionsDb,
  saveVacancyTaskSubmissionsDb
} from "../shared/storage"

export const createVacanciesService = () => ({
  async getVacancies(): Promise<Vacancy[]> {
    if (USE_MOCK) {
      return await delay(300).then(() => getCompanyVacanciesDb())
    }

    await delay(700)
    return []
  },

  async getVacancyById(vacancyId: string): Promise<Vacancy | null> {
    if (USE_MOCK) {
      return await delay(260).then(() => getCompanyVacanciesDb().find((item) => item.id === vacancyId) ?? null)
    }

    await delay(700)
    return null
  },

  async getCandidateWorkLeaderboard(userId: number | null): Promise<CandidateWorkLeaderboardResponse> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(260).then(() => {
        const db = getVacancyTaskSubmissionsDb()
        const allSubmissions = Object.entries(db).flatMap(([vacancyId, items]) =>
          items.map((item) => ({ ...item, vacancyId }))
        )
        const currentUserSubmissions = allSubmissions.filter((item) => item.userId === resolvedUserId)

        let currentUserEntry: CandidateWorkLeaderboardEntry | null = null

        if (currentUserSubmissions.length) {
          const scores = currentUserSubmissions.map((item) => evaluateSubmissionQuality(item))
          const averageQualityScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          const latest = [...currentUserSubmissions].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0]
          const relatedVacancy = getCompanyVacanciesDb().find((vacancy) => vacancy.id === latest.vacancyId)

          currentUserEntry = {
            userId: resolvedUserId,
            fullName: "Вы",
            avatar: "Y",
            company: relatedVacancy?.company ?? "—",
            vacancyTitle: relatedVacancy?.title ?? "—",
            tasksSubmitted: currentUserSubmissions.length,
            averageQualityScore,
            aiVerdict: verdictByScore(averageQualityScore),
            sentToHr: averageQualityScore >= 75,
            sentAt: averageQualityScore >= 75 ? new Date().toISOString() : null,
            rank: 0
          }
        }

        const all = [...createMockWorkLeaders(), ...(currentUserEntry ? [currentUserEntry] : [])]
          .sort((a, b) => {
            if (b.averageQualityScore !== a.averageQualityScore) {
              return b.averageQualityScore - a.averageQualityScore
            }
            return b.tasksSubmitted - a.tasksSubmitted
          })
          .map((item, index) => ({
            ...item,
            rank: index + 1,
            sentToHr: item.sentToHr || index < 3
          }))

        const normalizedCurrent = all.find((item) => item.userId === resolvedUserId) ?? null

        return {
          leaders: all,
          currentUser: normalizedCurrent
        }
      })
    }

    await delay(700)
    return {
      leaders: [],
      currentUser: null
    }
  },

  async getVacancyTaskLeaderboard(vacancyId: string, userId: number | null): Promise<VacancyTaskLeaderboardResponse> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(240).then(() => {
        const vacancy = getCompanyVacanciesDb().find((item) => item.id === vacancyId)
        const vacancyTitle = vacancy?.title ?? "Vacancy"

        const db = getVacancyTaskSubmissionsDb()
        const submissions = (db[vacancyId] ?? []).filter((item) => item.userId === resolvedUserId)

        let currentUserEntry: VacancyTaskLeaderboardEntry | null = null
        if (submissions.length) {
          const scores = submissions.map((item) => evaluateSubmissionQuality(item))
          const averageQualityScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          currentUserEntry = {
            userId: resolvedUserId,
            fullName: "Вы",
            avatar: "Y",
            tasksSubmitted: submissions.length,
            averageQualityScore,
            aiVerdict: verdictByScore(averageQualityScore),
            sentToHr: averageQualityScore >= 75,
            sentAt: averageQualityScore >= 75 ? new Date().toISOString() : null,
            rank: 0
          }
        }

        const all = [...createMockVacancyTaskLeaders(vacancyId), ...(currentUserEntry ? [currentUserEntry] : [])]
          .sort((a, b) => {
            if (b.averageQualityScore !== a.averageQualityScore) {
              return b.averageQualityScore - a.averageQualityScore
            }
            return b.tasksSubmitted - a.tasksSubmitted
          })
          .map((item, index) => ({ ...item, rank: index + 1 }))

        return {
          vacancyId,
          vacancyTitle,
          leaders: all,
          currentUser: all.find((item) => item.userId === resolvedUserId) ?? null
        }
      })
    }

    await delay(700)
    return {
      vacancyId,
      vacancyTitle: "Vacancy",
      leaders: [],
      currentUser: null
    }
  },

  async getVacancyRealTasks(vacancyId: string, userId: number | null): Promise<Array<{ task: VacancyTask; submission: VacancyTaskSubmission | null }>> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(220).then(() => {
        const vacancy = getCompanyVacanciesDb().find((item) => item.id === vacancyId)
        if (!vacancy) return []

        const db = getVacancyTaskSubmissionsDb()
        const submissions = db[vacancyId] ?? []

        return vacancy.realTasks.map((task) => ({
          task,
          submission: submissions.find((item) => item.taskId === task.id && item.userId === resolvedUserId) ?? null
        }))
      })
    }

    await delay(700)
    return []
  },

  async submitVacancyTask(
    vacancyId: string,
    taskId: string,
    payload: VacancyTaskSubmissionPayload,
    userId: number | null
  ): Promise<VacancyTaskSubmission> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(260).then(() => {
        const db = getVacancyTaskSubmissionsDb()
        const current = db[vacancyId] ?? []
        const withoutCurrentTask = current.filter((item) => !(item.taskId === taskId && item.userId === resolvedUserId))

        const submission: VacancyTaskSubmission = {
          vacancyId,
          taskId,
          userId: resolvedUserId,
          solutionUrl: payload.solutionUrl,
          comment: payload.comment,
          status: "submitted",
          submittedAt: new Date().toISOString()
        }

        db[vacancyId] = [...withoutCurrentTask, submission]
        saveVacancyTaskSubmissionsDb(db)
        return submission
      })
    }

    await delay(700)
    return {
      vacancyId,
      taskId,
      userId: resolvedUserId,
      solutionUrl: payload.solutionUrl,
      comment: payload.comment,
      status: "submitted",
      submittedAt: new Date().toISOString()
    }
  }
})
