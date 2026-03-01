<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import type { RoadmapNode as RoadmapTreeNode, TopicStatus } from "@/shared/mocks/mockRoadmaps"
import RoadmapNode from "@/features/roadmaps/components/RoadmapNode.vue"
import RoadmapConnection from "@/features/roadmaps/components/RoadmapConnection.vue"

interface PositionedNode {
  id: string
  node: RoadmapTreeNode
  parentId: string | null
  depth: number
  x: number
  y: number
}

interface Connection {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  active: boolean
}

const props = defineProps<{
  nodes: RoadmapTreeNode[]
}>()

const router = useRouter()
const viewportRef = ref<HTMLElement | null>(null)
const selectedNode = ref<RoadmapTreeNode | null>(null)

const nodeSize = 124
const transform = reactive({ x: 0, y: 0, scale: 1 })
const dragging = reactive({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 })
const dragPointer = reactive({ x: 0, y: 0 })
let resizeObserver: ResizeObserver | null = null
let hasAutoCentered = false
let dragFrameId = 0

const isUnlocked = (status: TopicStatus) => status !== "locked"

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const layout = computed(() => {
  const flat: PositionedNode[] = []
  const byDepth = new Map<number, PositionedNode[]>()
  let maxDepth = 0

  const walk = (nodes: RoadmapTreeNode[], depth: number, parentId: string | null) => {
    maxDepth = Math.max(maxDepth, depth)

    nodes.forEach((node) => {
      const item: PositionedNode = {
        id: node.id,
        node,
        parentId,
        depth,
        x: 0,
        y: 0
      }

      flat.push(item)

      if (!byDepth.has(depth)) {
        byDepth.set(depth, [])
      }

      byDepth.get(depth)?.push(item)

      if (node.children?.length) {
        walk(node.children, depth + 1, node.id)
      }
    })
  }

  walk(props.nodes, 0, null)

  const widestRow = Math.max(1, ...Array.from(byDepth.values(), (row) => row.length))
  const horizontalSpacing = 210
  const verticalSpacing = 190
  const width = Math.max(900, widestRow * horizontalSpacing + 280)
  const height = Math.max(560, (maxDepth + 1) * verticalSpacing + 220)

  // Dynamic layout: every depth level is centered and receives subtle deterministic offsets
  // so the tree remains readable but does not look like a strict table/grid.
  byDepth.forEach((row, depth) => {
    const rowWidth = (row.length - 1) * horizontalSpacing
    const rowStart = (width - rowWidth) / 2

    row.forEach((item, index) => {
      const seed = hashString(item.id)
      const organicX = (seed % 5 - 2) * 12 + (depth % 2 === 0 ? -16 : 16)
      const organicY = (seed % 3 - 1) * 10

      item.x = rowStart + index * horizontalSpacing + organicX
      item.y = 120 + depth * verticalSpacing + organicY
    })
  })

  const map = new Map(flat.map((item) => [item.id, item]))
  const connections: Connection[] = []

  flat.forEach((item) => {
    if (!item.parentId) return

    const parent = map.get(item.parentId)
    if (!parent) return

    connections.push({
      id: `${parent.id}-${item.id}`,
      from: {
        x: parent.x,
        y: parent.y + nodeSize / 2 - 2
      },
      to: {
        x: item.x,
        y: item.y - nodeSize / 2 + 2
      },
      active: isUnlocked(parent.node.status) && isUnlocked(item.node.status)
    })
  })

  return {
    width,
    height,
    nodes: flat,
    connections
  }
})

const stageStyle = computed(() => ({
  width: `${layout.value.width}px`,
  height: `${layout.value.height}px`,
  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`
}))

const selectedIsLeaf = computed(() => Boolean(selectedNode.value && !selectedNode.value.children?.length))
const selectedIsLocked = computed(() => selectedNode.value?.status === "locked")

const collectLeafNodes = (nodes: RoadmapTreeNode[]): RoadmapTreeNode[] => {
  return nodes.flatMap((node) => {
    if (node.children?.length) {
      return collectLeafNodes(node.children)
    }

    return [node]
  })
}

const progressStats = computed(() => {
  const leaves = collectLeafNodes(props.nodes)
  const total = leaves.length
  const completed = leaves.filter((node) => node.status === "completed").length
  const inProgress = leaves.filter((node) => node.status === "in_progress").length
  const locked = leaves.filter((node) => node.status === "locked").length
  const open = leaves.filter((node) => node.status === "not_started").length
  const completionPercent = total ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    inProgress,
    locked,
    open,
    completionPercent
  }
})

const statusTitles: Record<TopicStatus, string> = {
  locked: "Заблокировано",
  not_started: "Можно начать",
  in_progress: "В процессе",
  completed: "Завершено"
}

const statusDescriptions: Record<TopicStatus, string> = {
  locked: "Сначала завершите нужную родительскую ветку, чтобы открыть этот узел.",
  not_started: "Этот узел доступен. Откройте его, чтобы начать обучение и тест.",
  in_progress: "Вы уже начали эту тему. Продолжайте до завершения.",
  completed: "Все обязательные задачи по этой теме выполнены."
}

const selectedStatusTitle = computed(() => {
  if (!selectedNode.value) return ""
  return statusTitles[selectedNode.value.status]
})

const selectedStatusDescription = computed(() => {
  if (!selectedNode.value) return ""
  return statusDescriptions[selectedNode.value.status]
})

const autoCenter = () => {
  const viewport = viewportRef.value
  if (!viewport) return

  transform.scale = 1
  transform.x = (viewport.clientWidth - layout.value.width) / 2
  transform.y = Math.max(12, (viewport.clientHeight - layout.value.height) / 2)
  hasAutoCentered = true
}

watch(
  () => [layout.value.width, layout.value.height],
  () => {
    if (!hasAutoCentered) {
      autoCenter()
    }
  },
  { immediate: true }
)

const clampScale = (value: number) => Math.min(1.9, Math.max(0.65, value))

const onWheel = (event: WheelEvent) => {
  const viewport = viewportRef.value
  if (!viewport) return

  const zoomFactor = event.deltaY > 0 ? 0.92 : 1.08
  const nextScale = clampScale(transform.scale * zoomFactor)

  const rect = viewport.getBoundingClientRect()
  const pointerX = event.clientX - rect.left
  const pointerY = event.clientY - rect.top
  const worldX = (pointerX - transform.x) / transform.scale
  const worldY = (pointerY - transform.y) / transform.scale

  transform.scale = nextScale
  transform.x = pointerX - worldX * nextScale
  transform.y = pointerY - worldY * nextScale
}

const onPointerDown = (event: PointerEvent) => {
  const target = event.target as HTMLElement

  if (target.closest(".roadmap-node")) return
  if (event.button !== 0) return

  dragging.active = true
  dragging.startX = event.clientX
  dragging.startY = event.clientY
  dragging.baseX = transform.x
  dragging.baseY = transform.y

  viewportRef.value?.setPointerCapture(event.pointerId)
}

const onPointerMove = (event: PointerEvent) => {
  if (!dragging.active) return

  dragPointer.x = event.clientX
  dragPointer.y = event.clientY

  if (dragFrameId) return

  dragFrameId = window.requestAnimationFrame(() => {
    dragFrameId = 0
    transform.x = dragging.baseX + (dragPointer.x - dragging.startX)
    transform.y = dragging.baseY + (dragPointer.y - dragging.startY)
  })
}

const onPointerUp = (event: PointerEvent) => {
  if (!dragging.active) return

  if (dragFrameId) {
    window.cancelAnimationFrame(dragFrameId)
    dragFrameId = 0
  }

  transform.x = dragging.baseX + (event.clientX - dragging.startX)
  transform.y = dragging.baseY + (event.clientY - dragging.startY)
  dragging.active = false
  viewportRef.value?.releasePointerCapture(event.pointerId)
}

const openNodeDetails = (node: RoadmapTreeNode) => {
  if (node.status === "locked") return
  if (!node.children?.length) {
    router.push(`/topics/${node.id}`)
    return
  }

  selectedNode.value = node
}

const closeModal = () => {
  selectedNode.value = null
}

const openTopic = () => {
  if (!selectedNode.value || selectedNode.value.status === "locked") return
  if (selectedNode.value.children?.length) return

  router.push(`/topics/${selectedNode.value.id}`)
  closeModal()
}

const resetView = () => {
  autoCenter()
}

onMounted(() => {
  if (viewportRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (!hasAutoCentered) {
        autoCenter()
      }
    })

    resizeObserver.observe(viewportRef.value)
  }
})

onBeforeUnmount(() => {
  if (dragFrameId) {
    window.cancelAnimationFrame(dragFrameId)
  }
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="tree-shell">
    <div class="tree-progress-card">
      <div class="tree-progress-main">
        <p class="tree-progress-label">Прогресс Roadmap</p>
        <p class="tree-progress-value">{{ progressStats.completionPercent }}%</p>
      </div>
      <div class="tree-progress-visual">
        <div class="tree-progress-track">
          <span class="tree-progress-fill" :style="{ width: `${progressStats.completionPercent}%` }" />
        </div>
        <div class="tree-progress-stats">
          <span>Завершено: {{ progressStats.completed }}/{{ progressStats.total }}</span>
          <span>В процессе: {{ progressStats.inProgress }}</span>
          <span>Открыто: {{ progressStats.open }}</span>
          <span>Заблокировано: {{ progressStats.locked }}</span>
        </div>
      </div>
    </div>

    <div class="tree-toolbar">
      <div class="legend">
        <span class="legend-item completed">Завершено</span>
        <span class="legend-item in-progress">В процессе</span>
        <span class="legend-item available">Открыто</span>
        <span class="legend-item locked">Заблокировано</span>
      </div>
      <div class="tree-controls">
        <button type="button" class="secondary" @click="resetView">Сбросить вид</button>
      </div>
    </div>

    <div
      ref="viewportRef"
      class="tree-viewport"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="tree-stage" :class="{ dragging: dragging.active }" :style="stageStyle">
        <svg class="tree-connections" :viewBox="`0 0 ${layout.width} ${layout.height}`" xmlns="http://www.w3.org/2000/svg">
          <RoadmapConnection
            v-for="connection in layout.connections"
            :key="connection.id"
            :from="connection.from"
            :to="connection.to"
            :active="connection.active"
          />
        </svg>

        <RoadmapNode
          v-for="item in layout.nodes"
          :key="item.id"
          :node="item.node"
          :x="item.x"
          :y="item.y"
          :size="nodeSize"
          @select="openNodeDetails"
        />
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="selectedNode" class="node-modal-overlay" @click.self="closeModal">
        <div class="node-modal" role="dialog" aria-modal="true">
          <h3>{{ selectedNode.title }}</h3>
          <p class="status-pill">{{ selectedStatusTitle }}</p>
          <p class="status-text">{{ selectedStatusDescription }}</p>

          <p v-if="selectedNode.children?.length" class="status-note">
            В этой ветке {{ selectedNode.children.length }} дочерних узл(ов).
          </p>

          <div class="node-modal-actions">
            <button type="button" class="secondary" @click="closeModal">Закрыть</button>
            <button
              v-if="selectedIsLeaf && !selectedIsLocked"
              type="button"
              class="primary"
              @click="openTopic"
            >
              Открыть тему
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.tree-shell {
  border: 1px solid rgba(109, 181, 210, 0.34);
  border-radius: 18px;
  background:
    radial-gradient(620px 280px at 12% 2%, rgba(45, 138, 174, 0.2), transparent 62%),
    radial-gradient(520px 260px at 90% 10%, rgba(38, 122, 214, 0.2), transparent 58%),
    linear-gradient(180deg, #0d1f2b 0%, #0a1821 100%);
  box-shadow: inset 0 1px 0 rgba(151, 214, 237, 0.18), 0 20px 40px rgba(2, 10, 16, 0.3);
  padding: 14px;
}

.tree-progress-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
  border: 1px solid rgba(118, 198, 228, 0.34);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(21, 53, 72, 0.82) 0%, rgba(13, 38, 58, 0.82) 100%);
  padding: 12px;
  margin-bottom: 12px;
}

.tree-progress-main {
  min-width: 132px;
}

.tree-progress-label {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8fd4ec;
  font-weight: 700;
}

.tree-progress-value {
  margin: 4px 0 0;
  color: #effbff;
  font-size: 30px;
  line-height: 1;
  font-weight: 800;
}

.tree-progress-visual {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tree-progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(112, 153, 170, 0.35);
  overflow: hidden;
}

.tree-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #26c3a4 0%, #48a5ff 55%, #6f87ff 100%);
  box-shadow: 0 0 16px rgba(71, 173, 232, 0.52);
  transition: width 0.3s ease;
}

.tree-progress-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tree-progress-stats span {
  border: 1px solid rgba(134, 204, 231, 0.38);
  border-radius: 999px;
  color: #d4f4ff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  background: rgba(8, 30, 45, 0.45);
}

.tree-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid #d7e4f6;
  border-radius: 12px;
  padding: 10px;
  background: linear-gradient(180deg, #ffffff 0%, #f6fbff 100%);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-item {
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
  padding: 5px 10px;
  border: 1px solid transparent;
  background: #f7fbff;
}

.legend-item.completed {
  color: #2f7b66;
  border-color: #bfe6d9;
}

.legend-item.in-progress {
  color: #285f99;
  border-color: #bdd9fb;
}

.legend-item.available {
  color: #3a6287;
  border-color: #c8dff4;
}

.legend-item.locked {
  color: #667d95;
  border-color: #d2dfea;
}

.tree-viewport {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(93, 157, 186, 0.36);
  background:
    linear-gradient(rgba(53, 111, 132, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(53, 111, 132, 0.16) 1px, transparent 1px),
    linear-gradient(180deg, #102434 0%, #0c1d2b 100%);
  background-size: 36px 36px, 36px 36px, 100% 100%;
  min-height: 620px;
  touch-action: none;
}

.tree-stage {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
  transition: transform 0.15s ease-out;
}

.tree-stage.dragging {
  transition: none;
}

.tree-connections {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: visible;
  pointer-events: none;
}

.node-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  background: rgba(3, 7, 14, 0.62);
  padding: 16px;
}

.node-modal {
  width: min(420px, 100%);
  border-radius: 14px;
  border: 1px solid rgba(123, 186, 214, 0.4);
  background: linear-gradient(180deg, #163148 0%, #11283a 100%);
  color: #e2f5ff;
  padding: 18px;
  box-shadow: 0 24px 46px rgba(2, 6, 13, 0.55);
}

.node-modal h3 {
  margin: 0 0 10px;
}

.status-pill {
  margin: 0 0 8px;
  width: fit-content;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  border: 1px solid rgba(117, 179, 206, 0.5);
  padding: 4px 10px;
  color: #d3efff;
}

.status-text,
.status-note {
  margin: 0;
  color: #b9dff0;
  font-size: 14px;
}

.status-note {
  margin-top: 8px;
}

.node-modal-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 860px) {
  .tree-progress-card {
    grid-template-columns: 1fr;
  }

  .tree-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .tree-viewport {
    min-height: 540px;
  }
}
</style>
