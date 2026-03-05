<script setup lang="ts">
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const fromPath = computed(() => {
  return typeof route.query.from === "string" ? route.query.from : "/"
})

const retry = () => {
  router.replace(fromPath.value)
}

const goHome = () => {
  router.push("/")
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-container auth-shell">
      <aside class="auth-side">
        <p class="auth-kicker">Skillo</p>
        <h1>Сервис временно недоступен</h1>
        <p class="auth-text">Не удалось загрузить данные. Обычно это временная ошибка сети или сервера.</p>
      </aside>

      <div class="card auth-card">
        <h2>Ошибка подключения</h2>
        <p class="auth-subtitle">Сервер не отвечает или соединение нестабильно.</p>

        <div class="auth-actions-row">
          <button type="button" class="primary auth-submit" @click="retry">Повторить</button>
          <button type="button" class="secondary auth-submit" @click="goHome">На главную</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-actions-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 760px) {
  .auth-actions-row {
    grid-template-columns: 1fr;
  }
}
</style>
