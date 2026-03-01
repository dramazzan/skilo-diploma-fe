import { mockRoadmapProgressResponse } from "@/shared/mocks/mockData"

import type { UserActivityDay } from "../types"
import { getRoadmapProgressDb, getTopicResults } from "./storage"

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const buildLastYearActivity = (): UserActivityDay[] => {
  const days: UserActivityDay[] = []
  const today = new Date()

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push({
      date: toIsoDate(date),
      level: 0
    })
  }

  return days
}

export const getActivityFromUserActions = (): UserActivityDay[] => {
  const base = buildLastYearActivity()
  const byDate = base.reduce<Record<string, 0 | 1 | 2 | 3 | 4>>((acc, day) => {
    acc[day.date] = 0
    return acc
  }, {})

  const topicResults = Object.values(getTopicResults())

  topicResults.forEach((result) => {
    const date = result.updatedAt?.slice(0, 10)
    if (!date || byDate[date] === undefined) return

    const increment = result.passed ? 2 : 1
    byDate[date] = Math.min(4, byDate[date] + increment) as 0 | 1 | 2 | 3 | 4
  })

  return base.map((day) => ({
    date: day.date,
    level: byDate[day.date] ?? 0
  }))
}

export const getCurrentUserRoadmapProgressMap = (): Record<string, number> => {
  const db = getRoadmapProgressDb()

  if (!Object.keys(db).length) {
    return mockRoadmapProgressResponse.reduce<Record<string, number>>((acc, item) => {
      acc[item.roadmapId] = item.completionPercent
      return acc
    }, {})
  }

  return Object.values(db).reduce<Record<string, number>>((acc, item) => {
    acc[item.roadmapId] = item.completionPercent
    return acc
  }, {})
}

export const averageProgressFromMap = (map: Record<string, number>): number => {
  const values = Object.values(map)
  if (!values.length) return 0

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}
