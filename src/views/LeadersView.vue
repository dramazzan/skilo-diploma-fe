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
  <div class="page leaders-page">
    <section class="leaders-intro card">
      <h1>Лидеры Skilo</h1>
      <p>Рейтинг формируется по очкам за прохождение тестов, активности и общему прогрессу.</p>

      <div class="leader-filters">
        <label>
          <span>Страна</span>
          <select v-model="selectedCountry">
            <option value="all">Все страны</option>
            <option v-for="country in countryOptions" :key="country" :value="country">{{ country }}</option>
          </select>
        </label>

        <label>
          <span>Город</span>
          <select v-model="selectedCity">
            <option value="all">Все города</option>
            <option v-for="city in cityOptions" :key="city" :value="city">{{ city }}</option>
          </select>
        </label>

        <label>
          <span>Университет</span>
          <select v-model="selectedUniversity">
            <option value="all">Все университеты</option>
            <option v-for="university in universityOptions" :key="university" :value="university">
              {{ university }}
            </option>
          </select>
        </label>
      </div>

      <div v-if="currentUser" class="my-race-card">
        <p>Ваш результат в гонке</p>
        <div class="my-race-grid">
          <div><span>Место (глобально)</span><strong>#{{ currentUser.rank }}</strong></div>
          <div>
            <span>Очки</span>
            <strong class="points-with-cup">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 4h8v2h3a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-.17A6.01 6.01 0 0 1 13 16.92V19h3v2H8v-2h3v-2.08A6.01 6.01 0 0 1 9.17 13H9a5 5 0 0 1-5-5V7a1 1 0 0 1 1-1h3V4Zm-2 4a3 3 0 0 0 3 3h.03A6.03 6.03 0 0 1 8 8V8H6Zm12 0v0a6.03 6.03 0 0 1-1.03 3H17a3 3 0 0 0 3-3h-2Z" fill="currentColor"/>
              </svg>
              {{ currentUser.points }}
            </strong>
          </div>
          <div><span>Прогресс</span><strong>{{ currentUser.roadmapProgressPercent }}%</strong></div>
          <div>
            <span>Место в выбранном списке</span>
            <strong>{{ filteredCurrentUser ? `#${filteredCurrentUser.filteredRank}` : "Вне фильтра" }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="leaders-list card">
      <div v-if="loading" class="muted">Загрузка лидеров...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="rankedFilteredLeaders.length === 0" class="muted">По выбранному фильтру нет данных.</div>

      <div v-else class="leader-rows">
        <article
          v-for="leader in rankedFilteredLeaders"
          :key="leader.userId"
          class="leader-row"
          :class="{ me: currentUser && leader.userId === currentUser.userId }"
          @click="openLeader(leader)"
        >
          <div class="leader-rank">#{{ leader.filteredRank }}</div>
          <div class="leader-avatar">{{ leader.avatar }}</div>
          <div class="leader-main">
            <h3>{{ leader.fullName }}</h3>
            <p>
              {{ leader.country }} · {{ leader.city }} · {{ leader.university }}
            </p>
            <p>Тесты: {{ leader.completedTests }} · Успех: {{ leader.passedTests }}/{{ leader.completedTests }}</p>
          </div>
          <div class="leader-points">
            <svg class="trophy-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4h8v2h3a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-.17A6.01 6.01 0 0 1 13 16.92V19h3v2H8v-2h3v-2.08A6.01 6.01 0 0 1 9.17 13H9a5 5 0 0 1-5-5V7a1 1 0 0 1 1-1h3V4Zm-2 4a3 3 0 0 0 3 3h.03A6.03 6.03 0 0 1 8 8V8H6Zm12 0v0a6.03 6.03 0 0 1-1.03 3H17a3 3 0 0 0 3-3h-2Z" fill="currentColor"/>
            </svg>
            {{ leader.points }}
          </div>
        </article>
      </div>
    </section>

    <transition name="leader-fade">
      <div v-if="selectedLeader" class="leader-modal-overlay" @click.self="closeLeader">
        <div class="leader-modal">
          <h3>{{ selectedLeader.fullName }}</h3>
          <p class="leader-modal-sub">Подробная статистика участника</p>
          <p class="leader-modal-location">
            {{ selectedLeader.country }} · {{ selectedLeader.city }} · {{ selectedLeader.university }}
          </p>

          <div class="leader-mini-grid">
            <div><span>Место</span><strong>#{{ selectedLeader.rank }}</strong></div>
            <div>
              <span>Очки</span>
              <strong class="points-with-cup">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 4h8v2h3a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-.17A6.01 6.01 0 0 1 13 16.92V19h3v2H8v-2h3v-2.08A6.01 6.01 0 0 1 9.17 13H9a5 5 0 0 1-5-5V7a1 1 0 0 1 1-1h3V4Zm-2 4a3 3 0 0 0 3 3h.03A6.03 6.03 0 0 1 8 8V8H6Zm12 0v0a6.03 6.03 0 0 1-1.03 3H17a3 3 0 0 0 3-3h-2Z" fill="currentColor"/>
                </svg>
                {{ selectedLeader.points }}
              </strong>
            </div>
            <div><span>Прогресс</span><strong>{{ selectedLeader.roadmapProgressPercent }}%</strong></div>
            <div><span>Пройдено тестов</span><strong>{{ selectedLeader.completedTests }}</strong></div>
            <div><span>Успешно</span><strong>{{ selectedLeader.passedTests }}</strong></div>
            <div><span>Неудачно</span><strong>{{ selectedLeader.failedTests }}</strong></div>
          </div>

          <div class="leader-badges" v-if="selectedLeader.badges.length">
            <span v-for="badge in selectedLeader.badges" :key="badge">{{ badge }}</span>
          </div>

          <div class="leader-modal-actions">
            <button class="primary" @click="closeLeader">Закрыть</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.leaders-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.leaders-intro {
  border: 1px solid #d8e4f6;
  background:
    radial-gradient(900px 220px at 0% 0%, rgba(63, 111, 255, 0.08), transparent 52%),
    linear-gradient(180deg, #ffffff 0%, #f9fcff 100%);
}

.leaders-intro h1 {
  margin: 0 0 6px;
  color: #152544;
  letter-spacing: 0.01em;
}

.leaders-intro p {
  margin: 0;
  color: #4b5e7f;
}

.leader-filters {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.leader-filters label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border: 1px solid #dfebf8;
  border-radius: 12px;
  background: #ffffffcc;
}

.leader-filters span {
  font-size: 12px;
  color: #5a6d8f;
  font-weight: 600;
}

.leader-filters select {
  border: 1px solid #d5e2f4;
  border-radius: 10px;
  background: #ffffff;
  padding: 8px 10px;
  font-size: 13px;
  color: #22314d;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.leader-filters select:focus {
  outline: none;
  border-color: #8ca7e9;
  box-shadow: 0 0 0 3px rgba(89, 122, 210, 0.14);
}

.my-race-card {
  margin-top: 14px;
  border: 1px solid #d5e1f5;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  padding: 13px;
  box-shadow: 0 10px 20px rgba(22, 43, 86, 0.06);
}

.my-race-card p {
  margin: 0 0 8px;
  font-weight: 700;
  color: #334155;
}

.my-race-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.my-race-grid div span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.my-race-grid div strong {
  font-size: 18px;
  color: #1b2f6b;
}

.points-with-cup {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.points-with-cup svg {
  width: 16px;
  height: 16px;
  color: #c48b00;
}

.leader-rows {
  display: grid;
  gap: 12px;
}

.leader-row {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 10px;
  border: 1px solid #d7e3f6;
  border-radius: 14px;
  padding: 12px;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(17, 32, 63, 0.05);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.leader-row:hover {
  border-color: #b8cdee;
  background: #fbfdff;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(27, 49, 92, 0.1);
}

.leader-row.me {
  border-color: #9eb8ef;
  background: linear-gradient(180deg, #f3f6ff 0%, #edf2ff 100%);
}

.leader-rank {
  min-width: 38px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid #d1def4;
  background: #f4f8ff;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #1d377e;
}

.leader-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #ccd9f1;
  background: linear-gradient(180deg, #f4f7ff 0%, #eaf1ff 100%);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #253f77;
}

.leader-main h3 {
  margin: 0 0 3px;
  font-size: 16px;
  color: #162645;
}

.leader-main p {
  margin: 0;
  font-size: 13px;
  color: #55657c;
}

.leader-main p + p {
  margin-top: 4px;
}

.leader-points {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid #d7e2f5;
  background: #f6f9ff;
  font-weight: 800;
  color: #22378f;
}

.trophy-icon {
  width: 16px;
  height: 16px;
  color: #c48b00;
}

.leader-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 22, 0.54);
  backdrop-filter: blur(2px);
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 16px;
}

.leader-modal {
  width: min(540px, 100%);
  border-radius: 14px;
  border: 1px solid #d3e0f6;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 18px 44px rgba(11, 21, 47, 0.22);
}

.leader-modal h3 {
  margin: 0;
}

.leader-modal-sub {
  margin: 4px 0;
  color: #64748b;
}

.leader-modal-location {
  margin: 0 0 12px;
  color: #43516b;
  font-size: 13px;
}

.leader-mini-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.leader-mini-grid div {
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  padding: 8px;
  background: #f8fbff;
}

.leader-mini-grid span {
  display: block;
  font-size: 11px;
  color: #64748b;
}

.leader-mini-grid strong {
  font-size: 14px;
  color: #1f2d7a;
}

.leader-badges {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.leader-badges span {
  border: 1px solid #d4e2f8;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  color: #3a4e76;
  background: #f5f8ff;
}

.leader-modal-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .leader-filters {
    grid-template-columns: 1fr;
  }

  .my-race-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .leader-row {
    grid-template-columns: auto auto 1fr;
  }

  .leader-points {
    grid-column: 1 / -1;
    justify-self: start;
  }
}

@media (max-width: 560px) {
  .my-race-grid {
    grid-template-columns: 1fr;
  }

  .leader-mini-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
