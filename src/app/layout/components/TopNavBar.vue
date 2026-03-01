<script setup>
defineProps({
  isSideNavOpen: {
    type: Boolean,
    default: false
  },
  isDarkTheme: {
    type: Boolean,
    default: false
  }
})

defineEmits(["toggle-nav", "toggle-theme"])
</script>

<template>
  <header class="top-nav">
    <div class="top-nav-inner">
      <div class="top-nav-left">
        <button
          type="button"
          class="top-nav-menu"
          :aria-expanded="isSideNavOpen ? 'true' : 'false'"
          aria-controls="side-navigation"
          aria-label="Меню навигации"
          @click="$emit('toggle-nav')"
        >
          <span class="top-nav-menu-icon" aria-hidden="true" />
        </button>

        <router-link to="/" class="top-brand">Skillo</router-link>
      </div>

      <div class="top-nav-actions">
        <router-link to="/profile" class="top-profile-link" aria-label="Профиль">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
          </svg>
        </router-link>

        <button
          type="button"
          class="theme-toggle"
          :aria-label="isDarkTheme ? 'Включить светлую тему' : 'Включить ночную тему'"
          @click="$emit('toggle-theme')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              v-if="isDarkTheme"
              d="M12 3v2M12 19v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M3 12h2M19 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
            />
            <path
              v-else
              d="M21 12.79A9 9 0 1 1 11.21 3c-.18.62-.27 1.27-.27 1.94A7.5 7.5 0 0 0 18.06 12c.67 0 1.32-.09 1.94-.27Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
