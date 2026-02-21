<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useRoadmapsStore } from "@/store/roadmaps"
import { useAuthStore } from "@/store/auth"

const router = useRouter()
const roadmapsStore = useRoadmapsStore()
const authStore = useAuthStore()
const removingRoadmapId = ref<string | null>(null)

const myRoadmaps = computed(() => roadmapsStore.myRoadmaps)
const availableRoadmaps = computed(() => roadmapsStore.availableRoadmaps)
const completedRoadmaps = computed(() => {
  return myRoadmaps.value.filter((roadmap) => getProgressPercent(roadmap.id) >= 100).length
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
})

const removeRoadmap = async (roadmapId: string) => {
  removingRoadmapId.value = roadmapId
  await roadmapsStore.removeRoadmapFromCollection(roadmapId, authStore.user?.id ?? null)
  removingRoadmapId.value = null
}
</script>

<template>
  <div class="page">
    <section class="home-intro card">
      <div class="home-intro-head">
        <h1>Платформа обучения Skilo</h1>
        <p>Стройте свой путь по дорожным картам: оценка уровня, тесты и подготовка к интервью.</p>
      </div>

      <div class="home-intro-stats">
        <div class="home-stat">
          <span class="home-stat-label">Мои направления</span>
          <strong>{{ myRoadmaps.length }}</strong>
        </div>
        <div class="home-stat">
          <span class="home-stat-label">Доступно для добавления</span>
          <strong>{{ availableRoadmaps.length }}</strong>
        </div>
        <div class="home-stat">
          <span class="home-stat-label">Завершённых roadmap</span>
          <strong>{{ completedRoadmaps }}</strong>
        </div>
      </div>

      <div class="home-feature-grid">
        <article class="home-feature">
          <h3>Дерево навыков</h3>
          <p>Интерактивное дерево тем с логикой разблокировки и отслеживанием статусов.</p>
        </article>
        <article class="home-feature">
          <h3>Тесты по темам</h3>
          <p>Таймер, последовательные вопросы, результат прохождения и возможность пересдачи.</p>
        </article>
        <article class="home-feature">
          <h3>Подготовка к интервью</h3>
          <p>Частые вопросы по каждой теме с быстрым просмотром ответов.</p>
        </article>
      </div>
    </section>

    <section class="roadmaps-section">
      <div class="section-head">
        <h1>Мои дорожные карты</h1>
      </div>

      <div v-if="myRoadmaps.length === 0" class="card">
        У вас пока нет дорожных карт. Добавьте направление ниже.
      </div>

      <div class="roadmaps-grid">
        <div
          v-for="roadmap in myRoadmaps"
          :key="roadmap.id"
          class="card roadmap-card"
          :class="getLevelClass(getAssignedLevel(roadmap.id, roadmap.level))"
        >
          <div class="roadmap-card-content">
            <h3>{{ roadmap.title }}</h3>
            <p class="roadmap-description">{{ roadmap.description }}</p>
            <p class="muted level-badge">Уровень: {{ getAssignedLevel(roadmap.id, roadmap.level) }}</p>
            <div class="roadmap-progress">
              <div class="progress-head">
                <span>Прогресс</span>
                <span>{{ getProgressPercent(roadmap.id) }}%</span>
              </div>
              <div class="progress-track">
                <span class="progress-fill" :style="{ width: `${getProgressPercent(roadmap.id)}%` }" />
              </div>
              <p class="muted progress-meta">{{ getProgressMeta(roadmap.id) }}</p>
            </div>
          </div>
          <div class="actions-row">
            <button class="primary" @click="openRoadmap(roadmap.id)">Открыть карту</button>
            <button
              class="secondary"
              :disabled="removingRoadmapId === roadmap.id"
              @click="removeRoadmap(roadmap.id)"
            >
              {{ removingRoadmapId === roadmap.id ? "Удаление..." : "Удалить" }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="roadmaps-section">
      <div class="section-head">
        <h1>Добавить направление</h1>
      </div>

      <div v-if="availableRoadmaps.length === 0" class="card">
        Все доступные направления уже добавлены в вашу коллекцию.
      </div>

      <div class="roadmaps-grid">
        <div
          v-for="roadmap in availableRoadmaps"
          :key="roadmap.id"
          class="card roadmap-card"
          :class="getLevelClass(roadmap.level)"
        >
          <div class="roadmap-card-content">
            <h3>{{ roadmap.title }}</h3>
            <p class="roadmap-description">{{ roadmap.description }}</p>
            <p class="muted level-badge">Уровень: {{ roadmap.level }}</p>
          </div>
          <div class="actions-row">
            <button class="primary" @click="startAssessment(roadmap.id)">Пройти оценку</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
