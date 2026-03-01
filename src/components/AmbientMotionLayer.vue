<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    mode?: "hero" | "soft" | "cta" | "panel"
    seamless?: boolean
    edgeFade?: "none" | "soft" | "wide"
    intensity?: "low" | "medium" | "high"
  }>(),
  {
    mode: "soft",
    seamless: true,
    edgeFade: "wide",
    intensity: "medium"
  }
)

const layerClass = computed(() => [
  "ambient-motion-layer",
  `mode-${props.mode}`,
  `edge-${props.edgeFade}`,
  `intensity-${props.intensity}`,
  { seamless: props.seamless }
])
</script>

<template>
  <div :class="layerClass" aria-hidden="true">
    <span class="orb orb-one" />
    <span class="orb orb-two" />
    <span class="orb orb-three" />
    <span class="halo halo-one" />
    <span class="halo halo-two" />
    <span class="mesh" />
    <span class="scan" />
  </div>
</template>

<style scoped>
.ambient-motion-layer {
  --orb-opacity: 0.45;
  --mesh-opacity: 0.2;
  --scan-opacity: 0.2;
  --halo-opacity: 0.2;
  --halo-border: rgba(24, 24, 24, 0.24);
  --mesh-line-rgb: 22, 22, 22;
  --mesh-line-alpha: 0.12;
  --scan-rgb: 10, 10, 10;
  --scan-core-alpha: 0.16;
  --top-scrim: rgba(8, 8, 8, 0.06);
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.85;
}

.ambient-motion-layer.seamless.edge-wide {
  inset: -20%;
  -webkit-mask-image: radial-gradient(132% 128% at 50% 50%, #000 55%, transparent 100%);
  mask-image: radial-gradient(132% 128% at 50% 50%, #000 55%, transparent 100%);
}

.ambient-motion-layer.seamless.edge-soft {
  inset: -12%;
  -webkit-mask-image: radial-gradient(122% 120% at 50% 50%, #000 66%, transparent 100%);
  mask-image: radial-gradient(122% 120% at 50% 50%, #000 66%, transparent 100%);
}

.ambient-motion-layer.edge-none {
  inset: 0;
  -webkit-mask-image: none;
  mask-image: none;
}

.ambient-motion-layer::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--top-scrim) 0%, rgba(8, 8, 8, 0) 58%);
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(1px);
  opacity: var(--orb-opacity);
}

.orb-one {
  width: 330px;
  height: 330px;
  left: -100px;
  top: -120px;
  animation: orb-one 15s ease-in-out infinite;
}

.orb-two {
  width: 300px;
  height: 300px;
  right: -90px;
  top: -100px;
  animation: orb-two 17s ease-in-out infinite;
}

.orb-three {
  width: 360px;
  height: 360px;
  left: 30%;
  bottom: -220px;
  animation: orb-three 20s ease-in-out infinite;
}

.halo {
  position: absolute;
  border-radius: 999px;
  border: 1px solid var(--halo-border);
  opacity: var(--halo-opacity);
}

.halo-one {
  width: 420px;
  height: 420px;
  left: -120px;
  bottom: -220px;
  animation: halo-pulse 18s ease-in-out infinite;
}

.halo-two {
  width: 360px;
  height: 360px;
  right: -80px;
  top: -180px;
  animation: halo-pulse 20s ease-in-out infinite reverse;
}

.mesh {
  position: absolute;
  inset: -22%;
  background:
    linear-gradient(rgba(var(--mesh-line-rgb), var(--mesh-line-alpha)) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--mesh-line-rgb), var(--mesh-line-alpha)) 1px, transparent 1px);
  background-size: 56px 56px;
  opacity: var(--mesh-opacity);
  transform: perspective(760px) rotateX(52deg) translateY(-16px);
  transform-origin: center top;
  animation: mesh-drift 24s linear infinite;
}

.scan {
  position: absolute;
  inset: -16%;
  background: linear-gradient(
    104deg,
    rgba(var(--scan-rgb), 0) 34%,
    rgba(var(--scan-rgb), var(--scan-core-alpha)) 49%,
    rgba(var(--scan-rgb), 0) 64%
  );
  opacity: var(--scan-opacity);
  animation: scan-sweep 8s ease-in-out infinite;
}

.intensity-low {
  --orb-opacity: 0.3;
  --mesh-opacity: 0.14;
  --scan-opacity: 0.12;
  --halo-opacity: 0.1;
  --mesh-line-alpha: 0.1;
  --scan-core-alpha: 0.12;
}

.intensity-medium {
  --orb-opacity: 0.52;
  --mesh-opacity: 0.26;
  --scan-opacity: 0.24;
  --halo-opacity: 0.2;
  --mesh-line-alpha: 0.13;
  --scan-core-alpha: 0.18;
}

.intensity-high {
  --orb-opacity: 0.64;
  --mesh-opacity: 0.32;
  --scan-opacity: 0.32;
  --halo-opacity: 0.3;
  --mesh-line-alpha: 0.16;
  --scan-core-alpha: 0.22;
}

.mode-hero .orb-one {
  background: radial-gradient(circle, rgba(122, 122, 122, 0.2) 0%, rgba(122, 122, 122, 0) 72%);
}

.mode-hero .orb-two {
  background: radial-gradient(circle, rgba(165, 165, 165, 0.18) 0%, rgba(165, 165, 165, 0) 72%);
}

.mode-hero .orb-three {
  background: radial-gradient(circle, rgba(96, 96, 96, 0.16) 0%, rgba(96, 96, 96, 0) 74%);
}

.mode-soft {
  opacity: 0.78;
}

.mode-soft .orb-one {
  background: radial-gradient(circle, rgba(150, 150, 150, 0.16) 0%, rgba(150, 150, 150, 0) 72%);
}

.mode-soft .orb-two {
  background: radial-gradient(circle, rgba(122, 122, 122, 0.14) 0%, rgba(122, 122, 122, 0) 72%);
}

.mode-soft .orb-three {
  background: radial-gradient(circle, rgba(172, 172, 172, 0.14) 0%, rgba(172, 172, 172, 0) 74%);
}

.mode-soft .mesh {
  opacity: 0.15;
}

.mode-cta {
  opacity: 0.86;
}

.mode-cta .orb-one {
  background: radial-gradient(circle, rgba(130, 130, 130, 0.16) 0%, rgba(130, 130, 130, 0) 70%);
}

.mode-cta .orb-two {
  background: radial-gradient(circle, rgba(184, 184, 184, 0.14) 0%, rgba(184, 184, 184, 0) 74%);
}

.mode-cta .orb-three {
  background: radial-gradient(circle, rgba(108, 108, 108, 0.14) 0%, rgba(108, 108, 108, 0) 74%);
}

.mode-panel {
  opacity: 0.72;
}

.mode-panel .orb-one {
  background: radial-gradient(circle, rgba(144, 144, 144, 0.16) 0%, rgba(144, 144, 144, 0) 72%);
}

.mode-panel .orb-two {
  background: radial-gradient(circle, rgba(108, 108, 108, 0.15) 0%, rgba(108, 108, 108, 0) 72%);
}

.mode-panel .orb-three {
  background: radial-gradient(circle, rgba(174, 174, 174, 0.12) 0%, rgba(174, 174, 174, 0) 74%);
}

.mode-panel .mesh {
  opacity: 0.12;
}

.mode-panel .scan {
  opacity: 0.09;
}

:global(:root[data-theme="dark"]) .ambient-motion-layer {
  --halo-border: rgba(255, 255, 255, 0.22);
  --mesh-line-rgb: 255, 255, 255;
  --mesh-line-alpha: 0.08;
  --scan-rgb: 255, 255, 255;
  --scan-core-alpha: 0.18;
  --top-scrim: rgba(245, 245, 245, 0.05);
}

@keyframes orb-one {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(24px, 24px, 0);
  }
}

@keyframes orb-two {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-28px, 20px, 0);
  }
}

@keyframes orb-three {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(16px, -22px, 0);
  }
}

@keyframes halo-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: var(--halo-opacity);
  }
  50% {
    transform: scale(1.07);
    opacity: calc(var(--halo-opacity) * 0.6);
  }
}

@keyframes mesh-drift {
  0% {
    transform: perspective(760px) rotateX(52deg) translateY(-16px) translateX(0);
  }
  100% {
    transform: perspective(760px) rotateX(52deg) translateY(-16px) translateX(-56px);
  }
}

@keyframes scan-sweep {
  0% {
    transform: translateX(-42%);
  }
  50% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(42%);
  }
}

@media (max-width: 680px) {
  .mesh {
    inset: -28%;
    background-size: 44px 44px;
    transform: perspective(620px) rotateX(54deg) translateY(-14px);
  }

  .orb-three {
    left: 22%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orb,
  .halo,
  .mesh,
  .scan {
    animation: none !important;
    transform: none !important;
  }
}
</style>
