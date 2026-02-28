import type { VacancyItem, VacancyTask as MockVacancyTask } from "@/mocks/mockVacancies"

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

export type FriendChallengeStatus = "waiting_opponent" | "completed"

export interface FriendChallenge {
  id: string
  challengerUserId: number
  opponentUserId: number
  opponentName: string
  roadmapId: string
  roadmapTitle: string
  challengerScore: number
  challengerDurationSec: number
  opponentScore: number | null
  opponentDurationSec: number | null
  winnerUserId: number | null
  status: FriendChallengeStatus
  createdAt: string
  completedAt: string | null
  isNotificationRead: boolean
}

export interface CreateFriendChallengePayload {
  opponentUserId: number
  roadmapId: string
  challengerScore: number
  challengerDurationSec: number
}

export interface FriendChallengeNotification {
  id: string
  challengeId: string
  message: string
  createdAt: string
}
