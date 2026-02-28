<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDailyTasksStore } from "@/store/dailyTasks";
import { useAuthStore } from "@/store/auth";

const THEME_STORAGE_KEY = "skilo-theme";
const REVEAL_SELECTOR = [
  ".app-main .hero-card",
  ".app-main .card",
  ".app-main .profile-card",
  ".app-main .roadmap-card",
  ".app-main .assessment-card",
  ".app-main .question-card",
  ".app-main .direction-card",
  ".app-main .result-card",
  ".app-main .vacancy-card",
  ".app-main .friend-card",
  ".app-main .leader-card",
  ".app-main .topic-card",
  ".app-main .daily-task-card",
  ".app-main section",
  ".app-main article"
].join(", ");

const theme = ref("light");
const isDarkTheme = computed(() => theme.value === "dark");
const router = useRouter();
const route = useRoute();
const dailyTasksStore = useDailyTasksStore();
const authStore = useAuthStore();
let revealObserver = null;
let revealMutationObserver = null;
let revealFrameId = 0;

const dailyReminderMessage = computed(() => {
  return `Сегодня доступно ${dailyTasksStore.pendingTodayCount} заданий на +${Math.max(0, dailyTasksStore.todayTotalPoints - dailyTasksStore.earnedTodayPoints)} очков`;
});

function applyTheme(nextTheme) {
  const normalizedTheme = nextTheme === "dark" ? "dark" : "light";
  theme.value = normalizedTheme;
  document.documentElement.setAttribute("data-theme", normalizedTheme);
}

function toggleTheme() {
  applyTheme(isDarkTheme.value ? "light" : "dark");
}

function openDailyTasksFromReminder() {
  dailyTasksStore.dismissReminderForToday();
  router.push("/daily-tasks");
}

function dismissDailyReminder() {
  dailyTasksStore.dismissReminderForToday();
}

function logout() {
  authStore.logout();
  router.push("/login");
}

function shouldAnimateReveal(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.classList.contains("reveal-visible")) return false;
  if (element.closest(".daily-reminder")) return false;
  if (element.closest('[role="dialog"]')) return false;
  if (element.offsetHeight < 64 && element.offsetWidth < 180) return false;
  return true;
}

function ensureRevealObserver() {
  if (revealObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        element.classList.add("reveal-visible");
        observer.unobserve(element);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealObserver = observer;
}

function applyRevealAnimations() {
  ensureRevealObserver();
  if (!revealObserver) return;

  const revealElements = document.querySelectorAll(REVEAL_SELECTOR);

  revealElements.forEach((element, index) => {
    if (!shouldAnimateReveal(element)) return;
    if (element.classList.contains("reveal-on-scroll")) return;

    element.classList.add("reveal-on-scroll");
    element.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 35}ms`);
    revealObserver.observe(element);
  });
}

function scheduleRevealScan() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  if (revealFrameId) {
    window.cancelAnimationFrame(revealFrameId);
  }

  revealFrameId = window.requestAnimationFrame(() => {
    revealFrameId = 0;
    applyRevealAnimations();
  });
}

onMounted(() => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    applyTheme(storedTheme);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  dailyTasksStore.ensureTodayTasks();

  nextTick(() => {
    scheduleRevealScan();

    const appMain = document.querySelector(".app-main");
    if (!appMain) return;

    revealMutationObserver = new MutationObserver(() => {
      scheduleRevealScan();
    });
    revealMutationObserver.observe(appMain, {
      childList: true,
      subtree: true
    });
  });
});

watch(theme, (nextTheme) => {
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
});

watch(
  () => route.fullPath,
  () => {
    nextTick(() => {
      scheduleRevealScan();
    });
  }
);

onBeforeUnmount(() => {
  if (revealFrameId) {
    window.cancelAnimationFrame(revealFrameId);
    revealFrameId = 0;
  }

  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }

  if (revealMutationObserver) {
    revealMutationObserver.disconnect();
    revealMutationObserver = null;
  }
});
</script>

<template>
  <div class="app-shell">
    <header class="top-nav">
      <div class="top-nav-inner">
        <div class="top-nav-left">
          <router-link to="/roadmaps" class="top-brand">Skilo</router-link>

          <nav class="top-nav-links" aria-label="Навигация">
            <router-link to="/roadmaps">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM8 10h8M8 14h5" /></svg>
              <span>Дорожные карты</span>
            </router-link>
            <router-link to="/daily-tasks">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
              <span>Ежедневные задания</span>
            </router-link>
            <router-link to="/skill-verification">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8M6 7h12M5 11h14M7 15h10M10 19h4" /><path d="M12 11v8" /></svg>
              <span>Подтверждение навыков</span>
            </router-link>
            <router-link to="/skill-levels">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16M7 19V9M12 19V5M17 19v-7" /></svg>
              <span>Определение уровня</span>
            </router-link>
            <router-link to="/friends">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M23 11h-6" /></svg>
              <span>Друзья</span>
            </router-link>
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
            <router-link to="/profile">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" /></svg>
              <span>Профиль</span>
            </router-link>
          </nav>
        </div>

        <div class="top-nav-actions">
          <button type="button" class="top-logout" @click="logout">Выход</button>

          <button
            type="button"
            class="theme-toggle"
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
      </div>
    </header>

    <main class="app-main">
      <transition name="daily-reminder">
        <aside v-if="dailyTasksStore.isReminderVisible" class="daily-reminder">
          <div class="daily-reminder-text">
            <strong>Ежедневное напоминание</strong>
            <p>{{ dailyReminderMessage }}</p>
          </div>
          <div class="daily-reminder-actions">
            <button type="button" class="daily-reminder-btn daily-reminder-btn--primary" @click="openDailyTasksFromReminder">
              Открыть задания
            </button>
            <button type="button" class="daily-reminder-btn" @click="dismissDailyReminder">
              Скрыть
            </button>
          </div>
        </aside>
      </transition>

      <router-view v-slot="{ Component }">
        <transition name="route-fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>
