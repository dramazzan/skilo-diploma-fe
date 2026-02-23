export * from "./api/types"

import { createAuthService } from "./api/services/auth.service"
import { createCompanyService } from "./api/services/company.service"
import { createInterviewService } from "./api/services/interview.service"
import { createLeaderboardService } from "./api/services/leaderboard.service"
import { createRoadmapsService } from "./api/services/roadmaps.service"
import { createSocialService } from "./api/services/social.service"
import { createVacanciesService } from "./api/services/vacancies.service"

export const api = {
  ...createAuthService(),
  ...createRoadmapsService(),
  ...createSocialService(),
  ...createLeaderboardService(),
  ...createVacanciesService(),
  ...createInterviewService(),
  ...createCompanyService()
}

export type ApiClient = typeof api
