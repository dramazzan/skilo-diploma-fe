export type UserRole = "student" | "company"

export interface CompanyProfile {
  companyName: string
  bin: string
  industry: string
  contactPerson: string
  phone: string
  website: string
}

export interface LoginPayload {
  email: string
  password: string
  role: UserRole
}

export interface RegisterPayload {
  email: string
  password: string
  role: UserRole
  country?: string
  city?: string
  university?: string
  companyName?: string
  bin?: string
  industry?: string
  contactPerson?: string
  phone?: string
  website?: string
}

export interface User {
  id: number
  email: string
  password: string
  role: UserRole
  firstLogin: boolean
  createdAt: string
  country: string
  city: string
  university: string
  companyProfile: CompanyProfile | null
  fullName?: string
}

export interface AuthResponse {
  token: string
  user: Omit<User, "password">
}

export type RoadmapLevel = "Beginner" | "Intermediate" | "Advanced"

export interface Roadmap {
  id: string
  title: string
  description: string
  level: RoadmapLevel
  recommended: boolean
}

export type TopicStatus = "not_started" | "in_progress" | "completed" | "locked"

export interface RoadmapNode {
  id: string
  title: string
  status: TopicStatus
  children?: RoadmapNode[]
}

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

export interface RoadmapProgressItem {
  roadmapId: string
  completionPercent: number
  completedTopics: number
  totalTopics: number
}

export interface RoadmapTopic {
  id: string
  roadmapId: string
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
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

export interface TopicResult {
  topicId: string
  score: number
  passed: boolean
  updatedAt: string
}

export interface TopicResultUpdateResponse {
  result: TopicResult
  progress: RoadmapProgressItem
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

export interface ProfileResponse {
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
  submittedAt: string
}

export interface Vacancy {
  id: string
  company: string
  title: string
  level: "junior" | "middle" | "senior"
  location: string
  employment: "full-time" | "part-time" | "internship" | "remote"
  salaryRange: string
  tags: string[]
  summary: string
  preparation: VacancyPreparation
  realTasks: VacancyTask[]
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

export type DirectionSkillLevel = "Junior" | "Junior Strong" | "Middle" | "Middle Strong" | "Senior"

export interface DirectionLevelResult {
  roadmapId: string
  roadmapTitle: string
  levelLabel: DirectionSkillLevel
  score: number
  updatedAt: string
}

export interface CustomRoadmapDraft {
  id: string
  title: string
  goal: string
  directionIds: string[]
  generationMode: "single" | "multiple"
  milestones: string[]
  createdAt: string
}

export interface GenerateCustomTrackPayload {
  title: string
  goal: string
  selectedDirectionIds: string[]
  generationMode: "single" | "multiple"
  interests?: string[]
}

export type CommunityAuthorType = "developer" | "company"
export type CommunityModerationStatus = "pending" | "approved" | "rejected"

export interface CommunityComment {
  id: string
  authorName: string
  authorType: CommunityAuthorType
  authorUserId: number | null
  text: string
  createdAt: string
}

export interface CommunityPost {
  id: string
  title: string
  content: string
  focusArea: string
  tags: string[]
  authorName: string
  authorType: CommunityAuthorType
  authorUserId: number | null
  createdAt: string
  publishedAt: string | null
  moderationStatus: CommunityModerationStatus
  moderationNote: string | null
  likes: number
  likedByUserIds: number[]
  comments: CommunityComment[]
}

export type VerificationMode = "online" | "offline"
export type VerificationStatus = "scheduled" | "completed"

export interface VerificationSlot {
  id: string
  date: string
  time: string
  mode: VerificationMode
  location: string
  assessor: string
  seats: number
}

export interface VerificationBooking {
  id: string
  slotId: string
  roadmapId: string
  roadmapTitle: string
  mode: VerificationMode
  date: string
  time: string
  dateTimeIso: string
  location: string
  assessor: string
  status: VerificationStatus
  bookedAt: string
  completedAt: string | null
  certificateId: string | null
}

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
