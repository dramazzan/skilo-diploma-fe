import { mockVacancies } from "@/mocks/mockVacancies"

import type {
  CompanyCandidate,
  FriendChallenge,
  RoadmapProgressItem,
  User,
  Vacancy,
  VacancyTaskSubmission
} from "../types"

const STORAGE_KEYS = {
  users: "mock_users",
  roadmapCollections: "mock_user_roadmap_collections",
  topicResults: "topic_test_results",
  roadmapProgress: "user_roadmap_progress",
  dailyTasks: "daily_tasks_db",
  vacancyTaskSubmissions: "vacancy_task_submissions",
  userFriends: "mock_user_friends",
  friendChallenges: "mock_friend_challenges",
  companyVacancies: "mock_company_vacancies",
  companyCandidates: "mock_company_candidates"
} as const

const readStorageJson = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key)

  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const writeStorageJson = <T>(key: string, payload: T) => {
  localStorage.setItem(key, JSON.stringify(payload))
}

export interface TopicResultLike {
  score: number
  passed: boolean
  updatedAt: string
}

export interface DailyTaskLike {
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

export const getUsers = (): User[] =>
  readStorageJson<User[]>(STORAGE_KEYS.users, [])

export const saveUsers = (users: User[]) => {
  writeStorageJson(STORAGE_KEYS.users, users)
}

export const getCollectionDb = (): Record<string, string[]> =>
  readStorageJson<Record<string, string[]>>(STORAGE_KEYS.roadmapCollections, {})

export const saveCollectionDb = (db: Record<string, string[]>) => {
  writeStorageJson(STORAGE_KEYS.roadmapCollections, db)
}

export const getFriendsDb = (): Record<string, number[]> =>
  readStorageJson<Record<string, number[]>>(STORAGE_KEYS.userFriends, {})

export const saveFriendsDb = (db: Record<string, number[]>) => {
  writeStorageJson(STORAGE_KEYS.userFriends, db)
}

export const getFriendChallengesDb = (): Record<string, FriendChallenge[]> =>
  readStorageJson<Record<string, FriendChallenge[]>>(STORAGE_KEYS.friendChallenges, {})

export const saveFriendChallengesDb = (db: Record<string, FriendChallenge[]>) => {
  writeStorageJson(STORAGE_KEYS.friendChallenges, db)
}

export const getTopicResults = (): Record<string, TopicResultLike> =>
  readStorageJson<Record<string, TopicResultLike>>(STORAGE_KEYS.topicResults, {})

export const getRoadmapProgressDb = (): Record<string, RoadmapProgressItem> =>
  readStorageJson<Record<string, RoadmapProgressItem>>(STORAGE_KEYS.roadmapProgress, {})

export const getDailyTasksDb = (): Record<string, DailyTaskLike[]> =>
  readStorageJson<Record<string, DailyTaskLike[]>>(STORAGE_KEYS.dailyTasks, {})

export const getVacancyTaskSubmissionsDb = (): Record<string, VacancyTaskSubmission[]> =>
  readStorageJson<Record<string, VacancyTaskSubmission[]>>(STORAGE_KEYS.vacancyTaskSubmissions, {})

export const saveVacancyTaskSubmissionsDb = (db: Record<string, VacancyTaskSubmission[]>) => {
  writeStorageJson(STORAGE_KEYS.vacancyTaskSubmissions, db)
}

export const getCompanyVacanciesDb = (): Vacancy[] =>
  readStorageJson<Vacancy[]>(STORAGE_KEYS.companyVacancies, [...mockVacancies])

export const saveCompanyVacanciesDb = (vacancies: Vacancy[]) => {
  writeStorageJson(STORAGE_KEYS.companyVacancies, vacancies)
}

export const getCompanyCandidatesDbRaw = (): CompanyCandidate[] | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.companyCandidates)

  if (!raw) return null

  try {
    return JSON.parse(raw) as CompanyCandidate[]
  } catch {
    return null
  }
}

export const saveCompanyCandidatesDb = (candidates: CompanyCandidate[]) => {
  writeStorageJson(STORAGE_KEYS.companyCandidates, candidates)
}
