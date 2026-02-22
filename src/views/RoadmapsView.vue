<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useRoadmapsStore } from "@/store/roadmaps"
import { useAuthStore } from "@/store/auth"

interface CustomRoadmapDraft {
  id: string
  title: string
  goal: string
  directionIds: string[]
  generationMode: "single" | "multiple"
  milestones: string[]
  createdAt: string
}

const router = useRouter()
const roadmapsStore = useRoadmapsStore()
const authStore = useAuthStore()
const removingRoadmapId = ref<string | null>(null)
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const generatedTracks = ref<CustomRoadmapDraft[]>([])
const customTracks = ref<CustomRoadmapDraft[]>([])
const CUSTOM_TRACKS_STORAGE_KEY = "custom_ai_tracks"

const aiForm = ref({
  title: "",
  goal: "",
  interests: "",
  selectedDirectionIds: [] as string[],
  generationMode: "single" as "single" | "multiple"
})

const myRoadmaps = computed(() => roadmapsStore.myRoadmaps)
const availableRoadmaps = computed(() => roadmapsStore.availableRoadmaps)
const allRoadmaps = computed(() => [...myRoadmaps.value, ...availableRoadmaps.value])
const completedRoadmaps = computed(() => {
  return myRoadmaps.value.filter((roadmap) => getProgressPercent(roadmap.id) >= 100).length
})

const roadmapTitlesMap = computed(() => {
  return allRoadmaps.value.reduce<Record<string, string>>((acc, roadmap) => {
    acc[roadmap.id] = roadmap.title
    return acc
  }, {})
})

const relatedDirectionsByRoadmap: Record<string, string[]> = {
  ai: ["backend", "devops", "frontend"],
  frontend: ["backend", "mobile", "ai"],
  backend: ["devops", "ai", "frontend"],
  devops: ["backend", "ai", "frontend"],
  mobile: ["frontend", "backend", "ai"]
}

const compatibilityByPair: Record<string, number> = {
  "ai:backend": 88,
  "ai:frontend": 72,
  "ai:devops": 80,
  "ai:mobile": 58,
  "backend:frontend": 92,
  "backend:devops": 94,
  "backend:mobile": 64,
  "frontend:devops": 66,
  "frontend:mobile": 86,
  "devops:mobile": 49
}

const pairKey = (first: string, second: string) => {
  return [first, second].sort().join(":")
}

const selectedDirections = computed(() => {
  return aiForm.value.selectedDirectionIds
    .map((id) => allRoadmaps.value.find((roadmap) => roadmap.id === id))
    .filter((item): item is (typeof allRoadmaps.value)[number] => Boolean(item))
})

const compatibilityPairs = computed(() => {
  const ids = aiForm.value.selectedDirectionIds
  const pairs: Array<{ ids: [string, string]; score: number }> = []

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const key = pairKey(ids[i], ids[j])
      pairs.push({
        ids: [ids[i], ids[j]],
        score: compatibilityByPair[key] ?? 56
      })
    }
  }

  return pairs
})

const compatibilityPercent = computed(() => {
  if (compatibilityPairs.value.length === 0) return 100
  const total = compatibilityPairs.value.reduce((sum, pair) => sum + pair.score, 0)
  return Math.round(total / compatibilityPairs.value.length)
})

const weakCompatibilityPairs = computed(() => {
  return compatibilityPairs.value
    .filter((pair) => pair.score < 60)
    .map((pair) => {
      const first = roadmapTitlesMap.value[pair.ids[0]] ?? pair.ids[0]
      const second = roadmapTitlesMap.value[pair.ids[1]] ?? pair.ids[1]
      return `${first} + ${second}`
    })
})

const relatedSuggestions = computed(() => {
  const ownDirections = myRoadmaps.value.map((roadmap) => roadmap.id)
  const selected = aiForm.value.selectedDirectionIds
  const fromSelected = selected.flatMap((id) => relatedDirectionsByRoadmap[id] ?? [])
  const fromOwn = ownDirections.flatMap((id) => relatedDirectionsByRoadmap[id] ?? [])
  const merged = [...fromSelected, ...fromOwn]
  const filtered = merged.filter((id, index) => merged.indexOf(id) === index)

  return filtered
    .map((id) => allRoadmaps.value.find((roadmap) => roadmap.id === id))
    .filter((item): item is (typeof allRoadmaps.value)[number] => Boolean(item))
    .filter((item) => !selected.includes(item.id))
    .slice(0, 4)
})

const openRoadmap = (id: string) => {
  router.push(`/roadmaps/${id}`)
}

const startAssessment = (id: string) => {
  router.push(`/roadmaps/${id}/assessment`)
}

const getAssignedLevel = (id: string, fallback: string) => {
  return roadmapsStore.getRoadmapLevel(id) ?? fallback
}

const getLevelClass = (level: string) => {
  const normalized = level.toLowerCase()

  if (normalized === "beginner") return "level-beginner"
  if (normalized === "intermediate") return "level-intermediate"
  if (normalized === "advanced") return "level-advanced"

  return ""
}

const getRoadmapProgress = (roadmapId: string) => {
  return roadmapsStore.getRoadmapProgress(roadmapId)
}

const getProgressPercent = (roadmapId: string) => {
  return getRoadmapProgress(roadmapId)?.completionPercent ?? 0
}

const getProgressMeta = (roadmapId: string) => {
  const progress = getRoadmapProgress(roadmapId)
  if (!progress) return "0/0 тем"

  return `${progress.completedTopics}/${progress.totalTopics} тем`
}

onMounted(() => {
  void roadmapsStore.loadUserRoadmapCollection(authStore.user?.id ?? null)
  void roadmapsStore.loadRoadmapProgress(authStore.user?.id ?? null)

  const rawTracks = localStorage.getItem(CUSTOM_TRACKS_STORAGE_KEY)
  if (!rawTracks) return

  try {
    customTracks.value = JSON.parse(rawTracks) as CustomRoadmapDraft[]
  } catch {
    customTracks.value = []
  }
})

const removeRoadmap = async (roadmapId: string) => {
  removingRoadmapId.value = roadmapId
  await roadmapsStore.removeRoadmapFromCollection(roadmapId, authStore.user?.id ?? null)
  removingRoadmapId.value = null
}

const persistCustomTracks = () => {
  localStorage.setItem(CUSTOM_TRACKS_STORAGE_KEY, JSON.stringify(customTracks.value))
}

const isDirectionSelected = (roadmapId: string) => {
  return aiForm.value.selectedDirectionIds.includes(roadmapId)
}

const toggleDirection = (roadmapId: string) => {
  if (isDirectionSelected(roadmapId)) {
    aiForm.value.selectedDirectionIds = aiForm.value.selectedDirectionIds.filter((id) => id !== roadmapId)
    return
  }

  aiForm.value.selectedDirectionIds = [...aiForm.value.selectedDirectionIds, roadmapId]
}

const splitInterests = (value: string) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const generateCustomTrack = async () => {
  aiError.value = null
  generatedTracks.value = []

  if (!aiForm.value.title.trim() || !aiForm.value.goal.trim() || aiForm.value.selectedDirectionIds.length === 0) {
    aiError.value = "Заполните название, цель и выберите хотя бы одно направление."
    return
  }

  aiLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 650))

    const interests = splitInterests(aiForm.value.interests)
    const selectedTitles = selectedDirections.value.map((item) => item.title)

    if (aiForm.value.generationMode === "single") {
      const milestones = [
        `Собранная база направлений: ${selectedTitles.join(" + ")}`,
        "Кросс-доменная практика: проекты, объединяющие выбранные направления",
        interests.length
          ? `Фокус интересов: ${interests.join(", ")}`
          : "Фокус интересов: практика, тесты, интервью",
        weakCompatibilityPairs.value.length
          ? `Проверьте слабые связки: ${weakCompatibilityPairs.value.join("; ")}`
          : "Связки направлений совместимы и формируют единый трек"
      ]

      const track: CustomRoadmapDraft = {
        id: `custom-${Date.now()}`,
        title: aiForm.value.title.trim(),
        goal: aiForm.value.goal.trim(),
        directionIds: [...aiForm.value.selectedDirectionIds],
        generationMode: "single",
        milestones,
        createdAt: new Date().toISOString()
      }

      generatedTracks.value = [track]
      customTracks.value = [track, ...customTracks.value]
    } else {
      const tracks = selectedDirections.value.map((direction, index) => {
        const milestones = [
          `База по направлению: ${direction.title}`,
          "Практика ключевых тем и выполнение тестов",
          interests.length
            ? `Доп. интересы: ${interests.join(", ")}`
            : "Доп. фокус: интервью и прикладные задачи",
          "Сравнение прогресса с другими выбранными направлениями"
        ]

        return {
          id: `custom-${Date.now()}-${index}`,
          title: `${aiForm.value.title.trim()} · ${direction.title}`,
          goal: aiForm.value.goal.trim(),
          directionIds: [direction.id],
          generationMode: "multiple" as const,
          milestones,
          createdAt: new Date().toISOString()
        }
      })

      generatedTracks.value = tracks
      customTracks.value = [...tracks, ...customTracks.value]
    }

    persistCustomTracks()
  } finally {
    aiLoading.value = false
  }
}
</script>

<template>
  <div class="page">

    <!-- ── Hero intro ── -->
    <section class="intro-card">
      <div class="intro-body">
        <div class="intro-text">
          <h1 class="intro-title">Платформа обучения Skilo</h1>
          <p class="intro-desc">Стройте свой путь по дорожным картам: оценка уровня, тесты и подготовка к интервью.</p>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <strong class="stat-value">{{ myRoadmaps.length }}</strong>
            <span class="stat-label">Мои направления</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <strong class="stat-value">{{ availableRoadmaps.length }}</strong>
            <span class="stat-label">Доступно</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <strong class="stat-value">{{ completedRoadmaps }}</strong>
            <span class="stat-label">Завершено</span>
          </div>
        </div>
      </div>

      <div class="feature-grid">
        <article class="feature-item">
          <span class="feature-icon">🌿</span>
          <h3 class="feature-title">Дерево навыков</h3>
          <p class="feature-desc">Интерактивное дерево тем с логикой разблокировки и отслеживанием статусов.</p>
        </article>
        <article class="feature-item">
          <span class="feature-icon">📝</span>
          <h3 class="feature-title">Тесты по темам</h3>
          <p class="feature-desc">Таймер, последовательные вопросы, результат прохождения и возможность пересдачи.</p>
        </article>
        <article class="feature-item">
          <span class="feature-icon">💬</span>
          <h3 class="feature-title">Подготовка к интервью</h3>
          <p class="feature-desc">Частые вопросы по каждой теме с быстрым просмотром ответов.</p>
        </article>
      </div>
    </section>

    <!-- ── My roadmaps ── -->
    <section class="roadmaps-section">
      <div class="section-head">
        <span class="section-label">AI-конструктор дорожки</span>
        <span class="section-count badge">Новая функция</span>
      </div>

      <div class="builder-card">
        <div class="builder-grid">
          <label class="builder-label">
            Название вашей дорожки
            <input v-model="aiForm.title" type="text" placeholder="Например: Fullstack + AI для карьерного роста" />
          </label>
          <label class="builder-label">
            Режим генерации
            <div class="mode-switch">
              <button
                type="button"
                class="btn btn--ghost"
                :class="{ 'mode-active': aiForm.generationMode === 'single' }"
                :aria-pressed="aiForm.generationMode === 'single'"
                @click="aiForm.generationMode = 'single'"
              >
                Один большой трек
              </button>
              <button
                type="button"
                class="btn btn--ghost"
                :class="{ 'mode-active': aiForm.generationMode === 'multiple' }"
                :aria-pressed="aiForm.generationMode === 'multiple'"
                @click="aiForm.generationMode = 'multiple'"
              >
                Несколько треков
              </button>
            </div>
            <span class="mode-selected">
              Выбран режим:
              <strong>{{ aiForm.generationMode === "single" ? "Один большой трек" : "Несколько треков" }}</strong>
            </span>
          </label>
        </div>

        <div class="builder-label">
          Выберите нужные направления
          <div class="direction-pills">
            <button
              v-for="roadmap in allRoadmaps"
              :key="roadmap.id"
              type="button"
              class="direction-pill"
              :class="{ active: isDirectionSelected(roadmap.id) }"
              @click="toggleDirection(roadmap.id)"
            >
              {{ roadmap.title }}
            </button>
          </div>
        </div>

        <label class="builder-label">
          Цель пользователя
          <textarea
            v-model="aiForm.goal"
            rows="3"
            placeholder="Например: устроиться на Junior/Middle роль за 6 месяцев и собрать сильное портфолио"
          />
        </label>

        <label class="builder-label">
          Интересы (через запятую)
          <input
            v-model="aiForm.interests"
            type="text"
            placeholder="Например: архитектура, микросервисы, алгоритмы, system design"
          />
        </label>

        <div class="builder-ai-hint">
          <p class="section-label">AI-рекомендации по связанным направлениям</p>
          <div class="tags">
            <span v-for="item in relatedSuggestions" :key="item.id">{{ item.title }}</span>
            <span v-if="!relatedSuggestions.length">Выберите направление, чтобы получить рекомендации</span>
          </div>
          <div class="compatibility-block">
            <div class="progress-head">
              <span class="section-label" style="margin: 0;">Совместимость выбранных направлений</span>
              <span class="badge">{{ compatibilityPercent }}%</span>
            </div>
            <div class="progress-track">
              <span class="progress-fill" :style="{ width: `${compatibilityPercent}%` }" />
            </div>
            <p v-if="weakCompatibilityPairs.length" class="builder-warning">
              Слабая связка: {{ weakCompatibilityPairs.join(", ") }}. Лучше генерировать в режиме "Несколько треков".
            </p>
          </div>
          <p class="builder-meta">
            Рекомендации и совместимость пересчитываются по мере выбора направлений.
          </p>
        </div>

        <p v-if="aiError" class="builder-error">{{ aiError }}</p>

        <div class="actions-row actions-row--builder">
          <button class="btn btn--primary" :disabled="aiLoading" @click="generateCustomTrack">
            {{ aiLoading ? "Генерация..." : "Собрать дорожку через AI" }}
          </button>
        </div>
      </div>

      <div v-for="generatedTrack in generatedTracks" :key="generatedTrack.id" class="generated-card">
        <div class="generated-head">
          <h3>{{ generatedTrack.title }}</h3>
          <span class="badge">Создано</span>
        </div>
        <p class="roadmap-desc">{{ generatedTrack.goal }}</p>
        <p class="builder-meta">
          Направления: {{ generatedTrack.directionIds.map((id) => roadmapTitlesMap[id] ?? id).join(", ") }}
        </p>
        <ul class="milestones-list">
          <li v-for="item in generatedTrack.milestones" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div v-if="customTracks.length > 0" class="saved-tracks">
        <p class="section-label">Собранные пользовательские дорожки</p>
        <div class="saved-track-grid">
          <article v-for="track in customTracks" :key="track.id" class="saved-track-card">
            <h4>{{ track.title }}</h4>
            <p>{{ track.goal }}</p>
            <span class="badge">{{ new Date(track.createdAt).toLocaleDateString() }}</span>
          </article>
        </div>
      </div>
    </section>

    <!-- ── My roadmaps ── -->
    <section class="roadmaps-section">
      <div class="section-head">
        <span class="section-label">Мои дорожные карты</span>
        <span class="section-count badge">{{ myRoadmaps.length }}</span>
      </div>

      <div v-if="myRoadmaps.length === 0" class="empty-card">
        У вас пока нет дорожных карт. Добавьте направление ниже.
      </div>

      <div class="roadmaps-grid">
        <div
          v-for="roadmap in myRoadmaps"
          :key="roadmap.id"
          class="roadmap-card"
          :class="getLevelClass(getAssignedLevel(roadmap.id, roadmap.level))"
        >
          <div class="roadmap-card-body">
            <div class="roadmap-card-top">
              <span class="level-badge" :class="getLevelClass(getAssignedLevel(roadmap.id, roadmap.level))">
                {{ getAssignedLevel(roadmap.id, roadmap.level) }}
              </span>
            </div>
            <h3 class="roadmap-title">{{ roadmap.title }}</h3>
            <p class="roadmap-desc">{{ roadmap.description }}</p>

            <div class="progress-block">
              <div class="progress-head">
                <span class="section-label" style="margin: 0;">Прогресс</span>
                <span class="badge">{{ getProgressPercent(roadmap.id) }}%</span>
              </div>
              <div class="progress-track">
                <span class="progress-fill" :style="{ width: `${getProgressPercent(roadmap.id)}%` }" />
              </div>
              <p class="progress-meta">{{ getProgressMeta(roadmap.id) }}</p>
            </div>
          </div>

          <div class="actions-row">
            <button class="btn btn--primary" @click="openRoadmap(roadmap.id)">Открыть карту</button>
            <button
              class="btn btn--ghost"
              :disabled="removingRoadmapId === roadmap.id"
              @click="removeRoadmap(roadmap.id)"
            >
              {{ removingRoadmapId === roadmap.id ? "Удаление..." : "Удалить" }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Available roadmaps ── -->
    <section class="roadmaps-section">
      <div class="section-head">
        <span class="section-label">Добавить направление</span>
        <span class="section-count badge">{{ availableRoadmaps.length }}</span>
      </div>

      <div v-if="availableRoadmaps.length === 0" class="empty-card">
        Все доступные направления уже добавлены в вашу коллекцию.
      </div>

      <div class="roadmaps-grid">
        <div
          v-for="roadmap in availableRoadmaps"
          :key="roadmap.id"
          class="roadmap-card"
          :class="getLevelClass(roadmap.level)"
        >
          <div class="roadmap-card-body">
            <div class="roadmap-card-top">
              <span class="level-badge" :class="getLevelClass(roadmap.level)">
                {{ roadmap.level }}
              </span>
            </div>
            <h3 class="roadmap-title">{{ roadmap.title }}</h3>
            <p class="roadmap-desc">{{ roadmap.description }}</p>
          </div>

          <div class="actions-row">
            <button class="btn btn--primary" @click="startAssessment(roadmap.id)">Пройти оценку</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Reset & Base ── */
.page {
  font-family: 'Inter', sans-serif;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Intro Card ── */
.intro-card {
  border: 1px solid #eee;
  border-radius: 14px;
  background: #fff;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.intro-body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.intro-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #334155;
  margin: 0 0 8px;
  line-height: 1.2;
}

.intro-desc {
  font-size: 14px;
  color: #888;
  margin: 0;
  max-width: 480px;
  line-height: 1.6;
}

/* ── Stats ── */
.stats-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 14px 20px;
  background: #f5f5f5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #334155;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #eee;
}

/* ── Feature Grid ── */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.feature-item {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  background: #f5f5f5;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.feature-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(10, 10, 10, 0.07);
}

.feature-icon {
  font-size: 18px;
  display: block;
  margin-bottom: 8px;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 6px;
}

.feature-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
  line-height: 1.5;
}

/* ── Section ── */
.roadmaps-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
}

.section-count {
  /* inherits .badge */
}

/* ── Badge / pill ── */
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #888;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 100px;
  padding: 2px 10px;
}

/* ── Level Badge ── */
.level-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 100px;
  padding: 3px 10px;
  border: 1px solid #eee;
  background: #f5f5f5;
  color: #888;
}

.level-badge.level-beginner {
  background: #f5f5f5;
  color: #555;
  border-color: #ddd;
}

.level-badge.level-intermediate {
  background: #f0f0f0;
  color: #333;
  border-color: #ccc;
}

.level-badge.level-advanced {
  background: #1f2d7a;
  color: #fff;
  border-color: #334155;
}

/* ── Empty Card ── */
.empty-card {
  border: 1px dashed #eee;
  border-radius: 12px;
  padding: 24px;
  color: #999;
  font-size: 14px;
  background: #fafafa;
}

.builder-card {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 18px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.builder-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.mode-switch .btn.mode-active {
  background: #1f2d7a;
  color: #fff;
  border-color: #1f2d7a;
  box-shadow: 0 6px 18px rgba(31, 45, 122, 0.28);
}

.mode-switch .btn.mode-active:hover {
  background: #1a2669;
  border-color: #1a2669;
}

.mode-switch .btn.mode-active::before {
  content: "✓";
  font-weight: 700;
  margin-right: 6px;
}

.mode-selected {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}

.mode-selected strong {
  color: #1f2d7a;
}

.builder-label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.builder-label input,
.builder-label textarea,
.builder-label select {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  color: #334155;
  background: #fff;
}

.direction-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.direction-pill {
  border: 1px solid #eee;
  border-radius: 100px;
  padding: 7px 12px;
  background: #fff;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.direction-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(10, 10, 10, 0.08);
}

.direction-pill.active {
  background: #1f2d7a;
  color: #fff;
  border-color: #1f2d7a;
}

.builder-ai-hint {
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.builder-meta {
  margin: 0;
  font-size: 12px;
  color: #888;
}

.compatibility-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.builder-warning {
  margin: 0;
  color: #b45309;
  font-size: 12px;
}

.builder-error {
  margin: 0;
  font-size: 13px;
  color: #be123c;
}

.actions-row--builder {
  padding: 0;
  border-top: 0;
  background: transparent;
}

.generated-card {
  border: 1px solid #eee;
  border-radius: 14px;
  background: #fff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.generated-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.generated-head h3 {
  margin: 0;
  font-size: 16px;
  color: #334155;
}

.milestones-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  color: #64748b;
  font-size: 13px;
}

.saved-tracks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-track-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.saved-track-card {
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.saved-track-card h4 {
  margin: 0;
  font-size: 14px;
  color: #334155;
}

.saved-track-card p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  min-height: 40px;
}

/* ── Roadmap Grid ── */
.roadmaps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* ── Roadmap Card ── */
.roadmap-card {
  border: 1px solid #eee;
  border-radius: 14px;
  background: #fff;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  overflow: hidden;
}

.roadmap-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(10, 10, 10, 0.08);
}

.roadmap-card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.roadmap-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.roadmap-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0;
  line-height: 1.3;
}

.roadmap-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
  line-height: 1.55;
  flex: 1;
}

/* ── Progress ── */
.progress-block {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-track {
  width: 100%;
  height: 5px;
  border-radius: 100px;
  background: #eee;
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #1f2d7a;
  transition: width 0.4s ease;
}

.progress-meta {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* ── Actions ── */
.actions-row {
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--primary {
  background: #1f2d7a;
  color: #fff;
  border-color: #334155;
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.2);
}

.btn--ghost {
  background: #fff;
  color: #334155;
  border-color: #eee;
}

.btn--ghost:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.06);
}

/* ── Adaptive ── */
@media (max-width: 640px) {
  .intro-card {
    padding: 18px;
  }

  .intro-body {
    flex-direction: column;
  }

  .intro-title {
    font-size: 20px;
  }

  .stats-row {
    width: 100%;
    justify-content: space-between;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .builder-grid {
    grid-template-columns: 1fr;
  }

  .mode-switch {
    grid-template-columns: 1fr;
  }

  .roadmaps-grid {
    grid-template-columns: 1fr;
  }

  .actions-row {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
