import { api, type LeaderboardResponse, type UserActivityDay } from "@/shared/api/client"

export const profileApi = {
  getUserYearActivity(userId: number | null): Promise<UserActivityDay[]> {
    return api.getUserYearActivity(userId)
  },
  getLeaderboard(userId: number | null): Promise<LeaderboardResponse> {
    return api.getLeaderboard(userId)
  }
}

export type { UserActivityDay }
