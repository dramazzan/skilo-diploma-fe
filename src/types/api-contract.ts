/**
 * MVP API Contract (Single Source of Truth)
 *
 * This file contains:
 * 1) All backend models used by the frontend.
 * 2) Request/response DTOs for MVP endpoints.
 * 3) Short documentation of what each endpoint does.
 * 4) Minimal flow description (how screens consume this API).
 *
 * Conventions:
 * - Dates are ISO strings (UTC): YYYY-MM-DDTHH:mm:ss.sssZ
 * - IDs are strings unless explicitly numeric (userId)
 * - Topic unlock state is controlled by `TopicStatus`
 */

// =========================
// Shared primitives
// =========================

export type IsoDateTimeString = string

export type RoadmapLevel = "Beginner" | "Intermediate" | "Advanced"

export type TopicDifficulty = "beginner" | "intermediate" | "advanced"

export type TopicStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "locked"

// =========================
// Auth
// =========================

export interface AuthUser {
  id: number
  email: string
  firstLogin: boolean
  createdAt: IsoDateTimeString
  country: string
  city: string
  university: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

// =========================
// Profile
// =========================

export interface ProfileResponse {
  id: number
  fullName: string
  email: string
  createdAt: IsoDateTimeString
  joinedAt: IsoDateTimeString
  country: string
  city: string
  university: string
  firstLogin: boolean
  completedTests: number
  skills: string[]
  achievements: string[]
}

export interface UserActivityDay {
  date: string // YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4
}

export type UserActivityResponse = UserActivityDay[]

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
  sentAt: IsoDateTimeString | null
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
  sentAt: IsoDateTimeString | null
  rank: number
}

export interface VacancyTaskLeaderboardResponse {
  vacancyId: string
  vacancyTitle: string
  leaders: VacancyTaskLeaderboardEntry[]
  currentUser: VacancyTaskLeaderboardEntry | null
}

// =========================
// Vacancies
// =========================

export type VacancyLevel = "junior" | "middle" | "senior"

export type VacancyEmployment = "full-time" | "part-time" | "internship" | "remote"

export interface VacancyQuestion {
  id: string
  question: string
  answer: string
}

export interface VacancyTestQuestion {
  id: string
  question: string
  options: string[]
  correctAnswerIndex: number
}

export interface VacancyPreparation {
  direction: string
  questions: VacancyQuestion[]
  test: VacancyTestQuestion[]
}

export interface VacancyTask {
  id: string
  title: string
  brief: string
  requirements: string[]
  deliverables: string[]
  estimatedHours: number
}

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
  submittedAt: IsoDateTimeString
}

export interface Vacancy {
  id: string
  company: string
  title: string
  level: VacancyLevel
  location: string
  employment: VacancyEmployment
  salaryRange: string
  tags: string[]
  summary: string
  preparation: VacancyPreparation
  realTasks: VacancyTask[]
}

export type VacancyListResponse = Vacancy[]
export type VacancyResponse = Vacancy | null
export type VacancyTaskListResponse = Array<{
  task: VacancyTask
  submission: VacancyTaskSubmission | null
}>

// =========================
// Roadmaps
// =========================

export interface Roadmap {
  id: string
  title: string
  description: string
  level: RoadmapLevel
  recommended: boolean
}

export interface RoadmapNode {
  id: string
  title: string
  status: TopicStatus
  children?: RoadmapNode[]
}

export interface RoadmapCollectionItem {
  roadmapId: string
  assignedLevel: RoadmapLevel
}

export interface RoadmapProgressItem {
  roadmapId: string
  completionPercent: number
  completedTopics: number
  totalTopics: number
}

export interface UserRoadmapCollectionResponse {
  userId: number
  roadmapIds: string[]
}

// Frontend store currently expects `string[]` in collection methods.
export type UserRoadmapIdsResponse = string[]

export type RoadmapListResponse = Roadmap[]
export type RoadmapTreeResponse = Record<string, RoadmapNode[]>
export type RoadmapCollectionResponse = RoadmapCollectionItem[]
export type RoadmapProgressResponse = RoadmapProgressItem[]

// =========================
// Roadmap Assessment
// =========================

export interface AssessmentOption {
  id: string
  label: string
  score: number
}

export interface AssessmentQuestion {
  id: string
  text: string
  options: AssessmentOption[]
}

export interface RoadmapAssessment {
  roadmapId: string
  title: string
  questions: AssessmentQuestion[]
}

export interface AssessmentSubmitRequest {
  roadmapId: string
  answers: Record<string, number>
}

export interface AssessmentSubmitResponse {
  roadmapId: string
  level: RoadmapLevel
}

// =========================
// Topics / Learning / Tests
// =========================

export interface RoadmapTopic {
  id: string
  roadmapId: string
  title: string
  description: string
  level: TopicDifficulty
}

export interface TopicContent {
  topicId: string
  theory: string
}

export interface TestQuestion {
  id: string
  question: string
  options: string[]
  correctAnswerIndex: number
}

export interface TopicTest {
  topicId: string
  questions: TestQuestion[]
}

export interface TopicResultResponse {
  topicId: string
  score: number
  passed: boolean
  updatedAt: IsoDateTimeString
}

export type TopicListResponse = RoadmapTopic[]
export type TopicContentResponse = TopicContent[]
export type TopicTestsResponse = TopicTest[]

// =========================
// Interview Q&A
// =========================

export interface InterviewQuestionItem {
  id: string
  topicId: string
  question: string
  answer: string
}

export type TopicInterviewQuestionsResponse = InterviewQuestionItem[]

// =========================
// Collection write DTOs
// =========================

export interface UpdateUserRoadmapCollectionRequest {
  roadmapIds: string[]
}

export interface RemoveRoadmapFromCollectionResponse {
  roadmapIds: string[]
}

// =========================
// Error envelope (recommended)
// =========================

export interface ApiErrorResponse {
  message: string
  code?: string
  details?: Record<string, string | number | boolean>
}

// =========================
// MVP endpoint documentation
// =========================

export interface EndpointDoc {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  request?: string
  response: string
  purpose: string
}

/**
 * Human-readable MVP contract for backend implementation.
 * `request`/`response` values reference interfaces from this file.
 */
export const MVP_API_ENDPOINTS: EndpointDoc[] = [
  {
    method: "POST",
    path: "/auth/register",
    request: "RegisterRequest",
    response: "AuthResponse",
    purpose: "Create account and return auth token + user"
  },
  {
    method: "POST",
    path: "/auth/login",
    request: "LoginRequest",
    response: "AuthResponse",
    purpose: "Sign in and return auth token + user"
  },
  {
    method: "GET",
    path: "/profile",
    response: "ProfileResponse",
    purpose: "Load profile page summary"
  },
  {
    method: "GET",
    path: "/users/:userId/activity",
    response: "UserActivityResponse",
    purpose: "Get yearly user activity heatmap data"
  },
  {
    method: "GET",
    path: "/leaderboard",
    response: "LeaderboardResponse",
    purpose: "Get leaderboard with user points, ranks, and current user result"
  },
  {
    method: "GET",
    path: "/leaderboard/candidate-work",
    response: "CandidateWorkLeaderboardResponse",
    purpose: "Get AI-based ranking for submitted company tasks and HR shortlist state"
  },
  {
    method: "GET",
    path: "/vacancies",
    response: "VacancyListResponse",
    purpose: "Get published vacancies with short information and preparation metadata"
  },
  {
    method: "GET",
    path: "/vacancies/:vacancyId",
    response: "VacancyResponse",
    purpose: "Get vacancy details with interview questions and focused mini-test"
  },
  {
    method: "GET",
    path: "/vacancies/:vacancyId/tasks",
    response: "VacancyTaskListResponse",
    purpose: "Get real company tasks for vacancy with current user submission state"
  },
  {
    method: "GET",
    path: "/vacancies/:vacancyId/tasks/leaderboard",
    response: "VacancyTaskLeaderboardResponse",
    purpose: "Get leaderboard for one vacancy based on AI quality checks of submitted tasks"
  },
  {
    method: "POST",
    path: "/vacancies/:vacancyId/tasks/:taskId/submission",
    request: "VacancyTaskSubmissionPayload",
    response: "VacancyTaskSubmission",
    purpose: "Submit user solution for company task"
  },
  {
    method: "GET",
    path: "/roadmaps",
    response: "RoadmapListResponse",
    purpose: "Get all available roadmap cards"
  },
  {
    method: "GET",
    path: "/roadmaps/tree",
    response: "RoadmapTreeResponse",
    purpose: "Get full roadmap trees by roadmapId"
  },
  {
    method: "GET",
    path: "/roadmaps/:roadmapId/assessment",
    response: "RoadmapAssessment",
    purpose: "Get initial level assessment questions"
  },
  {
    method: "POST",
    path: "/roadmaps/:roadmapId/assessment/submit",
    request: "AssessmentSubmitRequest",
    response: "AssessmentSubmitResponse",
    purpose: "Calculate assigned roadmap level"
  },
  {
    method: "GET",
    path: "/users/:userId/roadmaps",
    response: "UserRoadmapIdsResponse",
    purpose: "Get user roadmap collection ids (frontend currently expects plain string[])"
  },
  {
    method: "PUT",
    path: "/users/:userId/roadmaps",
    request: "UpdateUserRoadmapCollectionRequest",
    response: "UserRoadmapIdsResponse",
    purpose: "Replace user roadmap collection (frontend currently expects plain string[])"
  },
  {
    method: "DELETE",
    path: "/users/:userId/roadmaps/:roadmapId",
    response: "UserRoadmapIdsResponse",
    purpose: "Remove roadmap from user collection (frontend currently expects plain string[])"
  },
  {
    method: "GET",
    path: "/users/:userId/roadmap-progress",
    response: "RoadmapProgressResponse",
    purpose: "Get completion percent for roadmap cards"
  },
  {
    method: "GET",
    path: "/topics",
    response: "TopicListResponse",
    purpose: "Get all topics metadata"
  },
  {
    method: "GET",
    path: "/topics/:topicId/content",
    response: "TopicContentResponse",
    purpose: "Get theory text/content for topic"
  },
  {
    method: "GET",
    path: "/topics/:topicId/test",
    response: "TopicTestsResponse",
    purpose: "Get test questions for topic"
  },
  {
    method: "POST",
    path: "/topics/:topicId/result",
    request: "TopicResultResponse",
    response: "TopicResultResponse",
    purpose: "Save and return final test result"
  },
  {
    method: "GET",
    path: "/topics/:topicId/interview-questions",
    response: "TopicInterviewQuestionsResponse",
    purpose: "Get interview Q&A list for topic"
  }
]

// =========================
// Mock -> API alignment
// =========================

export interface MockToApiContractItem {
  mockSourceFile: string
  mockExport: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  responseModel: string
}

/**
 * Backend checklist:
 * all data currently taken from mocks must be returned by these endpoints.
 */
export const MOCK_TO_API_CONTRACT: MockToApiContractItem[] = [
  { mockSourceFile: "src/mocks/mockData.ts", mockExport: "mockLoginResponse", endpoint: "/auth/login", method: "POST", responseModel: "AuthResponse" },
  { mockSourceFile: "src/mocks/mockData.ts", mockExport: "mockDefaultRoadmapCollection", endpoint: "/users/:userId/roadmaps", method: "GET", responseModel: "UserRoadmapIdsResponse" },
  { mockSourceFile: "src/mocks/mockData.ts", mockExport: "mockRoadmapProgressResponse", endpoint: "/users/:userId/roadmap-progress", method: "GET", responseModel: "RoadmapProgressResponse" },

  { mockSourceFile: "src/mocks/mockProfile.ts", mockExport: "mockProfileData", endpoint: "/profile", method: "GET", responseModel: "ProfileResponse" },

  { mockSourceFile: "src/mocks/mockRoadmaps.ts", mockExport: "mockRoadmaps", endpoint: "/roadmaps", method: "GET", responseModel: "RoadmapListResponse" },
  { mockSourceFile: "src/mocks/mockRoadmaps.ts", mockExport: "mockRoadmapTrees", endpoint: "/roadmaps/tree", method: "GET", responseModel: "RoadmapTreeResponse" },
  { mockSourceFile: "src/mocks/mockRoadmaps.ts", mockExport: "mockRoadmapAssessments", endpoint: "/roadmaps/:roadmapId/assessment", method: "GET", responseModel: "RoadmapAssessment" },

  { mockSourceFile: "src/mocks/mockRoadmap.ts", mockExport: "mockRoadmap", endpoint: "/topics", method: "GET", responseModel: "TopicListResponse" },
  { mockSourceFile: "src/mocks/mockRoadmap.ts", mockExport: "mockTopicContent", endpoint: "/topics/:topicId/content", method: "GET", responseModel: "TopicContentResponse" },
  { mockSourceFile: "src/mocks/mockRoadmap.ts", mockExport: "mockTests", endpoint: "/topics/:topicId/test", method: "GET", responseModel: "TopicTestsResponse" },

  { mockSourceFile: "src/mocks/mockInterviewQuestions.ts", mockExport: "mockInterviewQuestionsByTopic", endpoint: "/topics/:topicId/interview-questions", method: "GET", responseModel: "TopicInterviewQuestionsResponse" },

  { mockSourceFile: "src/mocks/mockVacancies.ts", mockExport: "mockVacancies", endpoint: "/vacancies", method: "GET", responseModel: "VacancyListResponse" },
  { mockSourceFile: "src/mocks/mockVacancies.ts", mockExport: "mockVacancies[vacancyId]", endpoint: "/vacancies/:vacancyId", method: "GET", responseModel: "VacancyResponse" },
  { mockSourceFile: "src/mocks/mockVacancies.ts", mockExport: "mockVacancies[vacancyId].realTasks + submissions", endpoint: "/vacancies/:vacancyId/tasks", method: "GET", responseModel: "VacancyTaskListResponse" },
  { mockSourceFile: "src/mocks/mockVacancies.ts", mockExport: "mock vacancy task leaderboard", endpoint: "/vacancies/:vacancyId/tasks/leaderboard", method: "GET", responseModel: "VacancyTaskLeaderboardResponse" }
]

// =========================
// MVP flow (how UI works)
// =========================

/**
 * 1) User signs in via /auth/login or /auth/register.
 * 2) Roadmaps page loads:
 *    - /roadmaps
 *    - /users/:userId/roadmaps
 *    - /users/:userId/roadmap-progress
 * 3) User adds roadmap:
 *    - /roadmaps/:roadmapId/assessment
 *    - /roadmaps/:roadmapId/assessment/submit
 *    - /users/:userId/roadmaps (PUT)
 * 4) Roadmap detail (skill tree/list):
 *    - /roadmaps/tree
 *    - node state is derived from TopicStatus + topic test results
 * 5) Topic page:
 *    - /topics/:topicId/content
 *    - /topics/:topicId/test
 *    - /topics/:topicId/result (POST after finish)
 * 6) Interview tab:
 *    - /topics/:topicId/interview-questions
 * 7) User removes roadmap:
 *    - /users/:userId/roadmaps/:roadmapId (DELETE)
 * 8) Vacancies and interview preparation:
 *    - /vacancies
 *    - /vacancies/:vacancyId
 *    - /vacancies/:vacancyId/tasks
 *    - /vacancies/:vacancyId/tasks/:taskId/submission
 */
