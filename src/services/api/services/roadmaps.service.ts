import { mockDefaultRoadmapCollection, mockRoadmapProgressResponse } from "@/mocks/mockData"

import type { RoadmapProgressItem, UserActivityDay } from "../types"
import { getActivityFromUserActions } from "../shared/roadmaps.helpers"
import { delay, resolveMockUserId, USE_MOCK } from "../shared/runtime"
import { getCollectionDb, saveCollectionDb } from "../shared/storage"

export const createRoadmapsService = () => {
  const loadUserCollection = async (resolvedUserId: number): Promise<string[]> => {
    if (USE_MOCK) {
      return await delay(250).then(() => {
        const db = getCollectionDb()
        return db[String(resolvedUserId)] ?? [...mockDefaultRoadmapCollection]
      })
    }

    await delay(600)
    return []
  }

  const persistUserCollection = async (resolvedUserId: number, roadmapIds: string[]): Promise<string[]> => {
    if (USE_MOCK) {
      return await delay(250).then(() => {
        const db = getCollectionDb()
        db[String(resolvedUserId)] = [...new Set(roadmapIds)]
        saveCollectionDb(db)
        return db[String(resolvedUserId)]
      })
    }

    await delay(600)
    return roadmapIds
  }

  return {
    async getRoadmapProgress(_userId: number | null): Promise<RoadmapProgressItem[]> {
      if (USE_MOCK) {
        return await delay(350).then(() => mockRoadmapProgressResponse)
      }

      await delay(700)
      return []
    },

    async getUserRoadmapCollection(userId: number | null): Promise<string[]> {
      const resolvedUserId = resolveMockUserId(userId)
      return loadUserCollection(resolvedUserId)
    },

    async updateUserRoadmapCollection(userId: number | null, roadmapIds: string[]): Promise<string[]> {
      const resolvedUserId = resolveMockUserId(userId)
      return persistUserCollection(resolvedUserId, roadmapIds)
    },

    async removeUserRoadmapFromCollection(userId: number | null, roadmapId: string): Promise<string[]> {
      const resolvedUserId = resolveMockUserId(userId)
      const current = await loadUserCollection(resolvedUserId)
      const next = current.filter((id) => id !== roadmapId)

      return persistUserCollection(resolvedUserId, next)
    },

    async getUserYearActivity(userId: number | null): Promise<UserActivityDay[]> {
      resolveMockUserId(userId)

      if (USE_MOCK) {
        return await delay(280).then(() => getActivityFromUserActions())
      }

      await delay(700)
      return []
    }
  }
}
