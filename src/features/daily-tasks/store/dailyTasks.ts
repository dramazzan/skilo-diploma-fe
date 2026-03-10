import { computed, ref } from "vue"
import { defineStore } from "pinia"

import { dailyTasksApi, type DailyTaskQuiz } from "@/features/daily-tasks/api/dailyTasks.api"

export interface DailyTaskItem {
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
}

const DAILY_TASK_REMINDER_KEY = "daily_tasks_reminder_dismissed"
const GLOBAL_ROADMAP_ID = "global"

const pad = (value: number) => String(value).padStart(2, "0")
const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const useDailyTasksStore = defineStore("daily-tasks", () => {
  const tasksByDate = ref<Record<string, DailyTaskItem[]>>({})
  const quizzesByTaskId = ref<Record<string, DailyTaskQuiz>>({})
  const reminderDismissedDate = ref<string | null>(localStorage.getItem(DAILY_TASK_REMINDER_KEY))
  const currentDateKey = ref<string>(toDateKey(new Date()))
  const loading = ref(false)

  const persistReminder = () => {
    if (!reminderDismissedDate.value) {
      localStorage.removeItem(DAILY_TASK_REMINDER_KEY)
      return
    }
    localStorage.setItem(DAILY_TASK_REMINDER_KEY, reminderDismissedDate.value)
  }

  const todayTasks = computed(() => tasksByDate.value[currentDateKey.value] ?? [])
  const globalTodayTask = computed(() => todayTasks.value.find((task) => task.roadmapId === GLOBAL_ROADMAP_ID) ?? null)
  const roadmapTodayTasks = computed(() => todayTasks.value.filter((task) => task.roadmapId !== GLOBAL_ROADMAP_ID))

  const completedTodayCount = computed(() => todayTasks.value.filter((task) => task.completed).length)
  const pendingTodayCount = computed(() => Math.max(0, todayTasks.value.length - completedTodayCount.value))
  const todayTotalPoints = computed(() => todayTasks.value.reduce((sum, task) => sum + task.points, 0))
  const earnedTodayPoints = computed(() =>
    todayTasks.value.reduce((sum, task) => sum + (task.completed ? task.points : 0), 0)
  )
  const earnedTotalPoints = computed(() =>
    Object.values(tasksByDate.value)
      .flat()
      .reduce((sum, task) => sum + (task.completed ? task.points : 0), 0)
  )

  const groupedTodayTasks = computed(() => {
    return roadmapTodayTasks.value.reduce<Record<string, DailyTaskItem[]>>((acc, task) => {
      if (!acc[task.roadmapId]) {
        acc[task.roadmapId] = []
      }

      acc[task.roadmapId].push(task)
      return acc
    }, {})
  })

  const isReminderVisible = computed(() => {
    return pendingTodayCount.value > 0 && reminderDismissedDate.value !== currentDateKey.value
  })

  const ensureTodayTasks = async () => {
    loading.value = true

    try {
      const response = await dailyTasksApi.getToday(null)
      currentDateKey.value = response.date
      tasksByDate.value = {
        ...tasksByDate.value,
        [response.date]: response.tasks
      }
    } finally {
      loading.value = false
    }
  }

  const completeTask = (taskId: string) => {
    const tasks = tasksByDate.value[currentDateKey.value] ?? []
    const targetIndex = tasks.findIndex((task) => task.id === taskId)

    if (targetIndex < 0) return false
    const task = tasks[targetIndex]
    if (!task || task.completed) return false

    const next = [...tasks]
    next[targetIndex] = {
      ...task,
      completed: true,
      completedAt: new Date().toISOString()
    }

    tasksByDate.value[currentDateKey.value] = next
    return true
  }

  const getQuizForTask = async (taskId: string) => {
    if (quizzesByTaskId.value[taskId]) {
      return quizzesByTaskId.value[taskId] ?? null
    }

    const quiz = await dailyTasksApi.getQuiz(null, taskId)
    quizzesByTaskId.value = {
      ...quizzesByTaskId.value,
      [taskId]: quiz
    }
    return quiz
  }

  const submitTaskAnswer = async (taskId: string, optionId: string) => {
    const result = await dailyTasksApi.submitAnswer(null, taskId, optionId)

    if (result.completed) {
      const tasks = tasksByDate.value[currentDateKey.value] ?? []
      const next = tasks.map((task) => {
        if (task.id !== taskId) return task
        return {
          ...task,
          completed: true,
          completedAt: new Date().toISOString()
        }
      })
      tasksByDate.value[currentDateKey.value] = next
    }

    return result.isCorrect
  }

  const getTaskForNode = (nodeId: string): DailyTaskItem | null => {
    return roadmapTodayTasks.value.find((task) => task.nodeId === nodeId) ?? null
  }

  const dismissReminderForToday = () => {
    reminderDismissedDate.value = currentDateKey.value
    persistReminder()
  }

  const restoreReminder = () => {
    reminderDismissedDate.value = null
    persistReminder()
  }

  return {
    tasksByDate,
    loading,
    todayTasks,
    globalTodayTask,
    roadmapTodayTasks,
    groupedTodayTasks,
    completedTodayCount,
    pendingTodayCount,
    todayTotalPoints,
    earnedTodayPoints,
    earnedTotalPoints,
    isReminderVisible,
    ensureTodayTasks,
    completeTask,
    getQuizForTask,
    submitTaskAnswer,
    getTaskForNode,
    dismissReminderForToday,
    restoreReminder
  }
})
