<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import {
  api,
  type LeaderboardEntry,
  type LeaderboardResponse
} from "@/services/api"
import { useAuthStore } from "@/store/auth"

const authStore = useAuthStore()
const loading = ref(true)
const error = ref<string | null>(null)
const leaderboard = ref<LeaderboardResponse | null>(null)
const selectedLeader = ref<LeaderboardEntry | null>(null)

const selectedCountry = ref<string>("all")
const selectedCity = ref<string>("all")
const selectedUniversity = ref<string>("all")

const leaders = computed(() => leaderboard.value?.leaders ?? [])
const currentUser = computed(() => leaderboard.value?.currentUser ?? null)

const countryOptions = computed(() => {
  return [...new Set(leaders.value.map((leader) => leader.country))].sort((a, b) => a.localeCompare(b))
})

const cityOptions = computed(() => {
  return [
    ...new Set(
      leaders.value
        .filter((leader) => selectedCountry.value === "all" || leader.country === selectedCountry.value)
        .map((leader) => leader.city)
    )
  ].sort((a, b) => a.localeCompare(b))
})

const universityOptions = computed(() => {
  return [
    ...new Set(
      leaders.value
        .filter((leader) => selectedCountry.value === "all" || leader.country === selectedCountry.value)
        .filter((leader) => selectedCity.value === "all" || leader.city === selectedCity.value)
        .map((leader) => leader.university)
    )
  ].sort((a, b) => a.localeCompare(b))
})

watch(countryOptions, (options) => {
  if (selectedCountry.value !== "all" && !options.includes(selectedCountry.value)) {
    selectedCountry.value = "all"
  }
})

watch(cityOptions, (options) => {
  if (selectedCity.value !== "all" && !options.includes(selectedCity.value)) {
    selectedCity.value = "all"
  }
})

watch(universityOptions, (options) => {
  if (selectedUniversity.value !== "all" && !options.includes(selectedUniversity.value)) {
    selectedUniversity.value = "all"
  }
})

const filteredLeaders = computed(() => {
  return leaders.value.filter((leader) => {
    if (selectedCountry.value !== "all" && leader.country !== selectedCountry.value) return false
    if (selectedCity.value !== "all" && leader.city !== selectedCity.value) return false
    if (selectedUniversity.value !== "all" && leader.university !== selectedUniversity.value) return false
    return true
  })
})

const rankedFilteredLeaders = computed(() => {
  return filteredLeaders.value.map((leader, index) => ({
    ...leader,
    filteredRank: index + 1
  }))
})

const filteredCurrentUser = computed(() => {
  const me = currentUser.value
  if (!me) return null
  return rankedFilteredLeaders.value.find((leader) => leader.userId === me.userId) ?? null
})

const loadLeaders = async () => {
  try {
    loading.value = true
    error.value = null
    leaderboard.value = await api.getLeaderboard(authStore.user?.id ?? null)
  } catch {
    error.value = "Не удалось загрузить рейтинг"
  } finally {
    loading.value = false
  }
}

const openLeader = (leader: LeaderboardEntry) => {
  selectedLeader.value = leader
}

const closeLeader = () => {
  selectedLeader.value = null
}

onMounted(() => {
  void loadLeaders()
})
</script>

<template>
  <div class="leaders-page">
    <!-- Header -->
    <header class="page-header">
      <h1>Лидеры</h1>
      <p>Рейтинг по очкам за тесты, активности и прогрессу</p>
    </header>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-item">
        <span>Страна</span>
        <select v-model="selectedCountry">
          <option value="all">Все страны</option>
          <option v-for="country in countryOptions" :key="country" :value="country">{{ country }}</option>
        </select>
      </div>
      <div class="filter-item">
        <span>Город</span>
        <select v-model="selectedCity">
          <option value="all">Все города</option>
          <option v-for="city in cityOptions" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
      <div class="filter-item">
        <span>Университет</span>
        <select v-model="selectedUniversity">
          <option value="all">Все университеты</option>
          <option v-for="university in universityOptions" :key="university" :value="university">
            {{ university }}
          </option>
        </select>
      </div>
    </div>

    <!-- Current User Stats -->
    <div v-if="currentUser" class="my-stats">
      <div class="my-stats-label">Ваш результат</div>
      <div class="stats-grid">
        <div class="stat-cell">
          <span>Место</span>
          <strong>#{{ currentUser.rank }}</strong>
        </div>
        <div class="stat-cell">
          <span>Очки</span>
          <strong class="with-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4h8v2h3a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-.17A6.01 6.01 0 0 1 13 16.92V19h3v2H8v-2h3v-2.08A6.01 6.01 0 0 1 9.17 13H9a5 5 0 0 1-5-5V7a1 1 0 0 1 1-1h3V4Zm-2 4a3 3 0 0 0 3 3h.03A6.03 6.03 0 0 1 8 8V8H6Zm12 0v0a6.03 6.03 0 0 1-1.03 3H17a3 3 0 0 0 3-3h-2Z" fill="currentColor"/>
            </svg>
            {{ currentUser.points }}
          </strong>
        </div>
        <div class="stat-cell">
          <span>Прогресс</span>
          <strong>{{ currentUser.roadmapProgressPercent }}%</strong>
        </div>
        <div class="stat-cell">
          <span>В фильтре</span>
          <strong>{{ filteredCurrentUser ? `#${filteredCurrentUser.filteredRank}` : "---" }}</strong>
        </div>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="leaderboard">
      <div v-if="loading" class="state-message">Загрузка...</div>
      <div v-else-if="error" class="state-message error-text">{{ error }}</div>
      <div v-else-if="rankedFilteredLeaders.length === 0" class="state-message">Нет данных по фильтру</div>

      <div v-else class="leader-list">
        <article
          v-for="leader in rankedFilteredLeaders"
          :key="leader.userId"
          class="leader-row"
          :class="{ 'is-me': currentUser && leader.userId === currentUser.userId }"
          @click="openLeader(leader)"
        >
          <div class="rank" :class="{ gold: leader.filteredRank === 1, silver: leader.filteredRank === 2, bronze: leader.filteredRank === 3 }">
            {{ leader.filteredRank }}
          </div>
          <div class="avatar">{{ leader.avatar }}</div>
          <div class="info">
            <h3>{{ leader.fullName }}</h3>
            <p>{{ leader.country }} · {{ leader.city }}</p>
          </div>
          <div class="points">
            <svg class="trophy" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4h8v2h3a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-.17A6.01 6.01 0 0 1 13 16.92V19h3v2H8v-2h3v-2.08A6.01 6.01 0 0 1 9.17 13H9a5 5 0 0 1-5-5V7a1 1 0 0 1 1-1h3V4Zm-2 4a3 3 0 0 0 3 3h.03A6.03 6.03 0 0 1 8 8V8H6Zm12 0v0a6.03 6.03 0 0 1-1.03 3H17a3 3 0 0 0 3-3h-2Z" fill="currentColor"/>
            </svg>
            {{ leader.points }}
          </div>
        </article>
      </div>
    </div>

    <!-- Modal -->
    <transition name="modal">
      <div v-if="selectedLeader" class="overlay" @click.self="closeLeader">
        <div class="modal">
          <button class="modal-close" @click="closeLeader" aria-label="Закрыть">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <div class="modal-header">
            <div class="modal-avatar">{{ selectedLeader.avatar }}</div>
            <div>
              <h3>{{ selectedLeader.fullName }}</h3>
              <p class="modal-location">{{ selectedLeader.country }} · {{ selectedLeader.city }} · {{ selectedLeader.university }}</p>
            </div>
          </div>

          <div class="modal-grid">
            <div class="modal-stat">
              <span>Место</span>
              <strong>#{{ selectedLeader.rank }}</strong>
            </div>
            <div class="modal-stat">
              <span>Очки</span>
              <strong class="with-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 4h8v2h3a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-.17A6.01 6.01 0 0 1 13 16.92V19h3v2H8v-2h3v-2.08A6.01 6.01 0 0 1 9.17 13H9a5 5 0 0 1-5-5V7a1 1 0 0 1 1-1h3V4Zm-2 4a3 3 0 0 0 3 3h.03A6.03 6.03 0 0 1 8 8V8H6Zm12 0v0a6.03 6.03 0 0 1-1.03 3H17a3 3 0 0 0 3-3h-2Z" fill="currentColor"/>
                </svg>
                {{ selectedLeader.points }}
              </strong>
            </div>
            <div class="modal-stat">
              <span>Прогресс</span>
              <strong>{{ selectedLeader.roadmapProgressPercent }}%</strong>
            </div>
            <div class="modal-stat">
              <span>Тестов</span>
              <strong>{{ selectedLeader.completedTests }}</strong>
            </div>
            <div class="modal-stat">
              <span>Успешно</span>
              <strong class="success">{{ selectedLeader.passedTests }}</strong>
            </div>
            <div class="modal-stat">
              <span>Неудачно</span>
              <strong class="fail">{{ selectedLeader.failedTests }}</strong>
            </div>
          </div>

          <div class="modal-badges" v-if="selectedLeader.badges.length">
            <span v-for="badge in selectedLeader.badges" :key="badge">{{ badge }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.leaders-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 20px 80px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text);
}

/* Header */
.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0 0 6px;
  color: var(--text);
}

.page-header p {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

/* Filters */
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item span {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-item select {
  appearance: none;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.filter-item select:focus {
  outline: none;
  border-color: var(--text);
}

/* My Stats */
.my-stats {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 24px;
  background: var(--surface-soft);
}

.my-stats-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-cell {
  text-align: center;
}

.stat-cell span {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.stat-cell strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.with-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.with-icon svg {
  width: 16px;
  height: 16px;
  color: #d4a000;
}

/* Leaderboard */
.leaderboard {
  margin-top: 8px;
}

.state-message {
  text-align: center;
  padding: 48px 0;
  font-size: 15px;
  color: var(--muted);
}

.error-text {
  color: #d44;
}

.leader-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leader-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.leader-row:hover {
  border-color: var(--border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.leader-row.is-me {
  border-color: var(--text);
  background: var(--surface-soft);
}

.rank {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
  background: var(--surface-soft);
  flex-shrink: 0;
}

.rank.gold {
  background: var(--primary);
  color: #fff;
}

.rank.silver {
  background: var(--text);
  color: #fff;
}

.rank.bronze {
  background: var(--muted);
  color: #fff;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.info h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 2px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info p {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.points {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}

.trophy {
  width: 15px;
  height: 15px;
  color: #d4a000;
}

/* Modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  width: min(480px, 100%);
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  position: relative;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  padding: 4px;
  border-radius: 6px;
  transition: color 0.15s ease, background 0.15s ease;
}

.modal-close:hover {
  color: var(--text);
  background: var(--surface-soft);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.modal-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 2px;
  color: var(--text);
}

.modal-location {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.modal-stat {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  text-align: center;
}

.modal-stat span {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

.modal-stat strong {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.modal-stat strong.success {
  color: #16a34a;
}

.modal-stat strong.fail {
  color: #dc2626;
}

.modal-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.modal-badges span {
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 100px;
  background: var(--surface-soft);
  color: var(--muted);
  border: 1px solid var(--border);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .leaders-page {
    padding: 32px 16px 60px;
  }

  .filters {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .leader-row {
    flex-wrap: wrap;
  }
}
</style>