import { mockDefaultRoadmapCollection, mockLoginResponse, mockRoadmapProgressResponse } from "@/mocks/mockData"
import { mockFriendDirectory, mockDefaultFriendIds, type MockFriendProfile } from "@/mocks/mockFriends"
import { mockInterviewQuestionsByTopic } from "@/mocks/mockInterviewQuestions"
import { mockRoadmaps } from "@/mocks/mockRoadmaps"
import { mockVacancies, type VacancyItem, type VacancyTask as MockVacancyTask } from "@/mocks/mockVacancies"

export interface User {
  id: number
  email: string
  password: string
  firstLogin: boolean
  createdAt: string
  country: string
  city: string
  university: string
}

export interface AuthResponse {
  token: string
  user: Omit<User, "password">
}

export interface RoadmapProgressItem {
  roadmapId: string
  completionPercent: number
  completedTopics: number
  totalTopics: number
}

export interface InterviewQuestionItem {
  id: string
  topicId: string
  question: string
  answer: string
}

export interface UserActivityDay {
  date: string
  level: 0 | 1 | 2 | 3 | 4
}

export interface LeaderboardEntry {
  userId: number
  fullName: string
  avatar: string
  country: string
  city: string
  university: string
  points: number
  completedTests: number
  passedTests: number
  failedTests: number
  roadmapProgressPercent: number
  badges: string[]
  rank: number
}

export interface LeaderboardResponse {
  leaders: LeaderboardEntry[]
  currentUser: LeaderboardEntry
}

export interface CandidateWorkLeaderboardEntry {
  userId: number
  fullName: string
  avatar: string
  company: string
  vacancyTitle: string
  tasksSubmitted: number
  averageQualityScore: number
  aiVerdict: "excellent" | "strong" | "good" | "needs_improvement"
  sentToHr: boolean
  sentAt: string | null
  rank: number
}

export interface CandidateWorkLeaderboardResponse {
  leaders: CandidateWorkLeaderboardEntry[]
  currentUser: CandidateWorkLeaderboardEntry | null
}

export interface VacancyTaskLeaderboardEntry {
  userId: number
  fullName: string
  avatar: string
  tasksSubmitted: number
  averageQualityScore: number
  aiVerdict: "excellent" | "strong" | "good" | "needs_improvement"
  sentToHr: boolean
  sentAt: string | null
  rank: number
}

export interface VacancyTaskLeaderboardResponse {
  vacancyId: string
  vacancyTitle: string
  leaders: VacancyTaskLeaderboardEntry[]
  currentUser: VacancyTaskLeaderboardEntry | null
}

export interface VacancyTestQuestion {
  id: string
  question: string
  options: string[]
  correctAnswerIndex: number
}

export interface VacancyQuestion {
  id: string
  question: string
  answer: string
}

export interface VacancyPreparation {
  direction: string
  questions: VacancyQuestion[]
  test: VacancyTestQuestion[]
}

export interface VacancyTask extends MockVacancyTask {}

export interface VacancyTaskSubmissionPayload {
  solutionUrl: string
  comment: string
}

export interface VacancyTaskSubmission {
  vacancyId: string
  taskId: string
  userId: number
  solutionUrl: string
  comment: string
  status: "submitted"
  submittedAt: string
}

export interface Vacancy extends Omit<VacancyItem, "preparation"> {
  preparation: VacancyPreparation
}

export interface CompanyVacancyPayload {
  title: string
  description: string
  requirements: string[]
  level: Vacancy["level"]
  stack: string[]
  location: string
  employment: Vacancy["employment"]
  salaryRange: string
}

export interface CompanyVacancyTaskPayload {
  title: string
  brief: string
  requirements: string[]
  deliverables: string[]
  estimatedHours: number
}

export type CandidateResultStatus = "passed" | "failed" | "not_submitted"

export interface CompanyCandidateTaskResult {
  taskId: string
  taskTitle: string
  status: CandidateResultStatus
  score: number | null
  submittedAt: string | null
}

export interface CompanyCandidateTestResult {
  status: CandidateResultStatus
  score: number | null
  correctAnswers: number
  totalQuestions: number
}

export interface CompanyCandidateInterviewResult {
  status: CandidateResultStatus
  score: number | null
  answered: number
  totalQuestions: number
}

export interface CompanyCandidateEvaluation {
  tasks: CompanyCandidateTaskResult[]
  tasksSubmitted: number
  tasksPassed: number
  tasksTotal: number
  test: CompanyCandidateTestResult
  interview: CompanyCandidateInterviewResult
  overallScore: number | null
  workReadinessPercent: number
  readyForWork: boolean
}

export interface CompanyCandidate {
  id: string
  fullName: string
  email: string
  avatar: string
  phone: string
  country: string
  city: string
  university: string
  experienceLevel: "intern" | "junior" | "middle"
  about: string
  skills: string[]
  portfolioUrl: string
  githubUrl: string
  linkedinUrl: string
  vacancyId: string
  vacancyTitle: string
  appliedAt: string
  status: "new" | "reviewed" | "invited"
  inviteSentAt: string | null
  evaluation: CompanyCandidateEvaluation
}

export interface InterviewInvitePayload {
  subject: string
  message: string
}

export interface InterviewInviteResult {
  candidateId: string
  sentTo: string
  subject: string
  sentAt: string
}

export interface FriendProfile {
  userId: number
  fullName: string
  email: string
  avatar: string
  country: string
  city: string
  university: string
  points: number
  roadmapProgressPercent: number
  roadmapProgress: Record<string, number>
}

export interface GlobalItMapRoadmap {
  roadmapId: string
  title: string
}

export interface GlobalItMapParticipant {
  userId: number
  fullName: string
  avatar: string
  isCurrentUser: boolean
  points: number
  overallProgressPercent: number
  roadmapProgress: Record<string, number>
}

export interface GlobalItMapResponse {
  roadmaps: GlobalItMapRoadmap[]
  participants: GlobalItMapParticipant[]
}

// mock switch
const USE_MOCK = true

const USERS_KEY = "mock_users"
const USER_ROADMAP_COLLECTIONS_KEY = "mock_user_roadmap_collections"
const TOPIC_RESULTS_KEY = "topic_test_results"
const ROADMAP_PROGRESS_STORAGE_KEY = "user_roadmap_progress"
const VACANCY_TASK_SUBMISSIONS_KEY = "vacancy_task_submissions"
const USER_FRIENDS_KEY = "mock_user_friends"
const COMPANY_VACANCIES_KEY = "mock_company_vacancies"
const COMPANY_CANDIDATES_KEY = "mock_company_candidates"

// emulate network latency
const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// read local mock "database"
const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

// write local mock "database"
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const getCollectionDb = (): Record<string, string[]> => {
  const raw = localStorage.getItem(USER_ROADMAP_COLLECTIONS_KEY)

  if (!raw) return {}

  try {
    return JSON.parse(raw) as Record<string, string[]>
  } catch {
    return {}
  }
}

const saveCollectionDb = (db: Record<string, string[]>) => {
  localStorage.setItem(USER_ROADMAP_COLLECTIONS_KEY, JSON.stringify(db))
}

const getFriendsDb = (): Record<string, number[]> => {
  const raw = localStorage.getItem(USER_FRIENDS_KEY)

  if (!raw) return {}

  try {
    return JSON.parse(raw) as Record<string, number[]>
  } catch {
    return {}
  }
}

const saveFriendsDb = (db: Record<string, number[]>) => {
  localStorage.setItem(USER_FRIENDS_KEY, JSON.stringify(db))
}

const toIsoDate = (date: Date) => {
  return date.toISOString().slice(0, 10)
}

interface TopicResultLike {
  score: number
  passed: boolean
  updatedAt: string
}

const buildLastYearActivity = (): UserActivityDay[] => {
  const days: UserActivityDay[] = []
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push({
      date: toIsoDate(date),
      level: 0
    })
  }

  return days
}

const getTopicResults = (): Record<string, TopicResultLike> => {
  const raw = localStorage.getItem(TOPIC_RESULTS_KEY)
  if (!raw) return {}

  try {
    return JSON.parse(raw) as Record<string, TopicResultLike>
  } catch {
    return {}
  }
}

const getActivityFromUserActions = (): UserActivityDay[] => {
  const base = buildLastYearActivity()
  const byDate = base.reduce<Record<string, 0 | 1 | 2 | 3 | 4>>((acc, day) => {
    acc[day.date] = 0
    return acc
  }, {})

  const topicResults = Object.values(getTopicResults())

  topicResults.forEach((result) => {
    const date = result.updatedAt?.slice(0, 10)
    if (!date || byDate[date] === undefined) return

    const increment = result.passed ? 2 : 1
    byDate[date] = Math.min(4, (byDate[date] + increment) as 0 | 1 | 2 | 3 | 4)
  })

  return base.map((day) => ({
    date: day.date,
    level: byDate[day.date] ?? 0
  }))
}

const getRoadmapProgressDb = (): Record<string, RoadmapProgressItem> => {
  const raw = localStorage.getItem(ROADMAP_PROGRESS_STORAGE_KEY)
  if (!raw) return {}

  try {
    return JSON.parse(raw) as Record<string, RoadmapProgressItem>
  } catch {
    return {}
  }
}

const getCurrentUserRoadmapProgressMap = (): Record<string, number> => {
  const db = getRoadmapProgressDb()

  if (!Object.keys(db).length) {
    return mockRoadmapProgressResponse.reduce<Record<string, number>>((acc, item) => {
      acc[item.roadmapId] = item.completionPercent
      return acc
    }, {})
  }

  return Object.values(db).reduce<Record<string, number>>((acc, item) => {
    acc[item.roadmapId] = item.completionPercent
    return acc
  }, {})
}

const averageProgressFromMap = (map: Record<string, number>): number => {
  const values = Object.values(map)
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

const normalizeFriendProfile = (profile: MockFriendProfile): FriendProfile => {
  return {
    ...profile,
    roadmapProgressPercent: averageProgressFromMap(profile.roadmapProgress)
  }
}

const getFriendsForUser = (userId: number): FriendProfile[] => {
  const db = getFriendsDb()
  const friendIds = db[String(userId)] ?? [...mockDefaultFriendIds]

  return friendIds
    .map((friendId) => mockFriendDirectory.find((candidate) => candidate.userId === friendId))
    .filter((candidate): candidate is MockFriendProfile => Boolean(candidate))
    .map(normalizeFriendProfile)
}

const getVacancyTaskSubmissionsDb = (): Record<string, VacancyTaskSubmission[]> => {
  const raw = localStorage.getItem(VACANCY_TASK_SUBMISSIONS_KEY)
  if (!raw) return {}

  try {
    return JSON.parse(raw) as Record<string, VacancyTaskSubmission[]>
  } catch {
    return {}
  }
}

const saveVacancyTaskSubmissionsDb = (db: Record<string, VacancyTaskSubmission[]>) => {
  localStorage.setItem(VACANCY_TASK_SUBMISSIONS_KEY, JSON.stringify(db))
}

const getCompanyVacanciesDb = (): Vacancy[] => {
  const raw = localStorage.getItem(COMPANY_VACANCIES_KEY)
  if (!raw) return [...mockVacancies]

  try {
    return JSON.parse(raw) as Vacancy[]
  } catch {
    return [...mockVacancies]
  }
}

const saveCompanyVacanciesDb = (vacancies: Vacancy[]) => {
  localStorage.setItem(COMPANY_VACANCIES_KEY, JSON.stringify(vacancies))
}

const createInitialCandidates = (vacancies: Vacancy[]): CompanyCandidate[] => {
  const first = vacancies[0]
  const second = vacancies[1] ?? first
  const third = vacancies[2] ?? first

  return [
    {
      id: "cand-1",
      fullName: "Айдана С.",
      email: "aidana.candidate@example.com",
      avatar: "A",
      phone: "+7 777 145 80 12",
      country: "Казахстан",
      city: "Алматы",
      university: "KBTU",
      experienceLevel: "junior",
      about: "Frontend-кандидат с фокусом на Vue и аккуратный UI.",
      skills: ["Vue", "TypeScript", "Pinia", "HTML/CSS"],
      portfolioUrl: "https://portfolio.example.com/aidana",
      githubUrl: "https://github.com/aidana-dev",
      linkedinUrl: "https://linkedin.com/in/aidana-dev",
      vacancyId: first?.id ?? "vac-frontend-junior-1",
      vacancyTitle: first?.title ?? "Junior Frontend-разработчик (Vue)",
      appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "new",
      inviteSentAt: null,
      evaluation: buildCandidateEvaluation({ id: "cand-1", status: "new" }, first ?? null)
    },
    {
      id: "cand-2",
      fullName: "Тимур А.",
      email: "timur.candidate@example.com",
      avatar: "T",
      phone: "+7 701 506 33 91",
      country: "Казахстан",
      city: "Астана",
      university: "ENU",
      experienceLevel: "middle",
      about: "Backend-разработчик, уверенно работает с Node.js и БД.",
      skills: ["Node.js", "PostgreSQL", "NestJS", "Docker"],
      portfolioUrl: "https://portfolio.example.com/timur",
      githubUrl: "https://github.com/timur-backend",
      linkedinUrl: "https://linkedin.com/in/timur-backend",
      vacancyId: second?.id ?? "vac-backend-middle-1",
      vacancyTitle: second?.title ?? "Middle Backend-разработчик (Node.js)",
      appliedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: "reviewed",
      inviteSentAt: null,
      evaluation: buildCandidateEvaluation({ id: "cand-2", status: "reviewed" }, second ?? null)
    },
    {
      id: "cand-3",
      fullName: "Назерке К.",
      email: "nazerke.candidate@example.com",
      avatar: "N",
      phone: "+7 705 661 27 55",
      country: "Казахстан",
      city: "Шымкент",
      university: "SDU",
      experienceLevel: "intern",
      about: "Начинающий аналитик данных, активно проходит тесты и практику.",
      skills: ["Python", "Pandas", "SQL", "Power BI"],
      portfolioUrl: "https://portfolio.example.com/nazerke",
      githubUrl: "https://github.com/nazerke-data",
      linkedinUrl: "https://linkedin.com/in/nazerke-data",
      vacancyId: third?.id ?? "vac-data-intern-1",
      vacancyTitle: third?.title ?? "Стажер-аналитик данных",
      appliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: "new",
      inviteSentAt: null,
      evaluation: buildCandidateEvaluation({ id: "cand-3", status: "new" }, third ?? null)
    }
  ]
}

const getCompanyCandidatesDb = (): CompanyCandidate[] => {
  const raw = localStorage.getItem(COMPANY_CANDIDATES_KEY)
  if (!raw) {
    const seeded = createInitialCandidates(getCompanyVacanciesDb())
    localStorage.setItem(COMPANY_CANDIDATES_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    return JSON.parse(raw) as CompanyCandidate[]
  } catch {
    const seeded = createInitialCandidates(getCompanyVacanciesDb())
    localStorage.setItem(COMPANY_CANDIDATES_KEY, JSON.stringify(seeded))
    return seeded
  }
}

const saveCompanyCandidatesDb = (candidates: CompanyCandidate[]) => {
  localStorage.setItem(COMPANY_CANDIDATES_KEY, JSON.stringify(candidates))
}

const candidateSeedHash = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const candidateScoreStatus = (score: number): CandidateResultStatus => {
  return score >= 70 ? "passed" : "failed"
}

const buildCandidateEvaluation = (
  candidate: Pick<CompanyCandidate, "id" | "status">,
  vacancy: Vacancy | null
): CompanyCandidateEvaluation => {
  const statusEngagement: Record<CompanyCandidate["status"], number> = {
    new: 0.38,
    reviewed: 0.68,
    invited: 0.9
  }

  const baseHash = candidateSeedHash(`${candidate.id}:${vacancy?.id ?? "no-vacancy"}`)
  const tasks = vacancy?.realTasks ?? []
  const taskResults: CompanyCandidateTaskResult[] = tasks.map((task, index) => {
    const scoreSeed = (baseHash + index * 37) % 100
    const submitted = scoreSeed < statusEngagement[candidate.status] * 100
    if (!submitted) {
      return {
        taskId: task.id,
        taskTitle: task.title,
        status: "not_submitted",
        score: null,
        submittedAt: null
      }
    }

    const score = 55 + (scoreSeed % 41)
    return {
      taskId: task.id,
      taskTitle: task.title,
      status: candidateScoreStatus(score),
      score,
      submittedAt: new Date(Date.now() - (index + 1) * 86400000).toISOString()
    }
  })

  const tasksSubmitted = taskResults.filter((item) => item.status !== "not_submitted").length
  const tasksPassed = taskResults.filter((item) => item.status === "passed").length
  const taskScores = taskResults.flatMap((item) => (typeof item.score === "number" ? [item.score] : []))

  const testTotal = Math.max(1, vacancy?.preparation.test.length ?? 0)
  const testTaken = baseHash % 100 < statusEngagement[candidate.status] * 100
  const testScore = testTaken ? 52 + ((baseHash + 11) % 44) : null
  const testCorrect = testScore ? Math.round((testScore / 100) * testTotal) : 0

  const interviewTotal = Math.max(1, vacancy?.preparation.questions.length ?? 0)
  const interviewTaken = (baseHash + 17) % 100 < statusEngagement[candidate.status] * 100
  const interviewScore = interviewTaken ? 54 + ((baseHash + 23) % 42) : null
  const interviewAnswered = interviewScore ? Math.round((interviewScore / 100) * interviewTotal) : 0

  const scorePool = [
    ...taskScores,
    ...(typeof testScore === "number" ? [testScore] : []),
    ...(typeof interviewScore === "number" ? [interviewScore] : [])
  ]

  const overallScore = scorePool.length
    ? Math.round(scorePool.reduce((sum, value) => sum + value, 0) / scorePool.length)
    : null

  const baseReadiness = overallScore ?? 0
  const completionBonus = tasks.length
    ? Math.round((tasksSubmitted / tasks.length) * 12)
    : 0
  const readinessPercent = Math.max(0, Math.min(100, baseReadiness + completionBonus))
  const readyForWork = readinessPercent >= 75 &&
    tasksPassed >= Math.ceil(tasks.length * 0.6) &&
    testScore !== null &&
    interviewScore !== null

  return {
    tasks: taskResults,
    tasksSubmitted,
    tasksPassed,
    tasksTotal: taskResults.length,
    test: {
      status: typeof testScore === "number" ? candidateScoreStatus(testScore) : "not_submitted",
      score: testScore,
      correctAnswers: testCorrect,
      totalQuestions: testTotal
    },
    interview: {
      status: typeof interviewScore === "number" ? candidateScoreStatus(interviewScore) : "not_submitted",
      score: interviewScore,
      answered: interviewAnswered,
      totalQuestions: interviewTotal
    },
    overallScore,
    workReadinessPercent: readinessPercent,
    readyForWork
  }
}

const enrichCompanyCandidate = (candidate: CompanyCandidate, vacancies: Vacancy[]): CompanyCandidate => {
  const vacancy = vacancies.find((item) => item.id === candidate.vacancyId) ?? null
  const evaluation = buildCandidateEvaluation(candidate, vacancy)

  return {
    ...candidate,
    vacancyTitle: vacancy?.title ?? candidate.vacancyTitle,
    avatar: candidate.avatar || candidate.fullName.trim().slice(0, 1).toUpperCase(),
    phone: candidate.phone || "+7 700 000 00 00",
    country: candidate.country || "Казахстан",
    city: candidate.city || "Алматы",
    university: candidate.university || "Satbayev University",
    experienceLevel: candidate.experienceLevel || "junior",
    about: candidate.about || "Кандидат изучает направление и выполняет практические задания.",
    skills: candidate.skills?.length ? candidate.skills : ["Git", "REST API"],
    portfolioUrl: candidate.portfolioUrl || "",
    githubUrl: candidate.githubUrl || "",
    linkedinUrl: candidate.linkedinUrl || "",
    evaluation
  }
}

const evaluateSubmissionQuality = (submission: VacancyTaskSubmission): number => {
  const url = submission.solutionUrl.toLowerCase()
  const commentLength = submission.comment.trim().length
  const urlScore = url.includes("github") ? 36 : url.startsWith("http") ? 24 : 12
  const commentScore = Math.min(34, Math.floor(commentLength / 4))
  const base = 28
  return Math.max(0, Math.min(100, base + urlScore + commentScore))
}

const verdictByScore = (score: number): CandidateWorkLeaderboardEntry["aiVerdict"] => {
  if (score >= 85) return "excellent"
  if (score >= 75) return "strong"
  if (score >= 60) return "good"
  return "needs_improvement"
}

const createMockWorkLeaders = (): CandidateWorkLeaderboardEntry[] => {
  return [
    {
      userId: 11,
      fullName: "Aruzhan K.",
      avatar: "A",
      company: "Kaspi Tech",
      vacancyTitle: "Junior Frontend Developer (Vue)",
      tasksSubmitted: 4,
      averageQualityScore: 91,
      aiVerdict: "excellent",
      sentToHr: true,
      sentAt: new Date().toISOString(),
      rank: 0
    },
    {
      userId: 15,
      fullName: "Nikita S.",
      avatar: "N",
      company: "Freedom Tech",
      vacancyTitle: "Middle Backend Developer (Node.js)",
      tasksSubmitted: 3,
      averageQualityScore: 84,
      aiVerdict: "strong",
      sentToHr: true,
      sentAt: new Date().toISOString(),
      rank: 0
    },
    {
      userId: 22,
      fullName: "Miras T.",
      avatar: "M",
      company: "Halyk Digital",
      vacancyTitle: "Data Analyst Intern",
      tasksSubmitted: 2,
      averageQualityScore: 76,
      aiVerdict: "strong",
      sentToHr: true,
      sentAt: new Date().toISOString(),
      rank: 0
    }
  ]
}

const createMockVacancyTaskLeaders = (vacancyId: string): VacancyTaskLeaderboardEntry[] => {
  if (vacancyId === "vac-frontend-junior-1") {
    return [
      { userId: 11, fullName: "Aruzhan K.", avatar: "A", tasksSubmitted: 2, averageQualityScore: 92, aiVerdict: "excellent", sentToHr: true, sentAt: new Date().toISOString(), rank: 0 },
      { userId: 34, fullName: "Dana M.", avatar: "D", tasksSubmitted: 2, averageQualityScore: 87, aiVerdict: "excellent", sentToHr: true, sentAt: new Date().toISOString(), rank: 0 },
      { userId: 19, fullName: "Timur B.", avatar: "T", tasksSubmitted: 1, averageQualityScore: 79, aiVerdict: "strong", sentToHr: false, sentAt: null, rank: 0 }
    ]
  }

  if (vacancyId === "vac-backend-middle-1") {
    return [
      { userId: 15, fullName: "Nikita S.", avatar: "N", tasksSubmitted: 2, averageQualityScore: 88, aiVerdict: "excellent", sentToHr: true, sentAt: new Date().toISOString(), rank: 0 },
      { userId: 29, fullName: "Rustem A.", avatar: "R", tasksSubmitted: 2, averageQualityScore: 81, aiVerdict: "strong", sentToHr: true, sentAt: new Date().toISOString(), rank: 0 },
      { userId: 31, fullName: "Olga V.", avatar: "O", tasksSubmitted: 1, averageQualityScore: 73, aiVerdict: "good", sentToHr: false, sentAt: null, rank: 0 }
    ]
  }

  return [
    { userId: 22, fullName: "Miras T.", avatar: "M", tasksSubmitted: 2, averageQualityScore: 84, aiVerdict: "strong", sentToHr: true, sentAt: new Date().toISOString(), rank: 0 },
    { userId: 44, fullName: "Aida K.", avatar: "A", tasksSubmitted: 2, averageQualityScore: 77, aiVerdict: "strong", sentToHr: false, sentAt: null, rank: 0 },
    { userId: 46, fullName: "Sergey P.", avatar: "S", tasksSubmitted: 1, averageQualityScore: 69, aiVerdict: "good", sentToHr: false, sentAt: null, rank: 0 }
  ]
}

const getAverageRoadmapProgress = (): number => {
  const db = getRoadmapProgressDb()
  const list = Object.values(db)

  if (!list.length) {
    const fallback = mockRoadmapProgressResponse
    const total = fallback.reduce((sum, item) => sum + item.completionPercent, 0)
    return Math.round(total / fallback.length)
  }

  const total = list.reduce((sum, item) => sum + item.completionPercent, 0)
  return Math.round(total / list.length)
}

const getCurrentUserPointsSnapshot = () => {
  const topicResults = Object.values(getTopicResults())
  const passedTests = topicResults.filter((result) => result.passed).length
  const failedTests = Math.max(0, topicResults.length - passedTests)
  const scoreTotal = topicResults.reduce((sum, result) => sum + result.score, 0)
  const activityPoints = getActivityFromUserActions().reduce((sum, day) => sum + day.level, 0)
  const progressPercent = getAverageRoadmapProgress()
  const progressBonus = progressPercent * 5

  const points = passedTests * 140 + failedTests * 40 + scoreTotal + activityPoints + progressBonus

  return {
    points: Math.round(points),
    passedTests,
    failedTests,
    completedTests: topicResults.length,
    progressPercent
  }
}

const createMockLeaders = (): LeaderboardEntry[] => {
  return [
    {
      userId: 11,
      fullName: "Aruzhan K.",
      avatar: "A",
      country: "Kazakhstan",
      city: "Almaty",
      university: "KBTU",
      points: 3820,
      completedTests: 34,
      passedTests: 30,
      failedTests: 4,
      roadmapProgressPercent: 86,
      badges: ["Top Learner", "AI Master"],
      rank: 0
    },
    {
      userId: 15,
      fullName: "Nikita S.",
      avatar: "N",
      country: "Kazakhstan",
      city: "Astana",
      university: "ENU",
      points: 3410,
      completedTests: 29,
      passedTests: 24,
      failedTests: 5,
      roadmapProgressPercent: 78,
      badges: ["Consistent", "Frontend Pro"],
      rank: 0
    },
    {
      userId: 22,
      fullName: "Miras T.",
      avatar: "M",
      country: "Kazakhstan",
      city: "Shymkent",
      university: "M. Auezov South Kazakhstan University",
      points: 2975,
      completedTests: 26,
      passedTests: 21,
      failedTests: 5,
      roadmapProgressPercent: 71,
      badges: ["Backend Runner"],
      rank: 0
    },
    {
      userId: 27,
      fullName: "Alina D.",
      avatar: "A",
      country: "Kyrgyzstan",
      city: "Bishkek",
      university: "AUCA",
      points: 2510,
      completedTests: 20,
      passedTests: 17,
      failedTests: 3,
      roadmapProgressPercent: 63,
      badges: ["Rising Star"],
      rank: 0
    }
  ]
}

const resolveMockUserId = (userId: number | null) => userId ?? mockLoginResponse.user.id

// fake token generator
const generateToken = () =>
  "mock-jwt-" + Math.random().toString(36).substring(2)

// --- API ---
export const api = {
  async register(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      // just return prepared mock response
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

    const user = users.find(
      (u) => u.email === email && u.password === password
    )

    if (!user) throw new Error("Invalid credentials")

    const { password: _, ...safeUser } = user

    return {
      token: generateToken(),
      user: safeUser
    }
  },

  async getRoadmapProgress(_userId: number | null): Promise<RoadmapProgressItem[]> {
    if (USE_MOCK) {
      return await delay(350).then(() => mockRoadmapProgressResponse)
    }

    await delay(700)
    return []
  },

  async getUserRoadmapCollection(userId: number | null): Promise<string[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(250).then(() => {
        const db = getCollectionDb()
        return db[String(resolvedUserId)] ?? [...mockDefaultRoadmapCollection]
      })
    }

    await delay(600)
    return []
  },

  async updateUserRoadmapCollection(userId: number | null, roadmapIds: string[]): Promise<string[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(250).then(() => {
        const db = getCollectionDb()
        db[String(resolvedUserId)] = [...new Set(roadmapIds)]
        saveCollectionDb(db)
        return db[String(resolvedUserId)]
      })
    }

    await delay(600)
    return roadmapIds
  },

  async removeUserRoadmapFromCollection(userId: number | null, roadmapId: string): Promise<string[]> {
    const current = await this.getUserRoadmapCollection(userId)
    const next = current.filter((id) => id !== roadmapId)
    return this.updateUserRoadmapCollection(userId, next)
  },

  async getUserYearActivity(userId: number | null): Promise<UserActivityDay[]> {
    resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(280).then(() => {
        return getActivityFromUserActions()
      })
    }

    await delay(700)
    return []
  },

  async getFriends(userId: number | null): Promise<FriendProfile[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(220).then(() => getFriendsForUser(resolvedUserId))
    }

    await delay(700)
    return []
  },

  async getFriendSuggestions(userId: number | null): Promise<FriendProfile[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(180).then(() => {
        const existingIds = new Set(getFriendsForUser(resolvedUserId).map((item) => item.userId))
        return mockFriendDirectory
          .filter((candidate) => candidate.userId !== resolvedUserId && !existingIds.has(candidate.userId))
          .map(normalizeFriendProfile)
      })
    }

    await delay(700)
    return []
  },

  async addFriendByEmail(userId: number | null, email: string): Promise<FriendProfile[]> {
    const resolvedUserId = resolveMockUserId(userId)
    const normalizedEmail = email.trim().toLowerCase()

    if (USE_MOCK) {
      return await delay(220).then(() => {
        const friend = mockFriendDirectory.find((candidate) => candidate.email.toLowerCase() === normalizedEmail)

        if (!friend) {
          throw new Error("Пользователь с таким email не найден")
        }

        if (friend.userId === resolvedUserId) {
          throw new Error("Нельзя добавить самого себя")
        }

        const db = getFriendsDb()
        const current = db[String(resolvedUserId)] ?? [...mockDefaultFriendIds]
        if (!current.includes(friend.userId)) {
          db[String(resolvedUserId)] = [...current, friend.userId]
          saveFriendsDb(db)
        }

        return getFriendsForUser(resolvedUserId)
      })
    }

    await delay(700)
    return []
  },

  async removeFriend(userId: number | null, friendUserId: number): Promise<FriendProfile[]> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getFriendsDb()
        const current = db[String(resolvedUserId)] ?? [...mockDefaultFriendIds]
        db[String(resolvedUserId)] = current.filter((id) => id !== friendUserId)
        saveFriendsDb(db)
        return getFriendsForUser(resolvedUserId)
      })
    }

    await delay(700)
    return []
  },

  async getGlobalItMap(userId: number | null): Promise<GlobalItMapResponse> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(240).then(() => {
        const currentProgressMap = getCurrentUserRoadmapProgressMap()
        const snapshot = getCurrentUserPointsSnapshot()

        const currentUserParticipant: GlobalItMapParticipant = {
          userId: resolvedUserId,
          fullName: "Вы",
          avatar: "Y",
          isCurrentUser: true,
          points: snapshot.points,
          overallProgressPercent: averageProgressFromMap(currentProgressMap),
          roadmapProgress: currentProgressMap
        }

        const friendParticipants: GlobalItMapParticipant[] = getFriendsForUser(resolvedUserId).map((friend) => ({
          userId: friend.userId,
          fullName: friend.fullName,
          avatar: friend.avatar,
          isCurrentUser: false,
          points: friend.points,
          overallProgressPercent: friend.roadmapProgressPercent,
          roadmapProgress: friend.roadmapProgress
        }))

        return {
          roadmaps: mockRoadmaps.map((roadmap) => ({
            roadmapId: roadmap.id,
            title: roadmap.title
          })),
          participants: [currentUserParticipant, ...friendParticipants]
        }
      })
    }

    await delay(700)
    return {
      roadmaps: [],
      participants: []
    }
  },

  async getLeaderboard(userId: number | null): Promise<LeaderboardResponse> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(320).then(() => {
        const snapshot = getCurrentUserPointsSnapshot()
        const currentUser: LeaderboardEntry = {
          userId: resolvedUserId,
          fullName: "Вы",
          avatar: "Y",
          country: mockLoginResponse.user.country,
          city: mockLoginResponse.user.city,
          university: mockLoginResponse.user.university,
          points: snapshot.points,
          completedTests: snapshot.completedTests,
          passedTests: snapshot.passedTests,
          failedTests: snapshot.failedTests,
          roadmapProgressPercent: snapshot.progressPercent,
          badges: snapshot.points >= 1800 ? ["Fast Learner"] : ["Starter"],
          rank: 0
        }

        const all = [...createMockLeaders(), currentUser]
          .sort((a, b) => b.points - a.points)
          .map((item, index) => ({
            ...item,
            rank: index + 1
          }))

        const normalizedCurrent = all.find((item) => item.userId === resolvedUserId) ?? currentUser

        return {
          leaders: all,
          currentUser: normalizedCurrent
        }
      })
    }

    await delay(700)
    return {
      leaders: [],
      currentUser: {
        userId: resolvedUserId,
        fullName: "Вы",
        avatar: "Y",
        country: "",
        city: "",
        university: "",
        points: 0,
        completedTests: 0,
        passedTests: 0,
        failedTests: 0,
        roadmapProgressPercent: 0,
        badges: [],
        rank: 0
      }
    }
  },

  async getVacancies(): Promise<Vacancy[]> {
    if (USE_MOCK) {
      return await delay(300).then(() => getCompanyVacanciesDb())
    }

    await delay(700)
    return []
  },

  async getVacancyById(vacancyId: string): Promise<Vacancy | null> {
    if (USE_MOCK) {
      return await delay(260).then(() => getCompanyVacanciesDb().find((item) => item.id === vacancyId) ?? null)
    }

    await delay(700)
    return null
  },

  async getCandidateWorkLeaderboard(userId: number | null): Promise<CandidateWorkLeaderboardResponse> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(260).then(() => {
        const db = getVacancyTaskSubmissionsDb()
        const allSubmissions = Object.entries(db).flatMap(([vacancyId, items]) =>
          items.map((item) => ({ ...item, vacancyId }))
        )
        const currentUserSubmissions = allSubmissions.filter((item) => item.userId === resolvedUserId)

        let currentUserEntry: CandidateWorkLeaderboardEntry | null = null

        if (currentUserSubmissions.length) {
          const scores = currentUserSubmissions.map((item) => evaluateSubmissionQuality(item))
          const averageQualityScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          const latest = [...currentUserSubmissions].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0]
          const relatedVacancy = getCompanyVacanciesDb().find((vacancy) => vacancy.id === latest.vacancyId)

          currentUserEntry = {
            userId: resolvedUserId,
            fullName: "Вы",
            avatar: "Y",
            company: relatedVacancy?.company ?? "—",
            vacancyTitle: relatedVacancy?.title ?? "—",
            tasksSubmitted: currentUserSubmissions.length,
            averageQualityScore,
            aiVerdict: verdictByScore(averageQualityScore),
            sentToHr: averageQualityScore >= 75,
            sentAt: averageQualityScore >= 75 ? new Date().toISOString() : null,
            rank: 0
          }
        }

        const all = [...createMockWorkLeaders(), ...(currentUserEntry ? [currentUserEntry] : [])]
          .sort((a, b) => {
            if (b.averageQualityScore !== a.averageQualityScore) {
              return b.averageQualityScore - a.averageQualityScore
            }
            return b.tasksSubmitted - a.tasksSubmitted
          })
          .map((item, index) => ({
            ...item,
            rank: index + 1,
            sentToHr: item.sentToHr || index < 3
          }))

        const normalizedCurrent = all.find((item) => item.userId === resolvedUserId) ?? null

        return {
          leaders: all,
          currentUser: normalizedCurrent
        }
      })
    }

    await delay(700)
    return {
      leaders: [],
      currentUser: null
    }
  },

  async getVacancyTaskLeaderboard(vacancyId: string, userId: number | null): Promise<VacancyTaskLeaderboardResponse> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(240).then(() => {
        const vacancy = getCompanyVacanciesDb().find((item) => item.id === vacancyId)
        const vacancyTitle = vacancy?.title ?? "Vacancy"

        const db = getVacancyTaskSubmissionsDb()
        const submissions = (db[vacancyId] ?? []).filter((item) => item.userId === resolvedUserId)

        let currentUserEntry: VacancyTaskLeaderboardEntry | null = null
        if (submissions.length) {
          const scores = submissions.map((item) => evaluateSubmissionQuality(item))
          const averageQualityScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          currentUserEntry = {
            userId: resolvedUserId,
            fullName: "Вы",
            avatar: "Y",
            tasksSubmitted: submissions.length,
            averageQualityScore,
            aiVerdict: verdictByScore(averageQualityScore),
            sentToHr: averageQualityScore >= 75,
            sentAt: averageQualityScore >= 75 ? new Date().toISOString() : null,
            rank: 0
          }
        }

        const all = [...createMockVacancyTaskLeaders(vacancyId), ...(currentUserEntry ? [currentUserEntry] : [])]
          .sort((a, b) => {
            if (b.averageQualityScore !== a.averageQualityScore) {
              return b.averageQualityScore - a.averageQualityScore
            }
            return b.tasksSubmitted - a.tasksSubmitted
          })
          .map((item, index) => ({ ...item, rank: index + 1 }))

        return {
          vacancyId,
          vacancyTitle,
          leaders: all,
          currentUser: all.find((item) => item.userId === resolvedUserId) ?? null
        }
      })
    }

    await delay(700)
    return {
      vacancyId,
      vacancyTitle: "Vacancy",
      leaders: [],
      currentUser: null
    }
  },

  async getVacancyRealTasks(vacancyId: string, userId: number | null): Promise<Array<{ task: VacancyTask; submission: VacancyTaskSubmission | null }>> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(220).then(() => {
        const vacancy = getCompanyVacanciesDb().find((item) => item.id === vacancyId)
        if (!vacancy) return []

        const db = getVacancyTaskSubmissionsDb()
        const submissions = db[vacancyId] ?? []

        return vacancy.realTasks.map((task) => ({
          task,
          submission: submissions.find((item) => item.taskId === task.id && item.userId === resolvedUserId) ?? null
        }))
      })
    }

    await delay(700)
    return []
  },

  async submitVacancyTask(
    vacancyId: string,
    taskId: string,
    payload: VacancyTaskSubmissionPayload,
    userId: number | null
  ): Promise<VacancyTaskSubmission> {
    const resolvedUserId = resolveMockUserId(userId)

    if (USE_MOCK) {
      return await delay(260).then(() => {
        const db = getVacancyTaskSubmissionsDb()
        const current = db[vacancyId] ?? []
        const withoutCurrentTask = current.filter((item) => !(item.taskId === taskId && item.userId === resolvedUserId))

        const submission: VacancyTaskSubmission = {
          vacancyId,
          taskId,
          userId: resolvedUserId,
          solutionUrl: payload.solutionUrl,
          comment: payload.comment,
          status: "submitted",
          submittedAt: new Date().toISOString()
        }

        db[vacancyId] = [...withoutCurrentTask, submission]
        saveVacancyTaskSubmissionsDb(db)
        return submission
      })
    }

    await delay(700)
    return {
      vacancyId,
      taskId,
      userId: resolvedUserId,
      solutionUrl: payload.solutionUrl,
      comment: payload.comment,
      status: "submitted",
      submittedAt: new Date().toISOString()
    }
  },

  async getTopicInterviewQuestions(topicId: string): Promise<InterviewQuestionItem[]> {
    if (USE_MOCK) {
      return await delay(300).then(() => mockInterviewQuestionsByTopic[topicId] ?? [])
    }

    await delay(700)
    return []
  },

  async getCompanyVacancies(): Promise<Vacancy[]> {
    if (USE_MOCK) {
      return await delay(220).then(() => getCompanyVacanciesDb())
    }

    await delay(700)
    return []
  },

  async createCompanyVacancy(payload: CompanyVacancyPayload): Promise<Vacancy> {
    if (USE_MOCK) {
      return await delay(260).then(() => {
        const db = getCompanyVacanciesDb()
        const created: Vacancy = {
          id: `vac-company-${Date.now()}`,
          company: "Skilo Company",
          title: payload.title,
          level: payload.level,
          location: payload.location,
          employment: payload.employment,
          salaryRange: payload.salaryRange,
          tags: payload.stack,
          summary: payload.description,
          preparation: {
            direction: payload.stack.join(" / "),
            questions: [],
            test: []
          },
          realTasks: payload.requirements.length
            ? [
                {
                  id: `task-company-${Date.now()}`,
                  title: "Базовое тестовое задание",
                  brief: "Опишите решение с учетом требований вакансии.",
                  requirements: payload.requirements,
                  deliverables: ["Ссылка на репозиторий", "Краткое описание решения"],
                  estimatedHours: 6
                }
              ]
            : []
        }

        const next = [created, ...db]
        saveCompanyVacanciesDb(next)
        return created
      })
    }

    await delay(700)
    throw new Error("Not implemented")
  },

  async updateCompanyVacancy(vacancyId: string, payload: CompanyVacancyPayload): Promise<Vacancy | null> {
    if (USE_MOCK) {
      return await delay(240).then(() => {
        const db = getCompanyVacanciesDb()
        let updated: Vacancy | null = null

        const next = db.map((vacancy) => {
          if (vacancy.id !== vacancyId) return vacancy

          updated = {
            ...vacancy,
            title: payload.title,
            level: payload.level,
            location: payload.location,
            employment: payload.employment,
            salaryRange: payload.salaryRange,
            tags: payload.stack,
            summary: payload.description
          }

          return updated
        })

        saveCompanyVacanciesDb(next)
        return updated
      })
    }

    await delay(700)
    return null
  },

  async deleteCompanyVacancy(vacancyId: string): Promise<boolean> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getCompanyVacanciesDb()
        const next = db.filter((vacancy) => vacancy.id !== vacancyId)
        saveCompanyVacanciesDb(next)

        const candidates = getCompanyCandidatesDb().filter((candidate) => candidate.vacancyId !== vacancyId)
        saveCompanyCandidatesDb(candidates)
        return true
      })
    }

    await delay(700)
    return false
  },

  async createCompanyVacancyTask(vacancyId: string, payload: CompanyVacancyTaskPayload): Promise<VacancyTask | null> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getCompanyVacanciesDb()
        let created: VacancyTask | null = null

        const next = db.map((vacancy) => {
          if (vacancy.id !== vacancyId) return vacancy

          created = {
            id: `task-company-${Date.now()}`,
            title: payload.title,
            brief: payload.brief,
            requirements: payload.requirements,
            deliverables: payload.deliverables,
            estimatedHours: payload.estimatedHours
          }

          return {
            ...vacancy,
            realTasks: [...vacancy.realTasks, created]
          }
        })

        saveCompanyVacanciesDb(next)
        return created
      })
    }

    await delay(700)
    return null
  },

  async updateCompanyVacancyTask(
    vacancyId: string,
    taskId: string,
    payload: CompanyVacancyTaskPayload
  ): Promise<VacancyTask | null> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getCompanyVacanciesDb()
        let updated: VacancyTask | null = null

        const next = db.map((vacancy) => {
          if (vacancy.id !== vacancyId) return vacancy

          return {
            ...vacancy,
            realTasks: vacancy.realTasks.map((task) => {
              if (task.id !== taskId) return task
              updated = {
                ...task,
                title: payload.title,
                brief: payload.brief,
                requirements: payload.requirements,
                deliverables: payload.deliverables,
                estimatedHours: payload.estimatedHours
              }
              return updated
            })
          }
        })

        saveCompanyVacanciesDb(next)
        return updated
      })
    }

    await delay(700)
    return null
  },

  async deleteCompanyVacancyTask(vacancyId: string, taskId: string): Promise<boolean> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const db = getCompanyVacanciesDb()
        const next = db.map((vacancy) => {
          if (vacancy.id !== vacancyId) return vacancy
          return {
            ...vacancy,
            realTasks: vacancy.realTasks.filter((task) => task.id !== taskId)
          }
        })
        saveCompanyVacanciesDb(next)
        return true
      })
    }

    await delay(700)
    return false
  },

  async getCompanyCandidates(): Promise<CompanyCandidate[]> {
    if (USE_MOCK) {
      return await delay(220).then(() => {
        const vacancies = getCompanyVacanciesDb()
        const candidates = getCompanyCandidatesDb()
        return candidates.map((candidate) => enrichCompanyCandidate(candidate, vacancies))
      })
    }

    await delay(700)
    return []
  },

  async sendInterviewInvite(
    candidateId: string,
    payload: InterviewInvitePayload
  ): Promise<InterviewInviteResult | null> {
    if (USE_MOCK) {
      return await delay(260).then(() => {
        const candidates = getCompanyCandidatesDb()
        const target = candidates.find((candidate) => candidate.id === candidateId)
        if (!target) return null

        const sentAt = new Date().toISOString()
        const next = candidates.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, status: "invited" as const, inviteSentAt: sentAt }
            : candidate
        )
        saveCompanyCandidatesDb(next)

        return {
          candidateId,
          sentTo: target.email,
          subject: payload.subject,
          sentAt
        }
      })
    }

    await delay(700)
    return null
  }
}
