<script setup lang="ts">
import { computed, ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { mockProfileData, ProfileData } from "@/shared/mocks/mockProfile"
import { mockRoadmaps } from "@/shared/mocks/mockRoadmaps"
import { useRoadmapsStore } from "@/features/roadmaps/store/roadmaps"
import { useSkillLevelsStore } from "@/features/skill-levels/store/skillLevels"
import { profileApi, type UserActivityDay } from "@/features/profile/api/profile.api"
import { useAuthStore } from "@/features/auth/store/auth"

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

interface ResumePreview {
  fullName: string
  email: string
  country: string
  city: string
  university: string
  desiredRole: string
  phone: string
  portfolioUrl: string
  githubUrl: string
  linkedinUrl: string
  summary: string
  experience: string
  achievements: string
  skills: string[]
  roadmapResults: Array<{
    title: string
    percent: number
    status: string
  }>
  generatedAt: string
}

interface KnowledgeAxis {
  id: string
  label: string
  value: number
}

interface RadarAxisVisual extends KnowledgeAxis {
  end: { x: number; y: number }
  valuePoint: { x: number; y: number }
  labelPoint: { x: number; y: number }
}

const profile = ref<ProfileData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const generatingResume = ref(false)
const generatedResume = ref<ResumePreview | null>(null)
const resumeActionMessage = ref<string | null>(null)
const resumeForm = ref({
  desiredRole: "",
  phone: "",
  portfolioUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  summary: "",
  experience: "",
  achievements: "",
  extraSkills: ""
})
const generatingCertificate = ref(false)
const generatedCertificate = ref<CertificatePreview | null>(null)
const certificateIdInput = ref("")
const certificateAccessGranted = ref(false)
const certificateAccessError = ref<string | null>(null)
const certificateActionMessage = ref<string | null>(null)
const activityDays = ref<UserActivityDay[]>([])
const activityLoading = ref(true)
const activityViewMode = ref<"heatmap" | "chart">("heatmap")
const activityChartRange = ref<"day" | "week" | "month" | "year">("week")
const profilePoints = ref<number | null>(null)

const roadmapsStore = useRoadmapsStore()
const skillLevelsStore = useSkillLevelsStore()
const authStore = useAuthStore()
const router = useRouter()
const radarSize = 360
const radarCenter = radarSize / 2
const radarRadius = 124
const radarLevels = [20, 40, 60, 80, 100]

const shortLabelByRoadmap: Record<string, string> = {
  ai: "AI",
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  mobile: "Mobile"
}

const roleByRoadmapId: Record<string, string> = {
  ai: "AI Engineer",
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  devops: "DevOps Engineer",
  mobile: "Mobile Developer"
}

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

const directionLevelsRows = computed(() => {
  return skillLevelsStore.allLevels
    .map((result) => ({
      ...result,
      title: mockRoadmaps.find((roadmap) => roadmap.id === result.roadmapId)?.title ?? result.roadmapTitle
    }))
    .sort((first, second) => first.title.localeCompare(second.title, "ru"))
})

const knowledgeAxes = computed<KnowledgeAxis[]>(() => {
  return mockRoadmaps.map((roadmap) => {
    const percent = roadmapsStore.getRoadmapProgress(roadmap.id)?.completionPercent ?? 0
    const normalized = Math.min(100, Math.max(0, percent))

    return {
      id: roadmap.id,
      label: shortLabelByRoadmap[roadmap.id] ?? roadmap.title,
      value: normalized
    }
  })
})

const knowledgeAverage = computed(() => {
  if (!knowledgeAxes.value.length) return 0
  const total = knowledgeAxes.value.reduce((sum, axis) => sum + axis.value, 0)
  return Math.round(total / knowledgeAxes.value.length)
})

const toRadarPoint = (index: number, total: number, ratio: number) => {
  const safeTotal = Math.max(1, total)
  const angle = (Math.PI * 2 * index) / safeTotal - Math.PI / 2
  const radius = radarRadius * ratio

  return {
    x: radarCenter + Math.cos(angle) * radius,
    y: radarCenter + Math.sin(angle) * radius
  }
}

const radarAxes = computed<RadarAxisVisual[]>(() => {
  const axes = knowledgeAxes.value
  const total = axes.length

  return axes.map((axis, index) => ({
    ...axis,
    end: toRadarPoint(index, total, 1),
    valuePoint: toRadarPoint(index, total, axis.value / 100),
    labelPoint: toRadarPoint(index, total, 1.15)
  }))
})

const radarKnowledgePolygon = computed(() => {
  return radarAxes.value
    .map((axis) => `${axis.valuePoint.x},${axis.valuePoint.y}`)
    .join(" ")
})

const radarGridPolygons = computed(() => {
  return radarLevels.map((level) => {
    const points = knowledgeAxes.value
      .map((_, index) => {
        const point = toRadarPoint(index, knowledgeAxes.value.length, level / 100)
        return `${point.x},${point.y}`
      })
      .join(" ")

    return {
      level,
      points
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
  activityDays.value = await profileApi.getUserYearActivity(null)
  activityLoading.value = false
}

const loadProfilePoints = async () => {
  const leaderboard = await profileApi.getLeaderboard(authStore.user?.id ?? null)
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

const parseCommaSeparatedValues = (input: string) => {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const buildResumePreview = (): ResumePreview | null => {
  if (!profile.value) return null

  const roadmapResults = roadmapProgressRows.value.map((item) => ({
    title: item.title,
    percent: item.percent,
    status: getProgressStatus(item.percent)
  }))

  const strongestDirections = roadmapResults
    .slice()
    .sort((first, second) => second.percent - first.percent)
    .slice(0, 3)
    .map((item) => item.title)
    .join(", ")

  const summary = strongestDirections
    ? `Развивает карьерный трек в направлениях: ${strongestDirections}.`
    : "Активно формирует базу знаний по выбранным направлениям на платформе."

  const extraSkills = parseCommaSeparatedValues(resumeForm.value.extraSkills)

  return {
    fullName: profile.value.fullName,
    email: profile.value.email,
    country: profile.value.country || "—",
    city: profile.value.city || "—",
    university: profile.value.university || "—",
    desiredRole: resumeForm.value.desiredRole.trim(),
    phone: resumeForm.value.phone.trim(),
    portfolioUrl: resumeForm.value.portfolioUrl.trim(),
    githubUrl: resumeForm.value.githubUrl.trim(),
    linkedinUrl: resumeForm.value.linkedinUrl.trim(),
    summary: resumeForm.value.summary.trim() || summary,
    experience: resumeForm.value.experience.trim(),
    achievements: resumeForm.value.achievements.trim(),
    skills: [...new Set([...profile.value.skills, ...extraSkills])],
    roadmapResults,
    generatedAt: new Date().toLocaleString("ru-RU")
  }
}

const buildCertificatePreview = (): CertificatePreview | null => {
  if (!profile.value) return null

  const avgProgress = roadmapProgressRows.value.length
    ? Math.round(roadmapProgressRows.value.reduce((sum, item) => sum + item.percent, 0) / roadmapProgressRows.value.length)
    : 0

  const certificateId = `SKL-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const verificationCode = Math.random().toString(36).slice(2, 10).toUpperCase()

  return {
    fullName: profile.value.fullName,
    email: profile.value.email,
    certificateId,
    title: "Skillo Skills Certificate",
    issueDate: new Date().toLocaleDateString("ru-RU"),
    verificationCode,
    issuedBy: "Skillo Platform",
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

const buildResumeText = (resume: ResumePreview) => {
  const roadmapLines = resume.roadmapResults.length
    ? resume.roadmapResults.map((item) => `- ${item.title}: ${item.percent}% (${item.status})`).join("\n")
    : "- Нет данных по направлениям"

  const links = [resume.portfolioUrl, resume.githubUrl, resume.linkedinUrl].filter(Boolean)
  const linksText = links.length ? links.map((link) => `- ${link}`).join("\n") : "- Не указаны"

  return [
    "РЕЗЮМЕ (Skillo)",
    `ФИО: ${resume.fullName}`,
    `Желаемая позиция: ${resume.desiredRole || "—"}`,
    `Email: ${resume.email}`,
    `Телефон: ${resume.phone || "—"}`,
    `Локация: ${resume.country}, ${resume.city}`,
    `Университет: ${resume.university}`,
    `Дата генерации: ${resume.generatedAt}`,
    "",
    `О себе: ${resume.summary}`,
    resume.experience ? `Опыт: ${resume.experience}` : "Опыт: —",
    resume.achievements ? `Достижения: ${resume.achievements}` : "Достижения: —",
    "",
    "Ссылки:",
    linksText,
    "",
    "Навыки:",
    resume.skills.length ? resume.skills.map((skill) => `- ${skill}`).join("\n") : "- Нет навыков",
    "",
    "Прогресс по направлениям:",
    roadmapLines
  ].join("\n")
}

const downloadResumeAsTxt = (resume: ResumePreview) => {
  const body = buildResumeText(resume)
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `resume-${resume.fullName.replace(/\s+/g, "-").toLowerCase()}.txt`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const handleResumeAction = async (action: "txt" | "copy") => {
  if (!generatedResume.value) return

  if (action === "txt") {
    downloadResumeAsTxt(generatedResume.value)
    resumeActionMessage.value = "Резюме в формате TXT скачано."
    return
  }

  try {
    await navigator.clipboard.writeText(buildResumeText(generatedResume.value))
    resumeActionMessage.value = "Текст резюме скопирован в буфер обмена."
  } catch {
    resumeActionMessage.value = "Не удалось скопировать резюме автоматически. Попробуйте позже."
  }
}

const buildResumeForDirection = async (roadmapId: string) => {
  const levelResult = skillLevelsStore.getLevel(roadmapId)
  const roadmap = mockRoadmaps.find((item) => item.id === roadmapId)
  if (!levelResult || !roadmap) return

  const role = roleByRoadmapId[roadmapId] ?? "Developer"
  resumeForm.value.desiredRole = `${levelResult.levelLabel} ${role}`
  resumeForm.value.summary = `Сфокусирован(а) на направлении "${roadmap.title}" и подтвердил(а) уровень ${levelResult.levelLabel}.`
  resumeForm.value.experience =
    resumeForm.value.experience.trim() ||
    `Практика по ${roadmap.title}: тесты, учебные проекты и прохождение roadmap на платформе.`

  await generateResume()
  resumeActionMessage.value = `Резюме собрано по направлению "${roadmap.title}" (${levelResult.levelLabel}).`
}

const verifyCertificateAccess = () => {
  if (!generatedCertificate.value) return

  const normalizedInput = certificateIdInput.value.trim().toUpperCase()
  const expectedCertificateId = generatedCertificate.value.certificateId.toUpperCase()

  if (!normalizedInput) {
    certificateAccessGranted.value = false
    certificateAccessError.value = "Введите ID подтверждения из письма."
    certificateActionMessage.value = null
    return
  }

  if (normalizedInput !== expectedCertificateId) {
    certificateAccessGranted.value = false
    certificateAccessError.value = "ID не совпадает. Проверьте письмо и попробуйте снова."
    certificateActionMessage.value = null
    return
  }

  certificateAccessGranted.value = true
  certificateAccessError.value = null
  certificateActionMessage.value = "ID подтвержден. Теперь доступны скачивание и публикация сертификата."
}

const buildCertificateShareText = (certificate: CertificatePreview) => {
  return [
    "Я подтвердил(а) навыки на платформе Skillo.",
    `Сертификат: ${certificate.title}`,
    `ID: ${certificate.certificateId}`,
    `Уровень: ${certificate.overallLevel}`,
    `Дата выдачи: ${certificate.issueDate}`
  ].join("\n")
}

const downloadCertificateAsTxt = (certificate: CertificatePreview) => {
  const body = [
    `${certificate.title}`,
    `ID сертификата: ${certificate.certificateId}`,
    `Код проверки: ${certificate.verificationCode}`,
    `Имя: ${certificate.fullName}`,
    `Email: ${certificate.email}`,
    `Дата выдачи: ${certificate.issueDate}`,
    `Уровень: ${certificate.overallLevel}`,
    `Пройдено тестов: ${certificate.completedTests}`
  ].join("\n")

  const blob = new Blob([body], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `certificate-${certificate.certificateId}.txt`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const handleCertificateAction = async (action: "pdf" | "docx" | "txt" | "linkedin" | "telegram") => {
  if (!generatedCertificate.value || !certificateAccessGranted.value) return

  if (action === "pdf" || action === "docx") {
    certificateActionMessage.value = `${action.toUpperCase()} будет доступен в следующем обновлении.`
    return
  }

  if (action === "txt") {
    downloadCertificateAsTxt(generatedCertificate.value)
    certificateActionMessage.value = "TXT сертификат скачан."
    return
  }

  const shareText = buildCertificateShareText(generatedCertificate.value)

  try {
    await navigator.clipboard.writeText(shareText)
    const channelLabel = action === "linkedin" ? "LinkedIn" : "Telegram"
    certificateActionMessage.value = `Текст для ${channelLabel} скопирован в буфер обмена.`
  } catch {
    certificateActionMessage.value = "Не удалось скопировать текст автоматически. Попробуйте позже."
  }
}

const generateResume = async () => {
  if (!profile.value) return

  generatingResume.value = true
  await new Promise((resolve) => setTimeout(resolve, 700))
  generatedResume.value = buildResumePreview()
  resumeActionMessage.value = "Резюме сформировано."
  generatingResume.value = false
}

const generateCertificate = async () => {
  if (!profile.value) return

  generatingCertificate.value = true
  await new Promise((resolve) => setTimeout(resolve, 700))
  generatedCertificate.value = buildCertificatePreview()
  certificateIdInput.value = ""
  certificateAccessGranted.value = false
  certificateAccessError.value = null
  certificateActionMessage.value = `ID подтверждения для сертификата отправлен на email ${profile.value.email}.`
  generatingCertificate.value = false
}

const logoutFromProfile = () => {
  authStore.logout()
  router.push("/auth")
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
        <div class="profile-header-main">
          <div class="avatar">{{ profile.fullName?.charAt(0) }}</div>
          <div>
            <h1>{{ profile.fullName }}</h1>
            <p class="email">{{ profile.email }}</p>
          </div>
        </div>
        <button type="button" class="profile-logout-btn" @click="logoutFromProfile">Выход</button>
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

      <!-- Knowledge Radar -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Паутина знаний</h2>
          <p class="section-note">Распределение уровня по ключевым направлениям.</p>
        </div>

        <div class="knowledge-shell">
          <div class="knowledge-radar-card">
            <svg
              class="knowledge-radar"
              :viewBox="`0 0 ${radarSize} ${radarSize}`"
              aria-label="Диаграмма знаний по направлениям"
            >
              <g class="radar-grid">
                <polygon
                  v-for="item in radarGridPolygons"
                  :key="`grid-${item.level}`"
                  :points="item.points"
                />
              </g>

              <g class="radar-axis">
                <line
                  v-for="axis in radarAxes"
                  :key="`axis-${axis.id}`"
                  :x1="radarCenter"
                  :y1="radarCenter"
                  :x2="axis.end.x"
                  :y2="axis.end.y"
                />
              </g>

              <polygon v-if="radarKnowledgePolygon" class="radar-shape" :points="radarKnowledgePolygon" />

              <g class="radar-points">
                <circle
                  v-for="axis in radarAxes"
                  :key="`point-${axis.id}`"
                  :cx="axis.valuePoint.x"
                  :cy="axis.valuePoint.y"
                  r="4"
                />
              </g>

              <g class="radar-labels">
                <text
                  v-for="axis in radarAxes"
                  :key="`label-${axis.id}`"
                  :x="axis.labelPoint.x"
                  :y="axis.labelPoint.y"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {{ axis.label }}
                </text>
              </g>
            </svg>
          </div>

          <div class="knowledge-stats">
            <div class="knowledge-summary">
              <span>Средний уровень</span>
              <strong>{{ knowledgeAverage }}%</strong>
            </div>

            <div class="knowledge-list">
              <article v-for="axis in radarAxes" :key="`stat-${axis.id}`" class="knowledge-item">
                <div class="knowledge-item-head">
                  <span>{{ axis.label }}</span>
                  <strong>{{ axis.value }}%</strong>
                </div>
                <div class="knowledge-track">
                  <span :style="{ width: `${axis.value}%` }" />
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- Resume -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Резюме</h2>
          <p class="section-note">Заполните поля от себя и сформируйте резюме через платформу.</p>
        </div>

        <details class="resume-fields-panel">
          <summary>Добавить поля от себя (опционально)</summary>

          <div class="resume-fields-body">
            <div class="resume-form-grid">
              <label class="resume-field">
                <span>Желаемая позиция</span>
                <input v-model="resumeForm.desiredRole" type="text" placeholder="Например: Frontend Developer" />
              </label>

              <label class="resume-field">
                <span>Телефон</span>
                <input v-model="resumeForm.phone" type="text" placeholder="+7 777 000 00 00" />
              </label>

              <label class="resume-field">
                <span>Портфолио</span>
                <input v-model="resumeForm.portfolioUrl" type="text" placeholder="https://portfolio.example" />
              </label>

              <label class="resume-field">
                <span>GitHub</span>
                <input v-model="resumeForm.githubUrl" type="text" placeholder="https://github.com/username" />
              </label>

              <label class="resume-field">
                <span>LinkedIn</span>
                <input v-model="resumeForm.linkedinUrl" type="text" placeholder="https://linkedin.com/in/username" />
              </label>

              <label class="resume-field resume-field--wide">
                <span>Дополнительные навыки (через запятую)</span>
                <input v-model="resumeForm.extraSkills" type="text" placeholder="TypeScript, Docker, SQL" />
              </label>

              <label class="resume-field resume-field--wide">
                <span>О себе</span>
                <textarea
                  v-model="resumeForm.summary"
                  rows="3"
                  placeholder="Кратко опишите ваш профиль, сильные стороны и карьерные цели"
                />
              </label>

              <label class="resume-field resume-field--wide">
                <span>Опыт</span>
                <textarea
                  v-model="resumeForm.experience"
                  rows="3"
                  placeholder="Укажите ваш опыт: стажировки, проекты, коммерческая разработка"
                />
              </label>

              <label class="resume-field resume-field--wide">
                <span>Достижения</span>
                <textarea
                  v-model="resumeForm.achievements"
                  rows="3"
                  placeholder="Опишите ваши достижения: конкурсы, хакатоны, результаты проектов"
                />
              </label>
            </div>
          </div>
        </details>

        <button class="btn-primary" :disabled="generatingResume" @click="generateResume">
          <span v-if="generatingResume" class="spinner" />
          {{ generatingResume ? "Генерация..." : "Сгенерировать резюме" }}
        </button>

        <div v-if="generatedResume" class="resume-container">
          <h3 class="cert-preview-title">Предпросмотр резюме</h3>

          <article class="resume-card">
            <header class="resume-head">
              <h4>{{ generatedResume.fullName }}</h4>
              <p v-if="generatedResume.desiredRole" class="resume-role">{{ generatedResume.desiredRole }}</p>
              <p>{{ generatedResume.email }} · {{ generatedResume.country }}, {{ generatedResume.city }}</p>
              <p v-if="generatedResume.phone">Телефон: {{ generatedResume.phone }}</p>
              <p>{{ generatedResume.university }}</p>
            </header>

            <p class="resume-summary">{{ generatedResume.summary }}</p>

            <section
              v-if="generatedResume.portfolioUrl || generatedResume.githubUrl || generatedResume.linkedinUrl"
              class="resume-section"
            >
              <h6>Ссылки</h6>
              <div class="resume-links">
                <a v-if="generatedResume.portfolioUrl" :href="generatedResume.portfolioUrl" target="_blank" rel="noreferrer">
                  Портфолио
                </a>
                <a v-if="generatedResume.githubUrl" :href="generatedResume.githubUrl" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a v-if="generatedResume.linkedinUrl" :href="generatedResume.linkedinUrl" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </div>
            </section>

            <section v-if="generatedResume.experience" class="resume-section">
              <h6>Опыт</h6>
              <p class="resume-free-text">{{ generatedResume.experience }}</p>
            </section>

            <section v-if="generatedResume.achievements" class="resume-section">
              <h6>Достижения</h6>
              <p class="resume-free-text">{{ generatedResume.achievements }}</p>
            </section>

            <section class="resume-section">
              <h6>Ключевые навыки</h6>
              <div class="cert-skills">
                <span v-for="skill in generatedResume.skills" :key="`resume-skill-${skill}`">{{ skill }}</span>
              </div>
            </section>

            <section class="resume-section">
              <h6>Прогресс по направлениям</h6>
              <div v-if="generatedResume.roadmapResults.length" class="cert-progress-list">
                <div
                  v-for="item in generatedResume.roadmapResults"
                  :key="`resume-progress-${item.title}`"
                  class="cert-progress-item"
                >
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

            <p class="resume-meta">Обновлено: {{ generatedResume.generatedAt }}</p>
          </article>

          <div class="resume-actions">
            <button class="btn-secondary" @click="handleResumeAction('txt')">Скачать TXT</button>
            <button class="btn-secondary" @click="handleResumeAction('copy')">Скопировать текст</button>
          </div>

          <p v-if="resumeActionMessage" class="resume-action-note">{{ resumeActionMessage }}</p>
        </div>
      </section>

      <!-- Direction Levels -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Уровни по направлениям</h2>
          <p class="section-note">
            Пройдите тесты на странице определения уровня и соберите резюме под конкретное направление.
          </p>
        </div>

        <router-link to="/skill-levels" class="levels-link">
          Перейти к странице определения уровня
        </router-link>

        <div v-if="directionLevelsRows.length" class="direction-levels-list">
          <article
            v-for="item in directionLevelsRows"
            :key="`direction-level-${item.roadmapId}`"
            class="direction-level-card"
          >
            <div class="direction-level-main">
              <strong>{{ item.title }}</strong>
              <span>Уровень: {{ item.levelLabel }}</span>
            </div>

            <button class="btn-secondary" @click="buildResumeForDirection(item.roadmapId)">
              Собрать резюме
            </button>
          </article>
        </div>

        <p v-else class="muted">
          Уровни пока не определены. Пройдите тесты по направлениям.
        </p>
      </section>

      <!-- Certificate -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Сертификат Skillo</h2>
          <p class="section-note">Сертификат от Skillo. Для скачивания и публикации требуется ID подтверждения.</p>
        </div>

        <button class="btn-primary" :disabled="generatingCertificate" @click="generateCertificate">
          <span v-if="generatingCertificate" class="spinner" />
          {{ generatingCertificate ? "Генерация..." : "Сгенерировать сертификат Skillo" }}
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
              <p>Статус: Сертификат подтверждения навыков Skillo</p>
            </footer>
          </article>

          <div class="cert-actions">
            <div class="cert-id-gate">
              <p>Чтобы скачать и поделиться сертификатом, введите ID подтверждения из письма.</p>

              <div class="cert-id-gate-row">
                <input
                  v-model="certificateIdInput"
                  type="text"
                  placeholder="Введите ID подтверждения"
                />
                <button class="btn-secondary" @click="verifyCertificateAccess">
                  Подтвердить ID
                </button>
              </div>

              <p v-if="certificateAccessError" class="cert-id-error">{{ certificateAccessError }}</p>
              <p v-else-if="certificateAccessGranted" class="cert-id-success">
                Доступ подтвержден. Вы можете скачать и поделиться сертификатом.
              </p>
            </div>

            <div class="cert-actions-grid">
              <button class="btn-secondary" :disabled="!certificateAccessGranted" @click="handleCertificateAction('pdf')">
                Скачать PDF
              </button>
              <button class="btn-secondary" :disabled="!certificateAccessGranted" @click="handleCertificateAction('docx')">
                Скачать DOCX
              </button>
              <button class="btn-secondary" :disabled="!certificateAccessGranted" @click="handleCertificateAction('txt')">
                Скачать TXT
              </button>
              <button class="btn-secondary" :disabled="!certificateAccessGranted" @click="handleCertificateAction('linkedin')">
                LinkedIn
              </button>
              <button class="btn-secondary" :disabled="!certificateAccessGranted" @click="handleCertificateAction('telegram')">
                Telegram
              </button>
            </div>

            <p v-if="certificateActionMessage" class="cert-action-note">{{ certificateActionMessage }}</p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 42px 20px 76px;
  font-family: inherit;
  color: var(--text);
  position: relative;
  isolation: isolate;
}

.profile-page::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(420px 220px at 2% 0%, rgba(28, 28, 28, 0.06), transparent 72%),
    radial-gradient(360px 200px at 98% 4%, rgba(28, 28, 28, 0.05), transparent 74%);
}

.profile-content {
  display: grid;
  gap: 14px;
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
  justify-content: space-between;
  gap: 14px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  box-shadow: var(--shadow-sm);
  padding: 18px;
}

.profile-header-main {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-logout-btn {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text);
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
}

.profile-logout-btn:hover {
  border-color: var(--soft-border);
  background: var(--surface-soft);
  color: var(--text);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--button-text);
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
  margin-bottom: 0;
}

.meta-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  text-align: center;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.meta-card:hover {
  border-color: var(--soft-border);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
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
  border: 1px solid var(--border);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  box-shadow: var(--shadow-sm);
  padding: 18px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin: 0 0 16px;
}

.section-title::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text);
  opacity: 0.55;
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
  transition: border-color 0.2s ease, background 0.2s ease;
}

.tag:hover {
  border-color: var(--soft-border);
  background: var(--surface);
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
  background: linear-gradient(180deg, var(--surface-soft) 0%, var(--surface) 100%);
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
  background: var(--surface);
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

/* Knowledge Radar */
.knowledge-shell {
  display: grid;
  grid-template-columns: minmax(290px, 1fr) minmax(220px, 1fr);
  gap: 12px;
  align-items: stretch;
}

.knowledge-radar-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  padding: 12px;
  box-shadow: var(--shadow-sm);
}

.knowledge-radar {
  width: 100%;
  height: auto;
  display: block;
}

.radar-grid polygon {
  fill: none;
  stroke: var(--border);
  stroke-width: 1;
}

.radar-axis line {
  stroke: var(--border);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}

.radar-shape {
  fill: rgba(255, 142, 60, 0.28);
  stroke: var(--primary);
  stroke-width: 2;
}

.radar-points circle {
  fill: var(--primary);
  stroke: var(--surface);
  stroke-width: 2;
}

.radar-labels text {
  fill: var(--muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.knowledge-stats {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  padding: 12px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.knowledge-summary {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.knowledge-summary span {
  font-size: 12px;
  color: var(--muted);
}

.knowledge-summary strong {
  font-size: 24px;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--text);
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  padding: 10px;
}

.knowledge-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.knowledge-item-head span {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.knowledge-item-head strong {
  font-size: 12px;
  color: var(--muted);
}

.knowledge-track {
  width: 100%;
  height: 6px;
  border-radius: 100px;
  background: var(--border);
  overflow: hidden;
}

.knowledge-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
  transition: width 0.25s ease;
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
  color: var(--button-text);
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
  background: var(--surface);
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

/* Resume */
.resume-fields-panel {
  margin-bottom: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  overflow: hidden;
}

.resume-fields-panel > summary {
  cursor: pointer;
  list-style: none;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.resume-fields-panel > summary::-webkit-details-marker {
  display: none;
}

.resume-fields-panel[open] > summary {
  border-bottom: 1px solid var(--border);
  background: var(--surface-soft);
}

.resume-fields-body {
  padding: 12px;
}

.resume-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.resume-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resume-field > span {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

.resume-field--wide {
  grid-column: 1 / -1;
}

.resume-container {
  margin-top: 20px;
}

.resume-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.resume-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.resume-head h4 {
  margin: 0;
  font-size: 21px;
  color: var(--text);
  letter-spacing: -0.02em;
}

.resume-head p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.resume-role {
  font-size: 14px !important;
  color: var(--text) !important;
  font-weight: 600;
}

.resume-summary {
  margin: 14px 0 0;
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
}

.resume-section {
  padding-top: 14px;
}

.resume-section h6 {
  margin: 0 0 10px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 600;
}

.resume-meta {
  margin: 16px 0 0;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted);
}

.resume-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.resume-links a {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 5px 10px;
  background: var(--surface-soft);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
}

.resume-free-text {
  margin: 0;
  color: var(--text);
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
}

.resume-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.resume-action-note {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.levels-link {
  display: inline-flex;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
}

.direction-levels-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.direction-level-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.direction-level-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.direction-level-main strong {
  font-size: 14px;
  color: var(--text);
}

.direction-level-main span {
  font-size: 12px;
  color: var(--muted);
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
  background: var(--surface);
  padding: 28px 24px;
  box-shadow: var(--shadow-sm);
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
  flex-direction: column;
  gap: 8px;
}

.cert-id-gate {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  padding: 10px;
}

.cert-id-gate p {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.cert-id-gate-row {
  margin-top: 8px;
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto;
  gap: 8px;
}

.cert-id-error {
  margin-top: 6px !important;
  color: #dc2626 !important;
  font-weight: 600;
}

.cert-id-success {
  margin-top: 6px !important;
  color: #15803d !important;
  font-weight: 600;
}

.cert-actions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cert-action-note {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

/* Responsive */
@media (max-width: 640px) {
  .profile-page {
    padding: 32px 16px 60px;
  }

  .section {
    padding: 16px;
  }

  .profile-header {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-header-main {
    gap: 14px;
  }

  .profile-logout-btn {
    width: 100%;
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

  .cert-id-gate-row {
    grid-template-columns: 1fr;
  }

  .resume-form-grid {
    grid-template-columns: 1fr;
  }

  .direction-level-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .toggle-bar {
    flex-direction: column;
  }

  .knowledge-shell {
    grid-template-columns: 1fr;
  }

  .knowledge-summary strong {
    font-size: 22px;
  }
}
</style>
