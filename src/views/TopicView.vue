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

const topicStatusClass = computed(() => {
  const label = topicStatusLabel.value
  if (label === "Пройдено") return "status--pass"
  if (label === "Не пройдено") return "status--fail"
  return "status--neutral"
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
  <div class="topic-page">

    <button class="btn btn--ghost" @click="goBack">← Назад</button>

    <!-- Tabs -->
    <div class="topic-tabs">
      <router-link class="topic-tab" :to="`/topics/${topicId}`">Обучение и тест</router-link>
      <router-link class="topic-tab" :to="`/topics/${topicId}/interview`">Вопросы интервью</router-link>
    </div>

    <div v-if="!topic" class="empty-state">
      <h2>Тема не найдена</h2>
    </div>

    <div v-else class="topic-body">

      <!-- Topic header -->
      <div class="topic-header">
        <div class="topic-header-main">
          <h1 class="topic-title">{{ topic.title }}</h1>
          <div class="topic-meta">
            <span class="badge">{{ topic.level }}</span>
            <span class="badge" :class="topicStatusClass">{{ topicStatusLabel }}</span>
          </div>
        </div>
      </div>

      <!-- THEORY -->
      <section v-if="!testStarted" class="section-card">
        <span class="section-label">Теория</span>
        <div class="theory-content">
          <pre class="theory-pre">{{ content?.theory }}</pre>
        </div>
        <div class="section-footer">
          <button
            class="btn btn--primary"
            :disabled="!test || !test.questions.length"
            @click="startTest"
          >
            Начать тест
          </button>
        </div>
      </section>

      <!-- TEST -->
      <section v-if="testStarted && test && !testFinished" class="section-card">
        <span class="section-label">Тест</span>

        <div class="test-meta-row">
          <div class="test-meta-item">
            <span class="meta-label">Осталось времени</span>
            <span class="meta-value timer" :class="{ 'timer--low': remainingSeconds <= 30 }">
              {{ timerText }}
            </span>
          </div>
          <div class="test-meta-divider" />
          <div class="test-meta-item">
            <span class="meta-label">Вопрос</span>
            <span class="meta-value">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
          </div>
          <div class="test-progress-track">
            <span
              class="test-progress-fill"
              :style="{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }"
            />
          </div>
        </div>

        <div v-if="currentQuestion" class="question-card">
          <p class="question-text">{{ currentQuestion.question }}</p>

          <div class="options-list">
            <label
              v-for="(option, oIndex) in currentQuestion.options"
              :key="oIndex"
              class="option-item"
              :class="{ 'option-item--selected': selectedAnswers[currentQuestionIndex] === oIndex }"
            >
              <input
                type="radio"
                class="option-radio"
                :name="currentQuestion.id"
                :value="oIndex"
                v-model="selectedAnswers[currentQuestionIndex]"
              />
              <span class="option-marker" />
              <span class="option-text">{{ option }}</span>
            </label>
          </div>
        </div>

        <div class="section-footer">
          <button
            v-if="!isLastQuestion"
            class="btn btn--ghost"
            :disabled="!isCurrentQuestionAnswered"
            @click="nextQuestion"
          >
            Следующий вопрос →
          </button>
          <button
            v-else
            class="btn btn--primary"
            :disabled="!isCurrentQuestionAnswered"
            @click="finishTest"
          >
            Завершить тест
          </button>
        </div>
      </section>

      <!-- RESULT -->
      <section v-if="testFinished" class="section-card result-card">
        <span class="section-label">Результат</span>

        <div class="result-score-block">
          <span class="result-score-value">{{ score }}%</span>
          <span class="result-score-label">ваш результат</span>
        </div>

        <div class="result-track-wrap">
          <div class="result-track">
            <span class="result-fill" :style="{ width: `${score}%` }" :class="score >= 70 ? 'result-fill--pass' : 'result-fill--fail'" />
            <span class="result-threshold" />
          </div>
          <div class="result-threshold-label">70% — порог</div>
        </div>

        <p v-if="score >= 70" class="result-verdict result-verdict--pass">
          ✓ Тест пройден
        </p>
        <p v-else class="result-verdict result-verdict--fail">
          ✗ Тест не пройден. Попробуйте снова.
        </p>

        <div class="section-footer">
          <button class="btn btn--ghost" @click="startTest">Пересдать тест</button>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Base ── */
.topic-page {
  font-family: 'Inter', sans-serif;
  color: #334155;
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 18px;
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
  opacity: 0.4;
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
  box-shadow: 0 4px 14px rgba(10, 10, 10, 0.2);
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

/* ── Tabs ── */
.topic-tabs {
  display: flex;
  gap: 4px;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 4px;
  background: #f5f5f5;
  align-self: flex-start;
}

.topic-tab {
  padding: 7px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.topic-tab:hover {
  color: #334155;
  background: #fff;
}

.topic-tab.router-link-active {
  background: #1f2d7a;
  color: #fff;
  box-shadow: 0 2px 8px rgba(10, 10, 10, 0.15);
}

/* ── Topic header ── */
.topic-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.topic-header-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #334155;
  margin: 0;
  line-height: 1.2;
}

.topic-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ── Badges ── */
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #888;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 100px;
  padding: 3px 10px;
}

.status--pass {
  background: #1f2d7a;
  color: #fff;
  border-color: #334155;
}

.status--fail {
  background: #f5f5f5;
  color: #888;
  border-color: #ddd;
}

.status--neutral {
  background: #f5f5f5;
  color: #999;
  border-color: #eee;
}

/* ── Section label ── */
.section-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin-bottom: 14px;
}

/* ── Section card ── */
.section-card {
  border: 1px solid #eee;
  border-radius: 14px;
  background: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.section-footer {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* ── Theory ── */
.theory-content {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #f5f5f5;
  padding: 16px;
  overflow: auto;
  max-height: 420px;
}

.theory-pre {
  font-family: inherit;
  font-size: 14px;
  color: #333;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

/* ── Test meta ── */
.test-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #f5f5f5;
  padding: 14px 18px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  position: relative;
}

.test-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
}

.meta-value {
  font-size: 16px;
  font-weight: 700;
  color: #334155;
}

.timer {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.timer--low {
  color: #888;
}

.test-meta-divider {
  width: 1px;
  height: 32px;
  background: #eee;
}

.test-progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #eee;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.test-progress-fill {
  display: block;
  height: 100%;
  background: #1f2d7a;
  border-radius: inherit;
  transition: width 0.3s ease;
}

/* ── Question ── */
.question-card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 18px;
  background: #fff;
}

.question-text {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  line-height: 1.5;
  margin: 0 0 16px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.option-item:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.option-item--selected {
  border-color: #334155;
  background: #f5f5f5;
}

.option-radio {
  display: none;
}

.option-marker {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-radius: 100px;
  background: #fff;
  transition: border-color 0.15s ease, background 0.15s ease;
  position: relative;
}

.option-item--selected .option-marker {
  border-color: #334155;
  background: #1f2d7a;
}

.option-item--selected .option-marker::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5px;
  height: 5px;
  border-radius: 100px;
  background: #fff;
}

.option-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.4;
}

/* ── Result ── */
.result-card {
  gap: 16px;
}

.result-score-block {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.result-score-value {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #334155;
  line-height: 1;
}

.result-score-label {
  font-size: 13px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.result-track-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-track {
  width: 100%;
  height: 8px;
  border-radius: 100px;
  background: #eee;
  overflow: visible;
  position: relative;
}

.result-fill {
  display: block;
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s ease;
}

.result-fill--pass {
  background: #1f2d7a;
}

.result-fill--fail {
  background: #bbb;
}

.result-threshold {
  position: absolute;
  left: 70%;
  top: -4px;
  width: 2px;
  height: 16px;
  background: #1f2d7a;
  border-radius: 100px;
}

.result-threshold-label {
  font-size: 11px;
  color: #999;
  margin-left: calc(70% - 6px);
}

.result-verdict {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #eee;
}

.result-verdict--pass {
  background: #f5f5f5;
  color: #334155;
  border-color: #ddd;
}

.result-verdict--fail {
  background: #f5f5f5;
  color: #888;
  border-color: #eee;
}

/* ── Empty ── */
.empty-state {
  color: #999;
  padding: 40px 0;
}

/* ── Adaptive ── */
@media (max-width: 640px) {
  .topic-title {
    font-size: 18px;
  }

  .topic-tabs {
    width: 100%;
  }

  .topic-tab {
    flex: 1;
    text-align: center;
  }

  .test-meta-row {
    padding: 12px 14px;
    gap: 12px;
  }

  .section-card {
    padding: 16px;
  }

  .result-score-value {
    font-size: 36px;
  }

  .section-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>