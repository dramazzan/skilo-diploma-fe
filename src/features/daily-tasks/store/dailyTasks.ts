import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { mockRoadmaps, mockRoadmapTrees, mockUserCollection, type RoadmapNode } from "@/shared/mocks/mockRoadmaps"

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

export interface DailyTaskQuizOption {
  id: string
  label: string
}

export interface DailyTaskQuiz {
  taskId: string
  question: string
  options: DailyTaskQuizOption[]
  correctOptionId: string
}

interface FlatRoadmapTopic {
  roadmapId: string
  roadmapTitle: string
  nodeId: string
  nodeTitle: string
}

const DAILY_TASKS_DB_KEY = "daily_tasks_db"
const DAILY_TASK_REMINDER_KEY = "daily_tasks_reminder_dismissed"
const ROADMAP_IDS_STORAGE_KEY = "user_roadmap_ids"
const GLOBAL_ROADMAP_ID = "global"

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const pad = (value: number) => String(value).padStart(2, "0")

const toDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const hash = (value: string) => {
  let result = 0

  for (let index = 0; index < value.length; index += 1) {
    result = ((result << 5) - result + value.charCodeAt(index)) | 0
  }

  return Math.abs(result)
}

const deterministicShuffle = <T>(items: T[], seed: string): T[] => {
  const list = [...items]

  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = hash(`${seed}:${index}`) % (index + 1)
    const temp = list[index]
    list[index] = list[swapIndex] as T
    list[swapIndex] = temp as T
  }

  return list
}

const pickDistinct = <T>(items: T[], count: number, seed: string): T[] => {
  return deterministicShuffle(items, seed).slice(0, Math.min(count, items.length))
}

const collectTopicsForDailyTests = (
  roadmapId: string,
  roadmapTitle: string,
  nodes: RoadmapNode[] | undefined
): FlatRoadmapTopic[] => {
  if (!nodes?.length) return []

  return nodes.flatMap((node) => {
    if (node.status === "locked") return []

    if (node.children?.length) {
      const nested = collectTopicsForDailyTests(roadmapId, roadmapTitle, node.children)

      if (nested.length) return nested
    }

    return [{
      roadmapId,
      roadmapTitle,
      nodeId: node.id,
      nodeTitle: node.title
    }]
  })
}

const topicsByRoadmapId = mockRoadmaps.reduce<Record<string, FlatRoadmapTopic[]>>((acc, roadmap) => {
  acc[roadmap.id] = collectTopicsForDailyTests(roadmap.id, roadmap.title, mockRoadmapTrees[roadmap.id])
  return acc
}, {})

const roadmapTaskPrompts = [
  "Пройдите мини-тест и зафиксируйте сложные вопросы для повтора.",
  "После теста разберите ошибки и повторите ключевые понятия темы.",
  "Дайте себе лимит времени и пройдите тест без подсказок."
]

const getSelectedRoadmaps = () => {
  const selectedIds = parseJson<string[]>(
    localStorage.getItem(ROADMAP_IDS_STORAGE_KEY),
    [...mockUserCollection]
  )

  return mockRoadmaps.filter((roadmap) => selectedIds.includes(roadmap.id))
}

export const useDailyTasksStore = defineStore("daily-tasks", () => {
  const tasksByDate = ref<Record<string, DailyTaskItem[]>>(
    parseJson<Record<string, DailyTaskItem[]>>(localStorage.getItem(DAILY_TASKS_DB_KEY), {})
  )

  const reminderDismissedDate = ref<string | null>(localStorage.getItem(DAILY_TASK_REMINDER_KEY))

  const persistTasks = () => {
    localStorage.setItem(DAILY_TASKS_DB_KEY, JSON.stringify(tasksByDate.value))
  }

  const persistReminder = () => {
    if (!reminderDismissedDate.value) {
      localStorage.removeItem(DAILY_TASK_REMINDER_KEY)
      return
    }

    localStorage.setItem(DAILY_TASK_REMINDER_KEY, reminderDismissedDate.value)
  }

  const getTodayKey = () => toDateKey(new Date())

  const buildTasksForDate = (dateKey: string): DailyTaskItem[] => {
    const existingById = new Map(
      (tasksByDate.value[dateKey] ?? []).map((task) => [task.id, task])
    )

    const selectedRoadmaps = getSelectedRoadmaps()
    const roadmapTasks: DailyTaskItem[] = selectedRoadmaps
      .map((roadmap) => {
        const topics = topicsByRoadmapId[roadmap.id] ?? []
        if (!topics.length) return null

        const seed = hash(`${dateKey}:roadmap:${roadmap.id}`)
        const selectedTopic = topics[seed % topics.length]

        if (!selectedTopic) return null

        const questionsCount = 5 + (seed % 4)
        const prompt = roadmapTaskPrompts[seed % roadmapTaskPrompts.length]

        return {
          id: `roadmap-test:${roadmap.id}:${selectedTopic.nodeId}`,
          date: dateKey,
          roadmapId: roadmap.id,
          roadmapTitle: roadmap.title,
          nodeId: selectedTopic.nodeId,
          nodeTitle: selectedTopic.nodeTitle,
          description: `Тест по дорожке «${roadmap.title}»: ${questionsCount} вопросов по теме «${selectedTopic.nodeTitle}». ${prompt}`,
          points: 70 + (seed % 3) * 10,
          completed: false,
          completedAt: null
        }
      })
      .filter((task): task is DailyTaskItem => Boolean(task))
      .sort((first, second) => first.roadmapTitle.localeCompare(second.roadmapTitle, "ru"))

    const globalSeed = hash(`${dateKey}:global:${selectedRoadmaps.map((item) => item.id).join(":")}`)
    const spotlightTopics = roadmapTasks.slice(0, 3).map((task) => `«${task.nodeTitle}»`).join(", ")

    const globalTask = roadmapTasks.length
      ? {
          id: "global-test",
          date: dateKey,
          roadmapId: GLOBAL_ROADMAP_ID,
          roadmapTitle: "Общее задание",
          nodeId: "global-daily-test",
          nodeTitle: "Смешанный тест по всем вашим дорожкам",
          description: `Общий тест дня: ${10 + (globalSeed % 6)} вопросов по нескольким направлениям. Фокус тем: ${spotlightTopics}. За это задание начисляется больше очков.`,
          points: 180 + (globalSeed % 3) * 20,
          completed: false,
          completedAt: null
        }
      : null

    const nextTasks = globalTask ? [globalTask, ...roadmapTasks] : roadmapTasks

    return nextTasks.map((task) => {
      const existing = existingById.get(task.id)

      if (!existing) return task

      return {
        ...task,
        completed: existing.completed,
        completedAt: existing.completedAt ?? null
      }
    })
  }

  const ensureTasksForDate = (dateKey: string) => {
    tasksByDate.value[dateKey] = buildTasksForDate(dateKey)
    persistTasks()
  }

  const ensureTodayTasks = () => {
    ensureTasksForDate(getTodayKey())
  }

  const todayTasks = computed(() => {
    const todayKey = getTodayKey()
    return tasksByDate.value[todayKey] ?? []
  })

  const globalTodayTask = computed(() => {
    return todayTasks.value.find((task) => task.roadmapId === GLOBAL_ROADMAP_ID) ?? null
  })

  const roadmapTodayTasks = computed(() => {
    return todayTasks.value.filter((task) => task.roadmapId !== GLOBAL_ROADMAP_ID)
  })

  const completedTodayCount = computed(() => {
    return todayTasks.value.filter((task) => task.completed).length
  })

  const pendingTodayCount = computed(() => {
    return Math.max(0, todayTasks.value.length - completedTodayCount.value)
  })

  const todayTotalPoints = computed(() => {
    return todayTasks.value.reduce((sum, task) => sum + task.points, 0)
  })

  const earnedTodayPoints = computed(() => {
    return todayTasks.value.reduce((sum, task) => {
      return sum + (task.completed ? task.points : 0)
    }, 0)
  })

  const earnedTotalPoints = computed(() => {
    return Object.values(tasksByDate.value)
      .flat()
      .reduce((sum, task) => {
        return sum + (task.completed ? task.points : 0)
      }, 0)
  })

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
    return pendingTodayCount.value > 0 && reminderDismissedDate.value !== getTodayKey()
  })

  const completeTask = (taskId: string) => {
    const todayKey = getTodayKey()
    if (!tasksByDate.value[todayKey]?.length) {
      ensureTasksForDate(todayKey)
    }

    const items = tasksByDate.value[todayKey] ?? []

    const index = items.findIndex((task) => task.id === taskId)
    if (index < 0) return false

    const targetTask = items[index]
    if (!targetTask || targetTask.completed) return false

    items[index] = {
      ...targetTask,
      completed: true,
      completedAt: new Date().toISOString()
    }

    tasksByDate.value[todayKey] = [...items]
    persistTasks()

    return true
  }

  const createRoadmapTaskQuiz = (task: DailyTaskItem): DailyTaskQuiz => {
    const distractorPool = mockRoadmaps
      .map((roadmap) => roadmap.title)
      .filter((title) => title !== task.roadmapTitle)
    const distractors = pickDistinct(distractorPool, 2, `quiz:roadmap:${task.id}`)
    const optionLabels = deterministicShuffle(
      [task.roadmapTitle, ...distractors],
      `quiz:options:${task.id}`
    )
    const options = optionLabels.map((label, index) => ({
      id: `opt-${index + 1}`,
      label
    }))
    const correctOption = options.find((option) => option.label === task.roadmapTitle)

    return {
      taskId: task.id,
      question: `К какой дорожке относится тема «${task.nodeTitle}»?`,
      options,
      correctOptionId: correctOption?.id ?? "opt-1"
    }
  }

  const createGlobalTaskQuiz = (task: DailyTaskItem): DailyTaskQuiz => {
    const totalRoadmapTests = roadmapTodayTasks.value.length
    const optionValues = Array.from(new Set([
      totalRoadmapTests,
      Math.max(1, totalRoadmapTests - 1),
      totalRoadmapTests + 1
    ]))

    let fallback = totalRoadmapTests + 2
    while (optionValues.length < 3) {
      if (!optionValues.includes(fallback)) {
        optionValues.push(fallback)
      }
      fallback += 1
    }

    const shuffled = deterministicShuffle(optionValues, `quiz:global:${task.id}`)
    const options = shuffled.map((value, index) => ({
      id: `opt-${index + 1}`,
      label: String(value)
    }))
    const correctOption = options.find((option) => Number(option.label) === totalRoadmapTests)

    return {
      taskId: task.id,
      question: "Сколько тестов по вашим дорожкам доступно сегодня (без общего задания)?",
      options,
      correctOptionId: correctOption?.id ?? "opt-1"
    }
  }

  const getQuizForTask = (taskId: string): DailyTaskQuiz | null => {
    const task = todayTasks.value.find((item) => item.id === taskId)
    if (!task) return null

    if (task.roadmapId === GLOBAL_ROADMAP_ID) {
      return createGlobalTaskQuiz(task)
    }

    return createRoadmapTaskQuiz(task)
  }

  const submitTaskAnswer = (taskId: string, optionId: string): boolean => {
    const quiz = getQuizForTask(taskId)
    if (!quiz) return false
    if (quiz.correctOptionId !== optionId) return false

    return completeTask(taskId)
  }

  const getTaskForNode = (nodeId: string): DailyTaskItem | null => {
    return roadmapTodayTasks.value.find((task) => task.nodeId === nodeId) ?? null
  }

  const dismissReminderForToday = () => {
    reminderDismissedDate.value = getTodayKey()
    persistReminder()
  }

  const restoreReminder = () => {
    reminderDismissedDate.value = null
    persistReminder()
  }

  ensureTodayTasks()

  return {
    tasksByDate,
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
