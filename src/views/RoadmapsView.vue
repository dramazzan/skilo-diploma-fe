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
  color: #0a0a0a;
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
  color: #0a0a0a;
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
  color: #0a0a0a;
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
  color: #0a0a0a;
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
  background: #0a0a0a;
  color: #fff;
  border-color: #0a0a0a;
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
  color: #0a0a0a;
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
  background: #0a0a0a;
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
  background: #0a0a0a;
  color: #fff;
  border-color: #0a0a0a;
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.2);
}

.btn--ghost {
  background: #fff;
  color: #0a0a0a;
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