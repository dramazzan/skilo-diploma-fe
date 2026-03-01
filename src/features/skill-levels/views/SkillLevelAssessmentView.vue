<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import {
  mockRoadmapAssessments,
  mockRoadmaps,
  type AssessmentOption,
  type AssessmentQuestion,
  type RoadmapLevel
} from "@/shared/mocks/mockRoadmaps"
import { useAuthStore } from "@/features/auth/store/auth"
import { useRoadmapsStore } from "@/features/roadmaps/store/roadmaps"
import { useSkillLevelsStore, type DirectionSkillLevel } from "@/features/skill-levels/store/skillLevels"

interface WrittenQuestion {
  id: string
  text: string
  placeholder: string
  hint: string
  keywords: string[]
}

const MIN_WRITTEN_LENGTH = 40

const THEORY_OPTIONS: AssessmentOption[] = [
  { id: "theory_low", label: "Знаю только базу, без уверенной практики", score: 1 },
  { id: "theory_mid", label: "Понимаю теорию и решал(а) учебные/рабочие кейсы", score: 2 },
  { id: "theory_high", label: "Уверенно применяю в продакшене и могу объяснить другим", score: 3 }
]

const theoryQuestionTextsByRoadmap: Record<string, string[]> = {
  ai: [
    "Насколько уверенно вы объясняете разницу между supervised, unsupervised и reinforcement learning?",
    "Как хорошо вы понимаете причины переобучения и методы regularization?",
    "Насколько уверенно вы подбираете метрики под бизнес-задачу (classification/regression/ranking)?",
    "Есть ли у вас опыт feature engineering и отбора признаков для моделей?",
    "Насколько глубоко вы понимаете bias-variance tradeoff и влияние гиперпараметров?",
    "Как уверенно вы проводите error analysis после обучения модели?",
    "Есть ли опыт мониторинга drift и качества моделей после деплоя?",
    "Насколько уверенно вы документируете ML-эксперименты и обеспечиваете воспроизводимость?"
  ],
  frontend: [
    "Насколько уверенно вы объясняете critical rendering path и влияние на время загрузки?",
    "Какой у вас уровень понимания семантической верстки и доступности интерфейсов?",
    "Насколько уверенно вы применяете async/await, Promise combinators и обработку ошибок?",
    "Есть ли опыт проектирования масштабируемой структуры компонентов и UI-модулей?",
    "Насколько хорошо вы владеете оптимизацией bundle (code splitting, lazy loading, tree shaking)?",
    "Как уверенно вы выявляете и устраняете проблемы производительности в браузере?",
    "Есть ли у вас опыт защиты фронтенда от XSS/CSRF и небезопасных паттернов?",
    "Насколько хорошо вы строите стратегию тестирования (unit/integration/e2e)?"
  ],
  backend: [
    "Насколько уверенно вы проектируете идемпотентные API и корректную обработку повторных запросов?",
    "Как хорошо вы понимаете транзакции, уровни изоляции и консистентность данных?",
    "Насколько уверенно вы применяете очереди, retries и dead-letter подходы?",
    "Есть ли опыт проектирования rate limiting и защиты API от перегрузки?",
    "Насколько глубоко вы понимаете кеширование и стратегии invalidation?",
    "Как уверенно вы проводите zero-downtime миграции схемы базы данных?",
    "Есть ли у вас опыт построения observability: логи, метрики, трассировка?",
    "Насколько уверенно вы проектируете сервисы с учетом масштабирования и отказоустойчивости?"
  ],
  devops: [
    "Насколько уверенно вы применяете стратегии деплоя (blue-green, canary, rolling)?",
    "Как хорошо вы понимаете жизненный цикл контейнеров и безопасность образов?",
    "Насколько уверенно вы используете IaC и управление состоянием инфраструктуры?",
    "Есть ли у вас опыт построения CI/CD с quality gates и автоматическими rollback?",
    "Насколько уверенно вы настраиваете мониторинг, SLI/SLO и алертинг?",
    "Как хорошо вы владеете управлением секретами и политиками доступа?",
    "Есть ли опыт настройки backup/disaster recovery и периодических проверок восстановления?",
    "Насколько уверенно вы оптимизируете облачные ресурсы и стоимость эксплуатации?"
  ],
  mobile: [
    "Насколько уверенно вы учитываете различия платформ iOS/Android в UX и архитектуре?",
    "Как хорошо вы понимаете offline-first подход и стратегию синхронизации данных?",
    "Насколько уверенно вы оптимизируете мобильные приложения по памяти/CPU/энергопотреблению?",
    "Есть ли у вас опыт управления релизами, staged rollout и мониторинга crash rate?",
    "Насколько уверенно вы реализуете пуш-уведомления и background processing?",
    "Как хорошо вы владеете навигацией, deep links и состоянием экранов?",
    "Есть ли опыт защиты приложения: secure storage, obfuscation, certificate pinning?",
    "Насколько уверенно вы строите стратегию тестирования мобильного приложения?"
  ]
}

const writtenQuestionsByRoadmap: Record<string, WrittenQuestion[]> = {
  ai: [
    {
      id: "ai_written_case",
      text: "Опишите, как бы вы построили решение для задачи прогноза оттока пользователей. Какие этапы, риски и метрики вы выберете?",
      placeholder:
        "Расскажите про постановку задачи, сбор и очистку данных, baseline, выбор модели, валидацию, мониторинг и бизнес-метрики.",
      hint: "Укажите этапы пайплайна, метрики, контроль качества и шаги после деплоя.",
      keywords: ["данн", "baseline", "валидац", "метрик", "f1", "precision", "recall", "drift", "монитор"]
    },
    {
      id: "ai_written_errors",
      text: "Как вы анализируете ошибки модели и принимаете решение, что делать дальше?",
      placeholder:
        "Опишите подход к анализу ошибок, сегментации кейсов, улучшению признаков и повторной проверке гипотез.",
      hint: "Важно описать цикл: анализ -> гипотеза -> изменение -> повторная оценка.",
      keywords: ["ошиб", "гипотез", "признак", "dataset", "метрик", "validation", "ab", "эксперимент"]
    },
    {
      id: "ai_written_deploy",
      text: "Опишите план деплоя AI-модели в прод: какие проверки и мониторинг обязательны?",
      placeholder:
        "Укажите offline/online проверки, латентность, SLA, drift, алерты, rollback и контроль качества.",
      hint: "Покажите, что учитываете как технические, так и бизнес-риски.",
      keywords: ["деплой", "latency", "sla", "алерт", "rollback", "drift", "monitor", "quality"]
    }
  ],
  frontend: [
    {
      id: "fe_written_arch",
      text: "Опишите архитектуру большого фронтенд-приложения: как делить модули и управлять состоянием?",
      placeholder:
        "Расскажите про границы модулей, структуру компонентов, shared-слой, управление состоянием и подход к рефакторингу.",
      hint: "Опишите масштабируемость, читаемость и тестируемость решений.",
      keywords: ["компонент", "модул", "state", "pinia", "store", "feature", "слой", "рефактор"]
    },
    {
      id: "fe_written_perf",
      text: "Как вы бы ускорили медленное веб-приложение? Опишите пошаговый план диагностики и оптимизации.",
      placeholder:
        "Укажите метрики, инструменты профилирования, критический путь рендера, оптимизацию JS/CSS/изображений и проверку результата.",
      hint: "Добавьте конкретные метрики: LCP, INP, CLS или TTI.",
      keywords: ["lcp", "inp", "cls", "performance", "bundle", "lazy", "cache", "profiler", "render"]
    },
    {
      id: "fe_written_security",
      text: "Опишите, как вы защищаете фронтенд от уязвимостей и ошибок пользователя.",
      placeholder:
        "Расскажите про XSS/CSRF, валидацию данных, безопасное хранение токенов, Content Security Policy и обработку ошибок.",
      hint: "Нужно показать практические меры, а не только определения.",
      keywords: ["xss", "csrf", "csp", "валидац", "token", "sanitize", "auth", "security"]
    }
  ],
  backend: [
    {
      id: "be_written_api",
      text: "Опишите проектирование API для высоконагруженного сервиса: что критично предусмотреть?",
      placeholder:
        "Опишите версионирование, идемпотентность, контракты, лимиты, кэширование, обработку ошибок и наблюдаемость.",
      hint: "Покажите, как API будет стабильно работать под высокой нагрузкой.",
      keywords: ["api", "идемпот", "version", "rate", "cache", "retry", "timeout", "observability"]
    },
    {
      id: "be_written_db",
      text: "Как вы подходите к выбору и оптимизации базы данных для нового проекта?",
      placeholder:
        "Расскажите про модель данных, индексы, транзакции, масштабирование, миграции и мониторинг запросов.",
      hint: "Укажите компромиссы и возможные узкие места.",
      keywords: ["sql", "nosql", "индекс", "транзак", "реплика", "шард", "миграц", "query", "explain"]
    },
    {
      id: "be_written_reliability",
      text: "Опишите стратегию отказоустойчивости и восстановления сервиса при сбоях.",
      placeholder:
        "Укажите circuit breaker, retry policy, fallback, backup, disaster recovery и план коммуникации инцидента.",
      hint: "Важно описать как предотвращение, так и восстановление.",
      keywords: ["retry", "fallback", "circuit", "backup", "disaster", "incident", "slo", "sla"]
    }
  ],
  devops: [
    {
      id: "devops_written_pipeline",
      text: "Опишите CI/CD pipeline для продукта с частыми релизами и высоким требованием к стабильности.",
      placeholder:
        "Расскажите про стадии, quality gates, тесты, security checks, канареечный выпуск и rollback.",
      hint: "Нужно описать автоматизацию и контроль рисков релиза.",
      keywords: ["ci", "cd", "pipeline", "quality", "canary", "rollback", "test", "scan"]
    },
    {
      id: "devops_written_observability",
      text: "Как вы строите систему мониторинга и алертинга для продакшена?",
      placeholder:
        "Опишите метрики, логи, трассировку, SLI/SLO, пороги алертов, runbook и postmortem.",
      hint: "Добавьте, как избежать шумных алертов.",
      keywords: ["метрик", "лог", "trace", "sli", "slo", "alert", "runbook", "postmortem"]
    },
    {
      id: "devops_written_recovery",
      text: "Опишите план восстановления инфраструктуры после критического инцидента.",
      placeholder:
        "Укажите backup strategy, RTO/RPO, порядок восстановления, проверку целостности и регулярные учения.",
      hint: "Покажите, что recovery проверяется заранее, а не только на бумаге.",
      keywords: ["backup", "rto", "rpo", "restore", "integrity", "drill", "incident", "recovery"]
    }
  ],
  mobile: [
    {
      id: "mobile_written_arch",
      text: "Опишите архитектуру мобильного приложения, которое должно работать офлайн и синхронизироваться при сети.",
      placeholder:
        "Расскажите про хранение локальных данных, конфликт-резолвинг, очередь синхронизации и UX для офлайн-режима.",
      hint: "Укажите, как защищаете данные и обрабатываете конфликты.",
      keywords: ["offline", "sync", "cache", "conflict", "queue", "storage", "retry", "state"]
    },
    {
      id: "mobile_written_perf",
      text: "Как вы оптимизируете производительность и стабильность мобильного приложения?",
      placeholder:
        "Опишите профилирование, устранение утечек памяти, оптимизацию рендеринга, фоновые задачи и crash analytics.",
      hint: "Добавьте конкретные техники и метрики.",
      keywords: ["memory", "fps", "crash", "profil", "render", "background", "battery", "latency"]
    },
    {
      id: "mobile_written_release",
      text: "Опишите процесс безопасного релиза мобильного приложения в сторы.",
      placeholder:
        "Расскажите про QA, staged rollout, мониторинг метрик после релиза, hotfix-план и коммуникацию изменений.",
      hint: "Важно описать шаги до и после публикации.",
      keywords: ["release", "staged", "qa", "store", "review", "rollback", "metrics", "hotfix"]
    }
  ]
}

const buildExtraTheoryQuestions = (roadmapId: string, questions: string[]): AssessmentQuestion[] => {
  return questions.map((text, index) => {
    const questionId = `${roadmapId}_theory_extra_${index + 1}`
    return {
      id: questionId,
      text,
      options: THEORY_OPTIONS.map((option) => ({
        id: `${questionId}_${option.id}`,
        label: option.label,
        score: option.score
      }))
    }
  })
}

const extraTheoryQuestionsByRoadmap: Record<string, AssessmentQuestion[]> = Object.fromEntries(
  Object.entries(theoryQuestionTextsByRoadmap).map(([roadmapId, questions]) => [
    roadmapId,
    buildExtraTheoryQuestions(roadmapId, questions)
  ])
) as Record<string, AssessmentQuestion[]>

const router = useRouter()
const authStore = useAuthStore()
const roadmapsStore = useRoadmapsStore()
const skillLevelsStore = useSkillLevelsStore()

const selectedRoadmapId = ref<string>(mockRoadmaps[0]?.id ?? "")
const answers = ref<Record<string, number>>({})
const writtenAnswers = ref<Record<string, string>>({})
const submitMessage = ref<string | null>(null)

const selectedRoadmap = computed(() => {
  return mockRoadmaps.find((roadmap) => roadmap.id === selectedRoadmapId.value) ?? null
})

const selectedAssessment = computed(() => {
  if (!selectedRoadmapId.value) return null
  return mockRoadmapAssessments[selectedRoadmapId.value] ?? null
})

const theoryQuestions = computed<AssessmentQuestion[]>(() => {
  if (!selectedRoadmapId.value) return []

  const baseQuestions = selectedAssessment.value?.questions ?? []
  const extraQuestions = extraTheoryQuestionsByRoadmap[selectedRoadmapId.value] ?? []

  return [...baseQuestions, ...extraQuestions]
})

const writtenQuestions = computed<WrittenQuestion[]>(() => {
  if (!selectedRoadmapId.value) return []
  return writtenQuestionsByRoadmap[selectedRoadmapId.value] ?? []
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

const experienceLevelFromScore = (score: number): DirectionSkillLevel => {
  if (score <= 1.2) return "Junior"
  if (score <= 1.6) return "Junior Strong"
  if (score <= 2.1) return "Middle"
  if (score <= 2.5) return "Middle Strong"
  return "Senior"
}

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

const normalizeText = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const evaluateWrittenAnswer = (answer: string, question: WrittenQuestion) => {
  const normalized = normalizeText(answer)
  if (!normalized) return 1

  const words = normalized.split(" ").filter(Boolean)
  const length = answer.trim().length
  const lengthScore =
    length >= 260 ? 3 : length >= 180 ? 2.7 : length >= 120 ? 2.3 : length >= MIN_WRITTEN_LENGTH ? 1.8 : 1

  const keywordMatches = question.keywords.reduce((count, keyword) => {
    return count + (normalized.includes(keyword) ? 1 : 0)
  }, 0)
  const keywordRatio = question.keywords.length ? keywordMatches / question.keywords.length : 0
  const keywordScore = keywordRatio >= 0.7 ? 3 : keywordRatio >= 0.45 ? 2.5 : keywordRatio >= 0.2 ? 2 : 1.2

  const structureScore = words.length >= 40 ? 3 : words.length >= 26 ? 2.5 : words.length >= 16 ? 2 : 1.2

  const weighted = lengthScore * 0.4 + keywordScore * 0.4 + structureScore * 0.2
  return Number(Math.min(3, Math.max(1, weighted)).toFixed(2))
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
})

watch(
  [answers, writtenAnswers],
  () => {
    if (submitMessage.value) submitMessage.value = null
  },
  { deep: true }
)

const submitDirectionAssessment = async () => {
  if (!selectedRoadmap.value || !theoryQuestions.value.length || !allAnswered.value) return

  const theoryTotal = theoryQuestions.value.reduce((sum, question) => {
    return sum + (answers.value[question.id] ?? 1)
  }, 0)
  const theoryScore = Number((theoryTotal / theoryQuestions.value.length).toFixed(2))

  const writtenScore = writtenQuestions.value.length
    ? Number(
        (
          writtenQuestions.value.reduce((sum, question) => {
            return sum + evaluateWrittenAnswer(writtenAnswers.value[question.id] ?? "", question)
          }, 0) / writtenQuestions.value.length
        ).toFixed(2)
      )
    : theoryScore

  const totalScore = Number((theoryScore * 0.7 + writtenScore * 0.3).toFixed(2))
  const levelLabel = experienceLevelFromScore(totalScore)
  const updatedAt = new Date().toISOString()

  skillLevelsStore.setLevel({
    roadmapId: selectedRoadmap.value.id,
    roadmapTitle: selectedRoadmap.value.title,
    levelLabel,
    score: totalScore,
    updatedAt
  })

  await roadmapsStore.addRoadmapWithLevel(
    selectedRoadmap.value.id,
    roadmapLevelFromExperience(levelLabel),
    authStore.user?.id ?? null
  )

  submitMessage.value = `Уровень для "${selectedRoadmap.value.title}" определен: ${levelLabel}. Теория: ${theoryScore}, письменная часть: ${writtenScore}.`
}
</script>

<template>
  <div class="skill-level-page">
    <button class="btn-back" @click="router.push('/roadmaps')">
      ← Назад к дорожным картам
    </button>

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
        <article
          v-for="roadmap in mockRoadmaps"
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
        <template v-if="selectedRoadmap && totalQuestions > 0">
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

.btn-back {
  border: none !important;
  background: transparent !important;
  color: var(--muted) !important;
  padding: 0 !important;
  width: fit-content;
  box-shadow: none !important;
}

.btn-back:hover {
  color: var(--text) !important;
  transform: none !important;
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
