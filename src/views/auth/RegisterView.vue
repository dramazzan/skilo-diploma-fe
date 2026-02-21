<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/store/auth"

const email = ref("")
const password = ref("")
const loading = ref(false)
const error = ref<string | null>(null)

const router = useRouter()
const auth = useAuthStore()

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await auth.register(email.value, password.value)
    if (response.user.firstLogin) router.push("/onboarding")
    else router.push("/roadmaps")
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="card">
      <h2>Register</h2>
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button :disabled="loading" @click="handleRegister">
        {{ loading ? "Loading..." : "Register" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
      <p>
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>
    </div>
  </div>
</template>
