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
        <p>{{ node.title }}</p>
        <p>Статус: {{ statusLabel }}</p>
        <p>{{ hasChildren ? `Веток: ${node.children?.length}` : "Финальная тема" }}</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.roadmap-node {
  position: absolute;
  z-index: 3;
}

.roadmap-node:not(.locked) {
  cursor: pointer;
}

.node-shape {
  width: 100%;
  height: 100%;
  clip-path: polygon(24% 8%, 76% 8%, 96% 50%, 76% 92%, 24% 92%, 4% 50%);
  border: 2px solid rgba(112, 170, 196, 0.56);
  background: linear-gradient(165deg, #1a3346 0%, #142b3d 100%);
  display: grid;
  place-items: center;
  transition: all 0.25s ease, transform 0.25s ease;
}

.roadmap-node:not(.locked):hover .node-shape {
  transform: scale(1.05);
}

.node-content {
  width: 86%;
  text-align: center;
}

.node-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  color: #f6fcff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.35);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.node-status {
  margin-top: 8px;
  display: inline-block;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 999px;
  letter-spacing: 0.01em;
  color: #d5e7ef;
  border: 1px solid rgba(131, 179, 199, 0.52);
  background: rgba(8, 25, 36, 0.45);
}

.roadmap-node.locked {
  opacity: 0.58;
  filter: grayscale(0.2);
  pointer-events: none;
}

.roadmap-node.not_started .node-shape {
  border-color: rgba(108, 162, 186, 0.6);
  background: linear-gradient(160deg, #224256 0%, #183548 100%);
}

.roadmap-node.in_progress .node-shape {
  border-color: rgba(89, 186, 255, 0.85);
  box-shadow: 0 0 0 1px rgba(89, 186, 255, 0.48), 0 0 14px rgba(69, 168, 225, 0.22);
  animation: pulse-node 2.1s ease-in-out infinite;
}

.roadmap-node.completed .node-shape {
  border-color: rgba(83, 224, 172, 0.92);
  background: radial-gradient(circle at 30% 24%, #2f5f63 0%, #1a4448 45%, #13363a 100%);
  box-shadow: 0 0 0 1px rgba(83, 214, 169, 0.48), 0 0 16px rgba(68, 205, 157, 0.36);
  animation: glow-node 2.4s ease-in-out infinite;
}

.node-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
  min-width: 176px;
  max-width: 220px;
  background: rgba(13, 20, 31, 0.94);
  border: 1px solid rgba(121, 176, 201, 0.46);
  border-radius: 10px;
  color: #eef4ff;
  padding: 9px 11px;
  box-shadow: 0 12px 28px rgba(4, 7, 12, 0.45);
  pointer-events: none;
}

.node-tooltip p {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
}

.node-tooltip p + p {
  margin-top: 4px;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px);
}

@keyframes pulse-node {
  0%,
  100% {
    box-shadow: 0 0 0 1px rgba(89, 186, 255, 0.45), 0 0 10px rgba(69, 168, 225, 0.18);
  }

  50% {
    box-shadow: 0 0 0 1px rgba(102, 199, 255, 0.72), 0 0 16px rgba(70, 180, 235, 0.3);
  }
}

@keyframes glow-node {
  0%,
  100% {
    box-shadow: 0 0 0 1px rgba(83, 214, 169, 0.46), 0 0 12px rgba(68, 205, 157, 0.3);
  }

  50% {
    box-shadow: 0 0 0 1px rgba(109, 231, 191, 0.76), 0 0 18px rgba(78, 220, 175, 0.4);
  }
}
</style>
