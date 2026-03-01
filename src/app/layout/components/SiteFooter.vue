<script setup>
import AmbientMotionLayer from "@/shared/ui/AmbientMotionLayer.vue"

defineProps({
  footerColumns: {
    type: Array,
    default: () => []
  },
  currentYear: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <footer class="site-footer ambient-host">
    <AmbientMotionLayer mode="panel" edge-fade="soft" intensity="low" />

    <div class="site-footer-inner">
      <div class="site-footer-brand">
        <h3>Skillo</h3>
        <p>Единая платформа развития навыков: обучение, практика, сообщество и карьерный рост.</p>
      </div>

      <div class="site-footer-columns">
        <article v-for="column in footerColumns" :key="column.title" class="site-footer-column">
          <h4>{{ column.title }}</h4>
          <router-link v-for="link in column.links" :key="link.to" :to="link.to">
            {{ link.label }}
          </router-link>
        </article>
      </div>
    </div>

    <div class="site-footer-bottom">
      <span>© {{ currentYear }} Skillo. Все права защищены.</span>
      <div class="site-footer-tags">
        <span>Roadmaps</span>
        <span>Practice</span>
        <span>Career</span>
      </div>
    </div>
  </footer>
</template>
