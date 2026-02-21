<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import type { RoadmapNode } from "@/mocks/mockRoadmaps"
import { useTopicProgressStore } from "@/store/topicProgress"

const props = withDefaults(defineProps<{
  node: RoadmapNode
  depth?: number
}>(), {
  depth: 0
})

const router = useRouter()
const topicProgress = useTopicProgressStore()
const hasChildren = computed(() => Boolean(props.node.children?.length))
const expanded = ref(props.depth === 0)

const toggle = () => {
  if (hasChildren.value) {
    expanded.value = !expanded.value
  }
}

const openTopic = () => {
  if (props.node.status !== "locked" && !hasChildren.value) {
    router.push(`/topics/${props.node.id}`)
  }
}

const getNodeStatusLabel = (node: RoadmapNode) => {
  if (node.status === "locked") return "Заблокировано"

  if (!node.children?.length) {
    const result = topicProgress.getResult(node.id)
    if (result) return result.passed ? "Пройдено" : "Не пройдено"
  }

  if (node.status === "completed") return "Пройдено"
  if (node.status === "in_progress") return "В процессе"
  if (node.status === "not_started") return "Не начато"

  return ""
}

const getNodeClass = (node: RoadmapNode) => ({
  locked: node.status === "locked",
  completed: node.status === "completed",
  in_progress: node.status === "in_progress"
})
</script>

<template>
  <div class="legacy-node" :class="`depth-${depth}`">
    <div class="legacy-row">
      <span v-if="depth > 0" class="legacy-connector" />

      <div class="legacy-title" :class="getNodeClass(node)" @click="hasChildren ? toggle() : openTopic()">
        <span class="legacy-toggle" v-if="hasChildren">
          {{ expanded ? "▼" : "▶" }}
        </span>
        <span class="legacy-toggle" v-else>•</span>

        <span class="legacy-name">{{ node.title }}</span>

        <span class="legacy-status">{{ getNodeStatusLabel(node) }}</span>
      </div>
    </div>

    <div v-if="expanded && hasChildren" class="legacy-children">
      <RoadmapListNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<style scoped>
.legacy-node {
  margin-top: 8px;
}

.legacy-row {
  display: flex;
  align-items: center;
}

.legacy-connector {
  width: 18px;
  height: 1px;
  background: #cdd8ea;
  margin-right: 8px;
}

.legacy-title {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  padding: 10px 12px;
  transition: all 0.2s ease;
}

.legacy-title:hover {
  border-color: #bfd2ec;
  background: #f8fbff;
}

.legacy-toggle {
  min-width: 14px;
  color: #56627d;
}

.legacy-name {
  font-weight: 600;
}

.legacy-status {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #dbe3ef;
  border-radius: 999px;
  padding: 2px 8px;
  color: #475569;
}

.legacy-title.locked {
  opacity: 0.58;
}

.legacy-title.in_progress .legacy-status {
  border-color: #c7d3ff;
  color: #3347a0;
}

.legacy-title.completed .legacy-status {
  border-color: #bfe6d5;
  color: #176a4f;
}

.legacy-children {
  margin-left: 26px;
}
</style>
