import { ref } from "vue"
import { defineStore } from "pinia"
import { roadmapsApi, type TopicResultUpdateResponse } from "@/features/roadmaps/api/roadmaps.api"
import type { TopicResult } from "@/shared/api/client"

export const useTopicProgressStore = defineStore("topic-progress", () => {
  const results = ref<Record<string, TopicResult>>({})
  const loading = ref(false)
  const loaded = ref(false)
  const activeUserId = ref<number | null>(null)

  const syncUserContext = (userId: number | null) => {
    const nextUserId = typeof userId === "number" ? userId : null
    if (activeUserId.value === nextUserId) return

    activeUserId.value = nextUserId
    results.value = {}
    loaded.value = false
  }

  const setResults = (items: TopicResult[]) => {
    results.value = items.reduce<Record<string, TopicResult>>((acc, item) => {
      acc[item.topicId] = item
      return acc
    }, {})
  }

  const loadResults = async (userId: number | null, force = false) => {
    syncUserContext(userId)
    if (loaded.value && !force) return

    loading.value = true

    try {
      const items = await roadmapsApi.getTopicResults(userId)
      setResults(items)
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const applyResult = (result: TopicResult) => {
    results.value = {
      ...results.value,
      [result.topicId]: result
    }
  }

  const setResult = async (
    topicId: string,
    score: number,
    passed: boolean,
    userId: number | null
  ): Promise<TopicResultUpdateResponse> => {
    syncUserContext(userId)
    const response = await roadmapsApi.upsertTopicResult(userId, topicId, { score, passed })
    applyResult(response.result)
    loaded.value = true
    return response
  }

  const getResult = (topicId: string): TopicResult | null => results.value[topicId] ?? null

  return {
    results,
    loading,
    loaded,
    setResults,
    loadResults,
    setResult,
    getResult
  }
})
