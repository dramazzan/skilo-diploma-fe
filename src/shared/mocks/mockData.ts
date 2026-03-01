import type { AuthResponse } from "@/shared/api/client"
import type { RoadmapProgressItem } from "@/shared/api/client"

export const mockLoginResponse: AuthResponse = {
  token: "mock-jwt-123456",
  user: {
    id: 1,
    email: "test@example.com",
    firstLogin: true,
    createdAt: new Date().toISOString(),
    country: "Казахстан",
    city: "Алматы",
    university: "Satbayev University"
  }
}

export const mockDefaultRoadmapCollection: string[] = ["ai", "frontend"]

export const mockRoadmapProgressResponse: RoadmapProgressItem[] = [
  {
    roadmapId: "ai",
    completionPercent: 34,
    completedTopics: 3,
    totalTopics: 9
  },
  {
    roadmapId: "frontend",
    completionPercent: 25,
    completedTopics: 2,
    totalTopics: 8
  },
  {
    roadmapId: "backend",
    completionPercent: 0,
    completedTopics: 0,
    totalTopics: 5
  },
  {
    roadmapId: "devops",
    completionPercent: 0,
    completedTopics: 0,
    totalTopics: 4
  },
  {
    roadmapId: "mobile",
    completionPercent: 0,
    completedTopics: 0,
    totalTopics: 4
  }
]
