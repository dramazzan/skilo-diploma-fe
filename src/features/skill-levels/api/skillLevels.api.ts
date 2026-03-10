import { api } from "@/shared/api/client"
import type { DirectionLevelResult } from "@/shared/api/client"

export const skillLevelsApi = {
  getLevels(userId: number | null): Promise<DirectionLevelResult[]> {
    return api.getSkillLevels(userId)
  },
  upsertLevel(userId: number | null, roadmapId: string, payload: DirectionLevelResult): Promise<DirectionLevelResult> {
    return api.upsertSkillLevel(userId, roadmapId, payload)
  },
  deleteLevel(userId: number | null, roadmapId: string): Promise<void> {
    return api.deleteSkillLevel(userId, roadmapId)
  }
}
