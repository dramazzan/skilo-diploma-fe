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
  <div class="profile-page">

    <!-- Loading -->
    <div v-if="loading" class="state-view">
      <span class="loader" />
      <p>Загрузка профиля...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-view">
      <p class="error-text">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="profile" class="profile-content">

      <!-- Header -->
      <div class="profile-header">
        <div class="avatar">{{ profile.fullName?.charAt(0) }}</div>
        <div>
          <h1>{{ profile.fullName }}</h1>
          <p class="email">{{ profile.email }}</p>
        </div>
      </div>

      <!-- Meta Stats -->
      <div class="meta-grid">
        <div class="meta-card">
          <span>Дата регистрации</span>
          <strong>{{ profile.joinedAt }}</strong>
        </div>
        <div class="meta-card">
          <span>Пройдено тестов</span>
          <strong>{{ profile.completedTests }}</strong>
        </div>
        <div class="meta-card">
          <span>Очки</span>
          <strong class="trophy-value">
            <svg class="trophy-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4h8v2h3a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-.17A6.01 6.01 0 0 1 13 16.92V19h3v2H8v-2h3v-2.08A6.01 6.01 0 0 1 9.17 13H9a5 5 0 0 1-5-5V7a1 1 0 0 1 1-1h3V4Zm-2 4a3 3 0 0 0 3 3h.03A6.03 6.03 0 0 1 8 8V8H6Zm12 0v0a6.03 6.03 0 0 1-1.03 3H17a3 3 0 0 0 3-3h-2Z" fill="currentColor"/>
            </svg>
            {{ profilePoints ?? "---" }}
          </strong>
        </div>
      </div>

      <!-- Skills -->
      <section class="section">
        <h2 class="section-title">Навыки</h2>
        <div class="tag-list">
          <span v-for="skill in profile.skills" :key="skill" class="tag">{{ skill }}</span>
        </div>
      </section>

      <!-- Achievements -->
      <section class="section">
        <h2 class="section-title">Достижения</h2>
        <ul class="ach-list">
          <li v-for="ach in profile.achievements" :key="ach">
            <span class="ach-dot" />
            {{ ach }}
          </li>
        </ul>
      </section>

      <!-- User Details -->
      <section class="section">
        <h2 class="section-title">Данные пользователя</h2>
        <p v-if="!userDetails.length" class="muted">Данные пользователя не загружены.</p>
        <div v-else class="details-grid">
          <div v-for="item in userDetails" :key="item.label" class="detail-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </section>

      <!-- Activity -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Активность за год</h2>
          <p class="section-note">Рассчитывается автоматически по результатам тестов.</p>
        </div>

        <div class="activity-stats">
          <span>Активных дней: <strong>{{ activityStats.totalActiveDays }}</strong></span>
          <span>Сумма: <strong>{{ activityStats.totalPoints }}</strong></span>
        </div>

        <div class="toggle-bar">
          <div class="toggle-group">
            <button
              :class="{ active: activityViewMode === 'heatmap' }"
              @click="activityViewMode = 'heatmap'"
            >Тепловая карта</button>
            <button
              :class="{ active: activityViewMode === 'chart' }"
              @click="activityViewMode = 'chart'"
            >Диаграмма</button>
          </div>

          <div v-if="activityViewMode === 'chart'" class="toggle-group">
            <button :class="{ active: activityChartRange === 'day' }" @click="activityChartRange = 'day'">Дни</button>
            <button :class="{ active: activityChartRange === 'week' }" @click="activityChartRange = 'week'">Недели</button>
            <button :class="{ active: activityChartRange === 'month' }" @click="activityChartRange = 'month'">Месяцы</button>
            <button :class="{ active: activityChartRange === 'year' }" @click="activityChartRange = 'year'">Годы</button>
          </div>
        </div>

        <div v-if="activityLoading" class="muted">Загрузка активности...</div>

        <!-- Heatmap -->
        <div v-else-if="activityViewMode === 'heatmap'" class="heatmap-wrap">
          <div class="heatmap" aria-label="Годовая активность">
            <div v-for="(week, wi) in activityWeeks" :key="`w-${wi}`" class="heatmap-week">
              <span
                v-for="(day, di) in week"
                :key="`d-${wi}-${di}`"
                class="heatmap-day"
                :class="day ? `level-${day.level}` : 'level-empty'"
                :title="day ? `${toRuDate(day.date)} - уровень ${day.level}` : ''"
              />
            </div>
          </div>
          <div class="heatmap-legend">
            <span>Меньше</span>
            <i class="heatmap-day level-0" />
            <i class="heatmap-day level-1" />
            <i class="heatmap-day level-2" />
            <i class="heatmap-day level-3" />
            <i class="heatmap-day level-4" />
            <span>Больше</span>
          </div>
        </div>

        <!-- Chart -->
        <div v-else class="chart-wrap">
          <div class="chart">
            <div v-for="(item, index) in activityChartData" :key="`${item.label}-${index}`" class="bar-col">
              <div class="bar-shell">
                <span class="bar-fill" :style="{ height: `${Math.max(4, (item.value / activityChartMax) * 100)}%` }" />
              </div>
              <span class="bar-label">{{ item.label }}</span>
              <span class="bar-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Certificate -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Сертификат</h2>
          <p class="section-note">Генерация сертификата на основе навыков и прогресса.</p>
        </div>

        <button class="btn-primary" :disabled="generatingResume" @click="generateResume">
          <span v-if="generatingResume" class="spinner" />
          {{ generatingResume ? "Генерация..." : "Сгенерировать сертификат" }}
        </button>

        <div v-if="generatedCertificate" class="certificate-container">
          <h3 class="cert-preview-title">Предпросмотр сертификата</h3>

          <article class="certificate">
            <header class="cert-header">
              <p class="cert-issuer">{{ generatedCertificate.issuedBy }}</p>
              <h4 class="cert-title">{{ generatedCertificate.title }}</h4>
              <p class="cert-id">ID: {{ generatedCertificate.certificateId }}</p>
            </header>

            <section class="cert-body">
              <p>Настоящим подтверждается, что</p>
              <h5 class="cert-name">{{ generatedCertificate.fullName }}</h5>
              <p>успешно проходит обучение по дорожным картам платформы и демонстрирует уровень:</p>
              <p class="cert-level">{{ generatedCertificate.overallLevel }}</p>
            </section>

            <section class="cert-meta-grid">
              <div>
                <span>Email</span>
                <strong>{{ generatedCertificate.email }}</strong>
              </div>
              <div>
                <span>Дата выдачи</span>
                <strong>{{ generatedCertificate.issueDate }}</strong>
              </div>
              <div>
                <span>Код проверки</span>
                <strong>{{ generatedCertificate.verificationCode }}</strong>
              </div>
            </section>

            <section class="cert-section">
              <h6>Подтверждённые навыки</h6>
              <div class="cert-skills">
                <span v-for="skill in generatedCertificate.skills" :key="skill">{{ skill }}</span>
              </div>
            </section>

            <section class="cert-section">
              <h6>Результаты по направлениям</h6>
              <div v-if="generatedCertificate.roadmapResults.length" class="cert-progress-list">
                <div v-for="item in generatedCertificate.roadmapResults" :key="item.title" class="cert-progress-item">
                  <div class="cert-progress-head">
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.percent }}% - {{ item.status }}</span>
                  </div>
                  <div class="cert-progress-track">
                    <span :style="{ width: `${item.percent}%` }" />
                  </div>
                </div>
              </div>
              <p v-else class="muted">Нет данных по направлениям.</p>
            </section>

            <footer class="cert-footer">
              <p>Пройдено тестов: <strong>{{ generatedCertificate.completedTests }}</strong></p>
              <p>Статус: Сертификат учебного прогресса</p>
            </footer>
          </article>

          <div class="cert-actions">
            <button class="btn-secondary" disabled>Скачать PDF (скоро)</button>
            <button class="btn-secondary" disabled>Скачать DOCX (скоро)</button>
            <button class="btn-secondary" disabled>Скачать TXT (скоро)</button>
            <button class="btn-secondary" disabled>LinkedIn (скоро)</button>
            <button class="btn-secondary" disabled>Telegram (скоро)</button>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 20px 80px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text);
}

/* States */
.state-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  gap: 12px;
}

.state-view p {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
}

.error-text {
  color: #dc2626;
}

.loader {
  width: 24px;
  height: 24px;
  border: 2.5px solid var(--border);
  border-top-color: var(--text);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-header h1 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 2px;
  color: var(--text);
}

.email {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

/* Meta Grid */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 32px;
}

.meta-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  text-align: center;
}

.meta-card span {
  display: block;
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

.meta-card strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.trophy-value {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.trophy-icon {
  width: 18px;
  height: 18px;
  color: #d4a000;
}

/* Sections */
.section {
  padding: 24px 0;
  border-top: 1px solid var(--border);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin: 0 0 16px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header .section-title {
  margin-bottom: 4px;
}

.section-note {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
}

.muted {
  font-size: 14px;
  color: var(--muted);
}

/* Tags */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 100px;
  background: var(--surface-soft);
  color: var(--text);
  border: 1px solid var(--border);
}

/* Achievements */
.ach-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ach-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text);
}

.ach-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
}

/* User Details */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.detail-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--surface-soft);
}

.detail-item span {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.detail-item strong {
  display: block;
  font-size: 14px;
  color: var(--text);
}

/* Activity */
.activity-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--muted);
}

.activity-stats strong {
  color: var(--text);
}

.toggle-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.toggle-group {
  display: flex;
  gap: 4px;
}

.toggle-group button {
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-group button:hover {
  border-color: var(--border);
  color: var(--muted);
}

.toggle-group button.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--text);
}

/* Heatmap */
.heatmap-wrap {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  padding: 14px;
}

.heatmap {
  display: flex;
  gap: 3px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.heatmap-week {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
}

.heatmap-day {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: none;
  background: var(--border);
}

.heatmap-day.level-empty {
  opacity: 0;
  pointer-events: none;
}

.heatmap-day.level-0 { background: var(--border); }
.heatmap-day.level-1 { background: var(--border); }
.heatmap-day.level-2 { background: var(--muted); }
.heatmap-day.level-3 { background: var(--muted); }
.heatmap-day.level-4 { background: var(--primary); }

.heatmap-legend {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--muted);
}

.heatmap-legend .heatmap-day {
  width: 10px;
  height: 10px;
}

/* Chart */
.chart-wrap {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  padding: 14px;
}

.chart {
  min-height: 200px;
  display: flex;
  align-items: flex-end;
  gap: 5px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.bar-col {
  min-width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bar-shell {
  width: 18px;
  height: 140px;
  border-radius: 100px;
  background: var(--border);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  border-radius: inherit;
  background: var(--primary);
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 10px;
  color: var(--muted);
}

.bar-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  background: var(--primary);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:disabled {
  background: var(--border);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  border-color: var(--border);
  background: var(--surface-soft);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Certificate */
.certificate-container {
  margin-top: 20px;
}

.cert-preview-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 14px;
}

.certificate {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 28px 24px;
}

.cert-header {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.cert-issuer {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.cert-title {
  margin: 6px 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.cert-id {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.cert-body {
  text-align: center;
  padding: 20px 0;
}

.cert-body p {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.cert-name {
  margin: 10px 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.cert-level {
  margin: 10px 0 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.cert-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.cert-meta-grid div {
  text-align: center;
}

.cert-meta-grid span {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin-bottom: 4px;
}

.cert-meta-grid strong {
  font-size: 13px;
  color: var(--text);
}

.cert-section {
  padding-top: 16px;
}

.cert-section h6 {
  margin: 0 0 10px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 600;
}

.cert-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cert-skills span {
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--muted);
  background: var(--surface-soft);
}

.cert-progress-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cert-progress-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  padding: 10px 12px;
}

.cert-progress-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.cert-progress-head strong {
  color: var(--text);
}

.cert-progress-head span {
  color: var(--muted);
  font-size: 12px;
}

.cert-progress-track {
  width: 100%;
  height: 6px;
  border-radius: 100px;
  background: var(--border);
  overflow: hidden;
}

.cert-progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
  transition: width 0.3s ease;
}

.cert-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.cert-footer p {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.cert-footer strong {
  color: var(--text);
}

.cert-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Responsive */
@media (max-width: 640px) {
  .profile-page {
    padding: 32px 16px 60px;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .cert-meta-grid {
    grid-template-columns: 1fr;
  }

  .cert-footer {
    flex-direction: column;
  }

  .toggle-bar {
    flex-direction: column;
  }
}
</style>