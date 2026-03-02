<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { UserRole } from "@/shared/api/client"

const route = useRoute()
const router = useRouter()

const selectedRole = ref<UserRole>("student")

const roleCards = [
  {
    id: "student" as const,
    title: "Студент",
    description: "Обучение, roadmap, задания, интервью и подтверждение навыков."
  },
  {
    id: "company" as const,
    title: "Компания",
    description: "Публикация вакансий, работа с кандидатами и приглашения на интервью."
  }
]

const nextPath = computed(() => {
  return route.query.next === "/register" ? "/register" : "/login"
})

const openWithRole = (path: "/login" | "/register") => {
  router.push({
    path,
    query: {
      role: selectedRole.value
    }
  })
}

const continueToNext = () => {
  openWithRole(nextPath.value)
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-container auth-shell">
      <aside class="auth-side">
        <p class="auth-kicker">Skillo</p>
        <h1>Выберите тип входа</h1>
        <p class="auth-text">
          Сначала выберите профиль аккаунта: студент или компания. После этого откроется соответствующий сценарий входа и регистрации.
        </p>
      </aside>

      <div class="card auth-card">
        <h2>Как вы хотите войти?</h2>
        <p class="auth-subtitle">Выбор влияет на форму регистрации и стартовый маршрут в платформе.</p>

        <div class="role-grid">
          <button
            v-for="role in roleCards"
            :key="role.id"
            type="button"
            class="role-card"
            :class="{ active: selectedRole === role.id }"
            @click="selectedRole = role.id"
          >
            <strong>{{ role.title }}</strong>
            <span>{{ role.description }}</span>
          </button>
        </div>

        <button class="primary auth-submit" @click="continueToNext">
          Продолжить
        </button>

        <div class="auth-actions-row">
          <button type="button" class="secondary auth-mode-btn" @click="openWithRole('/login')">
            Войти
          </button>
          <button type="button" class="secondary auth-mode-btn" @click="openWithRole('/register')">
            Регистрация
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.role-grid {
  display: grid;
  gap: 10px;
}

.role-card {
  display: grid;
  gap: 4px;
  text-align: left;
  border-radius: 12px;
  border: 1px solid var(--border) !important;
  background: var(--surface) !important;
  color: var(--text) !important;
}

.role-card.active {
  border-color: var(--primary) !important;
  background: color-mix(in srgb, var(--primary) 10%, var(--surface)) !important;
}

.role-card strong {
  font-size: 15px;
}

.role-card span {
  font-size: 13px;
  line-height: 1.45;
  color: var(--muted);
}

.auth-actions-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.auth-mode-btn {
  min-height: 42px;
}

@media (max-width: 760px) {
  .auth-actions-row {
    grid-template-columns: 1fr;
  }
}
</style>
