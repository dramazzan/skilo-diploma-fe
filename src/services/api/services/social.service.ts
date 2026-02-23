import { mockDefaultFriendIds, mockFriendDirectory } from "@/mocks/mockFriends"
import { mockRoadmaps } from "@/mocks/mockRoadmaps"

import type { FriendProfile, GlobalItMapParticipant, GlobalItMapResponse } from "../types"
import { getCurrentUserPointsSnapshot } from "../shared/leaderboard.helpers"
import { getFriendsForUser, normalizeFriendProfile } from "../shared/friends.helpers"
import { averageProgressFromMap, getCurrentUserRoadmapProgressMap } from "../shared/roadmaps.helpers"
import { delay, resolveMockUserId, USE_MOCK } from "../shared/runtime"
import { getFriendsDb, saveFriendsDb } from "../shared/storage"

export const createSocialService = () => ({
  async getFriends(userId: number | null): Promise<FriendProfile[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(220).then(() => getFriendsForUser(resolvedUserId))
    }

    await delay(700)
    return []
  },

  async getFriendSuggestions(userId: number | null): Promise<FriendProfile[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(180).then(() => {
        const existingIds = new Set(getFriendsForUser(resolvedUserId).map((item) => item.userId))
        return mockFriendDirectory
          .filter((candidate) => candidate.userId !== resolvedUserId && !existingIds.has(candidate.userId))
          .map(normalizeFriendProfile)
      })
    }

    await delay(700)
    return []
  },

  async addFriendByEmail(userId: number | null, email: string): Promise<FriendProfile[]> {
    const resolvedUserId = resolveMockUserId(userId)
    const normalizedEmail = email.trim().toLowerCase()

    if (USE_MOCK) {
      return await delay(220).then(() => {
        const friend = mockFriendDirectory.find((candidate) => candidate.email.toLowerCase() === normalizedEmail)

        if (!friend) {
          throw new Error("Пользователь с таким email не найден")
        }

        if (friend.userId === resolvedUserId) {
          throw new Error("Нельзя добавить самого себя")
        }

        const db = getFriendsDb()
        const current = db[String(resolvedUserId)] ?? [...mockDefaultFriendIds]

        if (!current.includes(friend.userId)) {
          db[String(resolvedUserId)] = [...current, friend.userId]
          saveFriendsDb(db)
        }

        return getFriendsForUser(resolvedUserId)
      })
    }

    await delay(700)
    return []
  },

  async removeFriend(userId: number | null, friendUserId: number): Promise<FriendProfile[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getFriendsDb()
        const current = db[String(resolvedUserId)] ?? [...mockDefaultFriendIds]
        db[String(resolvedUserId)] = current.filter((id) => id !== friendUserId)
        saveFriendsDb(db)
        return getFriendsForUser(resolvedUserId)
      })
    }

    await delay(700)
    return []
  },

  async getGlobalItMap(userId: number | null): Promise<GlobalItMapResponse> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(240).then(() => {
        const currentProgressMap = getCurrentUserRoadmapProgressMap()
        const snapshot = getCurrentUserPointsSnapshot()

        const currentUserParticipant: GlobalItMapParticipant = {
          userId: resolvedUserId,
          fullName: "Вы",
          avatar: "Y",
          isCurrentUser: true,
          points: snapshot.points,
          overallProgressPercent: averageProgressFromMap(currentProgressMap),
          roadmapProgress: currentProgressMap
        }

        const friendParticipants: GlobalItMapParticipant[] = getFriendsForUser(resolvedUserId).map((friend) => ({
          userId: friend.userId,
          fullName: friend.fullName,
          avatar: friend.avatar,
          isCurrentUser: false,
          points: friend.points,
          overallProgressPercent: friend.roadmapProgressPercent,
          roadmapProgress: friend.roadmapProgress
        }))

        return {
          roadmaps: mockRoadmaps.map((roadmap) => ({
            roadmapId: roadmap.id,
            title: roadmap.title
          })),
          participants: [currentUserParticipant, ...friendParticipants]
        }
      })
    }

    await delay(700)
    return {
      roadmaps: [],
      participants: []
    }
  }
})
