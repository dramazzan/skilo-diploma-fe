<script setup lang="ts">
import { computed } from "vue"

interface Point {
  x: number
  y: number
}

const props = defineProps<{
  from: Point
  to: Point
  active: boolean
}>()

const pathD = computed(() => {
  const dx = props.to.x - props.from.x
  const curvature = Math.max(70, Math.abs(dx) * 0.35)
  const c1x = props.from.x
  const c1y = props.from.y + curvature
  const c2x = props.to.x
  const c2y = props.to.y - curvature

  return `M ${props.from.x} ${props.from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${props.to.x} ${props.to.y}`
})
</script>

<template>
  <path
    :d="pathD"
    class="connection"
    :class="{ active }"
    pathLength="1"
  />
</template>

<style scoped>
.connection {
  fill: none;
  stroke: rgba(116, 171, 192, 0.45);
  stroke-width: 2;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  transition: stroke 0.3s ease;
}

.connection.active {
  stroke: rgba(82, 190, 255, 0.85);
  stroke-width: 2.4;
  animation: draw-connection 0.7s ease;
}

@keyframes draw-connection {
  from {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }

  to {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
  }
}
</style>
