<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useTopicProgressStore } from "@/store/topicProgress"
import {
  mockRoadmap,
  mockTopicContent,
  mockTests,
  RoadmapTopic,
  TopicTest
} from "@/mocks/mockRoadmap"

const route = useRoute()
const router = useRouter()
const topicProgress = useTopicProgressStore()

const topicId = route.params.id as string

const topic: RoadmapTopic | undefined = mockRoadmap.find(
  t => t.id === topicId
)

const content = mockTopicContent.find(
  c => c.topicId === topicId
)

const test: TopicTest | undefined = mockTests.find(
  t => t.topicId === topicId
)

const testStarted = ref(false)
const selectedAnswers = ref<number[]>([])
const testFinished = ref(false)
const score = ref(0)
const currentQuestionIndex = ref(0)
const remainingSeconds = ref(0)
let timerId: number | null = null

const persistedResult = computed(() => topicProgress.getResult(topicId))

const topicStatusLabel = computed(() => {
  if (testFinished.value) {
    return score.value >= 70 ? "Пройдено" : "Не пройдено"
  }

  if (persistedResult.value) {
    return persistedResult.value.passed ? "Пройдено" : "Не пройдено"
  }

  return "Не тестировалось"
})

const totalQuestions = computed(() => test?.questions.length ?? 0)

const currentQuestion = computed(() => {
  if (!test) return null
  return test.questions[currentQuestionIndex.value] ?? null
})

const isLastQuestion = computed(() => {
  if (!test) return false
  return currentQuestionIndex.value >= test.questions.length - 1
})

const isCurrentQuestionAnswered = computed(() => {
  return selectedAnswers.value[currentQuestionIndex.value] !== undefined
})

const formatTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
}

const timerText = computed(() => formatTime(remainingSeconds.value))

const clearTimer = () => {
  if (timerId !== null) {
    window.clearInterval(timerId)
    timerId = null
  }
}

const startTimer = () => {
  clearTimer()

  timerId = window.setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0
      clearTimer()
      finishTest()
      return
    }

    remainingSeconds.value -= 1
  }, 1000)
}

const startTest = () => {
  if (!test?.questions.length) return

  testStarted.value = true
  selectedAnswers.value = []
  testFinished.value = false
  score.value = 0
  currentQuestionIndex.value = 0
  remainingSeconds.value = test.questions.length * 45
  startTimer()
}

const nextQuestion = () => {
  if (!test || !isCurrentQuestionAnswered.value || isLastQuestion.value) return
  currentQuestionIndex.value += 1
}

const finishTest = () => {
  if (!test) return

  clearTimer()

  let correct = 0

  test.questions.forEach((q, index) => {
    if (selectedAnswers.value[index] === q.correctAnswerIndex) {
      correct++
    }
  })

  score.value = Math.round((correct / test.questions.length) * 100)
  testFinished.value = true
  topicProgress.setResult(topicId, score.value, score.value >= 70)
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push("/roadmaps")
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <div class="card">
    <button @click="goBack">← Назад</button>

    <div class="topic-tabs">
      <router-link class="topic-tab" :to="`/topics/${topicId}`">Обучение и тест</router-link>
      <router-link class="topic-tab" :to="`/topics/${topicId}/interview`">Вопросы интервью</router-link>
    </div>

    <div v-if="!topic">
      <h2>Тема не найдена</h2>
    </div>

    <div v-else class="topic-content">
      <h2>{{ topic.title }}</h2>
      <p><strong>Уровень:</strong> {{ topic.level }}</p>
      <p><strong>Статус:</strong> {{ topicStatusLabel }}</p>

      <!-- THEORY -->
      <div v-if="!testStarted" class="topic-theory">
        <h3>Теория</h3>
        <pre>
{{ content?.theory }}
        </pre>

        <button :disabled="!test || !test.questions.length" @click="startTest">
          Начать тест
        </button>
      </div>

      <!-- TEST -->
      <div v-if="testStarted && test && !testFinished" class="test-shell">
        <h3>Тест</h3>
        <div class="test-meta">
          <div class="test-meta-item">
            <span class="test-meta-label">Осталось времени</span>
            <span class="test-meta-value">{{ timerText }}</span>
          </div>
          <div class="test-meta-item">
            <span class="test-meta-label">Вопрос</span>
            <span class="test-meta-value">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
          </div>
        </div>

        <div v-if="currentQuestion" class="test-question-card">
          <p class="test-question-title">{{ currentQuestion.question }}</p>

          <div v-for="(option, oIndex) in currentQuestion.options" :key="oIndex" class="test-option-row">
            <label class="test-option">
              <input type="radio" :name="currentQuestion.id" :value="oIndex" v-model="selectedAnswers[currentQuestionIndex]" />
              <span>{{ option }}</span>
            </label>
          </div>
        </div>

        <div class="actions-row">
          <button v-if="!isLastQuestion" :disabled="!isCurrentQuestionAnswered" @click="nextQuestion">
            Следующий вопрос
          </button>
          <button v-else class="primary" :disabled="!isCurrentQuestionAnswered" @click="finishTest">
            Завершить тест
          </button>
        </div>
      </div>

      <!-- RESULT -->
      <div v-if="testFinished" class="test-result">
        <h3>Результат</h3>
        <p class="test-score">Ваш результат: <strong>{{ score }}%</strong></p>

        <div v-if="score >= 70">
          <p class="test-result-pass">Тест пройден</p>
        </div>
        <div v-else>
          <p class="test-result-fail">Тест не пройден. Попробуйте снова.</p>
        </div>

        <button @click="startTest">
          Пересдать тест
        </button>
      </div>
    </div>
  </div>
</template>
