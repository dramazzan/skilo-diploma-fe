export interface ProfileData {
  id: number
  fullName: string
  email: string
  createdAt: string
  joinedAt: string
  country: string
  city: string
  university: string
  firstLogin: boolean
  completedTests: number
  skills: string[]
  achievements: string[]
}

export const mockProfileData: ProfileData = {
  id: 1,
  fullName: "John Doe",
  email: "test@example.com",
  createdAt: "2026-02-18T09:00:00.000Z",
  joinedAt: "2026-02-18",
  country: "Kazakhstan",
  city: "Almaty",
  university: "Satbayev University",
  firstLogin: false,
  completedTests: 5,
  skills: ["HTML", "CSS", "JavaScript", "Vue.js", "Node.js"],
  achievements: ["First Login Completed", "Frontend Basics Completed"]
}
