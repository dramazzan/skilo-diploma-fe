import { mockLoginResponse } from "@/shared/mocks/mockData"

import type { AuthResponse, CompanyProfile, LoginPayload, RegisterPayload, User, UserRole } from "../types"
import { delay, generateToken, USE_MOCK } from "../shared/runtime"
import { getUsers, saveUsers } from "../shared/storage"

const normalizeRole = (role: UserRole): UserRole => {
  return role === "company" ? "company" : "student"
}

const sanitizeUser = (user: User): Omit<User, "password"> => {
  const { password: _, ...safeUser } = user
  return safeUser
}

const requireField = (value: string | undefined, message: string) => {
  if (value?.trim()) return value.trim()
  throw new Error(message)
}

const buildCompanyProfile = (payload: RegisterPayload): CompanyProfile => {
  return {
    companyName: requireField(payload.companyName, "Укажите название компании"),
    bin: requireField(payload.bin, "Укажите БИН компании"),
    industry: requireField(payload.industry, "Укажите сферу деятельности"),
    contactPerson: requireField(payload.contactPerson, "Укажите контактное лицо"),
    phone: requireField(payload.phone, "Укажите телефон компании"),
    website: payload.website?.trim() ?? ""
  }
}

const roleTitleByValue: Record<UserRole, string> = {
  student: "студент",
  company: "компания"
}

const normalizeStoredUser = (raw: User): User => {
  const role = raw.role === "company" ? "company" : "student"
  return {
    ...raw,
    role,
    country: raw.country || "Kazakhstan",
    city: raw.city || "Almaty",
    university: raw.university || "Satbayev University",
    companyProfile: role === "company" ? raw.companyProfile ?? null : null
  }
}

const loadNormalizedUsers = () => {
  const users = getUsers().map((item) => normalizeStoredUser(item))
  saveUsers(users)
  return users
}

export const createAuthService = () => ({
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const role = normalizeRole(payload.role)
    const email = requireField(payload.email, "Укажите email").toLowerCase()
    const password = requireField(payload.password, "Укажите пароль")

    await delay(USE_MOCK ? 500 : 800)

    const users = loadNormalizedUsers()

    const existingUser = users.find((u) => u.email === email)
    if (existingUser) throw new Error("User already exists")

    const newUser: User = {
      id: Date.now(),
      email,
      password,
      role,
      firstLogin: role === "student",
      createdAt: new Date().toISOString(),
      country: role === "student" ? payload.country?.trim() || "Kazakhstan" : "Kazakhstan",
      city: role === "student" ? payload.city?.trim() || "Almaty" : "Almaty",
      university: role === "student" ? payload.university?.trim() || "Satbayev University" : "—",
      companyProfile: role === "company" ? buildCompanyProfile(payload) : null
    }

    users.push(newUser)
    saveUsers(users)

    return {
      token: generateToken(),
      user: sanitizeUser(newUser)
    }
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const role = normalizeRole(payload.role)
    const email = requireField(payload.email, "Укажите email").toLowerCase()
    const password = requireField(payload.password, "Укажите пароль")

    await delay(USE_MOCK ? 500 : 800)

    const users = loadNormalizedUsers()
    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      if (user.role !== role) {
        throw new Error(`Этот аккаунт зарегистрирован как «${roleTitleByValue[user.role]}». Выберите корректный тип входа.`)
      }

      return {
        token: generateToken(),
        user: sanitizeUser(user)
      }
    }

    if (USE_MOCK && role === "student" && email === mockLoginResponse.user.email.toLowerCase()) {
      const mockStudent: Omit<User, "password"> = {
        ...mockLoginResponse.user,
        role: "student",
        companyProfile: null
      }

      return {
        token: mockLoginResponse.token,
        user: mockStudent
      }
    }

    throw new Error("Invalid credentials")
  }
})
