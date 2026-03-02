<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/features/auth/store/auth"
import type { UserRole } from "@/shared/api/client"

const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const country = ref("Kazakhstan")
const city = ref("Almaty")
const university = ref("Satbayev University")
const companyName = ref("")
const bin = ref("")
const industry = ref("")
const contactPerson = ref("")
const phone = ref("")
const website = ref("")
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
    ? "Регистрация компании"
    : "Создание аккаунта студента"
})

const roleHint = computed(() => {
  return selectedRole.value === "company"
    ? "Заполните корпоративные данные, чтобы открыть кабинет работодателя."
    : "Пройдите быструю регистрацию и получите доступ к roadmap-платформе, вакансиям и заданиям."
})

const changeRole = () => {
  router.push({
    path: "/auth",
    query: {
      next: "/register"
    }
  })
}

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

    if (selectedRole.value === "company") {
      if (!companyName.value.trim() || !bin.value.trim() || !industry.value.trim() || !contactPerson.value.trim() || !phone.value.trim()) {
        error.value = "Для компании заполните обязательные поля."
        return
      }
    } else {
      if (!country.value.trim() || !city.value.trim() || !university.value.trim()) {
        error.value = "Для студента заполните страну, город и университет."
        return
      }
    }

    const response = await auth.register({
      email: email.value.trim(),
      password: password.value,
      role: selectedRole.value,
      country: country.value.trim(),
      city: city.value.trim(),
      university: university.value.trim(),
      companyName: companyName.value.trim(),
      bin: bin.value.trim(),
      industry: industry.value.trim(),
      contactPerson: contactPerson.value.trim(),
      phone: phone.value.trim(),
      website: website.value.trim()
    })

    if (response.user.role === "company") {
      router.push("/company")
    } else if (response.user.firstLogin) {
      router.push("/onboarding")
    } else {
      router.push("/roadmaps")
    }
  } catch (err: any) {
    error.value = err?.message || "Не удалось зарегистрироваться"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-container auth-shell register-shell">
      <aside class="auth-side">
        <p class="auth-kicker">Skillo</p>
        <h1>{{ roleLead }}</h1>
        <p class="auth-text">
          {{ roleHint }}
        </p>
        <button type="button" class="secondary auth-role-switch" @click="changeRole">
          Изменить тип аккаунта ({{ roleLabel }})
        </button>
      </aside>

      <div class="card auth-card register-card">
        <header class="register-head">
          <h2>Регистрация</h2>
          <p class="auth-subtitle">Тип регистрации: <strong>{{ roleLabel }}</strong>.</p>
        </header>

        <section class="register-section">
          <h3>Данные аккаунта</h3>
          <div class="register-grid">
            <label class="auth-field field-span-2">
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
          </div>
        </section>

        <section class="register-section">
          <h3>{{ selectedRole === "company" ? "Профиль компании" : "Профиль студента" }}</h3>

          <div v-if="selectedRole === 'student'" class="register-grid">
            <label class="auth-field">
              <span>Страна</span>
              <input v-model="country" type="text" placeholder="Kazakhstan" />
            </label>

            <label class="auth-field">
              <span>Город</span>
              <input v-model="city" type="text" placeholder="Almaty" />
            </label>

            <label class="auth-field field-span-2">
              <span>Университет</span>
              <input v-model="university" type="text" placeholder="Satbayev University" />
            </label>
          </div>

          <div v-else class="register-grid">
            <label class="auth-field field-span-2">
              <span>Название компании</span>
              <input v-model="companyName" type="text" placeholder="Skillo Company" />
            </label>

            <label class="auth-field">
              <span>БИН</span>
              <input v-model="bin" type="text" placeholder="123456789012" />
            </label>

            <label class="auth-field">
              <span>Сфера деятельности</span>
              <input v-model="industry" type="text" placeholder="EdTech / IT" />
            </label>

            <label class="auth-field">
              <span>Контактное лицо</span>
              <input v-model="contactPerson" type="text" placeholder="Имя и фамилия" />
            </label>

            <label class="auth-field">
              <span>Телефон</span>
              <input v-model="phone" type="text" placeholder="+7 700 000 00 00" />
            </label>

            <label class="auth-field field-span-2">
              <span>Сайт (необязательно)</span>
              <input v-model="website" type="text" placeholder="https://company.kz" />
            </label>
          </div>
        </section>

        <p v-if="error" class="error auth-error">{{ error }}</p>

        <div class="register-actions">
          <button class="primary auth-submit" :disabled="loading" @click="handleRegister">
            {{ loading ? "Создание аккаунта..." : "Зарегистрироваться" }}
          </button>

          <p class="auth-footer">
            Уже есть аккаунт?
            <router-link :to="{ path: '/login', query: { role: selectedRole } }">Войти</router-link>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.register-shell {
  width: min(1180px, 100%);
  grid-template-columns: minmax(300px, 0.95fr) minmax(560px, 1.25fr);
}

.register-card {
  gap: 16px;
}

.register-head {
  display: grid;
  gap: 4px;
}

.register-section {
  border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  border-radius: 14px;
  padding: 14px;
  background: color-mix(in srgb, var(--surface-soft) 72%, var(--surface));
  display: grid;
  gap: 12px;
}

.register-section h3 {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}

.register-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field-span-2 {
  grid-column: 1 / -1;
}

.register-actions {
  display: grid;
  gap: 10px;
}

.auth-role-switch {
  width: fit-content;
  margin-top: 12px;
}

@media (max-width: 980px) {
  .register-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .register-section {
    padding: 12px;
  }

  .register-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
