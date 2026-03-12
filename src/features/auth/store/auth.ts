import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/features/auth/api/auth.api'
import type { AuthResponse, CompanyProfile, LoginPayload, OnboardingSubmitResponse, RegisterPayload, UserRole } from '@/shared/api/client'

interface User {
  id: number
  email: string
  role: UserRole
  firstLogin: boolean
  createdAt: string
  country: string
  city: string
  university: string
  companyProfile: CompanyProfile | null
  fullName?: string
}

const USER_STORAGE_KEY = 'auth_user'

const restoreUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(restoreUser())
  const isFirstLogin = ref<boolean>(user.value ? user.value.firstLogin : true)

  // ===== ACTIONS =====
  const login = async (payload: LoginPayload) => {
    const response: AuthResponse | undefined = await authApi.login(payload)

    if (!response) {
      throw new Error('Login failed: response is undefined')
    }

    token.value = response.token
    user.value = response.user
    isFirstLogin.value = response.user.firstLogin

    localStorage.setItem('token', response.token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user))

    return response
  }

  const register = async (payload: RegisterPayload) => {
    const response: AuthResponse | undefined = await authApi.register(payload)

    if (!response) {
      throw new Error('Register failed: response is undefined')
    }

    token.value = response.token
    user.value = response.user
    isFirstLogin.value = response.user.firstLogin

    localStorage.setItem('token', response.token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user))

    return response
  }

  const logout = () => {
    token.value = null
    user.value = null
    isFirstLogin.value = true
    localStorage.removeItem('token')
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  const setOnboardingDone = () => {
    isFirstLogin.value = false
    if (user.value) {
      user.value.firstLogin = false
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user.value))
    }
  }

  const completeOnboarding = async (interests: string[]) => {
    const response: OnboardingSubmitResponse | undefined = await authApi.submitOnboarding(user.value?.id ?? null, {
      interests
    })

    if (!response) {
      throw new Error("Onboarding failed: response is undefined")
    }

    user.value = response.user as User
    isFirstLogin.value = response.user.firstLogin
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user))

    return response
  }

  const setAuth = (newToken: string, newUser: User) => {
    token.value = newToken
    user.value = newUser
    isFirstLogin.value = newUser.firstLogin
    localStorage.setItem('token', newToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
  }


  return {
    token,
    user,
    isFirstLogin,
    login,
    register,
    logout,
    setOnboardingDone,
    completeOnboarding,
    setAuth
  }
})
