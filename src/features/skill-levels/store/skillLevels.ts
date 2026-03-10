import { computed, ref } from "vue"
import { defineStore } from "pinia"

import { skillLevelsApi } from "@/features/skill-levels/api/skillLevels.api"

export type DirectionSkillLevel = "Junior" | "Junior Strong" | "Middle" | "Middle Strong" | "Senior"

export interface DirectionLevelResult {
  roadmapId: string
  roadmapTitle: string
  levelLabel: DirectionSkillLevel
  score: number
  updatedAt: string
}

export const useSkillLevelsStore = defineStore("skillLevels", () => {
  const levelsByRoadmap = ref<Record<string, DirectionLevelResult>>({})
  const loading = ref(false)
  const loaded = ref(false)

  const allLevels = computed(() => {
    return Object.values(levelsByRoadmap.value).sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
  })

  const setLevels = (items: DirectionLevelResult[]) => {
    levelsByRoadmap.value = items.reduce<Record<string, DirectionLevelResult>>((acc, item) => {
      acc[item.roadmapId] = item
      return acc
    }, {})
  }

  const loadLevels = async (userId: number | null, force = false) => {
    if (loaded.value && !force) return

    loading.value = true

    try {
      const levels = await skillLevelsApi.getLevels(userId)
      setLevels(levels)
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const setLevel = async (result: DirectionLevelResult, userId: number | null) => {
    const saved = await skillLevelsApi.upsertLevel(userId, result.roadmapId, result)
    levelsByRoadmap.value[saved.roadmapId] = saved
    loaded.value = true
    return saved
  }

  const clearLevel = async (roadmapId: string, userId: number | null) => {
    await skillLevelsApi.deleteLevel(userId, roadmapId)
    delete levelsByRoadmap.value[roadmapId]
  }

  const getLevel = (roadmapId: string): DirectionLevelResult | null => {
    return levelsByRoadmap.value[roadmapId] ?? null
  }

  return {
    levelsByRoadmap,
    allLevels,
    loading,
    loaded,
    setLevels,
    loadLevels,
    setLevel,
    clearLevel,
    getLevel
  }
})
