<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import {
  mockRoadmaps,
  mockRoadmapTrees
} from "@/mocks/mockRoadmaps"
import RoadmapTree from "@/components/RoadmapTree.vue"
import RoadmapListNode from "@/components/RoadmapListNode.vue"
import { useTopicProgressStore } from "@/store/topicProgress"
import { mapRoadmapTreeWithProgress } from "@/utils/roadmapProgress"

type RoadmapViewMode = "skill_tree" | "classic_list"
const VIEW_MODE_KEY = "roadmap_view_mode"

const route = useRoute()
const topicProgress = useTopicProgressStore()
const roadmapId = route.params.id as string

const roadmap = mockRoadmaps.find(r => r.id === roadmapId)
const tree = computed(() => {
  const baseTree = mockRoadmapTrees[roadmapId] ?? []
  return mapRoadmapTreeWithProgress(baseTree, topicProgress.getResult)
})

const collectLeafNodes = (nodes: typeof tree.value): typeof tree.value => {
  return nodes.flatMap((node) => {
    if (node.children?.length) {
      return collectLeafNodes(node.children)
    }

    return [node]
  })
}

const listProgress = computed(() => {
  const leaves = collectLeafNodes(tree.value)
  const total = leaves.length
  const completed = leaves.filter((node) => node.status === "completed").length
  const inProgress = leaves.filter((node) => node.status === "in_progress").length
  const percent = total ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    inProgress,
    percent
  }
})

const getStoredMode = (): RoadmapViewMode => {
  const stored = localStorage.getItem(VIEW_MODE_KEY)
  return stored === "classic_list" ? "classic_list" : "skill_tree"
}

const viewMode = ref<RoadmapViewMode>(getStoredMode())

watch(viewMode, (value) => {
  localStorage.setItem(VIEW_MODE_KEY, value)
})
</script>

<template>
  <div class="page roadmap-page">
    <button class="secondary" @click="$router.push('/roadmaps')">← Назад к дорожным картам</button>

    <div v-if="!roadmap">
      <h2>Roadmap не найден</h2>
    </div>

    <div v-else>
      <h1>{{ roadmap.title }}</h1>
      <p>{{ roadmap.description }}</p>

      <div class="view-switcher" role="tablist" aria-label="Режим отображения roadmap">
        <button
          type="button"
          class="secondary"
          :class="{ active: viewMode === 'skill_tree' }"
          @click="viewMode = 'skill_tree'"
        >
          Дерево навыков
        </button>
        <button
          type="button"
          class="secondary"
          :class="{ active: viewMode === 'classic_list' }"
          @click="viewMode = 'classic_list'"
        >
          Классический список
        </button>
      </div>

      <div v-if="tree.length">
        <RoadmapTree v-if="viewMode === 'skill_tree'" :nodes="tree" />
        <div v-else class="legacy-list-wrap">
          <div class="classic-progress">
            <div class="classic-progress-head">
              <span>Прогресс</span>
              <span>{{ listProgress.percent }}%</span>
            </div>
            <div class="classic-progress-track">
              <span class="classic-progress-fill" :style="{ width: `${listProgress.percent}%` }" />
            </div>
            <p class="classic-progress-meta">
              {{ listProgress.completed }}/{{ listProgress.total }} завершено
              · {{ listProgress.inProgress }} в процессе
            </p>
          </div>

          <RoadmapListNode v-for="node in tree" :key="node.id" :node="node" />
        </div>
      </div>

      <div v-else>
        Тем пока нет.
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-page {
  max-width: 1280px;
}

.view-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.view-switcher .active {
  border-color: #2a2f8f;
  color: #2a2f8f;
  background: #eef1ff;
}

.legacy-list-wrap {
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  padding: 12px;
}

.classic-progress {
  border: 1px solid #dde6f3;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
  margin-bottom: 12px;
}

.classic-progress-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.classic-progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #dbe3ef;
  overflow: hidden;
}

.classic-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2f3599 0%, #3f2f88 100%);
}

.classic-progress-meta {
  margin: 6px 0 0;
  font-size: 12px;
  color: #526079;
}
</style>
