<script setup>
import { computed, onMounted, ref, watch } from "vue";

const THEME_STORAGE_KEY = "skilo-theme";
const theme = ref("light");
const isDarkTheme = computed(() => theme.value === "dark");

function applyTheme(nextTheme) {
  const normalizedTheme = nextTheme === "dark" ? "dark" : "light";
  theme.value = normalizedTheme;
  document.documentElement.setAttribute("data-theme", normalizedTheme);
}

function toggleTheme() {
  applyTheme(isDarkTheme.value ? "light" : "dark");
}

onMounted(() => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    applyTheme(storedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
});

watch(theme, (nextTheme) => {
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
});
</script>

<template>
  <div class="app-shell">
    <header class="top-nav">
      <div class="top-nav-inner">
        <router-link to="/roadmaps" class="top-brand">Skilo</router-link>
        <nav class="top-nav-menu">
          <div class="nav-section">
            <p class="nav-section-title">Обучение</p>
            <div class="top-nav-links">
              <router-link to="/roadmaps">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM8 10h8M8 14h5" /></svg>
                <span>Дорожные карты</span>
              </router-link>
              <router-link to="/friends">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M23 11h-6" /></svg>
                <span>Друзья</span>
              </router-link>
            </div>
          </div>

          <div class="nav-section">
            <p class="nav-section-title">Карьера</p>
            <div class="top-nav-links">
              <router-link to="/vacancies">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18v13H3zM8 7V5h8v2M3 12h18" /></svg>
                <span>Вакансии</span>
              </router-link>
              <router-link to="/company">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h6M9 14h6" /></svg>
                <span>Кабинет компании</span>
              </router-link>
              <router-link to="/leaders">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v2h3v2a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V6h3zM12 13v4M9 21h6" /></svg>
                <span>Лидеры</span>
              </router-link>
            </div>
          </div>

          <div class="nav-section">
            <p class="nav-section-title">Аккаунт</p>
            <div class="top-nav-links">
              <router-link to="/profile">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" /></svg>
                <span>Профиль</span>
              </router-link>
              <router-link to="/login">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
                <span>Вход</span>
              </router-link>
            </div>
          </div>
        </nav>

        <button
          type="button"
          class="theme-toggle chip"
          :aria-label="isDarkTheme ? 'Включить светлую тему' : 'Включить ночную тему'"
          @click="toggleTheme"
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
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>
