<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { api, type InterviewQuestionItem } from "@/services/api"
import { mockRoadmap, type RoadmapTopic } from "@/mocks/mockRoadmap"

const route = useRoute()
const router = useRouter()

const topicId = route.params.id as string
const topic: RoadmapTopic | undefined = mockRoadmap.find((item) => item.id === topicId)

const loading = ref(true)
const questions = ref<InterviewQuestionItem[]>([])
const openedQuestionId = ref<string | null>(null)

const loadQuestions = async () => {
  loading.value = true
  questions.value = await api.getTopicInterviewQuestions(topicId)
  openedQuestionId.value = questions.value[0]?.id ?? null
  loading.value = false
}

const toggleAnswer = (questionId: string) => {
  openedQuestionId.value = openedQuestionId.value === questionId ? null : questionId
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push(`/topics/${topicId}`)
}

onMounted(() => {
  void loadQuestions()
})
</script>

<template>
  <div class="interview-page">

    <button class="btn btn--ghost" @click="goBack">← Назад</button>

    <div class="topic-tabs">
      <router-link class="topic-tab" :to="`/topics/${topicId}`">Обучение и тест</router-link>
      <router-link class="topic-tab" :to="`/topics/${topicId}/interview`">Вопросы интервью</router-link>
    </div>

    <div v-if="!topic" class="empty-state">
      <h2>Тема не найдена</h2>
    </div>

    <div v-else class="interview-body">
      <div class="interview-header">
        <h1 class="interview-title">{{ topic.title }}</h1>
        <p class="interview-subtitle">Часто задаваемые вопросы по этой теме.</p>
      </div>

      <div v-if="loading" class="state-text">Загрузка вопросов...</div>

      <div v-else-if="questions.length === 0" class="state-text">
        Вопросов пока нет.
      </div>

      <div v-else class="interview-list">
        <span class="section-label">{{ questions.length }} вопросов</span>

        <article
          v-for="item in questions"
          :key="item.id"
          class="interview-card"
          :class="{ 'interview-card--open': openedQuestionId === item.id }"
        >
          <button class="interview-question" @click="toggleAnswer(item.id)">
            <span class="question-text">{{ item.question }}</span>
            <span class="question-toggle">{{ openedQuestionId === item.id ? "−" : "+" }}</span>
          </button>

          <div v-if="openedQuestionId === item.id" class="interview-answer">
            <p>{{ item.answer }}</p>
          </div>
        </article>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Base ── */
.interview-page {
  font-family: 'Inter', sans-serif;
  color: var(--text);
  max-width: 780px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Back button ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  white-space: nowrap;
  align-self: flex-start;
}

.btn--primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--text);
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.2);
}

.btn--ghost {
  background: #fff;
  color: var(--text);
  border-color: var(--border);
}

.btn--ghost:hover {
  background: var(--surface-soft);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.06);
}

/* ── Tabs ── */
.topic-tabs {
  display: flex;
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 4px;
  background: var(--surface-soft);
  align-self: flex-start;
}

.topic-tab {
  padding: 7px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.topic-tab:hover {
  color: var(--text);
  background: #fff;
}

.topic-tab.router-link-active {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(10, 10, 10, 0.15);
}

/* ── Header ── */
.interview-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.interview-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0;
  line-height: 1.2;
}

.interview-subtitle {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

/* ── Section label ── */
.section-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin-bottom: 8px;
}

/* ── State texts ── */
.state-text {
  font-size: 14px;
  color: var(--muted);
  padding: 32px 0;
}

/* ── Empty ── */
.empty-state {
  padding: 40px 0;
  color: var(--muted);
}

/* ── Interview body ── */
.interview-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Interview list ── */
.interview-list {
  display: flex;
  flex-direction: column;
}

/* ── Interview Card ── */
.interview-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  margin-bottom: 8px;
  overflow: hidden;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.interview-card:last-child {
  margin-bottom: 0;
}

.interview-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(10, 10, 10, 0.07);
}

.interview-card--open {
  border-color: var(--text);
}

/* ── Question button ── */
.interview-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  background: transparent !important;
  border: none !important;
  color: inherit !important;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;
  box-shadow: none !important;
}

.interview-question:hover {
  background: var(--surface-soft) !important;
  transform: none;
}

.interview-card--open .interview-question {
  background: var(--surface-soft) !important;
  border-bottom: 1px solid var(--border);
}

.question-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.5;
  flex: 1;
}

.question-toggle {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 100px;
  background: var(--border);
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.15s ease, color 0.15s ease;
}

.interview-card--open .question-toggle {
  background: var(--primary);
  color: #fff;
}

/* ── Answer ── */
.interview-answer {
  padding: 16px 18px;
  background: #fff;
}

.interview-answer p {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
  line-height: 1.7;
}

/* ── Adaptive ── */
@media (max-width: 640px) {
  .interview-title {
    font-size: 18px;
  }

  .topic-tabs {
    width: 100%;
  }

  .topic-tab {
    flex: 1;
    text-align: center;
  }

  .interview-question {
    padding: 14px 14px;
  }

  .interview-answer {
    padding: 14px 14px;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
