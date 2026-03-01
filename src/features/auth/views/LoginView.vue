<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/features/auth/store/auth"

const email = ref("")
const password = ref("")
const loading = ref(false)
const error = ref<string | null>(null)

const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null

    if (!email.value.trim() || !password.value.trim()) {
      error.value = "Заполните email и пароль"
      return
    }

    const response = await auth.login(email.value.trim(), password.value)

    if (response.user.firstLogin) {
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
        <h1>Вход в личный кабинет</h1>
        <p class="auth-text">
          Продолжайте обучение, отслеживайте прогресс и работайте с дорожными картами в одном месте.
        </p>
      </aside>

      <div class="card auth-card">
        <h2>С возвращением</h2>
        <p class="auth-subtitle">Введите данные аккаунта, чтобы продолжить.</p>

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
          <router-link to="/register">Зарегистрироваться</router-link>
        </p>
      </div>
    </div>
  </section>
</template>
