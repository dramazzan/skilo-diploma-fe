import {
  api,
  type Vacancy,
  type VacancyTaskLeaderboardResponse,
  type VacancyTaskSubmission,
  type VacancyTaskSubmissionPayload
} from "@/shared/api/client"

export const vacanciesApi = {
  getVacancies(): Promise<Vacancy[]> {
    return api.getVacancies()
  },
  getVacancyTaskLeaderboard(vacancyId: string, userId: number | null): Promise<VacancyTaskLeaderboardResponse> {
    return api.getVacancyTaskLeaderboard(vacancyId, userId)
  },
  getVacancyById(vacancyId: string): Promise<Vacancy> {
    return api.getVacancyById(vacancyId)
  },
  getVacancyRealTasks(vacancyId: string, userId: number | null): Promise<Array<{ task: Vacancy["realTasks"][number]; submission: VacancyTaskSubmission | null }>> {
    return api.getVacancyRealTasks(vacancyId, userId)
  },
  submitVacancyTask(
    vacancyId: string,
    taskId: string,
    payload: VacancyTaskSubmissionPayload,
    userId: number | null
  ): Promise<VacancyTaskSubmission> {
    return api.submitVacancyTask(vacancyId, taskId, payload, userId)
  }
}

export type {
  Vacancy,
  VacancyTaskLeaderboardResponse,
  VacancyTaskSubmission,
  VacancyTaskSubmissionPayload
}
