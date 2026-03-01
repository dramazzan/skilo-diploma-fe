import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/features/auth/api/auth.api'

interface User {
  id: number
  email: string
  firstLogin: boolean
  createdAt: string
  country: string
  city: string
  university: string
}

interface AuthResponse {
  token: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const isFirstLogin = ref<boolean>(true)

  // ===== ACTIONS =====
  const login = async (email: string, password: string) => {
    const response: AuthResponse | undefined = await authApi.login(email, password)

    if (!response) {
      throw new Error('Login failed: response is undefined')
    }

    token.value = response.token
    user.value = response.user
    isFirstLogin.value = response.user.firstLogin

    localStorage.setItem('token', response.token)

    return response
  }

  const register = async (email: string, password: string) => {
    const response: AuthResponse | undefined = await authApi.register(email, password)

    if (!response) {
      throw new Error('Register failed: response is undefined')
    }

    token.value = response.token
    user.value = response.user
    isFirstLogin.value = response.user.firstLogin

    localStorage.setItem('token', response.token)

    return response
  }

  const logout = () => {
    token.value = null
    user.value = null
    isFirstLogin.value = true
    localStorage.removeItem('token')
  }

  const setOnboardingDone = () => {
    isFirstLogin.value = false
    if (user.value) user.value.firstLogin = false
  }

  const setAuth = (newToken: string, newUser: User) => {
  token.value = newToken
  user.value = newUser
  isFirstLogin.value = newUser.firstLogin
  localStorage.setItem('token', newToken)
}


  return {
    token,
    user,
    isFirstLogin,
    login,
    register,
    logout,
    setOnboardingDone,
    setAuth
  }
})
