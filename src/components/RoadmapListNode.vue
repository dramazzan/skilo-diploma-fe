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
  <div class="list-node" :class="`depth-${depth}`">
    <div class="list-row">
      <span v-if="depth > 0" class="list-connector" />

      <div
        class="list-item"
        :class="getNodeClass(node)"
        @click="hasChildren ? toggle() : openTopic()"
      >
        <span class="list-toggle" :class="{ 'list-toggle--leaf': !hasChildren }">
          <template v-if="hasChildren">
            {{ expanded ? "▾" : "▸" }}
          </template>
          <template v-else>
            <span class="list-dot" />
          </template>
        </span>

        <span class="list-name">{{ node.title }}</span>

        <span
          v-if="getNodeStatusLabel(node)"
          class="list-status"
          :class="{
            'list-status--completed': node.status === 'completed',
            'list-status--progress': node.status === 'in_progress',
            'list-status--locked': node.status === 'locked',
          }"
        >
          {{ getNodeStatusLabel(node) }}
        </span>
      </div>
    </div>

    <div v-if="expanded && hasChildren" class="list-children">
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Node wrapper ── */
.list-node {
  margin-top: 6px;
  font-family: 'Inter', sans-serif;
}

/* ── Row ── */
.list-row {
  display: flex;
  align-items: center;
}

/* ── Connector line ── */
.list-connector {
  flex-shrink: 0;
  width: 20px;
  height: 1px;
  background: #eee;
  margin-right: 6px;
}

/* ── Item ── */
.list-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  user-select: none;
}

.list-item:hover {
  border-color: #ddd;
  background: #f5f5f5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.06);
}

/* locked */
.list-item.locked {
  opacity: 0.45;
  cursor: default;
  pointer-events: none;
}

/* ── Toggle icon ── */
.list-toggle {
  flex-shrink: 0;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #999;
  line-height: 1;
}

.list-toggle--leaf {
  /* keep alignment consistent */
}

.list-dot {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 100px;
  background: #ccc;
}

/* ── Name ── */
.list-name {
  font-size: 14px;
  font-weight: 600;
  color: #0a0a0a;
  flex: 1;
  line-height: 1.4;
}

/* ── Status badge ── */
.list-status {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 100px;
  padding: 3px 10px;
  border: 1px solid #eee;
  background: #f5f5f5;
  color: #999;
  white-space: nowrap;
}

.list-status--completed {
  background: #0a0a0a;
  color: #fff;
  border-color: #0a0a0a;
}

.list-status--progress {
  background: #f5f5f5;
  color: #555;
  border-color: #ddd;
}

.list-status--locked {
  background: #f5f5f5;
  color: #bbb;
  border-color: #eee;
}

/* ── Children ── */
.list-children {
  margin-left: 26px;
  border-left: 1px solid #eee;
  padding-left: 0;
}

/* ── Depth tinting ── */
.depth-1 .list-item {
  background: #fafafa;
}

.depth-2 .list-item {
  background: #f7f7f7;
}

/* ── Adaptive ── */
@media (max-width: 640px) {
  .list-name {
    font-size: 13px;
  }

  .list-status {
    font-size: 10px;
    padding: 2px 8px;
    letter-spacing: 0.03em;
  }

  .list-item {
    padding: 9px 12px;
    gap: 8px;
  }

  .list-children {
    margin-left: 16px;
  }

  .list-connector {
    width: 14px;
  }
}
</style>