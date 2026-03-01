<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDailyTasksStore } from "@/store/dailyTasks";
import AmbientMotionLayer from "@/components/AmbientMotionLayer.vue";

const THEME_STORAGE_KEY = "skilo-theme";
const DESKTOP_NAV_MEDIA_QUERY = "(min-width: 1100px)";
const DESKTOP_NAV_VISIBILITY_KEY = "skilo-desktop-nav-visible";
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
  ".app-main .community-post-card",
  ".app-main .leader-card",
  ".app-main .topic-card",
  ".app-main .daily-task-card",
  ".app-main section",
  ".app-main article"
].join(", ");

const theme = ref("light");
const isDarkTheme = computed(() => theme.value === "dark");
const isNavDrawerOpen = ref(false);
const isDesktopNavPinned = ref(false);
const isDesktopNavVisible = ref(true);
const router = useRouter();
const route = useRoute();
const dailyTasksStore = useDailyTasksStore();
let revealObserver = null;
let revealMutationObserver = null;
let revealFrameId = 0;
let desktopNavMediaQuery = null;
let onDesktopNavChange = null;

const isSideNavOpen = computed(() => {
  return isDesktopNavPinned.value ? isDesktopNavVisible.value : isNavDrawerOpen.value;
});

const primaryNavLinks = [
  {
    to: "/",
    label: "О проекте",
    iconPaths: ["M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"]
  },
  {
    to: "/roadmaps",
    label: "Дорожные карты",
    iconPaths: ["M4 6h16v12H4zM8 10h8M8 14h5"]
  },
  {
    to: "/daily-tasks",
    label: "Ежедневные задания",
    iconPaths: ["M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"]
  },
  {
    to: "/skill-verification",
    label: "Подтверждение навыков",
    iconPaths: ["M8 3h8M6 7h12M5 11h14M7 15h10M10 19h4", "M12 11v8"]
  },
  {
    to: "/skill-levels",
    label: "Определение уровня",
    iconPaths: ["M4 19h16M7 19V9M12 19V5M17 19v-7"]
  },
  {
    to: "/friends",
    label: "Друзья",
    iconPaths: ["M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M23 11h-6"]
  },
  {
    to: "/community",
    label: "Сообщество",
    iconPaths: ["M6 9h12M6 13h8M4 5h16v14H9l-5 3z"]
  },
  {
    to: "/vacancies",
    label: "Вакансии",
    iconPaths: ["M3 7h18v13H3zM8 7V5h8v2M3 12h18"]
  },
  {
    to: "/company",
    label: "Кабинет компании",
    iconPaths: ["M3 21h18M5 21V7l7-4 7 4v14M9 10h6M9 14h6"]
  },
  {
    to: "/leaders",
    label: "Лидеры",
    iconPaths: ["M8 4h8v2h3v2a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V6h3zM12 13v4M9 21h6"]
  },
  {
    to: "/profile",
    label: "Профиль",
    iconPaths: ["M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"]
  }
];

const dailyReminderMessage = computed(() => {
  return `Сегодня доступно ${dailyTasksStore.pendingTodayCount} заданий на +${Math.max(0, dailyTasksStore.todayTotalPoints - dailyTasksStore.earnedTodayPoints)} очков`;
});

const footerColumns = [
  {
    title: "Платформа",
    links: [
      { label: "О проекте", to: "/" },
      { label: "Дорожные карты", to: "/roadmaps" },
      { label: "Ежедневные задания", to: "/daily-tasks" },
      { label: "Определение уровня", to: "/skill-levels" }
    ]
  },
  {
    title: "Карьера",
    links: [
      { label: "Подтверждение навыков", to: "/skill-verification" },
      { label: "Вакансии", to: "/vacancies" },
      { label: "Лидеры", to: "/leaders" },
      { label: "Профиль", to: "/profile" }
    ]
  },
  {
    title: "Сообщество",
    links: [
      { label: "Публикации", to: "/community" },
      { label: "Друзья", to: "/friends" },
      { label: "Кабинет компании", to: "/company" }
    ]
  }
];

const currentYear = new Date().getFullYear();

function applyTheme(nextTheme) {
  const normalizedTheme = nextTheme === "dark" ? "dark" : "light";
  theme.value = normalizedTheme;
  document.documentElement.setAttribute("data-theme", normalizedTheme);
}

function toggleTheme() {
  applyTheme(isDarkTheme.value ? "light" : "dark");
}

function closeNavDrawer() {
  if (isDesktopNavPinned.value) {
    isDesktopNavVisible.value = false;
    return;
  }

  isNavDrawerOpen.value = false;
}

function toggleNavDrawer() {
  if (isDesktopNavPinned.value) {
    isDesktopNavVisible.value = !isDesktopNavVisible.value;
  } else {
    isNavDrawerOpen.value = !isNavDrawerOpen.value;
  }
}

function handleNavLinkClick() {
  if (!isDesktopNavPinned.value) {
    closeNavDrawer();
  }
}

function openDailyTasksFromReminder() {
  dailyTasksStore.dismissReminderForToday();
  router.push("/daily-tasks");
}

function dismissDailyReminder() {
  dailyTasksStore.dismissReminderForToday();
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
  desktopNavMediaQuery = window.matchMedia(DESKTOP_NAV_MEDIA_QUERY);
  onDesktopNavChange = (event) => {
    isDesktopNavPinned.value = event.matches;
    if (event.matches) {
      isNavDrawerOpen.value = false;
    }
  };

  onDesktopNavChange(desktopNavMediaQuery);
  desktopNavMediaQuery.addEventListener("change", onDesktopNavChange);

  const storedDesktopNavVisibility = localStorage.getItem(DESKTOP_NAV_VISIBILITY_KEY);
  if (storedDesktopNavVisibility === "0") {
    isDesktopNavVisible.value = false;
  }

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

watch(isDesktopNavVisible, (isVisible) => {
  localStorage.setItem(DESKTOP_NAV_VISIBILITY_KEY, isVisible ? "1" : "0");
});

watch(isNavDrawerOpen, (isOpen) => {
  if (isDesktopNavPinned.value) {
    document.body.style.overflow = "";
    return;
  }

  document.body.style.overflow = isOpen ? "hidden" : "";
});

watch(
  () => route.fullPath,
  () => {
    if (!isDesktopNavPinned.value) {
      closeNavDrawer();
    }
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

  if (desktopNavMediaQuery) {
    if (onDesktopNavChange) {
      desktopNavMediaQuery.removeEventListener("change", onDesktopNavChange);
      onDesktopNavChange = null;
    }
    desktopNavMediaQuery = null;
  }

  document.body.style.overflow = "";
});
</script>

<template>
  <div
    class="app-shell"
    :class="{ 'nav-docked': isDesktopNavPinned, 'nav-docked-collapsed': isDesktopNavPinned && !isDesktopNavVisible }"
  >
    <header class="top-nav">
      <div class="top-nav-inner">
        <div class="top-nav-left">
          <button
            type="button"
            class="top-nav-menu"
            :aria-expanded="isSideNavOpen ? 'true' : 'false'"
            aria-controls="side-navigation"
            aria-label="Меню навигации"
            @click="toggleNavDrawer"
          >
            <span class="top-nav-menu-icon" aria-hidden="true" />
            <span>Меню</span>
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

    <transition name="nav-drawer-fade">
      <div
        v-if="isSideNavOpen && !isDesktopNavPinned"
        class="side-nav-backdrop"
        aria-hidden="true"
        @click="closeNavDrawer"
      />
    </transition>

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
        <router-link to="/" class="top-brand" @click="closeNavDrawer">Skillo</router-link>
        <button type="button" class="side-nav-close" aria-label="Закрыть меню" @click="closeNavDrawer">
          Закрыть
        </button>
      </header>

      <nav class="side-nav-links" aria-label="Разделы платформы">
        <router-link
          v-for="link in primaryNavLinks"
          :key="link.to"
          :to="link.to"
          @click="handleNavLinkClick"
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

    <main class="app-main">
      <transition name="daily-reminder">
        <aside v-if="dailyTasksStore.isReminderVisible" class="daily-reminder ambient-host">
          <AmbientMotionLayer mode="panel" edge-fade="soft" intensity="low" />
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
            <router-link
              v-for="link in column.links"
              :key="link.to"
              :to="link.to"
            >
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
  </div>
</template>
