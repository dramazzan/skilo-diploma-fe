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
  <div class="page vacancies-page">
    <section class="card vacancies-head">
      <h1>Вакансии</h1>
      <p>Выберите вакансию и откройте персональный блок подготовки с вопросами и тестом.</p>
    </section>

    <section class="card">
      <div v-if="loading" class="muted">Загрузка вакансий...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!sortedVacancies.length" class="muted">Пока нет опубликованных вакансий.</div>

      <div v-else class="vacancy-grid">
        <article v-for="vacancy in sortedVacancies" :key="vacancy.id" class="vacancy-card">
          <div class="vacancy-top">
            <h3>{{ vacancy.title }}</h3>
            <span class="level-pill">{{ levelLabel(vacancy.level) }}</span>
          </div>

          <p class="vacancy-company">{{ vacancy.company }} · {{ vacancy.location }}</p>
          <p class="vacancy-summary">{{ vacancy.summary }}</p>

          <div class="vacancy-meta">
            <span>{{ employmentLabel(vacancy.employment) }}</span>
            <span>{{ vacancy.salaryRange }}</span>
          </div>

          <p class="vacancy-tasks-count">Реальные задачи от компании: {{ vacancy.realTasks.length }}</p>

          <button class="secondary" @click="toggleVacancyLeaders(vacancy.id)">
            {{ openedLeadersVacancyId === vacancy.id ? "Скрыть лидеров" : "Лидеры по задачам" }}
          </button>

          <div v-if="openedLeadersVacancyId === vacancy.id" class="vacancy-leaders-box">
            <div
              v-for="leader in (leaderboardByVacancy[vacancy.id]?.leaders ?? []).slice(0, 3)"
              :key="`vac-leader-${vacancy.id}-${leader.userId}`"
              class="vacancy-leader-row"
            >
              <span class="vacancy-leader-rank">#{{ leader.rank }}</span>
              <span class="vacancy-leader-name">{{ leader.fullName }}</span>
              <span class="vacancy-leader-score">{{ leader.averageQualityScore }}/100</span>
            </div>
          </div>

          <div class="vacancy-tags">
            <span v-for="tag in vacancy.tags" :key="tag">{{ tag }}</span>
          </div>

          <button class="primary" @click="openPreparation(vacancy.id)">Подготовка к вакансии</button>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.vacancies-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.vacancies-head p {
  margin: 0;
  color: #51627f;
}

.vacancy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.vacancy-card {
  border: 1px solid #d7e4f6;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vacancy-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: start;
}

.vacancy-top h3 {
  margin: 0;
  font-size: 17px;
  color: #1f2c46;
}

.level-pill {
  border: 1px solid #d4def1;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 12px;
  color: #344768;
  background: #f5f8ff;
}

.vacancy-company {
  margin: 0;
  color: #495c7c;
  font-weight: 600;
}

.vacancy-summary {
  margin: 0;
  color: #5a6b86;
  font-size: 14px;
}

.vacancy-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #314562;
  font-size: 13px;
}

.vacancy-tasks-count {
  margin: 0;
  font-size: 13px;
  color: #2f4670;
  font-weight: 600;
}

.vacancy-leaders-box {
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  background: #f8fbff;
  padding: 8px;
}

.vacancy-leader-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: #324763;
}

.vacancy-leader-row + .vacancy-leader-row {
  margin-top: 6px;
}

.vacancy-leader-rank {
  font-weight: 700;
  color: #2a4384;
}

.vacancy-leader-name {
  font-weight: 600;
}

.vacancy-leader-score {
  font-weight: 700;
  color: #2b3f78;
}

.vacancy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vacancy-tags span {
  border: 1px solid #dce7f8;
  border-radius: 999px;
  background: #f8fbff;
  padding: 4px 9px;
  font-size: 12px;
  color: #44597c;
}

@media (max-width: 900px) {
  .vacancy-grid {
    grid-template-columns: 1fr;
  }
}
</style>
