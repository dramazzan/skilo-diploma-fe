<script setup lang="ts">
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const requestedPath = computed(() => route.fullPath || "/")

const goHome = () => {
  router.push("/")
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push("/")
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-container auth-shell">
      <aside class="auth-side">
        <p class="auth-kicker">Skillo</p>
        <h1>Страница не найдена</h1>
        <p class="auth-text">Запрошенный адрес отсутствует в приложении.</p>
      </aside>

      <div class="card auth-card">
        <h2>Ошибка 404</h2>
        <p class="auth-subtitle">Такого адреса не существует.</p>
        <p class="auth-text"><strong>Адрес:</strong> {{ requestedPath }}</p>

        <div class="auth-actions-row">
          <button type="button" class="primary auth-submit" @click="goHome">На главную</button>
          <button type="button" class="secondary auth-submit" @click="goBack">Назад</button>
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
