<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/features/auth/store/auth"
import type { UserRole } from "@/shared/api/client"

const email = ref("")
const password = ref("")
const loading = ref(false)
const error = ref<string | null>(null)

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const selectedRole = computed<UserRole>(() => {
  return route.query.role === "company" ? "company" : "student"
})

const roleLabel = computed(() => {
  return selectedRole.value === "company" ? "Компания" : "Студент"
})

const roleLead = computed(() => {
  return selectedRole.value === "company"
    ? "Вход в кабинет компании"
    : "Вход в личный кабинет"
})

const roleHint = computed(() => {
  return selectedRole.value === "company"
    ? "Управляйте вакансиями и кандидатами из единого кабинета."
    : "Продолжайте обучение, отслеживайте прогресс и работайте с дорожными картами."
})

const changeRole = () => {
  router.push({
    path: "/auth",
    query: {
      next: "/login"
    }
  })
}

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null

    if (!email.value.trim() || !password.value.trim()) {
      error.value = "Заполните email и пароль"
      return
    }

    const response = await auth.login({
      email: email.value.trim(),
      password: password.value,
      role: selectedRole.value
    })

    if (response.user.role === "company") {
      router.push("/company")
    } else if (response.user.firstLogin) {
      router.push("/onboarding")
    } else {
      router.push("/roadmaps")
    }
  } catch (err: any) {
    error.value = err?.message || "Не удалось выполнить вход"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-container auth-shell">
      <aside class="auth-side">
        <p class="auth-kicker">Skillo</p>
        <h1>{{ roleLead }}</h1>
        <p class="auth-text">
          {{ roleHint }}
        </p>
        <button type="button" class="secondary auth-role-switch" @click="changeRole">
          Изменить тип входа ({{ roleLabel }})
        </button>
      </aside>

      <div class="card auth-card">
        <h2>С возвращением</h2>
        <p class="auth-subtitle">Тип входа: <strong>{{ roleLabel }}</strong>. Введите данные аккаунта.</p>

        <label class="auth-field">
          <span>Email</span>
          <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" />
        </label>

        <label class="auth-field">
          <span>Пароль</span>
          <input
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </label>

        <p v-if="error" class="error auth-error">{{ error }}</p>

        <button class="primary auth-submit" :disabled="loading" @click="handleLogin">
          {{ loading ? "Выполняется вход..." : "Войти" }}
        </button>

        <p class="auth-footer">
          Нет аккаунта?
          <router-link :to="{ path: '/register', query: { role: selectedRole } }">Зарегистрироваться</router-link>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-role-switch {
  width: fit-content;
  margin-top: 12px;
}
</style>
