import { mockLoginResponse } from "@/shared/mocks/mockData"

import type { AuthResponse, User } from "../types"
import { delay, generateToken, USE_MOCK } from "../shared/runtime"
import { getUsers, saveUsers } from "../shared/storage"

export const createAuthService = () => ({
  async register(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      return await delay(500).then(() => mockLoginResponse)
    }

    await delay(800)

    const users = getUsers()

    const existingUser = users.find((u) => u.email === email)
    if (existingUser) throw new Error("User already exists")

    const newUser: User = {
      id: Date.now(),
      email,
      password,
      firstLogin: true,
      createdAt: new Date().toISOString(),
      country: "Kazakhstan",
      city: "Almaty",
      university: "Satbayev University"
    }

    users.push(newUser)
    saveUsers(users)

    const { password: _, ...safeUser } = newUser

    return {
      token: generateToken(),
      user: safeUser
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      return await delay(500).then(() => mockLoginResponse)
    }

    await delay(800)

    const users = getUsers()
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) throw new Error("Invalid credentials")

    const { password: _, ...safeUser } = user

    return {
      token: generateToken(),
      user: safeUser
    }
  }
})
