import { computed, ref } from "vue"
import { defineStore } from "pinia"

import type { RoadmapLevel } from "@/shared/api/client"
import { roadmapsApi, type Roadmap, type RoadmapNode, type RoadmapProgressItem } from "@/features/roadmaps/api/roadmaps.api"

export const useRoadmapsStore = defineStore("roadmaps", () => {
  const roadmaps = ref<Roadmap[]>([])
  const roadmapsLoaded = ref(false)
  const roadmapTrees = ref<Record<string, RoadmapNode[]>>({})
  const roadmapTreeLoadedById = ref<Record<string, boolean>>({})

  const userRoadmapIds = ref<string[]>([])
  const userRoadmapLevels = ref<Record<string, RoadmapLevel>>({})
  const roadmapProgress = ref<Record<string, RoadmapProgressItem>>({})

  const progressLoaded = ref(false)
  const collectionLoaded = ref(false)
  const activeUserId = ref<number | null>(null)

  const syncUserContext = (userId: number | null) => {
    const nextUserId = typeof userId === "number" ? userId : null
    if (activeUserId.value === nextUserId) return

    activeUserId.value = nextUserId
    userRoadmapIds.value = []
    userRoadmapLevels.value = {}
    roadmapProgress.value = {}
    progressLoaded.value = false
    collectionLoaded.value = false
  }

  const countLeafTopics = (nodes: RoadmapNode[] | undefined): number => {
    if (!nodes?.length) return 0

    return nodes.reduce((sum, node) => {
      if (node.children?.length) {
        return sum + countLeafTopics(node.children)
      }

      return sum + 1
    }, 0)
  }

  const setRoadmapProgress = (items: RoadmapProgressItem[], replace = false) => {
    const mapped = items.reduce<Record<string, RoadmapProgressItem>>((acc, item) => {
      acc[item.roadmapId] = item
      return acc
    }, {})

    roadmapProgress.value = replace ? mapped : { ...roadmapProgress.value, ...mapped }

    progressLoaded.value = true
  }

  const setUserRoadmapCollection = (roadmapIds: string[]) => {
    userRoadmapIds.value = [...new Set(roadmapIds)]
    collectionLoaded.value = true
  }

  const loadRoadmaps = async () => {
    if (roadmapsLoaded.value) return
    roadmaps.value = await roadmapsApi.getRoadmaps()
    roadmapsLoaded.value = true
  }

  const loadRoadmapTree = async (roadmapId: string) => {
    if (!roadmapId) return [] as RoadmapNode[]
    if (roadmapTreeLoadedById.value[roadmapId]) return roadmapTrees.value[roadmapId] ?? []

    const payload = await roadmapsApi.getRoadmapTree(roadmapId)
    const nodes = Array.isArray(payload) ? payload : payload[roadmapId] ?? []

    roadmapTrees.value = {
      ...roadmapTrees.value,
      [roadmapId]: nodes
    }
    roadmapTreeLoadedById.value = {
      ...roadmapTreeLoadedById.value,
      [roadmapId]: true
    }

    return nodes
  }

  const getRoadmapTreeById = (roadmapId: string) => {
    return roadmapTrees.value[roadmapId] ?? []
  }

  const loadUserRoadmapCollection = async (userId: number | null) => {
    syncUserContext(userId)
    if (collectionLoaded.value) return

    const roadmapIds = await roadmapsApi.getUserRoadmapCollection(userId)
    setUserRoadmapCollection(roadmapIds)
  }

  const loadRoadmapProgress = async (userId: number | null) => {
    syncUserContext(userId)
    if (progressLoaded.value) return

    const items = await roadmapsApi.getRoadmapProgress(userId)
    setRoadmapProgress(items, true)
  }

  const isInCollection = (roadmapId: string) => userRoadmapIds.value.includes(roadmapId)

  const addRoadmapWithLevel = async (roadmapId: string, level: RoadmapLevel, userId: number | null) => {
    syncUserContext(userId)
    const nextCollection = isInCollection(roadmapId) ? userRoadmapIds.value : [...userRoadmapIds.value, roadmapId]

    const savedCollection = await roadmapsApi.updateUserRoadmapCollection(userId, nextCollection)
    setUserRoadmapCollection(savedCollection)

    userRoadmapLevels.value[roadmapId] = level

    if (!roadmapProgress.value[roadmapId]) {
      const tree = await loadRoadmapTree(roadmapId)
      const totalTopics = countLeafTopics(tree)

      roadmapProgress.value[roadmapId] = {
        roadmapId,
        completionPercent: 0,
        completedTopics: 0,
        totalTopics
      }
    }
  }

  const removeRoadmapFromCollection = async (roadmapId: string, userId: number | null) => {
    syncUserContext(userId)
    const prevCollection = [...userRoadmapIds.value]
    const prevLevels = { ...userRoadmapLevels.value }
    const prevProgress = { ...roadmapProgress.value }

    const nextCollection = prevCollection.filter((id) => id !== roadmapId)
    setUserRoadmapCollection(nextCollection)
    delete userRoadmapLevels.value[roadmapId]
    delete roadmapProgress.value[roadmapId]

    try {
      const savedCollection = await roadmapsApi.removeUserRoadmapFromCollection(userId, roadmapId)
      setUserRoadmapCollection(savedCollection)
    } catch (error) {
      userRoadmapIds.value = prevCollection
      userRoadmapLevels.value = prevLevels
      roadmapProgress.value = prevProgress
      throw error
    }
  }

  const getRoadmapLevel = (roadmapId: string): RoadmapLevel | null => {
    return userRoadmapLevels.value[roadmapId] ?? null
  }

  const getRoadmapProgress = (roadmapId: string): RoadmapProgressItem | null => {
    return roadmapProgress.value[roadmapId] ?? null
  }

  const myRoadmaps = computed(() => roadmaps.value.filter((roadmap) => userRoadmapIds.value.includes(roadmap.id)))

  const availableRoadmaps = computed(() =>
    roadmaps.value.filter((roadmap) => !userRoadmapIds.value.includes(roadmap.id))
  )

  return {
    roadmaps,
    roadmapsLoaded,
    roadmapTrees,
    userRoadmapIds,
    userRoadmapLevels,
    roadmapProgress,
    progressLoaded,
    collectionLoaded,
    myRoadmaps,
    availableRoadmaps,
    loadRoadmaps,
    loadRoadmapTree,
    getRoadmapTreeById,
    isInCollection,
    setUserRoadmapCollection,
    loadUserRoadmapCollection,
    setRoadmapProgress,
    loadRoadmapProgress,
    addRoadmapWithLevel,
    removeRoadmapFromCollection,
    getRoadmapLevel,
    getRoadmapProgress
  }
})
