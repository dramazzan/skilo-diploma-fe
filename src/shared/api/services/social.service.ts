import { mockDefaultFriendIds, mockFriendDirectory } from "@/shared/mocks/mockFriends"
import { mockRoadmaps } from "@/shared/mocks/mockRoadmaps"

import type {
  CreateFriendChallengePayload,
  FriendChallenge,
  FriendChallengeNotification,
  FriendProfile,
  GlobalItMapParticipant,
  GlobalItMapResponse
} from "../types"
import { getCurrentUserPointsSnapshot } from "../shared/leaderboard.helpers"
import { getFriendsForUser, normalizeFriendProfile } from "../shared/friends.helpers"
import { averageProgressFromMap, getCurrentUserRoadmapProgressMap } from "../shared/roadmaps.helpers"
import { delay, resolveMockUserId, USE_MOCK } from "../shared/runtime"
import {
  getFriendChallengesDb,
  getFriendsDb,
  saveFriendChallengesDb,
  saveFriendsDb
} from "../shared/storage"

const CHALLENGE_RESOLVE_MS = 45_000

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const hashText = (text: string) => {
  let hash = 0

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }

  return hash
}

const toDurationSec = (score: number, seed: number) => {
  const adjusted = 150 + (100 - score) * 4 + (seed % 80)
  return Math.max(90, adjusted)
}

const sortByCreatedAtDesc = (challenges: FriendChallenge[]) => {
  return [...challenges].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

const formatDuration = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0")
  const seconds = String(safe % 60).padStart(2, "0")
  return `${minutes}:${seconds}`
}

const resolvePendingChallenges = (challenges: FriendChallenge[]) => {
  const now = Date.now()
  let changed = false

  const resolved = challenges.map((challenge) => {
    if (challenge.status !== "waiting_opponent") return challenge

    const elapsed = now - new Date(challenge.createdAt).getTime()
    if (elapsed < CHALLENGE_RESOLVE_MS) return challenge

    const opponentProfile = mockFriendDirectory.find((item) => item.userId === challenge.opponentUserId)
    const baseScore = opponentProfile?.roadmapProgress[challenge.roadmapId] ?? 50
    const seed = hashText(`${challenge.id}:${challenge.opponentUserId}`)
    const opponentScore = clamp(baseScore + (seed % 19) - 9, 1, 100)
    const opponentDurationSec = toDurationSec(opponentScore, seed + 19)

    let winnerUserId: number | null = null

    if (opponentScore > challenge.challengerScore) {
      winnerUserId = challenge.opponentUserId
    } else if (opponentScore < challenge.challengerScore) {
      winnerUserId = challenge.challengerUserId
    } else if (opponentDurationSec < challenge.challengerDurationSec) {
      winnerUserId = challenge.opponentUserId
    } else if (opponentDurationSec > challenge.challengerDurationSec) {
      winnerUserId = challenge.challengerUserId
    }

    changed = true

    return {
      ...challenge,
      status: "completed" as const,
      opponentScore,
      opponentDurationSec,
      winnerUserId,
      completedAt: new Date(now).toISOString(),
      isNotificationRead: false
    }
  })

  return { resolved, changed }
}

const buildChallengeNotification = (challenge: FriendChallenge, currentUserId: number): FriendChallengeNotification => {
  const opponentScore = challenge.opponentScore ?? 0
  const challengerLine = `${challenge.challengerScore}% за ${formatDuration(challenge.challengerDurationSec)}`
  const opponentLine = `${opponentScore}% за ${formatDuration(challenge.opponentDurationSec ?? 0)}`

  const message =
    challenge.winnerUserId === null
      ? `Ничья в вызове по «${challenge.roadmapTitle}»: вы ${challengerLine}, ${challenge.opponentName} ${opponentLine}.`
      : challenge.winnerUserId === currentUserId
        ? `Вы выиграли вызов по «${challenge.roadmapTitle}»: вы ${challengerLine}, ${challenge.opponentName} ${opponentLine}.`
        : `${challenge.opponentName} выиграл(а) вызов по «${challenge.roadmapTitle}»: вы ${challengerLine}, ${challenge.opponentName} ${opponentLine}.`

  return {
    id: challenge.id,
    challengeId: challenge.id,
    message,
    createdAt: challenge.completedAt ?? challenge.createdAt
  }
}

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
  },

  async getFriendChallenges(userId: number | null): Promise<FriendChallenge[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(180).then(() => {
        const db = getFriendChallengesDb()
        const key = String(resolvedUserId)
        const current = db[key] ?? []
        const { resolved, changed } = resolvePendingChallenges(current)

        if (changed) {
          db[key] = resolved
          saveFriendChallengesDb(db)
        }

        return sortByCreatedAtDesc(resolved)
      })
    }

    await delay(700)
    return []
  },

  async createFriendChallenge(userId: number | null, payload: CreateFriendChallengePayload): Promise<FriendChallenge> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(220).then(() => {
        const availableFriends = getFriendsForUser(resolvedUserId)
        const friend = availableFriends.find((item) => item.userId === payload.opponentUserId)

        if (!friend) {
          throw new Error("Можно вызывать на соревнование только пользователя из списка друзей")
        }

        const roadmap = mockRoadmaps.find((item) => item.id === payload.roadmapId)

        if (!roadmap) {
          throw new Error("Не удалось определить направление для соревнования")
        }

        const db = getFriendChallengesDb()
        const key = String(resolvedUserId)
        const current = db[key] ?? []
        const { resolved } = resolvePendingChallenges(current)

        const hasActive = resolved.some(
          (challenge) =>
            challenge.status === "waiting_opponent" &&
            challenge.opponentUserId === payload.opponentUserId &&
            challenge.roadmapId === payload.roadmapId
        )

        if (hasActive) {
          throw new Error("По этому направлению уже есть активный вызов для выбранного друга")
        }

        const challengerScore = clamp(Math.round(payload.challengerScore), 1, 100)
        const challengerDurationSec = Math.max(1, Math.round(payload.challengerDurationSec))

        const challenge: FriendChallenge = {
          id: `friend-challenge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          challengerUserId: resolvedUserId,
          opponentUserId: payload.opponentUserId,
          opponentName: friend.fullName,
          roadmapId: roadmap.id,
          roadmapTitle: roadmap.title,
          challengerScore,
          challengerDurationSec,
          opponentScore: null,
          opponentDurationSec: null,
          winnerUserId: null,
          status: "waiting_opponent",
          createdAt: new Date().toISOString(),
          completedAt: null,
          isNotificationRead: true
        }

        db[key] = [...resolved, challenge]
        saveFriendChallengesDb(db)

        return challenge
      })
    }

    await delay(700)
    throw new Error("Функция доступна только в mock-режиме")
  },

  async getFriendChallengeNotifications(userId: number | null): Promise<FriendChallengeNotification[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(160).then(() => {
        const db = getFriendChallengesDb()
        const key = String(resolvedUserId)
        const current = db[key] ?? []
        const { resolved, changed } = resolvePendingChallenges(current)

        if (changed) {
          db[key] = resolved
          saveFriendChallengesDb(db)
        }

        return resolved
          .filter((challenge) => challenge.status === "completed" && !challenge.isNotificationRead)
          .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt))
          .map((challenge) => buildChallengeNotification(challenge, resolvedUserId))
      })
    }

    await delay(700)
    return []
  },

  async markFriendChallengeNotificationRead(userId: number | null, challengeId: string): Promise<void> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      await delay(140)

      const db = getFriendChallengesDb()
      const key = String(resolvedUserId)
      const current = db[key] ?? []
      let changed = false

      db[key] = current.map((challenge) => {
        if (challenge.id !== challengeId || challenge.isNotificationRead) return challenge
        changed = true
        return { ...challenge, isNotificationRead: true }
      })

      if (changed) {
        saveFriendChallengesDb(db)
      }

      return
    }

    await delay(700)
  }
})
