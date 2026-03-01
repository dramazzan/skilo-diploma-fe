import { computed, ref } from "vue"
import { defineStore } from "pinia"

export type DirectionSkillLevel =
  | "Junior"
  | "Junior Strong"
  | "Middle"
  | "Middle Strong"
  | "Senior"

export interface DirectionLevelResult {
  roadmapId: string
  roadmapTitle: string
  levelLabel: DirectionSkillLevel
  score: number
  updatedAt: string
}

const SKILL_LEVELS_STORAGE_KEY = "user_skill_levels_v1"

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const useSkillLevelsStore = defineStore("skillLevels", () => {
  const levelsByRoadmap = ref<Record<string, DirectionLevelResult>>(
    parseJson<Record<string, DirectionLevelResult>>(localStorage.getItem(SKILL_LEVELS_STORAGE_KEY), {})
  )

  const persist = () => {
    localStorage.setItem(SKILL_LEVELS_STORAGE_KEY, JSON.stringify(levelsByRoadmap.value))
  }

  const setLevel = (result: DirectionLevelResult) => {
    levelsByRoadmap.value[result.roadmapId] = result
    persist()
  }

  const clearLevel = (roadmapId: string) => {
    if (!levelsByRoadmap.value[roadmapId]) return
    delete levelsByRoadmap.value[roadmapId]
    persist()
  }

  const getLevel = (roadmapId: string): DirectionLevelResult | null => {
    return levelsByRoadmap.value[roadmapId] ?? null
  }

  const allLevels = computed(() => {
    return Object.values(levelsByRoadmap.value).sort((first, second) =>
      second.updatedAt.localeCompare(first.updatedAt)
    )
  })

  return {
    levelsByRoadmap,
    allLevels,
    setLevel,
    clearLevel,
    getLevel
  }
})
