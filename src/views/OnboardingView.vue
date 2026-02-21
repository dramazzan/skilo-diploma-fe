<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/store/auth"

const interests = ref<string[]>([])
const skills = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const auth = useAuthStore()
const router = useRouter()

const allInterests = ["Frontend", "Backend", "AI", "DevOps", "UI/UX"]

const handleSubmit = async () => {
  try {
    loading.value = true
    // AI would normally estimate the level and build a roadmap here
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
  <div class="onboarding-container card">
    <h2>Onboarding</h2>
    <p>Select your interests:</p>
    <div v-for="interest in allInterests" :key="interest">
      <input
        type="checkbox"
        :value="interest"
        v-model="interests"
      /> {{ interest }}
    </div>
    <button :disabled="loading" @click="handleSubmit">
      {{ loading ? "Loading..." : "Save & Continue" }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>
