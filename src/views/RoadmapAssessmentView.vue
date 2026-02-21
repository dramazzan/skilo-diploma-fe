<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { mockRoadmaps, mockRoadmapAssessments, type RoadmapLevel } from "@/mocks/mockRoadmaps"
import { useRoadmapsStore } from "@/store/roadmaps"
import { useAuthStore } from "@/store/auth"

const route = useRoute()
const router = useRouter()
const roadmapsStore = useRoadmapsStore()
const authStore = useAuthStore()

const roadmapId = route.params.id as string
const roadmap = mockRoadmaps.find((item) => item.id === roadmapId)
const assessment = mockRoadmapAssessments[roadmapId]

const answers = ref<Record<string, number>>({})
const completed = ref(false)
const detectedLevel = ref<RoadmapLevel | null>(null)

const allAnswered = computed(() => {
  if (!assessment) return false

  return assessment.questions.every((question) => answers.value[question.id] !== undefined)
})

const evaluateLevel = (avgScore: number): RoadmapLevel => {
  if (avgScore <= 1.5) return "Beginner"
  if (avgScore <= 2.3) return "Intermediate"
  return "Advanced"
}

const submitAssessment = async () => {
  if (!assessment || !allAnswered.value) return

  const total = assessment.questions.reduce((sum, question) => {
    return sum + (answers.value[question.id] ?? 1)
  }, 0)

  const avgScore = total / assessment.questions.length
  const level = evaluateLevel(avgScore)

  detectedLevel.value = level
  await roadmapsStore.addRoadmapWithLevel(roadmapId, level, authStore.user?.id ?? null)
  completed.value = true
}

const goToRoadmap = () => {
  router.push(`/roadmaps/${roadmapId}`)
}
</script>

<template>
  <div class="page card">
    <button @click="$router.push('/roadmaps')">← Назад</button>

    <div v-if="!roadmap || !assessment">
      <h2>Оценка не найдена</h2>
    </div>

    <div v-else-if="!completed" class="assessment-shell">
      <h2>{{ roadmap.title }}: оценка уровня</h2>
      <p>Ответьте на несколько вопросов, чтобы определить ваш текущий уровень.</p>
      <p class="assessment-meta">
        Вопросов: <strong>{{ assessment.questions.length }}</strong>
      </p>

      <div class="assessment-list">
        <div v-for="question in assessment.questions" :key="question.id" class="assessment-item">
          <p class="assessment-question"><strong>{{ question.text }}</strong></p>

          <label
            v-for="option in question.options"
            :key="option.id"
            class="assessment-option"
          >
            <input
              :name="question.id"
              type="radio"
              :value="option.score"
              v-model="answers[question.id]"
            />
            {{ option.label }}
          </label>
        </div>
      </div>

      <button :disabled="!allAnswered" class="primary assessment-submit" @click="submitAssessment">
        Добавить направление
      </button>
    </div>

    <div v-else class="assessment-result">
      <h2>Направление добавлено</h2>
      <p>
        Определённый уровень для <strong>{{ roadmap.title }}</strong>:
        <strong>{{ detectedLevel }}</strong>
      </p>
      <button class="primary" @click="goToRoadmap">Открыть roadmap</button>
    </div>
  </div>
</template>
