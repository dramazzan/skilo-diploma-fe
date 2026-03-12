export * from "./types"

import axios, { AxiosError } from "axios"

import type {
  AuthResponse,
  OnboardingSubmitRequest,
  OnboardingSubmitResponse,
  CandidateWorkLeaderboardResponse,
  CompanyCandidate,
  CompanyVacancyPayload,
  CompanyVacancyTaskPayload,
  CommunityComment,
  CommunityPost,
  CreateFriendChallengePayload,
  CustomRoadmapDraft,
  GenerateCustomTrackPayload,
  DailyTaskQuiz,
  DirectionLevelResult,
  FriendChallenge,
  FriendChallengeNotification,
  FriendProfile,
  GlobalItMapResponse,
  InterviewInvitePayload,
  InterviewInviteResult,
  InterviewQuestionItem,
  LeaderboardResponse,
  LoginPayload,
  ProfileResponse,
  RegisterPayload,
  Roadmap,
  RoadmapAssessment,
  RoadmapAssessmentSubmitRequest,
  RoadmapAssessmentSubmitResponse,
  RoadmapNode,
  RoadmapProgressItem,
  RoadmapTopic,
  SkillLevelAssessment,
  SkillLevelAssessmentSubmitRequest,
  TopicContent,
  TopicResult,
  TopicResultUpdateResponse,
  TopicTest,
  UserActivityDay,
  Vacancy,
  VacancyTask,
  VacancyTaskLeaderboardResponse,
  VacancyTaskSubmission,
  VacancyTaskSubmissionPayload,
  VerificationBooking,
  VerificationSlot
} from "./types"

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"

const http = axios.create({
  baseURL,
  timeout: 60_000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.statusCode = status
  }
  statusCode: number
}

const normalizeError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ?? error.message
    throw new ApiError(message, status)
  }

  if (error instanceof Error) throw error
  throw new Error("Unknown API error")
}

const request = async <T>(promise: Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await promise
    return response.data
  } catch (error) {
    normalizeError(error)
    throw error
  }
}

const ensureUserId = (userId: number | null): number => {
  if (typeof userId === "number") return userId

  const token = localStorage.getItem("token")
  if (!token) return 1

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || "")) as { userId?: number }
    return payload.userId ?? 1
  } catch {
    return 1
  }
}

export const api = {
  login(payload: LoginPayload): Promise<AuthResponse> {
    return request(http.post("/auth/login", payload))
  },

  register(payload: RegisterPayload): Promise<AuthResponse> {
    return request(http.post("/auth/register", payload))
  },

  submitOnboarding(userId: number | null, payload: OnboardingSubmitRequest): Promise<OnboardingSubmitResponse> {
    const resolved = ensureUserId(userId)
    return request(http.patch(`/users/${resolved}/onboarding`, payload))
  },

  getProfile(userId?: number): Promise<ProfileResponse> {
    return request(http.get("/profile", { params: { userId } }))
  },

  getRoadmaps(): Promise<Roadmap[]> {
    return request(http.get("/roadmaps"))
  },

  getRoadmapTree(roadmapId?: string): Promise<Record<string, RoadmapNode[]> | RoadmapNode[]> {
    return request(http.get("/roadmaps/tree", { params: { roadmapId } }))
  },

  getRoadmapAssessment(roadmapId: string): Promise<RoadmapAssessment> {
    return request(http.get(`/roadmaps/${roadmapId}/assessment`))
  },
  submitRoadmapAssessment(roadmapId: string, payload: RoadmapAssessmentSubmitRequest): Promise<RoadmapAssessmentSubmitResponse> {
    return request(http.post(`/roadmaps/${roadmapId}/assessment/submit`, payload))
  },

  getTopics(roadmapId?: string): Promise<RoadmapTopic[]> {
    return request(http.get("/topics", { params: { roadmapId } }))
  },

  getTopicContent(topicId: string): Promise<TopicContent> {
    return request(http.get(`/topics/${topicId}/content`))
  },

  getTopicTest(topicId: string): Promise<TopicTest> {
    return request(http.get(`/topics/${topicId}/test`))
  },

  getTopicInterviewQuestions(topicId: string): Promise<InterviewQuestionItem[]> {
    return request(http.get(`/topics/${topicId}/interview-questions`))
  },

  getRoadmapProgress(userId: number | null): Promise<RoadmapProgressItem[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/roadmap-progress`))
  },

  getTopicResults(userId: number | null): Promise<TopicResult[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/topic-results`))
  },

  upsertTopicResult(userId: number | null, topicId: string, payload: { score: number; passed: boolean }): Promise<TopicResultUpdateResponse> {
    const resolved = ensureUserId(userId)
    return request(http.put(`/users/${resolved}/topics/${topicId}/result`, payload))
  },

  getUserRoadmapCollection(userId: number | null): Promise<string[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/roadmaps`))
  },

  updateUserRoadmapCollection(userId: number | null, roadmapIds: string[]): Promise<string[]> {
    const resolved = ensureUserId(userId)
    return request(http.put(`/users/${resolved}/roadmaps`, { roadmapIds }))
  },

  removeUserRoadmapFromCollection(userId: number | null, roadmapId: string): Promise<string[]> {
    const resolved = ensureUserId(userId)
    return request(http.delete(`/users/${resolved}/roadmaps/${roadmapId}`))
  },

  getUserYearActivity(userId: number | null): Promise<UserActivityDay[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/year-activity`))
  },

  getFriends(userId: number | null): Promise<FriendProfile[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/friends`))
  },

  getFriendSuggestions(userId: number | null): Promise<FriendProfile[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/friends/suggestions`))
  },

  getGlobalItMap(userId: number | null): Promise<GlobalItMapResponse> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/global-it-map`))
  },

  addFriendByEmail(userId: number | null, email: string): Promise<FriendProfile[]> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/users/${resolved}/friends`, { email }))
  },

  removeFriend(userId: number | null, friendUserId: number): Promise<FriendProfile[]> {
    const resolved = ensureUserId(userId)
    return request(http.delete(`/users/${resolved}/friends/${friendUserId}`))
  },

  getFriendChallenges(userId: number | null): Promise<FriendChallenge[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/friend-challenges`))
  },

  getFriendChallengeNotifications(userId: number | null): Promise<FriendChallengeNotification[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/friend-challenges/notifications`))
  },

  markFriendChallengeNotificationRead(userId: number | null, challengeId: string): Promise<void> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/users/${resolved}/friend-challenges/${challengeId}/read`, {}))
  },

  createFriendChallenge(userId: number | null, payload: CreateFriendChallengePayload): Promise<FriendChallenge> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/users/${resolved}/friend-challenges`, payload))
  },

  getLeaderboard(userId: number | null): Promise<LeaderboardResponse> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/leaderboard`))
  },

  getVacancies(): Promise<Vacancy[]> {
    return request(http.get("/vacancies"))
  },

  getVacancyById(vacancyId: string): Promise<Vacancy> {
    return request(http.get(`/vacancies/${vacancyId}`))
  },

  getVacancyRealTasks(vacancyId: string, userId: number | null): Promise<Array<{ task: VacancyTask; submission: VacancyTaskSubmission | null }>> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/vacancies/${vacancyId}/tasks`, { params: { userId: resolved } }))
  },

  submitVacancyTask(
    vacancyId: string,
    taskId: string,
    payload: VacancyTaskSubmissionPayload,
    userId: number | null
  ): Promise<VacancyTaskSubmission> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/vacancies/${vacancyId}/tasks/${taskId}/submissions`, { ...payload, userId: resolved }))
  },

  getVacancyTaskLeaderboard(vacancyId: string, userId: number | null): Promise<VacancyTaskLeaderboardResponse> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/vacancies/${vacancyId}/tasks/leaderboard`, { params: { userId: resolved } }))
  },

  getCandidateWorkLeaderboard(userId: number | null): Promise<CandidateWorkLeaderboardResponse> {
    const resolved = ensureUserId(userId)
    return request(http.get("/leaderboards/candidate-work", { params: { userId: resolved } }))
  },

  getCompanyVacancies(): Promise<Vacancy[]> {
    return request(http.get("/company/vacancies"))
  },

  createCompanyVacancy(payload: CompanyVacancyPayload): Promise<Vacancy> {
    return request(http.post("/company/vacancies", payload))
  },

  updateCompanyVacancy(vacancyId: string, payload: CompanyVacancyPayload): Promise<Vacancy> {
    return request(http.put(`/company/vacancies/${vacancyId}`, payload))
  },

  deleteCompanyVacancy(vacancyId: string): Promise<void> {
    return request(http.delete(`/company/vacancies/${vacancyId}`))
  },

  createCompanyVacancyTask(vacancyId: string, payload: CompanyVacancyTaskPayload): Promise<VacancyTask> {
    return request(http.post(`/company/vacancies/${vacancyId}/tasks`, payload))
  },

  updateCompanyVacancyTask(vacancyId: string, taskId: string, payload: CompanyVacancyTaskPayload): Promise<VacancyTask> {
    return request(http.put(`/company/vacancies/${vacancyId}/tasks/${taskId}`, payload))
  },

  deleteCompanyVacancyTask(vacancyId: string, taskId: string): Promise<void> {
    return request(http.delete(`/company/vacancies/${vacancyId}/tasks/${taskId}`))
  },

  getCompanyCandidates(): Promise<CompanyCandidate[]> {
    return request(http.get("/company/candidates"))
  },

  sendInterviewInvite(candidateId: string, payload: InterviewInvitePayload): Promise<InterviewInviteResult> {
    return request(http.post(`/company/candidates/${candidateId}/interview-invite`, payload))
  },

  getSkillLevels(userId: number | null): Promise<DirectionLevelResult[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/skill-levels`))
  },
  getSkillLevelAssessment(userId: number | null, roadmapId: string): Promise<SkillLevelAssessment> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/skill-levels/assessments`, { params: { roadmapId } }))
  },
  submitSkillLevelAssessment(userId: number | null, payload: SkillLevelAssessmentSubmitRequest): Promise<DirectionLevelResult> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/users/${resolved}/skill-levels/assessments`, payload))
  },

  upsertSkillLevel(userId: number | null, roadmapId: string, payload: DirectionLevelResult): Promise<DirectionLevelResult> {
    const resolved = ensureUserId(userId)
    return request(http.put(`/users/${resolved}/skill-levels/${roadmapId}`, payload))
  },

  deleteSkillLevel(userId: number | null, roadmapId: string): Promise<void> {
    const resolved = ensureUserId(userId)
    return request(http.delete(`/users/${resolved}/skill-levels/${roadmapId}`))
  },

  getCustomTracks(userId: number | null): Promise<CustomRoadmapDraft[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/custom-tracks`))
  },

  createCustomTrack(userId: number | null, payload: CustomRoadmapDraft): Promise<CustomRoadmapDraft> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/users/${resolved}/custom-tracks`, payload))
  },

  generateCustomTracks(userId: number | null, payload: GenerateCustomTrackPayload): Promise<CustomRoadmapDraft[]> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/users/${resolved}/custom-tracks/generate`, payload))
  },

  deleteCustomTrack(userId: number | null, trackId: string): Promise<void> {
    const resolved = ensureUserId(userId)
    return request(http.delete(`/users/${resolved}/custom-tracks/${trackId}`))
  },

  getCommunityPosts(): Promise<CommunityPost[]> {
    return request(http.get("/community/posts"))
  },

  createCommunityPost(payload: {
    title: string
    content: string
    focusArea: string
    tags: string[]
    authorName: string
    authorType: "developer" | "company"
    authorUserId: number | null
  }): Promise<CommunityPost> {
    return request(http.post("/community/posts", payload))
  },

  addCommunityComment(
    postId: string,
    payload: { authorName: string; authorType: "developer" | "company"; authorUserId: number | null; text: string }
  ): Promise<CommunityComment> {
    return request(http.post(`/community/posts/${postId}/comments`, payload))
  },

  toggleCommunityLike(postId: string, userId: number): Promise<{ postId: string; likes: number; likedByUserIds: number[] }> {
    return request(http.post(`/community/posts/${postId}/likes`, { userId }))
  },

  getDailyTasksToday(userId: number | null): Promise<{
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
  }> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/daily-tasks/today`))
  },

  getDailyTaskQuiz(userId: number | null, taskId: string): Promise<DailyTaskQuiz> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/daily-tasks/${taskId}/quiz`))
  },

  submitDailyTaskAnswer(userId: number | null, taskId: string, optionId: string): Promise<{ taskId: string; isCorrect: boolean; completed: boolean; pointsEarned: number }> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/users/${resolved}/daily-tasks/${taskId}/answer`, { optionId }))
  },

  getVerificationSlots(params?: { mode?: "online" | "offline"; date?: string }): Promise<VerificationSlot[]> {
    return request(http.get("/skill-verification/slots", { params }))
  },

  getVerificationBookings(userId: number | null): Promise<VerificationBooking[]> {
    const resolved = ensureUserId(userId)
    return request(http.get(`/users/${resolved}/skill-verification/bookings`))
  },

  createVerificationBooking(
    userId: number | null,
    payload: {
      slotId: string
      roadmapId: string
      roadmapTitle: string
      mode: "online" | "offline"
      date: string
      time: string
      location: string
      assessor: string
    }
  ): Promise<VerificationBooking> {
    const resolved = ensureUserId(userId)
    return request(http.post(`/users/${resolved}/skill-verification/bookings`, payload))
  },

  completeVerificationBooking(userId: number | null, bookingId: string): Promise<VerificationBooking> {
    const resolved = ensureUserId(userId)
    return request(http.patch(`/users/${resolved}/skill-verification/bookings/${bookingId}/complete`))
  },

  cancelVerificationBooking(userId: number | null, bookingId: string): Promise<void> {
    const resolved = ensureUserId(userId)
    return request(http.delete(`/users/${resolved}/skill-verification/bookings/${bookingId}`))
  }
}

export type ApiClient = typeof api
