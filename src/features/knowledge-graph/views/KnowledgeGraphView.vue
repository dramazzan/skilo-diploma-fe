<script setup lang="ts">
import { computed, onMounted } from "vue"
import { RouterLink } from "vue-router"
import { useAuthStore } from "@/features/auth/store/auth"
import { useRoadmapsStore } from "@/features/roadmaps/store/roadmaps"
import { useSkillLevelsStore } from "@/features/skill-levels/store/skillLevels"
import { useTopicProgressStore } from "@/features/roadmaps/store/topicProgress"
import { useDailyTasksStore } from "@/features/daily-tasks/store/dailyTasks"
import { readLearningTelemetrySessions } from "@/features/knowledge-graph/lib/learningTelemetry"
import { mockRoadmap } from "@/shared/mocks/mockRoadmap"
import { mockRoadmaps } from "@/shared/mocks/mockRoadmaps"

interface RiskDimensions {
  accuracy: number
  speed: number
  stability: number
  depth: number
  consistency: number
}

interface RoadmapWeaknessInsight {
  roadmapId: string
  roadmapTitle: string
  weaknessScore: number
  confidence: number
  testsTaken: number
  avgScore: number
  avgSecondsPerQuestion: number
  dimensionRisk: RiskDimensions
  reasons: string[]
  tips: string[]
}

interface GraphNode {
  roadmapId: string
  roadmapTitle: string
  weaknessScore: number
  x: number
  y: number
  size: number
}

const RADAR_AXES: Array<{ key: keyof RiskDimensions; label: string }> = [
  { key: "accuracy", label: "Точность" },
  { key: "speed", label: "Скорость" },
  { key: "stability", label: "Стабильность" },
  { key: "depth", label: "Глубина" },
  { key: "consistency", label: "Регулярность" }
]

const authStore = useAuthStore()
const roadmapsStore = useRoadmapsStore()
const skillLevelsStore = useSkillLevelsStore()
const topicProgressStore = useTopicProgressStore()
const dailyTasksStore = useDailyTasksStore()

const roadmapById = new Map(mockRoadmaps.map((roadmap) => [roadmap.id, roadmap]))
const topicById = new Map(mockRoadmap.map((topic) => [topic.id, topic]))

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const average = (values: number[]) => {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const toPercent = (ratio: number) => {
  return Math.round(clamp(ratio * 100, 0, 100))
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

const nodeColor = (risk: number) => {
  const hue = clamp(190 - risk * 1.1, 8, 190)
  const lightness = clamp(70 - risk * 0.25, 36, 70)
  return `hsl(${hue} 78% ${lightness}%)`
}

const telemetrySessions = computed(() => {
  const userId = authStore.user?.id ?? null
  const sessions = readLearningTelemetrySessions()

  if (userId === null) return sessions

  return sessions.filter((session) => session.userId === userId || session.userId === null)
})

const latestSessionAt = computed(() => telemetrySessions.value[0]?.finishedAt ?? null)

const recentDailyCompletionByRoadmap = computed(() => {
  const cutoffMs = Date.now() - 1000 * 60 * 60 * 24 * 14
  const stats: Record<string, { completed: number; total: number }> = {}

  Object.values(dailyTasksStore.tasksByDate)
    .flat()
    .forEach((task) => {
      if (task.roadmapId === "global") return
      const taskDateMs = new Date(`${task.date}T00:00:00`).getTime()
      if (Number.isNaN(taskDateMs) || taskDateMs < cutoffMs) return

      if (!stats[task.roadmapId]) {
        stats[task.roadmapId] = { completed: 0, total: 0 }
      }

      stats[task.roadmapId].total += 1
      if (task.completed) {
        stats[task.roadmapId].completed += 1
      }
    })

  return stats
})

const roadmapInsights = computed<RoadmapWeaknessInsight[]>(() => {
  const roadmapIds = new Set<string>(roadmapsStore.userRoadmapIds)

  Object.keys(topicProgressStore.results).forEach((topicId) => {
    const topic = topicById.get(topicId)
    if (topic) roadmapIds.add(topic.roadmapId)
  })

  telemetrySessions.value.forEach((session) => {
    if (session.roadmapId) roadmapIds.add(session.roadmapId)
  })

  skillLevelsStore.allLevels.forEach((result) => {
    roadmapIds.add(result.roadmapId)
  })

  const entries: RoadmapWeaknessInsight[] = []

  roadmapIds.forEach((roadmapId) => {
    const roadmapTitle = roadmapById.get(roadmapId)?.title ?? roadmapId

    const topicResults = Object.entries(topicProgressStore.results)
      .map(([topicId, result]) => ({
        topic: topicById.get(topicId),
        result
      }))
      .filter((entry) => entry.topic?.roadmapId === roadmapId)
      .map((entry) => entry.result)

    const sessions = telemetrySessions.value.filter((session) => session.roadmapId === roadmapId)

    const testsTaken = Math.max(topicResults.length, sessions.length)

    const topicAvgScore = topicResults.length
      ? average(topicResults.map((item) => item.score))
      : null

    const topicFailedRate = topicResults.length
      ? topicResults.filter((item) => !item.passed).length / topicResults.length
      : 0

    const totalQuestions = sessions.reduce((sum, session) => sum + session.questionCount, 0)
    const totalWrongAnswers = sessions.reduce((sum, session) => sum + session.wrongCount, 0)
    const totalDurationSec = sessions.reduce((sum, session) => sum + session.durationSec, 0)
    const totalAnswerChanges = sessions.reduce((sum, session) => sum + session.answerChangeCount, 0)
    const totalRevisits = sessions.reduce((sum, session) => sum + session.revisitCount, 0)
    const totalLowConfidence = sessions.reduce((sum, session) => sum + session.lowConfidenceCount, 0)
    const failedSessionRate = sessions.length
      ? sessions.filter((session) => session.failed).length / sessions.length
      : 0

    const avgSecondsPerQuestion = totalQuestions
      ? totalDurationSec / totalQuestions
      : 40

    const wrongRate = totalQuestions
      ? totalWrongAnswers / totalQuestions
      : topicAvgScore !== null
        ? clamp((100 - topicAvgScore) / 100, 0, 1)
        : 0.28

    const revisionRate = totalQuestions
      ? (totalAnswerChanges + totalRevisits) / totalQuestions
      : 0

    const levelResult = skillLevelsStore.getLevel(roadmapId)
    const levelRisk = levelResult
      ? clamp(((2.45 - levelResult.score) / 1.45) * 100, 0, 100)
      : 0

    const completionPercent = roadmapsStore.getRoadmapProgress(roadmapId)?.completionPercent ?? null
    const roadmapProgressRisk = completionPercent === null
      ? 35
      : clamp((72 - completionPercent) * 1.28, 0, 100)

    const dailyStats = recentDailyCompletionByRoadmap.value[roadmapId]
    const dailyCompletionRatio = dailyStats?.total
      ? dailyStats.completed / dailyStats.total
      : null

    const dailyConsistencyRisk = dailyCompletionRatio === null
      ? 32
      : clamp((0.78 - dailyCompletionRatio) * 128, 0, 100)

    const accuracyRisk = clamp(
      (wrongRate * 0.62 + topicFailedRate * 0.23 + failedSessionRate * 0.15) * 100,
      8,
      100
    )

    const speedRisk = clamp(((avgSecondsPerQuestion - 34) / 34) * 100, 0, 100)
    const stabilityRisk = clamp(revisionRate * 135, 0, 100)

    const depthRisk = clamp(
      average([
        levelRisk,
        totalQuestions ? clamp((totalLowConfidence / totalQuestions) * 120, 0, 100) : 0,
        topicAvgScore === null ? 28 : clamp((74 - topicAvgScore) * 1.4, 0, 100)
      ]),
      8,
      100
    )

    const consistencyRisk = clamp(average([roadmapProgressRisk, dailyConsistencyRisk]), 10, 100)

    const weaknessScore = Math.round(
      accuracyRisk * 0.3 +
        depthRisk * 0.25 +
        consistencyRisk * 0.2 +
        speedRisk * 0.15 +
        stabilityRisk * 0.1
    )

    const confidenceSignals = topicResults.length * 6 + sessions.length * 4 + (completionPercent !== null ? 5 : 0)
    const confidence = Math.round(clamp(42 + confidenceSignals, 42, 96))

    const reasons: string[] = []

    if (topicResults.length && topicFailedRate >= 0.3) {
      reasons.push(`Не пройдено ${toPercent(topicFailedRate)}% тематических тестов.`)
    }

    if (totalQuestions > 0 && avgSecondsPerQuestion >= 52) {
      reasons.push(`Высокое время ответа: ${Math.round(avgSecondsPerQuestion)} сек/вопрос.`)
    }

    if (totalQuestions > 0 && revisionRate >= 0.2) {
      reasons.push(`Частые возвраты к ответам: ${toPercent(revisionRate)}% от вопросов.`)
    }

    if (levelResult && levelResult.score < 2.1) {
      reasons.push(`Низкая оценка по уровню: ${levelResult.levelLabel} (${levelResult.score}).`)
    }

    if (completionPercent !== null && completionPercent < 45) {
      reasons.push(`Прогресс по дорожке пока ${completionPercent}%.`)
    }

    if (dailyCompletionRatio !== null && dailyCompletionRatio < 0.58) {
      reasons.push(`Регулярность практики ${toPercent(dailyCompletionRatio)}% за 14 дней.`)
    }

    if (!reasons.length) {
      reasons.push("Явных провалов нет, но есть зона роста для закрепления навыка.")
    }

    const tips: string[] = []

    if (accuracyRisk >= 45) {
      tips.push("Сделайте 2 повторных мини-теста по этой дорожке с разбором каждой ошибки.")
    }

    if (speedRisk >= 45) {
      tips.push("Тренируйте ответы в режиме таймера: 35-45 сек на вопрос, затем разбор сложных пунктов.")
    }

    if (stabilityRisk >= 38) {
      tips.push("Перед выбором варианта фиксируйте короткую гипотезу, чтобы уменьшить колебания в ответах.")
    }

    if (depthRisk >= 45) {
      tips.push("Усилите фундамент: повторите базовые темы и закройте минимум 1 письменный кейс по направлению.")
    }

    if (consistencyRisk >= 45) {
      tips.push("Заложите ежедневный слот 20 минут и закройте минимум 5 задач подряд без пропусков.")
    }

    if (!tips.length) {
      tips.push("Удерживайте темп: раз в неделю проходите контрольный тест для проверки стабильности.")
    }

    entries.push({
      roadmapId,
      roadmapTitle,
      weaknessScore,
      confidence,
      testsTaken,
      avgScore: Math.round(topicAvgScore ?? clamp((1 - wrongRate) * 100, 0, 100)),
      avgSecondsPerQuestion: Math.round(avgSecondsPerQuestion),
      dimensionRisk: {
        accuracy: Math.round(accuracyRisk),
        speed: Math.round(speedRisk),
        stability: Math.round(stabilityRisk),
        depth: Math.round(depthRisk),
        consistency: Math.round(consistencyRisk)
      },
      reasons: reasons.slice(0, 3),
      tips: tips.slice(0, 3)
    })
  })

  return entries
    .sort((first, second) => second.weaknessScore - first.weaknessScore)
})

const hasSignals = computed(() => {
  return Boolean(
    roadmapInsights.value.length ||
      telemetrySessions.value.length ||
      Object.keys(topicProgressStore.results).length ||
      skillLevelsStore.allLevels.length
  )
})

const topWeakInsights = computed(() => {
  return roadmapInsights.value.filter((item) => item.weaknessScore >= 24).slice(0, 5)
})

const nextFocus = computed(() => {
  return topWeakInsights.value[0]?.roadmapTitle ?? "Стабильный баланс"
})

const overallRisk = computed<RiskDimensions>(() => {
  if (!topWeakInsights.value.length) {
    return {
      accuracy: 24,
      speed: 18,
      stability: 16,
      depth: 22,
      consistency: 20
    }
  }

  return {
    accuracy: Math.round(average(topWeakInsights.value.map((item) => item.dimensionRisk.accuracy))),
    speed: Math.round(average(topWeakInsights.value.map((item) => item.dimensionRisk.speed))),
    stability: Math.round(average(topWeakInsights.value.map((item) => item.dimensionRisk.stability))),
    depth: Math.round(average(topWeakInsights.value.map((item) => item.dimensionRisk.depth))),
    consistency: Math.round(average(topWeakInsights.value.map((item) => item.dimensionRisk.consistency)))
  }
})

const overallFocusScore = computed(() => {
  const avgRisk = average(Object.values(overallRisk.value))
  return Math.round(clamp(100 - avgRisk, 0, 100))
})

const radarGeometry = {
  size: 340,
  center: 170,
  radius: 118
}

const radarPoints = computed(() => {
  return RADAR_AXES.map((axis, index) => {
    const angle = ((Math.PI * 2) / RADAR_AXES.length) * index - Math.PI / 2
    const risk = overallRisk.value[axis.key]
    const currentRadius = (risk / 100) * radarGeometry.radius

    return {
      key: axis.key,
      label: axis.label,
      risk,
      x: radarGeometry.center + Math.cos(angle) * currentRadius,
      y: radarGeometry.center + Math.sin(angle) * currentRadius,
      axisX: radarGeometry.center + Math.cos(angle) * radarGeometry.radius,
      axisY: radarGeometry.center + Math.sin(angle) * radarGeometry.radius,
      labelX: radarGeometry.center + Math.cos(angle) * (radarGeometry.radius + 26),
      labelY: radarGeometry.center + Math.sin(angle) * (radarGeometry.radius + 26)
    }
  })
})

const radarPolygonPoints = computed(() => {
  return radarPoints.value.map((point) => `${point.x},${point.y}`).join(" ")
})

const networkNodes = computed<GraphNode[]>(() => {
  const list = topWeakInsights.value.slice(0, 6)
  if (!list.length) return []

  const centerX = 210
  const centerY = 210

  return list.map((item, index) => {
    const angle = ((Math.PI * 2) / list.length) * index - Math.PI / 2
    const radius = 110 + item.weaknessScore * 0.95

    return {
      roadmapId: item.roadmapId,
      roadmapTitle: item.roadmapTitle,
      weaknessScore: item.weaknessScore,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      size: 14 + (item.weaknessScore / 100) * 20
    }
  })
})

const platformTips = computed(() => {
  const tips: string[] = []

  if (overallRisk.value.accuracy >= 45) {
    tips.push("Раз в 2 дня закрывайте блок " + "ошибки -> разбор -> повторный тест" + " по самой слабой теме.")
  }

  if (overallRisk.value.depth >= 45) {
    tips.push("Перенесите фокус на базовые темы дорожки с максимальным риском и закройте минимум 3 узких вопроса подряд.")
  }

  if (overallRisk.value.consistency >= 42) {
    tips.push("Соберите ритм: 20 минут практики ежедневно, затем одна контрольная сессия в конце недели.")
  }

  if (overallRisk.value.speed >= 40) {
    tips.push("Добавьте спринт-режим: 10 вопросов с лимитом времени, потом анализ только медленных ответов.")
  }

  if (!tips.length) {
    tips.push("Профиль стабилен. Продолжайте текущий темп и проверяйте динамику графа каждую неделю.")
  }

  return tips.slice(0, 4)
})

onMounted(async () => {
  await roadmapsStore.loadUserRoadmapCollection(authStore.user?.id ?? null)
  await roadmapsStore.loadRoadmapProgress(authStore.user?.id ?? null)
  dailyTasksStore.ensureTodayTasks()
})
</script>

<template>
  <div class="knowledge-page">
    <section class="hero-card">
      <div>
        <p class="hero-kicker">AI Knowledge Graph</p>
        <h1>Граф слабых сторон и персональные рекомендации</h1>
        <p class="hero-note">
          AI анализирует ваши тесты, время на ответы, возвраты к вопросам и регулярность практики,
          чтобы показать, где именно теряется эффективность и что делать дальше.
        </p>
      </div>

      <div class="hero-stats">
        <article>
          <span>Выявлено зон риска</span>
          <strong>{{ topWeakInsights.length }}</strong>
        </article>
        <article>
          <span>Проанализировано сессий</span>
          <strong>{{ telemetrySessions.length }}</strong>
        </article>
        <article>
          <span>Следующий фокус</span>
          <strong>{{ nextFocus }}</strong>
        </article>
        <article>
          <span>Индекс фокуса</span>
          <strong>{{ overallFocusScore }}%</strong>
        </article>
      </div>
    </section>

    <section v-if="!hasSignals" class="empty-state card">
      <h2>Пока недостаточно данных для графа</h2>
      <p>
        Чтобы AI нашел слабые стороны, пройдите тесты по темам и уровню, затем выполните несколько ежедневных задач.
      </p>
      <div class="empty-actions">
        <RouterLink class="primary" to="/skill-levels">Пройти оценку уровня</RouterLink>
        <RouterLink class="secondary" to="/roadmaps">Открыть дорожные карты</RouterLink>
      </div>
    </section>

    <template v-else>
      <div class="layout">
        <section class="card graph-card">
          <header>
            <h2>Граф узких мест</h2>
            <p>
              Линии показывают связь с направлениями, размер узла - степень слабой зоны.
              Чем ближе к теплым оттенкам, тем выше риск просадки.
            </p>
          </header>

          <div class="network-wrap">
            <svg viewBox="0 0 420 420" class="network-chart" aria-label="Knowledge graph of weak skills">
              <defs>
                <radialGradient id="graphCenter" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stop-color="rgba(71, 174, 222, 0.44)" />
                  <stop offset="100%" stop-color="rgba(71, 174, 222, 0.04)" />
                </radialGradient>
              </defs>

              <circle cx="210" cy="210" r="48" fill="url(#graphCenter)" />
              <circle cx="210" cy="210" r="34" class="center-dot" />

              <line
                v-for="node in networkNodes"
                :key="`edge-${node.roadmapId}`"
                :x1="210"
                :y1="210"
                :x2="node.x"
                :y2="node.y"
                class="graph-edge"
              />

              <g v-for="node in networkNodes" :key="node.roadmapId">
                <circle
                  :cx="node.x"
                  :cy="node.y"
                  :r="node.size"
                  :fill="nodeColor(node.weaknessScore)"
                  class="graph-node"
                />
                <text :x="node.x" :y="node.y + 4" text-anchor="middle" class="graph-node-label">
                  {{ node.weaknessScore }}
                </text>
              </g>
            </svg>
          </div>

          <p class="graph-note">
            AI учитывает ошибки, темп, возвраты к ответам и регулярность практики.
            Последний анализ: <strong>{{ latestSessionAt ? formatDateTime(latestSessionAt) : "нет" }}</strong>.
          </p>
        </section>

        <section class="card radar-card">
          <header>
            <h2>Профиль рисков по факторам</h2>
            <p>
              Это агрегированный профиль по всем активным дорожкам. Больший радиус = выше риск.
            </p>
          </header>

          <svg
            class="radar-chart"
            :viewBox="`0 0 ${radarGeometry.size} ${radarGeometry.size}`"
            role="img"
            aria-label="Risk radar chart"
          >
            <circle
              v-for="ring in [0.25, 0.5, 0.75, 1]"
              :key="`ring-${ring}`"
              :cx="radarGeometry.center"
              :cy="radarGeometry.center"
              :r="radarGeometry.radius * ring"
              class="radar-ring"
            />

            <line
              v-for="point in radarPoints"
              :key="`axis-${point.key}`"
              :x1="radarGeometry.center"
              :y1="radarGeometry.center"
              :x2="point.axisX"
              :y2="point.axisY"
              class="radar-axis"
            />

            <polygon :points="radarPolygonPoints" class="radar-shape" />

            <circle
              v-for="point in radarPoints"
              :key="`dot-${point.key}`"
              :cx="point.x"
              :cy="point.y"
              r="5"
              class="radar-dot"
            />

            <text
              v-for="point in radarPoints"
              :key="`label-${point.key}`"
              :x="point.labelX"
              :y="point.labelY"
              class="radar-label"
            >
              {{ point.label }}
            </text>
          </svg>

          <div class="risk-grid">
            <article v-for="axis in RADAR_AXES" :key="`risk-${axis.key}`">
              <span>{{ axis.label }}</span>
              <strong>{{ overallRisk[axis.key] }}%</strong>
            </article>
          </div>
        </section>
      </div>

      <section class="card insights-card">
        <header>
          <h2>Где вы слабы и почему</h2>
          <p>
            Карточки ранжированы по риску. Для каждого направления показаны причины и конкретные шаги.
          </p>
        </header>

        <div class="insight-list">
          <article v-for="insight in topWeakInsights" :key="insight.roadmapId" class="insight-item">
            <div class="insight-head">
              <div>
                <h3>{{ insight.roadmapTitle }}</h3>
                <p>
                  Тестов: {{ insight.testsTaken }} • средний результат: {{ insight.avgScore }}% •
                  {{ insight.avgSecondsPerQuestion }} сек/вопрос
                </p>
              </div>
              <div class="risk-pill">
                <span>риск</span>
                <strong>{{ insight.weaknessScore }}</strong>
              </div>
            </div>

            <div class="dimension-bars">
              <div v-for="axis in RADAR_AXES" :key="`${insight.roadmapId}-${axis.key}`" class="dimension-row">
                <span>{{ axis.label }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: `${insight.dimensionRisk[axis.key]}%` }" />
                </div>
                <strong>{{ insight.dimensionRisk[axis.key] }}%</strong>
              </div>
            </div>

            <div class="insight-columns">
              <div>
                <h4>Почему AI считает это слабым местом</h4>
                <ul>
                  <li v-for="reason in insight.reasons" :key="reason">{{ reason }}</li>
                </ul>
              </div>

              <div>
                <h4>Что делать дальше</h4>
                <ul>
                  <li v-for="tip in insight.tips" :key="tip">{{ tip }}</li>
                </ul>
              </div>
            </div>

            <div class="insight-footer">
              <span>Достоверность оценки: {{ insight.confidence }}%</span>
              <RouterLink :to="`/roadmaps`">Открыть дорожку</RouterLink>
            </div>
          </article>
        </div>
      </section>

      <section class="card advice-card">
        <h2>Рекомендации платформы на ближайшую неделю</h2>
        <ol>
          <li v-for="tip in platformTips" :key="tip">{{ tip }}</li>
        </ol>
      </section>
    </template>
  </div>
</template>

<style scoped>
.knowledge-page {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.hero-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  background:
    radial-gradient(580px 280px at 100% 0, color-mix(in srgb, var(--primary) 16%, transparent) 0%, transparent 66%),
    linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  padding: 18px;
  display: grid;
  grid-template-columns: minmax(300px, 1.25fr) minmax(300px, 1fr);
  gap: 14px;
}

.hero-kicker {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.hero-card h1 {
  margin: 0 0 8px;
  font-size: 30px;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--text);
}

.hero-note {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
  max-width: 68ch;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.hero-stats article {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface) 84%, transparent);
  padding: 10px;
  display: grid;
  gap: 5px;
}

.hero-stats span {
  font-size: 11px;
  color: var(--muted);
}

.hero-stats strong {
  font-size: 16px;
  color: var(--text);
  line-height: 1.2;
}

.card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  padding: 14px;
}

.card h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.02em;
}

.card > header p,
.graph-note,
.insight-head p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.empty-state {
  display: grid;
  gap: 10px;
}

.empty-state p {
  margin: 0;
  color: var(--muted);
}

.empty-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.layout {
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(360px, 0.95fr);
  gap: 12px;
}

.graph-card,
.radar-card {
  display: grid;
  gap: 12px;
}

.network-wrap {
  border: 1px solid var(--border);
  border-radius: 12px;
  background:
    radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 56%),
    linear-gradient(180deg, var(--surface-soft) 0%, var(--surface) 100%);
  padding: 8px;
}

.network-chart {
  width: 100%;
  height: auto;
  display: block;
}

.center-dot {
  fill: color-mix(in srgb, var(--primary) 72%, var(--surface));
  stroke: color-mix(in srgb, var(--primary) 45%, var(--border));
  stroke-width: 1.5;
}

.graph-edge {
  stroke: color-mix(in srgb, var(--primary) 34%, var(--border));
  stroke-width: 1.4;
  opacity: 0.85;
}

.graph-node {
  stroke: color-mix(in srgb, var(--surface) 62%, transparent);
  stroke-width: 2;
  opacity: 0.95;
}

.graph-node-label {
  font-size: 11px;
  font-weight: 700;
  fill: #ffffff;
}

.radar-chart {
  width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background:
    radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 56%),
    linear-gradient(180deg, var(--surface-soft) 0%, var(--surface) 100%);
}

.radar-ring {
  fill: none;
  stroke: color-mix(in srgb, var(--border) 80%, transparent);
  stroke-width: 1;
}

.radar-axis {
  stroke: color-mix(in srgb, var(--border) 70%, transparent);
  stroke-width: 1;
}

.radar-shape {
  fill: color-mix(in srgb, var(--primary) 28%, transparent);
  stroke: color-mix(in srgb, var(--primary) 60%, var(--border));
  stroke-width: 2;
}

.radar-dot {
  fill: color-mix(in srgb, var(--primary) 78%, var(--surface));
}

.radar-label {
  font-size: 12px;
  font-weight: 600;
  fill: var(--muted);
  text-anchor: middle;
}

.risk-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.risk-grid article {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  padding: 8px 10px;
  display: grid;
  gap: 4px;
}

.risk-grid span {
  font-size: 12px;
  color: var(--muted);
}

.risk-grid strong {
  font-size: 16px;
  line-height: 1.2;
  color: var(--text);
}

.insights-card {
  display: grid;
  gap: 10px;
}

.insight-list {
  display: grid;
  gap: 10px;
}

.insight-item {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  padding: 12px;
  display: grid;
  gap: 10px;
}

.insight-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.insight-head h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.2;
}

.risk-pill {
  min-width: 76px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  padding: 5px 10px;
  display: grid;
  justify-items: center;
  line-height: 1;
}

.risk-pill span {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.risk-pill strong {
  margin-top: 5px;
  font-size: 18px;
  color: var(--text);
}

.dimension-bars {
  display: grid;
  gap: 6px;
}

.dimension-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 44px;
  gap: 8px;
  align-items: center;
}

.dimension-row span {
  font-size: 12px;
  color: var(--muted);
}

.bar-track {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--border) 74%, transparent);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #47aede 0%, #1f73c8 55%, #d45e43 100%);
}

.dimension-row strong {
  font-size: 12px;
  color: var(--text);
  text-align: right;
}

.insight-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.insight-columns h4 {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--text);
}

.insight-columns ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 5px;
}

.insight-columns li {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}

.insight-footer {
  border-top: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.insight-footer span {
  font-size: 12px;
  color: var(--muted);
}

.insight-footer a {
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.advice-card {
  display: grid;
  gap: 10px;
}

.advice-card ol {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
}

.advice-card li {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 1020px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .hero-stats {
    grid-template-columns: 1fr;
  }

  .insight-head {
    flex-direction: column;
  }

  .dimension-row {
    grid-template-columns: 92px minmax(0, 1fr) 38px;
  }

  .insight-columns {
    grid-template-columns: 1fr;
  }

  .insight-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .risk-grid {
    grid-template-columns: 1fr;
  }
}
</style>
