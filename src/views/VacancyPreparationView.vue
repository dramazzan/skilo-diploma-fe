<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  api,
  type Vacancy,
  type VacancyTaskLeaderboardResponse,
  type VacancyTaskSubmission,
  type VacancyTaskSubmissionPayload
} from "@/services/api"
import { useAuthStore } from "@/store/auth"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref<string | null>(null)
const vacancy = ref<Vacancy | null>(null)
const openedAnswerId = ref<string | null>(null)
const prepMode = ref<"overview" | "questions" | "tasks" | "test">("overview")

const tasksLoading = ref(false)
const taskItems = ref<Array<{ task: Vacancy["realTasks"][number]; submission: VacancyTaskSubmission | null }>>([])
const taskLeaderboard = ref<VacancyTaskLeaderboardResponse | null>(null)
const taskDrafts = ref<Record<string, VacancyTaskSubmissionPayload>>({})
const taskSubmitting = ref<Record<string, boolean>>({})
const taskErrors = ref<Record<string, string | null>>({})

const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const answers = ref<Record<string, number>>({})
const testFinished = ref(false)
const score = ref(0)

const testQuestions = computed(() => vacancy.value?.preparation.test ?? [])
const currentQuestion = computed(() => testQuestions.value[currentQuestionIndex.value] ?? null)
const answeredQuestions = computed(() => Object.keys(answers.value).length)
const taskLeadersTop = computed(() => (taskLeaderboard.value?.leaders ?? []).slice(0, 5))

const verdictLabel = {
  excellent: "Отлично",
  strong: "Сильная работа",
  good: "Хорошо",
  needs_improvement: "Нужно улучшить"
} as const

const toggleAnswer = (questionId: string) => {
  openedAnswerId.value = openedAnswerId.value === questionId ? null : questionId
}

const selectOption = (index: number) => {
  selectedAnswer.value = index
}

const nextQuestion = () => {
  const question = currentQuestion.value
  if (!question || selectedAnswer.value === null) return

  answers.value[question.id] = selectedAnswer.value

  if (currentQuestionIndex.value < testQuestions.value.length - 1) {
    currentQuestionIndex.value += 1
    selectedAnswer.value = answers.value[testQuestions.value[currentQuestionIndex.value].id] ?? null
    return
  }

  let total = 0
  testQuestions.value.forEach((item) => {
    if (answers.value[item.id] === item.correctAnswerIndex) total += 1
  })
  score.value = total
  testFinished.value = true
}

const restartTest = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  answers.value = {}
  testFinished.value = false
  score.value = 0
}

const initTaskDrafts = () => {
  const nextDrafts: Record<string, VacancyTaskSubmissionPayload> = {}
  taskItems.value.forEach((item) => {
    nextDrafts[item.task.id] = {
      solutionUrl: item.submission?.solutionUrl ?? "",
      comment: item.submission?.comment ?? ""
    }
  })
  taskDrafts.value = nextDrafts
}

const loadTasks = async (vacancyId: string) => {
  tasksLoading.value = true
  const [tasks, leaderboard] = await Promise.all([
    api.getVacancyRealTasks(vacancyId, authStore.user?.id ?? null),
    api.getVacancyTaskLeaderboard(vacancyId, authStore.user?.id ?? null)
  ])
  taskItems.value = tasks
  taskLeaderboard.value = leaderboard
  initTaskDrafts()
  tasksLoading.value = false
}

const submitTask = async (taskId: string) => {
  if (!vacancy.value) return

  const draft = taskDrafts.value[taskId]
  if (!draft?.solutionUrl?.trim()) {
    taskErrors.value[taskId] = "Добавьте ссылку на решение"
    return
  }

  try {
    taskSubmitting.value[taskId] = true
    taskErrors.value[taskId] = null
    const submission = await api.submitVacancyTask(vacancy.value.id, taskId, draft, authStore.user?.id ?? null)

    taskItems.value = taskItems.value.map((item) =>
      item.task.id === taskId ? { ...item, submission } : item
    )
    taskLeaderboard.value = await api.getVacancyTaskLeaderboard(vacancy.value.id, authStore.user?.id ?? null)
  } catch {
    taskErrors.value[taskId] = "Не удалось отправить решение"
  } finally {
    taskSubmitting.value[taskId] = false
  }
}

const loadVacancy = async () => {
  try {
    loading.value = true
    error.value = null
    vacancy.value = await api.getVacancyById(String(route.params.id))
    if (!vacancy.value) {
      error.value = "Вакансия не найдена"
    } else {
      await loadTasks(vacancy.value.id)
    }
  } catch {
    error.value = "Не удалось загрузить подготовку по вакансии"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadVacancy()
})
</script>

<template>
  <div class="page vacancy-preparation-page">
    <section class="card">
      <button class="secondary back-btn" @click="router.push('/vacancies')">← Назад к вакансиям</button>

      <div v-if="loading" class="muted">Загрузка...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <template v-else-if="vacancy">
        <h1>{{ vacancy.title }}</h1>
        <p class="vacancy-head-sub">
          {{ vacancy.company }} · {{ vacancy.location }} · Направление: {{ vacancy.preparation.direction }}
        </p>
        <div class="prep-mode-switch">
          <button
            class="secondary"
            :class="{ active: prepMode === 'overview' }"
            @click="prepMode = 'overview'"
          >
            Обзор
          </button>
          <button
            class="secondary"
            :class="{ active: prepMode === 'questions' }"
            @click="prepMode = 'questions'"
          >
            Вопросы
          </button>
          <button
            class="secondary"
            :class="{ active: prepMode === 'tasks' }"
            @click="prepMode = 'tasks'"
          >
            Реальные задачи
          </button>
          <button
            class="secondary"
            :class="{ active: prepMode === 'test' }"
            @click="prepMode = 'test'"
          >
            Тест
          </button>
        </div>
      </template>
    </section>

    <section v-if="vacancy && prepMode === 'overview'" class="card">
      <h3>План подготовки</h3>
      <div class="overview-grid">
        <article class="overview-item">
          <span>1. Изучите вопросы</span>
          <strong>{{ vacancy.preparation.questions.length }} шт.</strong>
          <button class="secondary" @click="prepMode = 'questions'">Открыть вопросы</button>
        </article>
        <article class="overview-item">
          <span>2. Выполните реальные задачи</span>
          <strong>{{ vacancy.realTasks.length }} шт.</strong>
          <button class="secondary" @click="prepMode = 'tasks'">Открыть задачи</button>
        </article>
        <article class="overview-item">
          <span>3. Пройдите мини-тест</span>
          <strong>{{ testQuestions.length }} шт.</strong>
          <button class="secondary" @click="prepMode = 'test'">Открыть тест</button>
        </article>
      </div>
      <p class="muted">Рекомендуемый порядок: вопросы → реальные задачи → тест.</p>
    </section>

    <section v-if="vacancy && prepMode === 'questions'" class="card">
      <h3>Частые вопросы для подготовки</h3>
      <div class="qa-list">
        <article v-for="item in vacancy.preparation.questions" :key="item.id" class="qa-item">
          <button class="qa-question" @click="toggleAnswer(item.id)">
            <span>{{ item.question }}</span>
            <strong>{{ openedAnswerId === item.id ? "−" : "+" }}</strong>
          </button>
          <p v-if="openedAnswerId === item.id" class="qa-answer">{{ item.answer }}</p>
        </article>
      </div>
      <div class="section-actions">
        <button class="secondary" @click="prepMode = 'overview'">К обзору</button>
        <button class="primary" @click="prepMode = 'tasks'">Перейти к задачам</button>
      </div>
    </section>

    <section v-if="vacancy && prepMode === 'tasks'" class="card">
      <h3>Реальные задачи от компании</h3>
      <p class="muted">Пока работает на mock-данных. В будущем компании смогут проверять отправленные решения.</p>

      <div v-if="tasksLoading" class="muted">Загрузка задач...</div>
      <div v-else-if="!taskItems.length" class="muted">По этой вакансии пока нет задач.</div>
      <div v-else class="task-list">
        <article v-for="item in taskItems" :key="item.task.id" class="task-item">
          <div class="task-head">
            <h4>{{ item.task.title }}</h4>
            <span class="task-hours">{{ item.task.estimatedHours }} ч</span>
          </div>
          <p class="task-brief">{{ item.task.brief }}</p>

          <div class="task-cols">
            <div>
              <p class="task-subtitle">Требования</p>
              <ul>
                <li v-for="req in item.task.requirements" :key="req">{{ req }}</li>
              </ul>
            </div>
            <div>
              <p class="task-subtitle">Что отправить</p>
              <ul>
                <li v-for="deliverable in item.task.deliverables" :key="deliverable">{{ deliverable }}</li>
              </ul>
            </div>
          </div>

          <div class="task-submit">
            <input
              v-model="taskDrafts[item.task.id].solutionUrl"
              placeholder="Ссылка на решение (GitHub/Drive)"
            />
            <textarea
              v-model="taskDrafts[item.task.id].comment"
              rows="3"
              placeholder="Комментарий к решению"
            />
            <div class="section-actions">
              <button class="primary" :disabled="taskSubmitting[item.task.id]" @click="submitTask(item.task.id)">
                {{ taskSubmitting[item.task.id] ? "Отправка..." : "Отправить решение" }}
              </button>
              <span v-if="item.submission" class="submitted-pill">Отправлено: {{ new Date(item.submission.submittedAt).toLocaleDateString("ru-RU") }}</span>
            </div>
            <p v-if="taskErrors[item.task.id]" class="error">{{ taskErrors[item.task.id] }}</p>
          </div>
        </article>
      </div>
      <div class="section-actions">
        <button class="secondary" @click="prepMode = 'questions'">К вопросам</button>
        <button class="primary" @click="prepMode = 'test'">Перейти к тесту</button>
      </div>

      <div v-if="taskLeadersTop.length" class="task-leaders-box">
        <h4>Лидеры по этой вакансии</h4>
        <div class="task-leader-list">
          <article v-for="leader in taskLeadersTop" :key="`task-leader-${leader.userId}`" class="task-leader-row">
            <div class="task-leader-rank">#{{ leader.rank }}</div>
            <div class="task-leader-main">
              <strong>{{ leader.fullName }}</strong>
              <p>{{ leader.tasksSubmitted }} задач · {{ verdictLabel[leader.aiVerdict] }}</p>
            </div>
            <div class="task-leader-score">{{ leader.averageQualityScore }}/100</div>
            <div class="task-leader-status" :class="{ sent: leader.sentToHr }">
              {{ leader.sentToHr ? "Отправлено HR" : "В обработке" }}
            </div>
          </article>
        </div>

        <div v-if="taskLeaderboard?.currentUser" class="task-leader-me">
          <span>Ваше место: <strong>#{{ taskLeaderboard.currentUser.rank }}</strong></span>
          <span>Качество: <strong>{{ taskLeaderboard.currentUser.averageQualityScore }}/100</strong></span>
        </div>
      </div>
    </section>

    <section v-if="vacancy && prepMode === 'test'" class="card">
      <h3>Мини-тест по вакансии</h3>

      <div v-if="!testFinished && currentQuestion" class="test-block">
        <p class="test-progress">
          Вопрос {{ currentQuestionIndex + 1 }} из {{ testQuestions.length }} · Отвечено: {{ answeredQuestions }}
        </p>
        <p class="test-question">{{ currentQuestion.question }}</p>

        <div class="test-options">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="`${currentQuestion.id}-${option}`"
            class="secondary test-option"
            :class="{ selected: selectedAnswer === index }"
            @click="selectOption(index)"
          >
            {{ option }}
          </button>
        </div>

        <button class="primary" :disabled="selectedAnswer === null" @click="nextQuestion">
          {{ currentQuestionIndex === testQuestions.length - 1 ? "Завершить тест" : "Следующий вопрос" }}
        </button>
        <button class="secondary" @click="prepMode = 'tasks'">Вернуться к задачам</button>
      </div>

      <div v-else class="test-result">
        <p>Результат: <strong>{{ score }} / {{ testQuestions.length }}</strong></p>
        <p class="muted">Подготовка завершена. Повторите тест для закрепления.</p>
        <div class="section-actions">
          <button class="secondary" @click="restartTest">Пройти заново</button>
          <button class="secondary" @click="prepMode = 'overview'">К обзору</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.vacancy-preparation-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.back-btn {
  margin-bottom: 10px;
}

.vacancy-head-sub {
  margin: 0;
  color: #52647f;
}

.prep-mode-switch {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.prep-mode-switch .active {
  border-color: #8ea8e8;
  background: #eef3ff;
  color: #1f2f4f;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.overview-item {
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overview-item span {
  color: #50627f;
}

.overview-item strong {
  color: #213350;
  font-size: 18px;
}

.qa-list {
  display: grid;
  gap: 8px;
}

.qa-item {
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  background: #fff;
}

.qa-question {
  width: 100%;
  background: transparent;
  border: 0;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  color: #233350;
  font-weight: 600;
  cursor: pointer;
}

.qa-answer {
  margin: 0;
  padding: 0 12px 12px;
  color: #54657f;
  line-height: 1.45;
}

.test-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.test-progress {
  margin: 0;
  font-size: 13px;
  color: #60708a;
}

.test-question {
  margin: 0;
  font-size: 18px;
  color: #1f2f4f;
}

.test-options {
  display: grid;
  gap: 8px;
}

.test-option {
  text-align: left;
}

.test-option.selected {
  border-color: #8ea8e8;
  background: #eef3ff;
}

.test-result p {
  margin: 0 0 8px;
}

.task-list {
  display: grid;
  gap: 10px;
}

.task-item {
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
}

.task-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
}

.task-head h4 {
  margin: 0;
  color: #203151;
}

.task-hours {
  font-size: 12px;
  border: 1px solid #d9e5f8;
  border-radius: 999px;
  padding: 3px 8px;
  background: #f6f9ff;
  color: #436187;
}

.task-brief {
  margin: 8px 0;
  color: #4e607d;
}

.task-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.task-subtitle {
  margin: 0 0 4px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #4f6488;
}

.task-cols ul {
  margin: 0;
  padding-left: 18px;
  color: #495a77;
}

.task-submit {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.task-submit input,
.task-submit textarea {
  width: 100%;
  border: 1px solid #d2e0f4;
  border-radius: 10px;
  padding: 9px 10px;
  background: #fff;
  color: #1e2f4b;
}

.submitted-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid #cae5d3;
  background: #eefbf3;
  color: #2f7550;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 12px;
}

.task-leaders-box {
  margin-top: 14px;
  border: 1px solid #dbe6f7;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
}

.task-leaders-box h4 {
  margin: 0 0 8px;
  color: #1f2f4f;
}

.task-leader-list {
  display: grid;
  gap: 8px;
}

.task-leader-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 10px;
  align-items: center;
  border: 1px solid #d9e5f8;
  border-radius: 9px;
  background: #fff;
  padding: 8px 9px;
}

.task-leader-rank {
  min-width: 30px;
  text-align: center;
  font-weight: 700;
  color: #2d4588;
}

.task-leader-main strong {
  color: #213352;
}

.task-leader-main p {
  margin: 2px 0 0;
  color: #5b6f8e;
  font-size: 12px;
}

.task-leader-score {
  font-weight: 700;
  color: #26407c;
}

.task-leader-status {
  border: 1px solid #d9e5f8;
  border-radius: 999px;
  padding: 4px 8px;
  background: #f5f8ff;
  color: #556a8d;
  font-size: 12px;
}

.task-leader-status.sent {
  border-color: #cae5d3;
  background: #edf9f1;
  color: #2f7150;
}

.task-leader-me {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #405473;
  font-size: 13px;
}

.section-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 840px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .task-cols {
    grid-template-columns: 1fr;
  }

  .task-leader-row {
    grid-template-columns: auto 1fr;
  }
}
</style>
