<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { api, type Vacancy, type VacancyTaskLeaderboardResponse } from "@/services/api"

const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const vacancies = ref<Vacancy[]>([])
const leaderboardByVacancy = ref<Record<string, VacancyTaskLeaderboardResponse>>({})
const openedLeadersVacancyId = ref<string | null>(null)

const levelLabel = (level: Vacancy["level"]) => {
  if (level === "junior") return "Junior"
  if (level === "middle") return "Middle"
  return "Senior"
}

const employmentLabel = (employment: Vacancy["employment"]) => {
  if (employment === "full-time") return "Full-time"
  if (employment === "part-time") return "Part-time"
  if (employment === "internship") return "Internship"
  return "Remote"
}

const sortedVacancies = computed(() => {
  return [...vacancies.value].sort((a, b) => a.company.localeCompare(b.company))
})

const openPreparation = (vacancyId: string) => {
  router.push(`/vacancies/${vacancyId}/preparation`)
}

const toggleVacancyLeaders = (vacancyId: string) => {
  openedLeadersVacancyId.value = openedLeadersVacancyId.value === vacancyId ? null : vacancyId
}

const loadVacancies = async () => {
  try {
    loading.value = true
    error.value = null
    vacancies.value = await api.getVacancies()
    const leaderboardEntries = await Promise.all(
      vacancies.value.map(async (item) => [item.id, await api.getVacancyTaskLeaderboard(item.id, null)] as const)
    )
    leaderboardByVacancy.value = Object.fromEntries(leaderboardEntries)
  } catch {
    error.value = "Не удалось загрузить вакансии"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadVacancies()
})
</script>

<template>
  <div class="vacancies-page">
    <!-- Header -->
    <header class="page-header">
      <h1>Вакансии</h1>
      <p>Выберите вакансию и откройте персональный блок подготовки с вопросами и тестом</p>
    </header>

    <!-- States -->
    <div v-if="loading" class="state-view">
      <span class="loader" />
      <p>Загрузка вакансий...</p>
    </div>

    <div v-else-if="error" class="state-view">
      <p class="error-text">{{ error }}</p>
    </div>

    <div v-else-if="!sortedVacancies.length" class="state-view">
      <p>Пока нет опубликованных вакансий.</p>
    </div>

    <!-- Grid -->
    <div v-else class="vacancy-grid">
      <article
        v-for="vacancy in sortedVacancies"
        :key="vacancy.id"
        class="vacancy-card"
      >
        <!-- Top -->
        <div class="card-top">
          <div>
            <h3>{{ vacancy.title }}</h3>
            <p class="company">{{ vacancy.company }} · {{ vacancy.location }}</p>
          </div>
          <span class="level-pill">{{ levelLabel(vacancy.level) }}</span>
        </div>

        <!-- Summary -->
        <p class="summary">{{ vacancy.summary }}</p>

        <!-- Meta row -->
        <div class="meta-row">
          <span class="meta-chip">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
            {{ employmentLabel(vacancy.employment) }}
          </span>
          <span class="meta-chip">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3l-5 3Z"/><path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3l-5 3Z"/><path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12"/></svg>
            {{ vacancy.salaryRange }}
          </span>
          <span class="meta-chip accent">
            {{ vacancy.realTasks.length }} {{ vacancy.realTasks.length === 1 ? 'задача' : 'задач' }}
          </span>
        </div>

        <!-- Tags -->
        <div class="tags">
          <span v-for="tag in vacancy.tags" :key="tag">{{ tag }}</span>
        </div>

        <!-- Leaders toggle -->
        <button class="btn-ghost" @click="toggleVacancyLeaders(vacancy.id)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {{ openedLeadersVacancyId === vacancy.id ? "Скрыть лидеров" : "Лидеры по задачам" }}
          <svg
            class="chevron"
            :class="{ rotated: openedLeadersVacancyId === vacancy.id }"
            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          ><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <!-- Leaders panel -->
        <transition name="slide">
          <div v-if="openedLeadersVacancyId === vacancy.id" class="leaders-panel">
            <div
              v-for="leader in (leaderboardByVacancy[vacancy.id]?.leaders ?? []).slice(0, 3)"
              :key="`vac-leader-${vacancy.id}-${leader.userId}`"
              class="leader-row"
            >
              <span
                class="leader-rank"
                :class="{ gold: leader.rank === 1, silver: leader.rank === 2, bronze: leader.rank === 3 }"
              >{{ leader.rank }}</span>
              <span class="leader-name">{{ leader.fullName }}</span>
              <span class="leader-score">{{ leader.averageQualityScore }}<small>/100</small></span>
            </div>
            <p v-if="!(leaderboardByVacancy[vacancy.id]?.leaders ?? []).length" class="no-leaders">
              Пока нет участников
            </p>
          </div>
        </transition>

        <!-- CTA -->
        <button class="btn-primary" @click="openPreparation(vacancy.id)">
          Подготовка к вакансии
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </article>
    </div>
  </div>
</template>

<style scoped>
.vacancies-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 20px 80px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #111;
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
  color: #0a0a0a;
}

.page-header p {
  font-size: 15px;
  color: #888;
  margin: 0;
  line-height: 1.5;
}

/* States */
.state-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  gap: 12px;
}

.state-view p {
  font-size: 15px;
  color: #999;
  margin: 0;
}

.error-text {
  color: #dc2626;
}

.loader {
  width: 24px;
  height: 24px;
  border: 2.5px solid #e5e5e5;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Grid */
.vacancy-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* Card */
.vacancy-card {
  border: 1px solid #eee;
  border-radius: 14px;
  background: #fff;
  padding: 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.15s ease;
}

.vacancy-card:hover {
  border-color: #ddd;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.card-top h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #0a0a0a;
  letter-spacing: -0.01em;
}

.company {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #777;
}

.level-pill {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 5px 10px;
  border-radius: 100px;
  background: #f0f0f0;
  color: #555;
  border: 1px solid #e5e5e5;
}

.summary {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #666;
}

/* Meta */
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #eee;
  color: #666;
}

.meta-chip.accent {
  background: #0a0a0a;
  border-color: #0a0a0a;
  color: #fff;
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tags span {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 11px;
  border-radius: 100px;
  background: #f5f5f5;
  color: #555;
  border: 1px solid #eee;
}

/* Ghost button */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  border: none;
  background: none;
  color: #888;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.15s ease;
}

.btn-ghost:hover {
  color: #333;
}

.chevron {
  transition: transform 0.2s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* Leaders panel */
.leaders-panel {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fafafa;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leader-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.leader-rank {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #555;
  background: #eee;
  flex-shrink: 0;
}

.leader-rank.gold {
  background: #0a0a0a;
  color: #fff;
}

.leader-rank.silver {
  background: #333;
  color: #fff;
}

.leader-rank.bronze {
  background: #666;
  color: #fff;
}

.leader-name {
  flex: 1;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leader-score {
  font-weight: 700;
  color: #0a0a0a;
  flex-shrink: 0;
}

.leader-score small {
  font-weight: 500;
  color: #bbb;
}

.no-leaders {
  font-size: 13px;
  color: #bbb;
  margin: 0;
  text-align: center;
  padding: 6px 0;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* Primary button */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #0a0a0a;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: auto;
}

.btn-primary:hover {
  background: #222;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 720px) {
  .vacancies-page {
    padding: 32px 16px 60px;
  }

  .vacancy-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 24px;
  }
}
</style>