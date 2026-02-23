import { mockRoadmapProgressResponse } from "@/mocks/mockData"

import type { LeaderboardEntry } from "../types"
import { getActivityFromUserActions } from "./roadmaps.helpers"
import { getRoadmapProgressDb, getTopicResults } from "./storage"

const getAverageRoadmapProgress = (): number => {
  const db = getRoadmapProgressDb()
  const list = Object.values(db)

  if (!list.length) {
    const fallback = mockRoadmapProgressResponse
    const total = fallback.reduce((sum, item) => sum + item.completionPercent, 0)
    return Math.round(total / fallback.length)
  }

  const total = list.reduce((sum, item) => sum + item.completionPercent, 0)
  return Math.round(total / list.length)
}

export const getCurrentUserPointsSnapshot = () => {
  const topicResults = Object.values(getTopicResults())
  const passedTests = topicResults.filter((result) => result.passed).length
  const failedTests = Math.max(0, topicResults.length - passedTests)
  const scoreTotal = topicResults.reduce((sum, result) => sum + result.score, 0)
  const activityPoints = getActivityFromUserActions().reduce((sum, day) => sum + day.level, 0)
  const progressPercent = getAverageRoadmapProgress()
  const progressBonus = progressPercent * 5

  const points = passedTests * 140 + failedTests * 40 + scoreTotal + activityPoints + progressBonus

  return {
    points: Math.round(points),
    passedTests,
    failedTests,
    completedTests: topicResults.length,
    progressPercent
  }
}

export const createMockLeaders = (): LeaderboardEntry[] => {
  return [
    {
      userId: 11,
      fullName: "Aruzhan K.",
      avatar: "A",
      country: "Kazakhstan",
      city: "Almaty",
      university: "KBTU",
      points: 3820,
      completedTests: 34,
      passedTests: 30,
      failedTests: 4,
      roadmapProgressPercent: 86,
      badges: ["Top Learner", "AI Master"],
      rank: 0
    },
    {
      userId: 15,
      fullName: "Nikita S.",
      avatar: "N",
      country: "Kazakhstan",
      city: "Astana",
      university: "ENU",
      points: 3410,
      completedTests: 29,
      passedTests: 24,
      failedTests: 5,
      roadmapProgressPercent: 78,
      badges: ["Consistent", "Frontend Pro"],
      rank: 0
    },
    {
      userId: 22,
      fullName: "Miras T.",
      avatar: "M",
      country: "Kazakhstan",
      city: "Shymkent",
      university: "M. Auezov South Kazakhstan University",
      points: 2975,
      completedTests: 26,
      passedTests: 21,
      failedTests: 5,
      roadmapProgressPercent: 71,
      badges: ["Backend Runner"],
      rank: 0
    },
    {
      userId: 27,
      fullName: "Alina D.",
      avatar: "A",
      country: "Kyrgyzstan",
      city: "Bishkek",
      university: "AUCA",
      points: 2510,
      completedTests: 20,
      passedTests: 17,
      failedTests: 3,
      roadmapProgressPercent: 63,
      badges: ["Rising Star"],
      rank: 0
    }
  ]
}
