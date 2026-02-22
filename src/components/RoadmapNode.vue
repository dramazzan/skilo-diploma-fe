<script setup lang="ts">
import { computed, ref } from "vue"
import type { RoadmapNode as RoadmapTreeNode, TopicStatus } from "@/mocks/mockRoadmaps"

const props = defineProps<{
  node: RoadmapTreeNode
  x: number
  y: number
  size?: number
}>()

const emit = defineEmits<{
  (event: "select", node: RoadmapTreeNode): void
}>()

const hovering = ref(false)

const nodeSize = computed(() => props.size ?? 124)
const isLocked = computed(() => props.node.status === "locked")
const hasChildren = computed(() => Boolean(props.node.children?.length))

const statusLabelMap: Record<TopicStatus, string> = {
  locked: "Закрыто",
  not_started: "Открыто",
  in_progress: "В процессе",
  completed: "Завершено"
}

const statusLabel = computed(() => statusLabelMap[props.node.status])

const nodeClass = computed(() => ({
  locked: props.node.status === "locked",
  not_started: props.node.status === "not_started",
  in_progress: props.node.status === "in_progress",
  completed: props.node.status === "completed"
}))

const handleClick = () => {
  if (isLocked.value) return
  emit("select", props.node)
}
</script>

<template>
  <div
    class="roadmap-node"
    :class="nodeClass"
    :style="{
      transform: `translate(${x - nodeSize / 2}px, ${y - nodeSize / 2}px)`,
      width: `${nodeSize}px`,
      height: `${nodeSize}px`
    }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @click="handleClick"
  >
    <div class="node-shape">
      <div class="node-content">
        <p class="node-title">{{ node.title }}</p>
        <span class="node-status">{{ statusLabel }}</span>
      </div>
    </div>

    <transition name="fade-scale">
      <div v-if="hovering" class="node-tooltip">
        <p class="tooltip-title">{{ node.title }}</p>
        <p class="tooltip-meta">Статус: {{ statusLabel }}</p>
        <p class="tooltip-meta">{{ hasChildren ? `Веток: ${node.children?.length}` : "Финальная тема" }}</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Wrapper ── */
.roadmap-node {
  position: absolute;
  z-index: 3;
  font-family: 'Inter', sans-serif;
}

.roadmap-node:not(.locked) {
  cursor: pointer;
}

/* ── Hexagon shape ── */
.node-shape {
  width: 100%;
  height: 100%;
  clip-path: polygon(24% 8%, 76% 8%, 96% 50%, 76% 92%, 24% 92%, 4% 50%);
  background: #fff;
  border: 1.5px solid #eee;
  display: grid;
  place-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* hover lift — applied via wrapper scale trick since clip-path clips overflow */
.roadmap-node:not(.locked):hover .node-shape {
  transform: scale(1.06);
  filter: drop-shadow(0 6px 16px rgba(10, 10, 10, 0.1));
}

/* ── Content ── */
.node-content {
  width: 80%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.node-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
  color: #334155;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Status pill ── */
.node-status {
  display: inline-block;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  border: 1px solid #eee;
  background: #f5f5f5;
  white-space: nowrap;
}

/* ── Status variants ── */

/* locked */
.roadmap-node.locked {
  opacity: 0.4;
  pointer-events: none;
}

/* not_started */
.roadmap-node.not_started .node-shape {
  background: #fff;
  border-color: #eee;
}

/* in_progress */
.roadmap-node.in_progress .node-shape {
  background: #f5f5f5;
  border-color: #334155;
}

.roadmap-node.in_progress .node-status {
  background: #1f2d7a;
  color: #fff;
  border-color: #334155;
}

.roadmap-node.in_progress .node-shape {
  animation: pulse-node 2.2s ease-in-out infinite;
}

/* completed */
.roadmap-node.completed .node-shape {
  background: #1f2d7a;
  border-color: #334155;
}

.roadmap-node.completed .node-title {
  color: #f3f8ff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.roadmap-node.completed .node-status {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
}

.roadmap-node.completed .node-shape {
  animation: glow-node 2.4s ease-in-out infinite;
}

/* ── Tooltip ── */
.node-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
  min-width: 170px;
  max-width: 216px;
  background: #1f2d7a;
  border: 1px solid #23277a;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 8px 24px rgba(10, 10, 10, 0.18);
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  line-height: 1.35;
}

.tooltip-meta {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: #888;
  line-height: 1.35;
}

/* ── Transitions ── */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px);
}

/* ── Animations ── */
@keyframes pulse-node {
  0%, 100% {
    filter: drop-shadow(0 0 0px rgba(10, 10, 10, 0));
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(10, 10, 10, 0.2));
  }
}

@keyframes glow-node {
  0%, 100% {
    filter: drop-shadow(0 0 4px rgba(10, 10, 10, 0.25));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(10, 10, 10, 0.45));
  }
}
</style>
