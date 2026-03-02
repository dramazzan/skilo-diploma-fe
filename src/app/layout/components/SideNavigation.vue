<script setup>
import logoS from "@/assets/logo-s-ai.svg"
import AmbientMotionLayer from "@/shared/ui/AmbientMotionLayer.vue"

defineProps({
  isSideNavOpen: {
    type: Boolean,
    default: false
  },
  primaryNavLinks: {
    type: Array,
    default: () => []
  }
})

defineEmits(["close-nav", "nav-link-click"])
</script>

<template>
  <aside
    id="side-navigation"
    class="side-nav ambient-host"
    :class="{ open: isSideNavOpen }"
    role="navigation"
    aria-label="Основная навигация"
    :aria-hidden="isSideNavOpen ? 'false' : 'true'"
  >
    <AmbientMotionLayer mode="panel" edge-fade="soft" intensity="low" />

    <header class="side-nav-head">
      <router-link to="/" class="top-brand" aria-label="Skillo" @click="$emit('close-nav')">
        <img :src="logoS" alt="" class="top-brand-icon" width="34" height="34" />
        <span>Skillo</span>
      </router-link>
      <button type="button" class="side-nav-icon-btn" aria-label="Закрыть навигацию" @click="$emit('close-nav')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </header>

    <nav class="side-nav-links" aria-label="Разделы платформы">
      <router-link
        v-for="link in primaryNavLinks"
        :key="link.to"
        :to="link.to"
        @click="$emit('nav-link-click')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path v-for="(path, index) in link.iconPaths" :key="`${link.to}-${index}`" :d="path" />
        </svg>
        <span>{{ link.label }}</span>
      </router-link>
    </nav>

    <footer class="side-nav-footer" aria-label="Информация меню">
      <small>Skillo • навигация платформы</small>
    </footer>
  </aside>
</template>
