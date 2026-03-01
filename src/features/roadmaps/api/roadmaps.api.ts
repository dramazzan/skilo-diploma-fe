import { api, type RoadmapProgressItem, type UserActivityDay } from "@/shared/api/client"

export const roadmapsApi = {
  getUserRoadmapCollection(userId: number | null): Promise<string[]> {
    return api.getUserRoadmapCollection(userId)
  },
  getRoadmapProgress(userId: number | null): Promise<RoadmapProgressItem[]> {
    return api.getRoadmapProgress(userId)
  },
  updateUserRoadmapCollection(userId: number | null, roadmapIds: string[]): Promise<string[]> {
    return api.updateUserRoadmapCollection(userId, roadmapIds)
  },
  removeUserRoadmapFromCollection(userId: number | null, roadmapId: string): Promise<string[]> {
    return api.removeUserRoadmapFromCollection(userId, roadmapId)
  },
  getUserYearActivity(userId: number | null): Promise<UserActivityDay[]> {
    return api.getUserYearActivity(userId)
  }
}

export type { RoadmapProgressItem, UserActivityDay }
