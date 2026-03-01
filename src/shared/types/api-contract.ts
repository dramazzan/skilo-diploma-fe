/**
 * Platform API Contract (Single Source of Truth)
 *
 * This file contains:
 * 1) All backend models used by the frontend.
 * 2) Request/response DTOs for frontend-required endpoints.
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

export interface OnboardingSubmitRequest {
  interests: string[]
}

export interface OnboardingSubmitResponse {
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

export interface ProfileUpdateRequest {
  fullName?: string
  country?: string
  city?: string
  university?: string
}

export interface UserActivityDay {
  date: string // YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4
}

export type UserActivityResponse = UserActivityDay[]

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

export type FriendsResponse = FriendProfile[]

export interface AddFriendByEmailRequest {
  email: string
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
  createdAt: IsoDateTimeString
  completedAt: IsoDateTimeString | null
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
  createdAt: IsoDateTimeString
}

export type FriendChallengeListResponse = FriendChallenge[]
export type FriendChallengeNotificationsResponse = FriendChallengeNotification[]

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
// Company Cabinet
// =========================

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
  submittedAt: IsoDateTimeString | null
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
  appliedAt: IsoDateTimeString
  status: "new" | "reviewed" | "invited"
  inviteSentAt: IsoDateTimeString | null
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
  sentAt: IsoDateTimeString
}

export type CompanyVacancyListResponse = Vacancy[]
export type CompanyCandidatesResponse = CompanyCandidate[]

export interface MutationSuccessResponse {
  success: boolean
}

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
// Skill Level Assessment
// =========================

export type DirectionSkillLevel =
  | "Junior"
  | "Junior Strong"
  | "Middle"
  | "Middle Strong"
  | "Senior"

export interface SkillLevelResult {
  roadmapId: string
  roadmapTitle: string
  levelLabel: DirectionSkillLevel
  score: number
  updatedAt: IsoDateTimeString
}

export interface SkillLevelAssessmentSubmissionRequest {
  roadmapId: string
  theoryAnswers: Record<string, number>
  writtenAnswers: Record<string, string>
}

export interface SkillLevelAssessmentSubmissionResponse extends SkillLevelResult {
  assignedRoadmapLevel: RoadmapLevel
}

export type SkillLevelsResponse = SkillLevelResult[]

// =========================
// AI Custom Tracks
// =========================

export type CustomTrackGenerationMode = "single" | "multiple"

export interface CustomTrack {
  id: string
  title: string
  goal: string
  directionIds: string[]
  generationMode: CustomTrackGenerationMode
  milestones: string[]
  createdAt: IsoDateTimeString
}

export interface GenerateCustomTrackRequest {
  title: string
  goal: string
  interests: string[]
  selectedDirectionIds: string[]
  generationMode: CustomTrackGenerationMode
}

export interface GenerateCustomTrackResponse {
  tracks: CustomTrack[]
  compatibilityPercent: number
  weakCompatibilityPairs: string[]
}

export type CustomTrackListResponse = CustomTrack[]

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
// Daily Tasks
// =========================

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
  completedAt: IsoDateTimeString | null
}

export interface DailyTaskQuizOption {
  id: string
  label: string
}

export interface DailyTaskQuiz {
  taskId: string
  question: string
  options: DailyTaskQuizOption[]
  correctOptionId?: string
}

export interface DailyTasksTodayResponse {
  date: string
  tasks: DailyTaskItem[]
  completedCount: number
  totalCount: number
  earnedPoints: number
  totalPoints: number
}

export interface DailyTaskHistoryItem {
  date: string
  completed: number
  total: number
  points: number
}

export type DailyTaskHistoryResponse = DailyTaskHistoryItem[]

export interface DailyTaskAnswerSubmitRequest {
  optionId: string
}

export interface DailyTaskAnswerSubmitResponse {
  taskId: string
  passed: boolean
  completed: boolean
  completedAt: IsoDateTimeString | null
  earnedPoints: number
}

export interface DailyTaskReminderDismissRequest {
  date: string
}

export interface DailyTaskReminderDismissResponse {
  dismissedForDate: string
}

// =========================
// Community
// =========================

export type CommunityAuthorType = "developer" | "company"
export type CommunityModerationStatus = "pending" | "approved" | "rejected"

export interface CommunityComment {
  id: string
  authorName: string
  authorType: CommunityAuthorType
  text: string
  createdAt: IsoDateTimeString
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
  createdAt: IsoDateTimeString
  publishedAt: IsoDateTimeString | null
  moderationStatus: CommunityModerationStatus
  moderationNote: string | null
  likes: number
  likedByUserIds: number[]
  comments: CommunityComment[]
}

export interface SubmitCommunityPostRequest {
  title: string
  content: string
  focusArea: string
  tags: string[]
  authorType: CommunityAuthorType
}

export interface CreateCommunityCommentRequest {
  text: string
  authorType: CommunityAuthorType
}

export interface ToggleCommunityLikeRequest {
  like?: boolean
}

export interface CommunityPostLikeResponse {
  postId: string
  likes: number
  likedByCurrentUser: boolean
}

export type CommunityPostsResponse = CommunityPost[]

// =========================
// Skill Verification
// =========================

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
  bookedAt: IsoDateTimeString
  completedAt: IsoDateTimeString | null
  certificateId: string | null
}

export interface VerificationSlotsQuery {
  date: string
  mode: VerificationMode
}

export interface CreateVerificationBookingRequest {
  roadmapId: string
  slotId: string
}

export type VerificationSlotsResponse = VerificationSlot[]
export type VerificationBookingsResponse = VerificationBooking[]

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
// Endpoint documentation
// =========================

export interface EndpointDoc {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  request?: string
  response: string
  purpose: string
}

/**
 * Human-readable contract for backend implementation.
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
    method: "PATCH",
    path: "/users/:userId/onboarding",
    request: "OnboardingSubmitRequest",
    response: "OnboardingSubmitResponse",
    purpose: "Save onboarding interests and mark first login as completed"
  },
  {
    method: "GET",
    path: "/profile",
    response: "ProfileResponse",
    purpose: "Load profile page summary"
  },
  {
    method: "PATCH",
    path: "/profile",
    request: "ProfileUpdateRequest",
    response: "ProfileResponse",
    purpose: "Update editable profile fields (country, city, university, full name)"
  },
  {
    method: "GET",
    path: "/users/:userId/activity",
    response: "UserActivityResponse",
    purpose: "Get yearly user activity heatmap data"
  },
  {
    method: "GET",
    path: "/users/:userId/friends",
    response: "FriendsResponse",
    purpose: "Get current user friend list"
  },
  {
    method: "GET",
    path: "/users/:userId/friends/suggestions",
    response: "FriendsResponse",
    purpose: "Get users that can be added as friends"
  },
  {
    method: "POST",
    path: "/users/:userId/friends",
    request: "AddFriendByEmailRequest",
    response: "FriendsResponse",
    purpose: "Add friend by email and return updated friend list"
  },
  {
    method: "DELETE",
    path: "/users/:userId/friends/:friendUserId",
    response: "FriendsResponse",
    purpose: "Remove friend and return updated friend list"
  },
  {
    method: "GET",
    path: "/users/:userId/global-it-map",
    response: "GlobalItMapResponse",
    purpose: "Get shared roadmap progress map for current user and friends"
  },
  {
    method: "GET",
    path: "/users/:userId/friend-challenges",
    response: "FriendChallengeListResponse",
    purpose: "Get current user challenge history with friends"
  },
  {
    method: "POST",
    path: "/users/:userId/friend-challenges",
    request: "CreateFriendChallengePayload",
    response: "FriendChallenge",
    purpose: "Create a new challenge against a friend for one roadmap"
  },
  {
    method: "GET",
    path: "/users/:userId/friend-challenges/notifications",
    response: "FriendChallengeNotificationsResponse",
    purpose: "Load unread challenge notifications for current user"
  },
  {
    method: "PATCH",
    path: "/users/:userId/friend-challenges/:challengeId/notifications/read",
    response: "MutationSuccessResponse",
    purpose: "Mark challenge notification as read"
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
    path: "/company/vacancies",
    response: "CompanyVacancyListResponse",
    purpose: "Load vacancies created by company cabinet"
  },
  {
    method: "POST",
    path: "/company/vacancies",
    request: "CompanyVacancyPayload",
    response: "Vacancy",
    purpose: "Create a vacancy from company cabinet form"
  },
  {
    method: "PUT",
    path: "/company/vacancies/:vacancyId",
    request: "CompanyVacancyPayload",
    response: "Vacancy",
    purpose: "Update company vacancy details"
  },
  {
    method: "DELETE",
    path: "/company/vacancies/:vacancyId",
    response: "MutationSuccessResponse",
    purpose: "Delete company vacancy and linked candidates"
  },
  {
    method: "POST",
    path: "/company/vacancies/:vacancyId/tasks",
    request: "CompanyVacancyTaskPayload",
    response: "VacancyTask",
    purpose: "Create a real task for vacancy"
  },
  {
    method: "PUT",
    path: "/company/vacancies/:vacancyId/tasks/:taskId",
    request: "CompanyVacancyTaskPayload",
    response: "VacancyTask",
    purpose: "Update vacancy task content"
  },
  {
    method: "DELETE",
    path: "/company/vacancies/:vacancyId/tasks/:taskId",
    response: "MutationSuccessResponse",
    purpose: "Delete vacancy task"
  },
  {
    method: "GET",
    path: "/company/candidates",
    response: "CompanyCandidatesResponse",
    purpose: "Load candidate list with evaluation details for employer view"
  },
  {
    method: "POST",
    path: "/company/candidates/:candidateId/interview-invite",
    request: "InterviewInvitePayload",
    response: "InterviewInviteResult",
    purpose: "Send interview invite to selected candidate"
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
  },
  {
    method: "GET",
    path: "/users/:userId/skill-levels",
    response: "SkillLevelsResponse",
    purpose: "Load stored direction levels for profile and assessment pages"
  },
  {
    method: "POST",
    path: "/users/:userId/skill-levels/assessments",
    request: "SkillLevelAssessmentSubmissionRequest",
    response: "SkillLevelAssessmentSubmissionResponse",
    purpose: "Evaluate theory + written answers and store resulting skill level"
  },
  {
    method: "DELETE",
    path: "/users/:userId/skill-levels/:roadmapId",
    response: "MutationSuccessResponse",
    purpose: "Clear saved skill level result for one roadmap"
  },
  {
    method: "GET",
    path: "/users/:userId/custom-tracks",
    response: "CustomTrackListResponse",
    purpose: "Load AI-generated custom tracks from user account"
  },
  {
    method: "POST",
    path: "/users/:userId/custom-tracks/generate",
    request: "GenerateCustomTrackRequest",
    response: "GenerateCustomTrackResponse",
    purpose: "Generate one or multiple custom tracks in AI constructor"
  },
  {
    method: "DELETE",
    path: "/users/:userId/custom-tracks/:trackId",
    response: "MutationSuccessResponse",
    purpose: "Delete one generated custom track"
  },
  {
    method: "GET",
    path: "/users/:userId/daily-tasks/today",
    response: "DailyTasksTodayResponse",
    purpose: "Get daily tasks list, progress counters and total points for current day"
  },
  {
    method: "GET",
    path: "/users/:userId/daily-tasks/history",
    response: "DailyTaskHistoryResponse",
    purpose: "Get last days summary for daily tasks widget"
  },
  {
    method: "GET",
    path: "/users/:userId/daily-tasks/:taskId/quiz",
    response: "DailyTaskQuiz",
    purpose: "Load quiz question for selected daily task"
  },
  {
    method: "POST",
    path: "/users/:userId/daily-tasks/:taskId/answer",
    request: "DailyTaskAnswerSubmitRequest",
    response: "DailyTaskAnswerSubmitResponse",
    purpose: "Submit daily task quiz answer and receive completion result"
  },
  {
    method: "POST",
    path: "/users/:userId/daily-tasks/reminder/dismiss",
    request: "DailyTaskReminderDismissRequest",
    response: "DailyTaskReminderDismissResponse",
    purpose: "Dismiss daily reminder for a specific date"
  },
  {
    method: "GET",
    path: "/community/posts",
    response: "CommunityPostsResponse",
    purpose: "Get community feed and moderation lists (by query filters)"
  },
  {
    method: "POST",
    path: "/community/posts",
    request: "SubmitCommunityPostRequest",
    response: "CommunityPost",
    purpose: "Create post and return moderation result for author"
  },
  {
    method: "POST",
    path: "/community/posts/:postId/comments",
    request: "CreateCommunityCommentRequest",
    response: "CommunityComment",
    purpose: "Publish comment under approved post"
  },
  {
    method: "POST",
    path: "/community/posts/:postId/likes",
    request: "ToggleCommunityLikeRequest",
    response: "CommunityPostLikeResponse",
    purpose: "Toggle like for current user and return updated like counters"
  },
  {
    method: "GET",
    path: "/skill-verification/slots",
    request: "VerificationSlotsQuery",
    response: "VerificationSlotsResponse",
    purpose: "Get available online/offline verification slots for selected date"
  },
  {
    method: "GET",
    path: "/users/:userId/skill-verification/bookings",
    response: "VerificationBookingsResponse",
    purpose: "Get user bookings including scheduled and completed sessions"
  },
  {
    method: "POST",
    path: "/users/:userId/skill-verification/bookings",
    request: "CreateVerificationBookingRequest",
    response: "VerificationBooking",
    purpose: "Book one available verification slot"
  },
  {
    method: "PATCH",
    path: "/users/:userId/skill-verification/bookings/:bookingId/complete",
    response: "VerificationBooking",
    purpose: "Mark booking as completed and attach certificate id"
  },
  {
    method: "DELETE",
    path: "/users/:userId/skill-verification/bookings/:bookingId",
    response: "MutationSuccessResponse",
    purpose: "Cancel booking and free selected slot"
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
  { mockSourceFile: "src/mocks/mockFriends.ts", mockExport: "mockFriendDirectory + mockDefaultFriendIds", endpoint: "/users/:userId/friends", method: "GET", responseModel: "FriendsResponse" },
  { mockSourceFile: "src/mocks/mockFriends.ts", mockExport: "mockFriendDirectory + mockDefaultFriendIds", endpoint: "/users/:userId/friends/suggestions", method: "GET", responseModel: "FriendsResponse" },
  { mockSourceFile: "src/mocks/mockFriends.ts", mockExport: "mockFriendDirectory + mockDefaultFriendIds", endpoint: "/users/:userId/global-it-map", method: "GET", responseModel: "GlobalItMapResponse" },

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
  { mockSourceFile: "src/mocks/mockVacancies.ts", mockExport: "mock vacancy task leaderboard", endpoint: "/vacancies/:vacancyId/tasks/leaderboard", method: "GET", responseModel: "VacancyTaskLeaderboardResponse" },

  { mockSourceFile: "src/shared/api/shared/storage.ts", mockExport: "mock_friend_challenges (storage)", endpoint: "/users/:userId/friend-challenges", method: "GET", responseModel: "FriendChallengeListResponse" },
  { mockSourceFile: "src/shared/api/shared/storage.ts", mockExport: "mock_friend_challenges (storage)", endpoint: "/users/:userId/friend-challenges/notifications", method: "GET", responseModel: "FriendChallengeNotificationsResponse" },

  { mockSourceFile: "src/shared/api/shared/company.helpers.ts", mockExport: "createInitialCandidates()", endpoint: "/company/candidates", method: "GET", responseModel: "CompanyCandidatesResponse" },
  { mockSourceFile: "src/shared/api/shared/storage.ts", mockExport: "mock_company_vacancies", endpoint: "/company/vacancies", method: "GET", responseModel: "CompanyVacancyListResponse" },

  { mockSourceFile: "src/features/community/store/community.ts", mockExport: "createSeedPosts()", endpoint: "/community/posts", method: "GET", responseModel: "CommunityPostsResponse" },
  { mockSourceFile: "src/features/daily-tasks/store/dailyTasks.ts", mockExport: "buildTasksForDate()", endpoint: "/users/:userId/daily-tasks/today", method: "GET", responseModel: "DailyTasksTodayResponse" },
  { mockSourceFile: "src/features/skill-levels/store/skillLevels.ts", mockExport: "levelsByRoadmap", endpoint: "/users/:userId/skill-levels", method: "GET", responseModel: "SkillLevelsResponse" },
  { mockSourceFile: "src/features/roadmaps/views/RoadmapsView.vue", mockExport: "custom_ai_tracks (localStorage)", endpoint: "/users/:userId/custom-tracks", method: "GET", responseModel: "CustomTrackListResponse" },
  { mockSourceFile: "src/features/skill-verification/views/SkillVerificationView.vue", mockExport: "buildSlots()", endpoint: "/skill-verification/slots", method: "GET", responseModel: "VerificationSlotsResponse" },
  { mockSourceFile: "src/features/skill-verification/views/SkillVerificationView.vue", mockExport: "skill_verification_bookings_v1 (localStorage)", endpoint: "/users/:userId/skill-verification/bookings", method: "GET", responseModel: "VerificationBookingsResponse" }
]

// =========================
// MVP flow (how UI works)
// =========================

/**
 * 1) User signs in via /auth/login or /auth/register.
 * 2) User finishes onboarding:
 *    - /users/:userId/onboarding (PATCH)
 * 3) Roadmaps page loads:
 *    - /roadmaps
 *    - /users/:userId/roadmaps
 *    - /users/:userId/roadmap-progress
 * 4) User adds roadmap:
 *    - /roadmaps/:roadmapId/assessment
 *    - /roadmaps/:roadmapId/assessment/submit
 *    - /users/:userId/roadmaps (PUT)
 * 5) Roadmap detail (skill tree/list):
 *    - /roadmaps/tree
 *    - node state is derived from TopicStatus + topic test results
 * 6) Topic page:
 *    - /topics/:topicId/content
 *    - /topics/:topicId/test
 *    - /topics/:topicId/result (POST after finish)
 * 7) Interview tab:
 *    - /topics/:topicId/interview-questions
 * 8) Friends + global map + challenges:
 *    - /users/:userId/friends
 *    - /users/:userId/friends/suggestions
 *    - /users/:userId/global-it-map
 *    - /users/:userId/friend-challenges
 *    - /users/:userId/friend-challenges/notifications
 * 9) User removes roadmap:
 *    - /users/:userId/roadmaps/:roadmapId (DELETE)
 * 10) Vacancies and interview preparation:
 *    - /vacancies
 *    - /vacancies/:vacancyId
 *    - /vacancies/:vacancyId/tasks
 *    - /vacancies/:vacancyId/tasks/:taskId/submission
 * 11) Company cabinet:
 *    - /company/vacancies (CRUD)
 *    - /company/vacancies/:vacancyId/tasks (CRUD)
 *    - /company/candidates
 *    - /company/candidates/:candidateId/interview-invite
 * 12) Skill levels page:
 *    - /users/:userId/skill-levels
 *    - /users/:userId/skill-levels/assessments
 * 13) Daily tasks:
 *    - /users/:userId/daily-tasks/today
 *    - /users/:userId/daily-tasks/:taskId/quiz
 *    - /users/:userId/daily-tasks/:taskId/answer
 * 14) Community page:
 *    - /community/posts
 *    - /community/posts/:postId/comments
 *    - /community/posts/:postId/likes
 * 15) Skill verification + custom AI tracks:
 *    - /skill-verification/slots
 *    - /users/:userId/skill-verification/bookings
 *    - /users/:userId/custom-tracks
 */
