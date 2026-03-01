export * from "./types"

import { createAuthService } from "./services/auth.service"
import { createCompanyService } from "./services/company.service"
import { createInterviewService } from "./services/interview.service"
import { createLeaderboardService } from "./services/leaderboard.service"
import { createRoadmapsService } from "./services/roadmaps.service"
import { createSocialService } from "./services/social.service"
import { createVacanciesService } from "./services/vacancies.service"

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
