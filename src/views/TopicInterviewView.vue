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
  <div class="card">
    <button @click="goBack">← Назад</button>

    <div class="topic-tabs">
      <router-link class="topic-tab" :to="`/topics/${topicId}`">Обучение и тест</router-link>
      <router-link class="topic-tab" :to="`/topics/${topicId}/interview`">Вопросы интервью</router-link>
    </div>

    <div v-if="!topic">
      <h2>Тема не найдена</h2>
    </div>

    <div v-else>
      <h2>{{ topic.title }}: Вопросы для интервью</h2>
      <p>Часто задаваемые вопросы по этой теме.</p>

      <div v-if="loading" class="muted">Загрузка вопросов...</div>

      <div v-else-if="questions.length === 0" class="muted">
        Вопросов пока нет.
      </div>

      <div v-else class="interview-list">
        <article v-for="item in questions" :key="item.id" class="interview-card">
          <button class="interview-question" @click="toggleAnswer(item.id)">
            <span>{{ item.question }}</span>
            <span>{{ openedQuestionId === item.id ? "−" : "+" }}</span>
          </button>

          <p v-if="openedQuestionId === item.id" class="interview-answer">{{ item.answer }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
