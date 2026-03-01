<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/features/auth/store/auth"

const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const loading = ref(false)
const error = ref<string | null>(null)

const router = useRouter()
const auth = useAuthStore()

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = null

    if (!email.value.trim() || !password.value.trim() || !confirmPassword.value.trim()) {
      error.value = "Заполните все поля"
      return
    }

    if (password.value !== confirmPassword.value) {
      error.value = "Пароли не совпадают"
      return
    }

    const response = await auth.register(email.value.trim(), password.value)
    if (response.user.firstLogin) router.push("/onboarding")
    else router.push("/roadmaps")
  } catch (err: any) {
    error.value = err?.message || "Не удалось зарегистрироваться"
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
        <h1>Создание аккаунта</h1>
        <p class="auth-text">
          Пройдите быструю регистрацию и получите доступ к roadmap-платформе, вакансиям и заданиям.
        </p>
      </aside>

      <div class="card auth-card">
        <h2>Регистрация</h2>
        <p class="auth-subtitle">Заполните поля, чтобы начать работу.</p>

        <label class="auth-field">
          <span>Email</span>
          <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" />
        </label>

        <label class="auth-field">
          <span>Пароль</span>
          <input
            v-model="password"
            type="password"
            placeholder="Минимум 6 символов"
            autocomplete="new-password"
          />
        </label>

        <label class="auth-field">
          <span>Подтверждение пароля</span>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Повторите пароль"
            autocomplete="new-password"
            @keyup.enter="handleRegister"
          />
        </label>

        <p v-if="error" class="error auth-error">{{ error }}</p>

        <button class="primary auth-submit" :disabled="loading" @click="handleRegister">
          {{ loading ? "Создание аккаунта..." : "Зарегистрироваться" }}
        </button>

        <p class="auth-footer">
          Уже есть аккаунт?
          <router-link to="/login">Войти</router-link>
        </p>
      </div>
    </div>
  </section>
</template>
