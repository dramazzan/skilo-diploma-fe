<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { api, type AuthResponse } from "@/services/api";

const email = ref("");
const password = ref("");

const router = useRouter();
const auth = useAuthStore();

const handleLogin = async () => {
  try {
    const response: AuthResponse | undefined = await api.login(email.value, password.value);

    if (!response) {
      throw new Error("Login failed: response is undefined");
    }

    auth.setAuth(response.token, response.user);

    if (response.user.firstLogin) {
      router.push("/onboarding");
    } else {
      router.push("/roadmaps");
    }
  } catch (err) {
    console.error(err);
    alert("Login failed. Check your email and password.");
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="card">
      <h2>Login</h2>
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="handleLogin">Login</button>
      <p>
        No account?
        <router-link to="/register">Create one</router-link>
      </p>
    </div>
  </div>
</template>
