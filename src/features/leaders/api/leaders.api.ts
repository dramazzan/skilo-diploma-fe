import { api, type LeaderboardResponse } from "@/shared/api/client"

export const leadersApi = {
  getLeaderboard(userId: number | null): Promise<LeaderboardResponse> {
    return api.getLeaderboard(userId)
  }
}

export type { LeaderboardEntry, LeaderboardResponse } from "@/shared/api/client"
