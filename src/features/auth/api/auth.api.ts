import { api, type AuthResponse } from "@/shared/api/client"

export const authApi = {
  login(email: string, password: string): Promise<AuthResponse> {
    return api.login(email, password)
  },
  register(email: string, password: string): Promise<AuthResponse> {
    return api.register(email, password)
  }
}
