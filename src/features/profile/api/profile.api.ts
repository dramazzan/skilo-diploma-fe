import { api, type LeaderboardResponse, type ProfileResponse, type UserActivityDay } from "@/shared/api/client"

export const profileApi = {
  getProfile(userId: number | null): Promise<ProfileResponse> {
    return api.getProfile(userId ?? undefined)
  },
  getUserYearActivity(userId: number | null): Promise<UserActivityDay[]> {
    return api.getUserYearActivity(userId)
  },
  getLeaderboard(userId: number | null): Promise<LeaderboardResponse> {
    return api.getLeaderboard(userId)
  }
}

export type { ProfileResponse, UserActivityDay }
