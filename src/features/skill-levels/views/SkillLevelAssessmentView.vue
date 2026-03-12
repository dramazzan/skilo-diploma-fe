<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useAuthStore } from "@/features/auth/store/auth"
import { useRoadmapsStore } from "@/features/roadmaps/store/roadmaps"
import { useSkillLevelsStore, type DirectionSkillLevel } from "@/features/skill-levels/store/skillLevels"
import { skillLevelsApi } from "@/features/skill-levels/api/skillLevels.api"
import type { AssessmentQuestion, RoadmapLevel, SkillLevelAssessment, SkillLevelWrittenQuestion } from "@/shared/api/client"

const MIN_WRITTEN_LENGTH = 40

const authStore = useAuthStore()
const roadmapsStore = useRoadmapsStore()
const skillLevelsStore = useSkillLevelsStore()

const selectedRoadmapId = ref<string>("")
const assessmentsByRoadmapId = ref<Record<string, SkillLevelAssessment | null>>({})
const answers = ref<Record<string, number>>({})
const writtenAnswers = ref<Record<string, string>>({})
const submitMessage = ref<string | null>(null)

const selectedRoadmaps = computed(() => roadmapsStore.myRoadmaps)

const selectedRoadmap = computed(() => {
  return selectedRoadmaps.value.find((roadmap) => roadmap.id === selectedRoadmapId.value) ?? null
})

const selectedAssessment = computed(() => {
  if (!selectedRoadmapId.value) return null
  return assessmentsByRoadmapId.value[selectedRoadmapId.value] ?? null
})

const ensureAssessment = async (roadmapId: string) => {
  if (!roadmapId) return
  if (assessmentsByRoadmapId.value[roadmapId] !== undefined) return

  const assessment = await skillLevelsApi.getAssessment(authStore.user?.id ?? null, roadmapId)
  assessmentsByRoadmapId.value = {
    ...assessmentsByRoadmapId.value,
    [roadmapId]: assessment
  }
}

const theoryQuestions = computed<AssessmentQuestion[]>(() => {
  if (!selectedRoadmapId.value) return []

  return selectedAssessment.value?.theoryQuestions ?? []
})

const writtenQuestions = computed<SkillLevelWrittenQuestion[]>(() => {
  if (!selectedRoadmapId.value) return []
  return selectedAssessment.value?.writtenQuestions ?? []
})

const isWrittenAnswerValid = (answer: string | undefined) => {
  return (answer?.trim().length ?? 0) >= MIN_WRITTEN_LENGTH
}

const writtenCharCount = (questionId: string) => {
  return (writtenAnswers.value[questionId] ?? "").trim().length
}

const theoryAnsweredCount = computed(() => {
  return theoryQuestions.value.filter((question) => answers.value[question.id] !== undefined).length
})

const writtenAnsweredCount = computed(() => {
  return writtenQuestions.value.filter((question) =>
    isWrittenAnswerValid(writtenAnswers.value[question.id])
  ).length
})

const answeredCount = computed(() => {
  return theoryAnsweredCount.value + writtenAnsweredCount.value
})

const totalQuestions = computed(() => {
  return theoryQuestions.value.length + writtenQuestions.value.length
})

const allAnswered = computed(() => {
  if (!theoryQuestions.value.length) return false
  const allTheoryAnswered = theoryQuestions.value.every((question) => answers.value[question.id] !== undefined)
  const allWrittenAnswered = writtenQuestions.value.every((question) =>
    isWrittenAnswerValid(writtenAnswers.value[question.id])
  )
  return allTheoryAnswered && allWrittenAnswered
})

const selectedStoredLevel = computed(() => {
  if (!selectedRoadmapId.value) return null
  return skillLevelsStore.getLevel(selectedRoadmapId.value)
})

const roadmapLevelFromExperience = (level: DirectionSkillLevel): RoadmapLevel => {
  if (level === "Junior" || level === "Junior Strong") return "Beginner"
  if (level === "Middle" || level === "Middle Strong") return "Intermediate"
  return "Advanced"
}

const formatDateTime = (isoDate: string) => {
  return new Date(isoDate).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const resetCurrentAnswers = () => {
  answers.value = {}
  writtenAnswers.value = {}
  submitMessage.value = null
}

const openDirection = (roadmapId: string) => {
  selectedRoadmapId.value = roadmapId
}

watch(selectedRoadmapId, () => {
  resetCurrentAnswers()
  void ensureAssessment(selectedRoadmapId.value)
})

watch(
  [answers, writtenAnswers],
  () => {
    if (submitMessage.value) submitMessage.value = null
  },
  { deep: true }
)

watch(
  () => selectedRoadmaps.value,
  (roadmaps) => {
    if (!roadmaps.length) {
      selectedRoadmapId.value = ""
      return
    }

    if (selectedRoadmapId.value && roadmaps.some((roadmap) => roadmap.id === selectedRoadmapId.value)) {
      return
    }

    selectedRoadmapId.value = roadmaps[0]?.id ?? ""
  },
  { immediate: true }
)

const submitDirectionAssessment = async () => {
  if (!selectedRoadmap.value || !theoryQuestions.value.length || !allAnswered.value) return

  const payload = {
    roadmapId: selectedRoadmap.value.id,
    theoryAnswers: answers.value,
    writtenAnswers: writtenQuestions.value.map((question) => ({
      id: question.id,
      question: question.text,
      answer: writtenAnswers.value[question.id] ?? ""
    }))
  }

  try {
    const result = await skillLevelsApi.submitAssessment(authStore.user?.id ?? null, payload)
    skillLevelsStore.setLevels([...skillLevelsStore.allLevels.filter((l) => l.roadmapId !== result.roadmapId), result])

    await roadmapsStore.addRoadmapWithLevel(
      selectedRoadmap.value.id,
      roadmapLevelFromExperience(result.levelLabel),
      authStore.user?.id ?? null
    )

    submitMessage.value = `Уровень для "${selectedRoadmap.value.title}" определен: ${result.levelLabel}. Итоговый балл: ${result.score}.`
  } catch (err) {
    submitMessage.value = `Ошибка: ${err instanceof Error ? err.message : "не удалось сохранить результат"}`
  }
}

onMounted(async () => {
  const userId = authStore.user?.id ?? null
  await roadmapsStore.loadRoadmaps()
  await roadmapsStore.loadUserRoadmapCollection(userId)
  await skillLevelsStore.loadLevels(userId)
  if (selectedRoadmapId.value) {
    await ensureAssessment(selectedRoadmapId.value)
  }
})
</script>

<template>
  <div class="skill-level-page">
    <section class="hero-card">
      <div>
        <p class="hero-kicker">Определение уровня</p>
        <h1>Тесты по направлениям</h1>
        <p class="hero-note">
          Выберите направление и пройдите полную оценку: блок теории + письменные ответы. После этого получите уровень (Junior, Junior Strong, Middle, Middle Strong, Senior).
        </p>
      </div>
      <div class="hero-actions">
        <router-link class="hero-link" to="/profile">Перейти в профиль</router-link>
      </div>
    </section>

    <section class="flow-note info-flow">
      <p>Чем конкретнее письменные ответы, тем точнее итоговая оценка вашего уровня по направлению.</p>
      <p>Лучше проходить тесты по одному треку за раз, чтобы профиль уровней получился честным и полезным.</p>
    </section>

    <div class="layout">
      <aside class="direction-list">
        <h2>Направления</h2>
        <p v-if="selectedRoadmaps.length === 0" class="direction-empty">
          Сначала выберите направления на странице дорожек.
          <router-link to="/roadmaps">Перейти к дорожкам</router-link>
        </p>
        <article
          v-for="roadmap in selectedRoadmaps"
          :key="roadmap.id"
          class="direction-card"
          :class="{ active: roadmap.id === selectedRoadmapId }"
          @click="openDirection(roadmap.id)"
        >
          <div class="direction-main">
            <strong>{{ roadmap.title }}</strong>
            <small>{{ roadmap.description }}</small>
          </div>
          <span v-if="skillLevelsStore.getLevel(roadmap.id)" class="level-badge">
            {{ skillLevelsStore.getLevel(roadmap.id)?.levelLabel }}
          </span>
          <span v-else class="level-badge level-badge--empty">Не определен</span>
        </article>
      </aside>

      <section class="assessment-card">
        <p v-if="selectedRoadmaps.length === 0" class="empty-note">
          Добавьте направления в дорожках, чтобы пройти определение уровня.
        </p>
        <template v-else-if="selectedRoadmap && totalQuestions > 0">
          <header class="assessment-head">
            <h2>{{ selectedRoadmap.title }}</h2>
            <p>
              Для этого направления: {{ theoryQuestions.length }} теоретических и
              {{ writtenQuestions.length }} письменных вопросов.
            </p>
          </header>

          <div class="progress-row">
            <span>
              {{ answeredCount }} / {{ totalQuestions }} (теория {{ theoryAnsweredCount }} / {{ theoryQuestions.length }},
              письменные {{ writtenAnsweredCount }} / {{ writtenQuestions.length }})
            </span>
            <div class="progress-track">
              <span :style="{ width: `${(answeredCount / totalQuestions) * 100}%` }" />
            </div>
          </div>

          <div class="question-list">
            <article
              v-for="(question, index) in theoryQuestions"
              :key="question.id"
              class="question-card"
            >
              <p class="question-title">{{ index + 1 }}. {{ question.text }}</p>

              <label
                v-for="option in question.options"
                :key="option.id"
                class="option-row"
                :class="{ selected: answers[question.id] === option.score }"
              >
                <input
                  v-model="answers[question.id]"
                  type="radio"
                  :name="question.id"
                  :value="option.score"
                />
                <span>{{ option.label }}</span>
              </label>
            </article>
          </div>

          <section v-if="writtenQuestions.length" class="written-section">
            <header class="written-head">
              <h3>Письменные вопросы</h3>
              <p>Каждый ответ обязателен, минимум {{ MIN_WRITTEN_LENGTH }} символов.</p>
            </header>

            <article
              v-for="(question, index) in writtenQuestions"
              :key="question.id"
              class="written-card"
            >
              <p class="written-title">{{ index + 1 }}. {{ question.text }}</p>
              <p class="written-hint">{{ question.hint }}</p>
              <textarea
                v-model="writtenAnswers[question.id]"
                class="written-input"
                :class="{
                  invalid:
                    !!writtenAnswers[question.id] && !isWrittenAnswerValid(writtenAnswers[question.id])
                }"
                :placeholder="question.placeholder"
                rows="5"
              />
              <div class="written-meta">
                <span>Минимум {{ MIN_WRITTEN_LENGTH }} символов</span>
                <span :class="{ ready: isWrittenAnswerValid(writtenAnswers[question.id]) }">
                  {{ writtenCharCount(question.id) }} символов
                </span>
              </div>
            </article>
          </section>

          <div class="assessment-actions">
            <button class="btn-primary" :disabled="!allAnswered" @click="submitDirectionAssessment">
              Определить уровень
            </button>
            <button class="btn-secondary" @click="resetCurrentAnswers">Очистить ответы</button>
          </div>

          <p v-if="submitMessage" class="submit-note">{{ submitMessage }}</p>

          <article v-if="selectedStoredLevel" class="result-card">
            <p>Последний результат:</p>
            <strong>{{ selectedStoredLevel.levelLabel }}</strong>
            <span>{{ formatDateTime(selectedStoredLevel.updatedAt) }}</span>
          </article>
        </template>

        <p v-else class="empty-note">Для выбранного направления пока нет полного набора вопросов.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.skill-level-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 10px 8px 36px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.flow-note {
  padding: 0 4px;
}

.hero-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.hero-kicker {
  margin: 0 0 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.hero-card h1 {
  margin: 0 0 6px;
  font-size: 28px;
  line-height: 1.1;
  color: var(--text);
}

.hero-note {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  max-width: 70ch;
}

.hero-link {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
}

.layout {
  display: grid;
  grid-template-columns: minmax(250px, 0.75fr) minmax(420px, 1.25fr);
  gap: 18px;
}

.direction-list,
.assessment-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  padding: 14px;
}

.direction-list h2,
.assessment-head h2 {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text);
}

.direction-empty {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--muted);
}

.direction-empty a {
  color: var(--primary);
  font-weight: 600;
}

.direction-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.direction-card:last-child {
  margin-bottom: 0;
}

.direction-card.active {
  border-color: var(--primary);
  background: rgba(255, 142, 60, 0.14);
}

.direction-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.direction-main strong {
  font-size: 14px;
  color: var(--text);
}

.direction-main small {
  font-size: 12px;
  color: var(--muted);
}

.level-badge {
  align-self: flex-start;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  background: var(--surface);
  white-space: nowrap;
}

.level-badge--empty {
  color: var(--muted);
}

.assessment-head p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.progress-row {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-row span {
  font-size: 12px;
  color: var(--muted);
}

.progress-track {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
}

.question-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  padding: 10px;
}

.question-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text);
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 8px;
}

.option-row.selected {
  border-color: var(--primary);
  background: rgba(255, 142, 60, 0.12);
}

.written-section {
  margin-top: 12px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.written-head h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text);
}

.written-head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--muted);
}

.written-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  padding: 10px;
}

.written-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.written-hint {
  margin: 6px 0 8px;
  font-size: 12px;
  color: var(--muted);
}

.written-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  padding: 8px 10px;
  resize: vertical;
  min-height: 110px;
}

.written-input::placeholder {
  color: var(--muted);
}

.written-input:focus {
  outline: none;
  border-color: var(--primary);
}

.written-input.invalid {
  border-color: #ef4444;
}

.written-meta {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--muted);
}

.written-meta .ready {
  color: #15803d;
  font-weight: 600;
}

.assessment-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.submit-note {
  margin: 10px 0 0;
  color: #15803d;
  font-size: 13px;
  font-weight: 600;
}

.result-card {
  margin-top: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-card p,
.result-card span {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.result-card strong {
  font-size: 16px;
  color: var(--text);
}

.empty-note {
  margin: 0;
  color: var(--muted);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-card h1 {
    font-size: 23px;
  }

  .assessment-actions {
    flex-direction: column;
  }
}
</style>
