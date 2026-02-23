<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/store/auth"

const interests = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const auth = useAuthStore()
const router = useRouter()

const allInterests = [
  { id: "frontend", label: "Frontend", description: "React, Vue, HTML/CSS", icon: "layout" },
  { id: "backend", label: "Backend", description: "Node.js, Python, API", icon: "server" },
  { id: "ai", label: "AI", description: "ML, NLP, Computer Vision", icon: "brain" },
  { id: "devops", label: "DevOps", description: "CI/CD, Docker, Cloud", icon: "cloud" },
  { id: "uiux", label: "UI/UX", description: "Figma, Research, Prototyping", icon: "pen" },
]

const toggleInterest = (id: string) => {
  const idx = interests.value.indexOf(id)
  if (idx === -1) {
    interests.value.push(id)
  } else {
    interests.value.splice(idx, 1)
  }
}

const isSelected = (id: string) => interests.value.includes(id)

const handleSubmit = async () => {
  if (interests.value.length === 0) return
  try {
    loading.value = true
    error.value = null
    auth.setOnboardingDone()
    router.push("/roadmaps")
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="onboarding">
    <div class="container">
      <!-- Steps indicator -->
      <div class="steps">
        <div class="step done"></div>
        <div class="step active"></div>
        <div class="step"></div>
      </div>

      <header>
        <h1>Что вас интересует?</h1>
        <p>Выберите направления, чтобы мы создали персональный план обучения</p>
      </header>

      <div class="interests-grid">
        <button
          v-for="interest in allInterests"
          :key="interest.id"
          class="interest-card"
          :class="{ selected: isSelected(interest.id) }"
          @click="toggleInterest(interest.id)"
        >
          <div class="card-check">
            <svg
              v-if="isSelected(interest.id)"
              xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>

          <!-- Icons -->
          <div class="card-icon">
            <svg v-if="interest.icon === 'layout'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <svg v-if="interest.icon === 'server'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><circle cx="6" cy="6" r="1"/><circle cx="6" cy="18" r="1"/></svg>
            <svg v-if="interest.icon === 'brain'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>
            <svg v-if="interest.icon === 'cloud'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
            <svg v-if="interest.icon === 'pen'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </div>

          <h3>{{ interest.label }}</h3>
          <p>{{ interest.description }}</p>
        </button>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <div class="actions">
        <span class="selected-count">{{ interests.length }} из {{ allInterests.length }} выбрано</span>
        <button
          class="submit-btn"
          :class="{ disabled: interests.length === 0 }"
          :disabled="loading || interests.length === 0"
          @click="handleSubmit"
        >
          <template v-if="loading">
            <span class="spinner"></span>
            Сохранение...
          </template>
          <template v-else>
            Продолжить
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-a);
  padding: 40px 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text);
}

.container {
  width: 100%;
  max-width: 560px;
}

/* Steps */
.steps {
  display: flex;
  gap: 6px;
  margin-bottom: 40px;
}

.step {
  height: 3px;
  flex: 1;
  border-radius: 100px;
  background: var(--border);
  transition: background 0.2s ease;
}

.step.done {
  background: var(--primary);
}

.step.active {
  background: var(--primary);
}

/* Header */
header {
  margin-bottom: 32px;
}

header h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0 0 8px;
  color: var(--text);
}

header p {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

/* Interests Grid */
.interests-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 28px;
}

.interest-card {
  position: relative;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 22px 20px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  color: inherit;
}

.interest-card:hover {
  border-color: var(--border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.interest-card.selected {
  border-color: var(--text);
  background: var(--surface-soft);
}

.card-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1.5px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.15s ease;
}

.interest-card.selected .card-check {
  background: var(--primary);
  border-color: var(--text);
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--surface-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: var(--text);
  transition: all 0.15s ease;
}

.interest-card.selected .card-icon {
  background: var(--primary);
  color: #fff;
}

.interest-card h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--text);
}

.interest-card p {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
  line-height: 1.4;
}

/* Error */
.error-msg {
  font-size: 14px;
  color: #dc2626;
  margin: 0 0 16px;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 10px;
  border: 1px solid #fecaca;
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-count {
  font-size: 13px;
  color: var(--muted);
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  background: var(--primary);
  color: var(--button-text);
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-btn.disabled {
  background: var(--border);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(13, 13, 13, 0.25);
  border-top-color: var(--button-text);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 520px) {
  .interests-grid {
    grid-template-columns: 1fr;
  }

  header h1 {
    font-size: 24px;
  }

  .actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .selected-count {
    text-align: center;
  }

  .submit-btn {
    justify-content: center;
  }
}
</style>
