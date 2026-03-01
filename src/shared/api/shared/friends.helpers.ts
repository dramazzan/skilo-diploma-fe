import { mockDefaultFriendIds, mockFriendDirectory, type MockFriendProfile } from "@/shared/mocks/mockFriends"

import type { FriendProfile } from "../types"
import { averageProgressFromMap } from "./roadmaps.helpers"
import { getFriendsDb } from "./storage"

export const normalizeFriendProfile = (profile: MockFriendProfile): FriendProfile => {
  return {
    ...profile,
    roadmapProgressPercent: averageProgressFromMap(profile.roadmapProgress)
  }
}

export const getFriendsForUser = (userId: number): FriendProfile[] => {
  const db = getFriendsDb()
  const friendIds = db[String(userId)] ?? [...mockDefaultFriendIds]

  return friendIds
    .map((friendId) => mockFriendDirectory.find((candidate) => candidate.userId === friendId))
    .filter((candidate): candidate is MockFriendProfile => Boolean(candidate))
    .map(normalizeFriendProfile)
}
