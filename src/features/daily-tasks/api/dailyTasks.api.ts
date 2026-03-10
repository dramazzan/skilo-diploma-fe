import { api, type DailyTaskQuiz } from "@/shared/api/client"

export interface DailyTasksTodayResponse {
  date: string
  tasks: Array<{
    id: string
    date: string
    roadmapId: string
    roadmapTitle: string
    nodeId: string
    nodeTitle: string
    description: string
    points: number
    completed: boolean
    completedAt: string | null
  }>
  stats: { completed: number; pending: number; earnedPoints: number; totalPoints: number }
}

export const dailyTasksApi = {
  getToday(userId: number | null): Promise<DailyTasksTodayResponse> {
    return api.getDailyTasksToday(userId)
  },
  getQuiz(userId: number | null, taskId: string): Promise<DailyTaskQuiz> {
    return api.getDailyTaskQuiz(userId, taskId)
  },
  submitAnswer(userId: number | null, taskId: string, optionId: string): Promise<{ taskId: string; isCorrect: boolean; completed: boolean; pointsEarned: number }> {
    return api.submitDailyTaskAnswer(userId, taskId, optionId)
  }
}

export type { DailyTaskQuiz }
