<script setup lang="ts">
import { computed, ref, onMounted } from "vue"
import { mockProfileData, ProfileData } from "@/mocks/mockProfile"
import { useRoadmapsStore } from "@/store/roadmaps"
import { api, type UserActivityDay } from "@/services/api"
import { useAuthStore } from "@/store/auth"

interface CertificatePreview {
  fullName: string
  email: string
  certificateId: string
  title: string
  issueDate: string
  verificationCode: string
  issuedBy: string
  overallLevel: string
  skills: string[]
  roadmapResults: Array<{
    title: string
    percent: number
    status: string
  }>
  completedTests: number
}

const profile = ref<ProfileData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const generatingResume = ref(false)
const generatedCertificate = ref<CertificatePreview | null>(null)
const activityDays = ref<UserActivityDay[]>([])
const activityLoading = ref(true)
const activityViewMode = ref<"heatmap" | "chart">("heatmap")
const activityChartRange = ref<"day" | "week" | "month" | "year">("week")
const profilePoints = ref<number | null>(null)

const roadmapsStore = useRoadmapsStore()
const authStore = useAuthStore()

const userDetails = computed(() => {
  const profileUser = profile.value
  const authUser = authStore.user

  if (!profileUser && !authUser) return []

  const createdAt = profileUser?.createdAt ?? authUser?.createdAt ?? ""
  const createdDate = createdAt
    ? new Date(createdAt).toLocaleDateString("ru-RU")
    : profileUser?.joinedAt ?? "—"

  return [
    { label: "Email", value: profileUser?.email || authUser?.email || "—" },
    { label: "Страна", value: profileUser?.country || authUser?.country || "—" },
    { label: "Город", value: profileUser?.city || authUser?.city || "—" },
    { label: "Университет", value: profileUser?.university || authUser?.university || "—" },
    { label: "Дата создания", value: createdDate },
    {
      label: "Онбординг",
      value: (profileUser?.firstLogin ?? authUser?.firstLogin ?? true) ? "Не завершен" : "Завершен"
    }
  ]
})

const roadmapProgressRows = computed(() => {
  return roadmapsStore.myRoadmaps.map((roadmap) => {
    const progress = roadmapsStore.getRoadmapProgress(roadmap.id)
    const percent = progress?.completionPercent ?? 0
    const completedTopics = progress?.completedTopics ?? 0
    const totalTopics = progress?.totalTopics ?? 0

    return {
      title: roadmap.title,
      percent,
      completedTopics,
      totalTopics
    }
  })
})

const activityByDate = computed(() => {
  return activityDays.value.reduce<Record<string, UserActivityDay>>((acc, day) => {
    acc[day.date] = day
    return acc
  }, {})
})

const activityStats = computed(() => {
  const totalActiveDays = activityDays.value.filter((day) => day.level > 0).length
  const totalPoints = activityDays.value.reduce((sum, day) => sum + day.level, 0)

  return {
    totalActiveDays,
    totalPoints
  }
})

const activityWeeks = computed(() => {
  if (!activityDays.value.length) return [] as Array<Array<UserActivityDay | null>>

  const sorted = [...activityDays.value].sort((a, b) => a.date.localeCompare(b.date))
  const firstDate = new Date(sorted[0].date)
  const startPad = firstDate.getDay()
  const cells: Array<UserActivityDay | null> = [
    ...Array.from({ length: startPad }, () => null),
    ...sorted
  ]
  const weeks: Array<Array<UserActivityDay | null>> = []

  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return weeks
})

const pad = (value: number) => String(value).padStart(2, "0")

const toMonthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

const toWeekStartIso = (input: Date) => {
  const date = new Date(input)
  const mondayOffset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - mondayOffset)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

const activityByDateLevel = computed(() => {
  return activityDays.value.reduce<Record<string, number>>((acc, day) => {
    acc[day.date] = day.level
    return acc
  }, {})
})

const activityChartData = computed(() => {
  if (!activityDays.value.length) return [] as Array<{ label: string; value: number }>

  const sorted = [...activityDays.value].sort((a, b) => a.date.localeCompare(b.date))

  if (activityChartRange.value === "day") {
    return sorted.map((day) => {
      const date = new Date(day.date)
      return {
        label: `${pad(date.getDate())}.${pad(date.getMonth() + 1)}`,
        value: day.level
      }
    })
  }

  if (activityChartRange.value === "week") {
    const byWeek = sorted.reduce<Record<string, number>>((acc, day) => {
      const key = toWeekStartIso(new Date(day.date))
      acc[key] = (acc[key] ?? 0) + day.level
      return acc
    }, {})

    return Object.keys(byWeek)
      .sort()
      .map((key) => {
        const weekStart = new Date(key)
        return {
        label: `${pad(weekStart.getDate())}.${pad(weekStart.getMonth() + 1)}`,
        value: byWeek[key] ?? 0
        }
      })
  }

  if (activityChartRange.value === "month") {
    const byMonth = sorted.reduce<Record<string, number>>((acc, day) => {
      const key = toMonthKey(new Date(day.date))
      acc[key] = (acc[key] ?? 0) + day.level
      return acc
    }, {})

    return Object.keys(byMonth)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-").map(Number)
        const monthDate = new Date(year, month - 1, 1)
        return {
        label: monthDate.toLocaleString("ru-RU", { month: "short" }),
        value: byMonth[key] ?? 0
        }
      })
  }

  const byYear = sorted.reduce<Record<string, number>>((acc, day) => {
    const year = String(new Date(day.date).getFullYear())
    acc[year] = (acc[year] ?? 0) + day.level
    return acc
  }, {})

  return Object.keys(byYear)
    .sort()
    .map((year) => ({
      label: year,
      value: byYear[year]
    }))
})

const activityChartMax = computed(() => {
  const max = Math.max(1, ...activityChartData.value.map((item) => item.value))
  return max
})

const fetchProfile = async () => {
  try {
    loading.value = true
    error.value = null
    await new Promise(resolve => setTimeout(resolve, 800))
    profile.value = mockProfileData
    await roadmapsStore.loadUserRoadmapCollection(null)
    await roadmapsStore.loadRoadmapProgress(null)
    await loadActivity()
    await loadProfilePoints()
  } catch (err: any) {
    error.value = "Не удалось загрузить профиль"
  } finally {
    loading.value = false
  }
}

const loadActivity = async () => {
  activityLoading.value = true
  activityDays.value = await api.getUserYearActivity(null)
  activityLoading.value = false
}

const loadProfilePoints = async () => {
  const leaderboard = await api.getLeaderboard(authStore.user?.id ?? null)
  profilePoints.value = leaderboard.currentUser.points
}

const toRuDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("ru-RU")
}

const getProgressStatus = (percent: number) => {
  if (percent >= 90) return "Освоено"
  if (percent >= 60) return "Хороший прогресс"
  if (percent >= 30) return "Базовый прогресс"
  return "Начальный этап"
}

const getOverallLevel = (avgPercent: number) => {
  if (avgPercent >= 80) return "Продвинутый"
  if (avgPercent >= 50) return "Средний"
  return "Базовый"
}

const buildCertificatePreview = (): CertificatePreview | null => {
  if (!profile.value) return null

  const avgProgress = roadmapProgressRows.value.length
    ? Math.round(roadmapProgressRows.value.reduce((sum, item) => sum + item.percent, 0) / roadmapProgressRows.value.length)
    : 0

  const certificateId = `ADP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const verificationCode = Math.random().toString(36).slice(2, 10).toUpperCase()

  return {
    fullName: profile.value.fullName,
    email: profile.value.email,
    certificateId,
    title: "Certificate of Learning Progress",
    issueDate: new Date().toLocaleDateString("ru-RU"),
    verificationCode,
    issuedBy: "Skilo Platform",
    overallLevel: getOverallLevel(avgProgress),
    skills: profile.value.skills,
    roadmapResults: roadmapProgressRows.value.map((item) => ({
      title: item.title,
      percent: item.percent,
      status: getProgressStatus(item.percent)
    })),
    completedTests: profile.value.completedTests
  }
}

const generateResume = async () => {
  if (!profile.value) return

  generatingResume.value = true
  await new Promise((resolve) => setTimeout(resolve, 700))
  generatedCertificate.value = buildCertificatePreview()
  generatingResume.value = false
}

onMounted(fetchProfile)
</script>

<template>
  <div class="profile-card card">

    <!-- Loading -->
    <div v-if="loading" class="state-view">
      <span class="loader" />
      <p class="state-text">Загрузка профиля…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-view">
      <p class="state-text error">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="profile" class="profile-content">

      <!-- Header -->
      <div class="profile-header">
        <div class="avatar">{{ profile.fullName?.charAt(0) }}</div>
        <div class="profile-title">
          <h2 class="full-name">{{ profile.fullName }}</h2>
          <span class="email">{{ profile.email }}</span>
        </div>
      </div>

      <div class="divider" />

      <!-- Meta -->
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Дата регистрации</span>
          <span class="meta-value">{{ profile.joinedAt }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Пройдено тестов</span>
          <span class="meta-value accent">{{ profile.completedTests }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Очки</span>
          <span class="meta-value trophy-value">
            <svg class="trophy-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4h8v2h3a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-.17A6.01 6.01 0 0 1 13 16.92V19h3v2H8v-2h3v-2.08A6.01 6.01 0 0 1 9.17 13H9a5 5 0 0 1-5-5V7a1 1 0 0 1 1-1h3V4Zm-2 4a3 3 0 0 0 3 3h.03A6.03 6.03 0 0 1 8 8V8H6Zm12 0v0a6.03 6.03 0 0 1-1.03 3H17a3 3 0 0 0 3-3h-2Z" fill="currentColor"/>
            </svg>
            {{ profilePoints ?? "—" }}
          </span>
        </div>
      </div>

      <div class="divider" />

      <!-- Skills -->
      <section class="section">
        <h3 class="section-title">Навыки</h3>
        <div class="tag-list">
          <span v-for="skill in profile.skills" :key="skill" class="tag">{{ skill }}</span>
        </div>
      </section>

      <!-- Achievements -->
      <section class="section">
        <h3 class="section-title">Достижения</h3>
        <ul class="ach-list">
          <li v-for="ach in profile.achievements" :key="ach" class="ach-item">
            <span class="ach-dot" />
            {{ ach }}
          </li>
        </ul>
      </section>

      <section class="section user-details-section">
        <h3 class="section-title">Данные пользователя</h3>
        <p v-if="!userDetails.length" class="muted">Данные пользователя не загружены.</p>
        <div v-else class="user-details-grid">
          <div v-for="item in userDetails" :key="item.label" class="user-details-item">
            <span class="user-details-label">{{ item.label }}</span>
            <strong class="user-details-value">{{ item.value }}</strong>
          </div>
        </div>
      </section>

      <!-- Activity -->
      <section class="section activity-section">
        <div class="activity-head">
          <h3 class="section-title">Активность за год</h3>
          <p class="activity-note">Активность рассчитывается автоматически по действиям пользователя (результаты тестов).</p>
        </div>

        <div class="activity-meta">
          <span>Активных дней: <strong>{{ activityStats.totalActiveDays }}</strong></span>
          <span>Сумма активности: <strong>{{ activityStats.totalPoints }}</strong></span>
        </div>

        <div class="activity-controls">
          <div class="view-toggle">
            <button
              type="button"
              class="secondary"
              :class="{ active: activityViewMode === 'heatmap' }"
              @click="activityViewMode = 'heatmap'"
            >
              Тепловая карта
            </button>
            <button
              type="button"
              class="secondary"
              :class="{ active: activityViewMode === 'chart' }"
              @click="activityViewMode = 'chart'"
            >
              Диаграмма
            </button>
          </div>

          <div v-if="activityViewMode === 'chart'" class="range-toggle">
            <button type="button" class="secondary" :class="{ active: activityChartRange === 'day' }" @click="activityChartRange = 'day'">Дни</button>
            <button type="button" class="secondary" :class="{ active: activityChartRange === 'week' }" @click="activityChartRange = 'week'">Недели</button>
            <button type="button" class="secondary" :class="{ active: activityChartRange === 'month' }" @click="activityChartRange = 'month'">Месяцы</button>
            <button type="button" class="secondary" :class="{ active: activityChartRange === 'year' }" @click="activityChartRange = 'year'">Годы</button>
          </div>
        </div>

        <div v-if="activityLoading" class="muted">Загрузка активности...</div>
        <div v-else-if="activityViewMode === 'heatmap'" class="activity-grid-wrap">
          <div class="activity-grid" aria-label="Годовая активность">
            <div v-for="(week, weekIndex) in activityWeeks" :key="`week-${weekIndex}`" class="activity-week">
              <span
                v-for="(day, dayIndex) in week"
                :key="`day-${weekIndex}-${dayIndex}`"
                class="activity-day"
                :class="day ? `level-${day.level}` : 'level-empty'"
                :title="day ? `${toRuDate(day.date)} · уровень ${day.level}` : ''"
              />
            </div>
          </div>

          <div class="activity-legend">
            <span>Меньше</span>
            <i class="activity-day level-0" />
            <i class="activity-day level-1" />
            <i class="activity-day level-2" />
            <i class="activity-day level-3" />
            <i class="activity-day level-4" />
            <span>Больше</span>
          </div>
        </div>

        <div v-else class="activity-chart-wrap">
          <div class="activity-chart">
            <div v-for="(item, index) in activityChartData" :key="`${item.label}-${index}`" class="activity-bar-col">
              <div class="activity-bar-shell">
                <span class="activity-bar" :style="{ height: `${Math.max(4, (item.value / activityChartMax) * 100)}%` }" />
              </div>
              <span class="activity-bar-label">{{ item.label }}</span>
              <span class="activity-bar-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Resume Generator -->
      <section class="section resume-section">
        <div class="resume-head">
          <h3 class="section-title">Генерация сертификата (MVP)</h3>
          <p class="resume-note">
            Пока используется mock-генерация на основе навыков и прогресса. Позже сертификат будет формироваться ИИ по данным пользователя.
          </p>
        </div>

        <button class="primary" :disabled="generatingResume" @click="generateResume">
          {{ generatingResume ? "Генерация..." : "Сгенерировать сертификат" }}
        </button>

        <div v-if="generatedCertificate" class="resume-result">
          <h4>Предпросмотр сертификата</h4>

          <article class="certificate-paper">
            <header class="certificate-head">
              <p class="certificate-subtitle">{{ generatedCertificate.issuedBy }}</p>
              <h5>{{ generatedCertificate.title }}</h5>
              <p class="certificate-id">ID: {{ generatedCertificate.certificateId }}</p>
            </header>

            <section class="certificate-main">
              <p class="certificate-text">Настоящим подтверждается, что</p>
              <h6 class="certificate-name">{{ generatedCertificate.fullName }}</h6>
              <p class="certificate-text">успешно проходит обучение по дорожным картам платформы и демонстрирует уровень:</p>
              <p class="certificate-level">{{ generatedCertificate.overallLevel }}</p>
            </section>

            <section class="certificate-grid">
              <div>
                <p class="certificate-meta-label">Email</p>
                <p class="certificate-meta-value">{{ generatedCertificate.email }}</p>
              </div>
              <div>
                <p class="certificate-meta-label">Дата выдачи</p>
                <p class="certificate-meta-value">{{ generatedCertificate.issueDate }}</p>
              </div>
              <div>
                <p class="certificate-meta-label">Код проверки</p>
                <p class="certificate-meta-value">{{ generatedCertificate.verificationCode }}</p>
              </div>
            </section>

            <section class="certificate-section">
              <h6>Подтверждённые навыки</h6>
              <div class="resume-skill-list">
                <span v-for="skill in generatedCertificate.skills" :key="skill">{{ skill }}</span>
              </div>
            </section>

            <section class="certificate-section">
              <h6>Результаты по направлениям</h6>
              <div v-if="generatedCertificate.roadmapResults.length" class="resume-progress-list">
                <div v-for="item in generatedCertificate.roadmapResults" :key="item.title" class="resume-progress-item">
                  <div class="resume-progress-head">
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.percent }}% · {{ item.status }}</span>
                  </div>
                  <div class="resume-progress-track">
                    <span :style="{ width: `${item.percent}%` }" />
                  </div>
                </div>
              </div>
              <p v-else class="resume-empty">Нет данных по направлениям.</p>
            </section>

            <footer class="certificate-footer">
              <p>Пройдено тестов: <strong>{{ generatedCertificate.completedTests }}</strong></p>
              <p>Статус: Сертификат учебного прогресса (MVP)</p>
            </footer>
          </article>

          <div class="resume-actions">
            <button class="secondary" disabled>Скачать PDF (скоро)</button>
            <button class="secondary" disabled>Скачать DOCX (скоро)</button>
            <button class="secondary" disabled>Скачать TXT (скоро)</button>
            <button class="secondary" disabled>Поделиться LinkedIn (скоро)</button>
            <button class="secondary" disabled>Поделиться Telegram (скоро)</button>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.trophy-value {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.trophy-icon {
  width: 16px;
  height: 16px;
  color: #c48b00;
}

.user-details-section {
  margin-top: 10px;
  border-top: 1px solid #e4ecf8;
  padding-top: 14px;
}

.user-details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.user-details-item {
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
}

.user-details-label {
  display: block;
  font-size: 12px;
  color: #5f6f89;
}

.user-details-value {
  margin-top: 4px;
  display: block;
  color: #233353;
  font-size: 14px;
}

.resume-section {
  margin-top: 10px;
  border-top: 1px solid #e4ecf8;
  padding-top: 14px;
}

.activity-section {
  margin-top: 10px;
  border-top: 1px solid #e4ecf8;
  padding-top: 14px;
}

.activity-head {
  margin-bottom: 8px;
}

.activity-note {
  margin: 0;
  color: #51627f;
  font-size: 13px;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  color: #425370;
  font-size: 13px;
}

.activity-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.view-toggle,
.range-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.activity-controls .secondary {
  padding: 6px 10px;
  font-size: 12px;
}

.activity-controls .active {
  border-color: #2a2f8f;
  color: #2a2f8f;
  background: #eef1ff;
}

.activity-grid-wrap {
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
}

.activity-grid {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.activity-week {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 4px;
}

.activity-day {
  width: 12px;
  height: 12px;
  padding: 0;
  border-radius: 3px;
  border: 1px solid #d6e1f3;
  background: #eef2f9;
  box-shadow: none;
}

.activity-day:hover {
  transform: none;
}

.activity-day.level-empty {
  opacity: 0;
  pointer-events: none;
}

.activity-day.level-0 {
  background: #e9eef7;
}

.activity-day.level-1 {
  background: #c8dcff;
  border-color: #bbd2fb;
}

.activity-day.level-2 {
  background: #9dc2ff;
  border-color: #8db6fa;
}

.activity-day.level-3 {
  background: #6ea3f6;
  border-color: #5f94ea;
}

.activity-day.level-4 {
  background: #2f70dc;
  border-color: #2a66c9;
}

.activity-legend {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.activity-chart-wrap {
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
}

.activity-chart {
  min-height: 220px;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.activity-bar-col {
  min-width: 34px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.activity-bar-shell {
  width: 20px;
  height: 140px;
  border-radius: 999px;
  background: #e3ebf8;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.activity-bar {
  width: 100%;
  border-radius: inherit;
  background: linear-gradient(180deg, #7aa9f3 0%, #2f70dc 100%);
}

.activity-bar-label {
  font-size: 10px;
  color: #596b87;
  max-width: 34px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-bar-value {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
}

.resume-head {
  margin-bottom: 10px;
}

.resume-note {
  margin: 0;
  color: #51627f;
  font-size: 13px;
}

.resume-result {
  margin-top: 12px;
  border: 1px solid #dbe6f7;
  border-radius: 12px;
  background: #f5f9ff;
  padding: 12px;
}

.resume-result h4 {
  margin: 0 0 8px;
}

.resume-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.certificate-paper {
  border: 1px solid #d7e3f4;
  border-radius: 10px;
  background:
    radial-gradient(500px 180px at 50% 0%, rgba(214, 228, 255, 0.35), transparent 55%),
    #ffffff;
  padding: 16px;
}

.certificate-head {
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2eaf7;
}

.certificate-head h5 {
  margin: 4px 0;
  font-size: 24px;
  line-height: 1.2;
  color: #1e3a8a;
}

.certificate-subtitle {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5a6f95;
}

.certificate-id {
  margin: 0;
  font-size: 12px;
  color: #5c6f90;
}

.certificate-main {
  text-align: center;
  margin-top: 14px;
}

.certificate-text {
  margin: 0;
  color: #40516f;
}

.certificate-name {
  margin: 8px 0;
  font-size: 28px;
  line-height: 1.2;
  color: #1f3f85;
}

.certificate-level {
  margin: 8px 0 0;
  font-size: 18px;
  font-weight: 700;
  color: #173e87;
}

.certificate-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.certificate-meta-label {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5d7198;
}

.certificate-meta-value {
  margin: 3px 0 0;
  font-size: 13px;
  color: #243b63;
  font-weight: 600;
}

.certificate-section {
  margin-top: 12px;
}

.certificate-section h6 {
  margin: 0 0 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #48618f;
}

.resume-skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.resume-skill-list span {
  border: 1px solid #d8e4f6;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 12px;
  background: #f8fbff;
}

.resume-progress-list {
  display: grid;
  gap: 8px;
}

.resume-progress-item {
  border: 1px solid #e1e9f7;
  border-radius: 8px;
  background: #fbfdff;
  padding: 8px;
}

.resume-progress-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}

.resume-progress-head span {
  color: #536480;
  font-size: 12px;
}

.resume-progress-track {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: #dce5f4;
  overflow: hidden;
}

.resume-progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%);
}

.resume-progress-item p {
  margin-top: 6px;
  font-size: 12px;
  color: #55657f;
}

.resume-empty {
  color: #64748b;
}

.certificate-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e4ebf8;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.certificate-footer p {
  margin: 0;
  font-size: 12px;
  color: #425370;
}

@media (max-width: 760px) {
  .user-details-grid {
    grid-template-columns: 1fr;
  }

  .certificate-grid {
    grid-template-columns: 1fr;
  }

  .certificate-footer {
    flex-direction: column;
  }
}
</style>
