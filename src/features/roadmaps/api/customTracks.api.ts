import { api } from "@/shared/api/client"
import type { CustomRoadmapDraft, GenerateCustomTrackPayload } from "@/shared/api/client"

export const customTracksApi = {
  list(userId: number | null): Promise<CustomRoadmapDraft[]> {
    return api.getCustomTracks(userId)
  },
  create(userId: number | null, payload: CustomRoadmapDraft): Promise<CustomRoadmapDraft> {
    return api.createCustomTrack(userId, payload)
  },
  generate(userId: number | null, payload: GenerateCustomTrackPayload): Promise<CustomRoadmapDraft[]> {
    return api.generateCustomTracks(userId, payload)
  },
  remove(userId: number | null, trackId: string): Promise<void> {
    return api.deleteCustomTrack(userId, trackId)
  }
}

export type { CustomRoadmapDraft, GenerateCustomTrackPayload }
