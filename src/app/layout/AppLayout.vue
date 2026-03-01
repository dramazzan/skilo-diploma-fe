<script setup>
import { computed, nextTick, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useDailyTasksStore } from "@/features/daily-tasks/store/dailyTasks"
import { useAppTheme } from "@/app/layout/composables/useAppTheme"
import { useResponsiveSideNav } from "@/app/layout/composables/useResponsiveSideNav"
import { useRevealOnScroll } from "@/app/layout/composables/useRevealOnScroll"
import { footerColumns, primaryNavLinks } from "@/app/layout/config/navigation"
import TopNavBar from "@/app/layout/components/TopNavBar.vue"
import SideNavigation from "@/app/layout/components/SideNavigation.vue"
import DailyReminderBanner from "@/app/layout/components/DailyReminderBanner.vue"
import SiteFooter from "@/app/layout/components/SiteFooter.vue"

const route = useRoute()
const router = useRouter()
const dailyTasksStore = useDailyTasksStore()
const currentYear = new Date().getFullYear()

const isAuthRoute = computed(() => route.meta.layout === "auth")
const dailyReminderMessage = computed(() => {
  return `Сегодня доступно ${dailyTasksStore.pendingTodayCount} заданий на +${Math.max(0, dailyTasksStore.todayTotalPoints - dailyTasksStore.earnedTodayPoints)} очков`
})

const { isDarkTheme, toggleTheme } = useAppTheme()
const {
  isDesktopNavPinned,
  isDesktopNavVisible,
  isSideNavOpen,
  closeNavDrawer,
  toggleNavDrawer,
  handleNavLinkClick
} = useResponsiveSideNav()
const { scheduleRevealScan } = useRevealOnScroll()

const openDailyTasksFromReminder = () => {
  dailyTasksStore.dismissReminderForToday()
  router.push("/daily-tasks")
}

const dismissDailyReminder = () => {
  dailyTasksStore.dismissReminderForToday()
}

onMounted(() => {
  dailyTasksStore.ensureTodayTasks()
})

watch(
  () => route.fullPath,
  () => {
    if (!isDesktopNavPinned.value) {
      closeNavDrawer()
    }

    nextTick(() => {
      scheduleRevealScan()
    })
  }
)
</script>

<template>
  <div
    class="app-shell"
    :class="{
      'nav-docked': isDesktopNavPinned,
      'nav-docked-collapsed': isDesktopNavPinned && !isDesktopNavVisible,
      'auth-layout': isAuthRoute
    }"
  >
    <TopNavBar
      v-if="!isAuthRoute"
      :is-side-nav-open="isSideNavOpen"
      :is-dark-theme="isDarkTheme"
      @toggle-nav="toggleNavDrawer"
      @toggle-theme="toggleTheme"
    />

    <transition name="nav-drawer-fade">
      <div
        v-if="!isAuthRoute && isSideNavOpen && !isDesktopNavPinned"
        class="side-nav-backdrop"
        aria-hidden="true"
        @click="closeNavDrawer"
      />
    </transition>

    <SideNavigation
      v-if="!isAuthRoute"
      :is-side-nav-open="isSideNavOpen"
      :primary-nav-links="primaryNavLinks"
      @close-nav="closeNavDrawer"
      @nav-link-click="handleNavLinkClick"
    />

    <main class="app-main" :class="{ 'app-main--auth': isAuthRoute }">
      <DailyReminderBanner
        :visible="!isAuthRoute && dailyTasksStore.isReminderVisible"
        :message="dailyReminderMessage"
        @open="openDailyTasksFromReminder"
        @dismiss="dismissDailyReminder"
      />

      <router-view v-slot="{ Component }">
        <transition name="route-fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <SiteFooter
      v-if="!isAuthRoute"
      :footer-columns="footerColumns"
      :current-year="currentYear"
    />
  </div>
</template>
