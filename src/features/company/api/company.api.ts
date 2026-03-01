import {
  api,
  type CompanyCandidate,
  type CompanyVacancyPayload,
  type CompanyVacancyTaskPayload,
  type InterviewInvitePayload,
  type InterviewInviteResult,
  type Vacancy
} from "@/shared/api/client"

export const companyApi = {
  getCompanyVacancies(): Promise<Vacancy[]> {
    return api.getCompanyVacancies()
  },
  getCompanyCandidates(): Promise<CompanyCandidate[]> {
    return api.getCompanyCandidates()
  },
  createCompanyVacancy(payload: CompanyVacancyPayload): Promise<Vacancy> {
    return api.createCompanyVacancy(payload)
  },
  updateCompanyVacancy(vacancyId: string, payload: CompanyVacancyPayload): Promise<Vacancy> {
    return api.updateCompanyVacancy(vacancyId, payload)
  },
  deleteCompanyVacancy(vacancyId: string): Promise<void> {
    return api.deleteCompanyVacancy(vacancyId)
  },
  createCompanyVacancyTask(vacancyId: string, payload: CompanyVacancyTaskPayload) {
    return api.createCompanyVacancyTask(vacancyId, payload)
  },
  updateCompanyVacancyTask(vacancyId: string, taskId: string, payload: CompanyVacancyTaskPayload) {
    return api.updateCompanyVacancyTask(vacancyId, taskId, payload)
  },
  deleteCompanyVacancyTask(vacancyId: string, taskId: string): Promise<void> {
    return api.deleteCompanyVacancyTask(vacancyId, taskId)
  },
  sendInterviewInvite(candidateId: string, payload: InterviewInvitePayload): Promise<InterviewInviteResult> {
    return api.sendInterviewInvite(candidateId, payload)
  }
}

export type {
  CandidateResultStatus,
  CompanyCandidate,
  CompanyVacancyPayload,
  CompanyVacancyTaskPayload,
  Vacancy
} from "@/shared/api/client"
