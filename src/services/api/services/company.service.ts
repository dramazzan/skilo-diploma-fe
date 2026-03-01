import type {
  CompanyCandidate,
  CompanyVacancyPayload,
  CompanyVacancyTaskPayload,
  InterviewInvitePayload,
  InterviewInviteResult,
  Vacancy,
  VacancyTask
} from "../types"
import {
  enrichCompanyCandidate,
  getCompanyCandidatesDb,
  saveCompanyCandidatesDb
} from "../shared/company.helpers"
import { delay, USE_MOCK } from "../shared/runtime"
import { getCompanyVacanciesDb, saveCompanyVacanciesDb } from "../shared/storage"

export const createCompanyService = () => ({
  async getCompanyVacancies(): Promise<Vacancy[]> {
    if (USE_MOCK) {
      return await delay(220).then(() => getCompanyVacanciesDb())
    }

    await delay(700)
    return []
  },

  async createCompanyVacancy(payload: CompanyVacancyPayload): Promise<Vacancy> {
    if (USE_MOCK) {
      return await delay(260).then(() => {
        const db = getCompanyVacanciesDb()
        const created: Vacancy = {
          id: `vac-company-${Date.now()}`,
          company: "Skillo Company",
          title: payload.title,
          level: payload.level,
          location: payload.location,
          employment: payload.employment,
          salaryRange: payload.salaryRange,
          tags: payload.stack,
          summary: payload.description,
          preparation: {
            direction: payload.stack.join(" / "),
            questions: [],
            test: []
          },
          realTasks: payload.requirements.length
            ? [
                {
                  id: `task-company-${Date.now()}`,
                  title: "Базовое тестовое задание",
                  brief: "Опишите решение с учетом требований вакансии.",
                  requirements: payload.requirements,
                  deliverables: ["Ссылка на репозиторий", "Краткое описание решения"],
                  estimatedHours: 6
                }
              ]
            : []
        }

        const next = [created, ...db]
        saveCompanyVacanciesDb(next)
        return created
      })
    }

    await delay(700)
    throw new Error("Not implemented")
  },

  async updateCompanyVacancy(vacancyId: string, payload: CompanyVacancyPayload): Promise<Vacancy | null> {
    if (USE_MOCK) {
      return await delay(240).then(() => {
        const db = getCompanyVacanciesDb()
        let updated: Vacancy | null = null

        const next = db.map((vacancy) => {
          if (vacancy.id !== vacancyId) return vacancy

          updated = {
            ...vacancy,
            title: payload.title,
            level: payload.level,
            location: payload.location,
            employment: payload.employment,
            salaryRange: payload.salaryRange,
            tags: payload.stack,
            summary: payload.description
          }

          return updated
        })

        saveCompanyVacanciesDb(next)
        return updated
      })
    }

    await delay(700)
    return null
  },

  async deleteCompanyVacancy(vacancyId: string): Promise<boolean> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getCompanyVacanciesDb()
        const next = db.filter((vacancy) => vacancy.id !== vacancyId)
        saveCompanyVacanciesDb(next)

        const candidates = getCompanyCandidatesDb().filter((candidate) => candidate.vacancyId !== vacancyId)
        saveCompanyCandidatesDb(candidates)
        return true
      })
    }

    await delay(700)
    return false
  },

  async createCompanyVacancyTask(vacancyId: string, payload: CompanyVacancyTaskPayload): Promise<VacancyTask | null> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getCompanyVacanciesDb()
        let created: VacancyTask | null = null

        const next = db.map((vacancy) => {
          if (vacancy.id !== vacancyId) return vacancy

          created = {
            id: `task-company-${Date.now()}`,
            title: payload.title,
            brief: payload.brief,
            requirements: payload.requirements,
            deliverables: payload.deliverables,
            estimatedHours: payload.estimatedHours
          }

          return {
            ...vacancy,
            realTasks: [...vacancy.realTasks, created]
          }
        })

        saveCompanyVacanciesDb(next)
        return created
      })
    }

    await delay(700)
    return null
  },

  async updateCompanyVacancyTask(
    vacancyId: string,
    taskId: string,
    payload: CompanyVacancyTaskPayload
  ): Promise<VacancyTask | null> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getCompanyVacanciesDb()
        let updated: VacancyTask | null = null

        const next = db.map((vacancy) => {
          if (vacancy.id !== vacancyId) return vacancy

          return {
            ...vacancy,
            realTasks: vacancy.realTasks.map((task) => {
              if (task.id !== taskId) return task

              updated = {
                ...task,
                title: payload.title,
                brief: payload.brief,
                requirements: payload.requirements,
                deliverables: payload.deliverables,
                estimatedHours: payload.estimatedHours
              }

              return updated
            })
          }
        })

        saveCompanyVacanciesDb(next)
        return updated
      })
    }

    await delay(700)
    return null
  },

  async deleteCompanyVacancyTask(vacancyId: string, taskId: string): Promise<boolean> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getCompanyVacanciesDb()
        const next = db.map((vacancy) => {
          if (vacancy.id !== vacancyId) return vacancy

          return {
            ...vacancy,
            realTasks: vacancy.realTasks.filter((task) => task.id !== taskId)
          }
        })

        saveCompanyVacanciesDb(next)
        return true
      })
    }

    await delay(700)
    return false
  },

  async getCompanyCandidates(): Promise<CompanyCandidate[]> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const vacancies = getCompanyVacanciesDb()
        const candidates = getCompanyCandidatesDb()
        return candidates.map((candidate) => enrichCompanyCandidate(candidate, vacancies))
      })
    }

    await delay(700)
    return []
  },

  async sendInterviewInvite(
    candidateId: string,
    payload: InterviewInvitePayload
  ): Promise<InterviewInviteResult | null> {
    if (USE_MOCK) {
      return await delay(260).then(() => {
        const candidates = getCompanyCandidatesDb()
        const target = candidates.find((candidate) => candidate.id === candidateId)
        if (!target) return null

        const sentAt = new Date().toISOString()
        const next = candidates.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, status: "invited" as const, inviteSentAt: sentAt }
            : candidate
        )
        saveCompanyCandidatesDb(next)

        return {
          candidateId,
          sentTo: target.email,
          subject: payload.subject,
          sentAt
        }
      })
    }

    await delay(700)
    return null
  }
})
